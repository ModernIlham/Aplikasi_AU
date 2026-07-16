"""BBM (Bahan Bakar Minyak) — log pengisian per armada + analisis efisiensi.

Dipakai untuk halaman Biaya & Skema Kontrak — komponen variable cost terbesar
dalam skema BTS (Buy The Service).
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, write_audit

router = APIRouter(prefix="/api/bbm", tags=["bbm"])


@router.get("", response_model=list[schemas.BbmOut])
def list_bbm(
    armada_id: int | None = None,
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(200, ge=1, le=2000),
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    q = select(models.Bbm).where(models.Bbm.waktu >= cutoff).order_by(desc(models.Bbm.waktu)).limit(limit)
    if armada_id is not None:
        q = select(models.Bbm).where(
            models.Bbm.waktu >= cutoff,
            models.Bbm.armada_id == armada_id,
        ).order_by(desc(models.Bbm.waktu)).limit(limit)
    return db.scalars(q).all()


@router.post("", response_model=schemas.BbmOut, status_code=status.HTTP_201_CREATED)
def create_bbm(
    payload: schemas.BbmCreate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    armada = db.get(models.Armada, payload.armada_id)
    if not armada:
        raise HTTPException(404, "Armada tidak ditemukan")
    # Auto-hitung total_rp jika 0
    data = payload.model_dump()
    if data.get("total_rp", 0) <= 0 and data.get("liter") and data.get("harga_per_liter"):
        data["total_rp"] = data["liter"] * data["harga_per_liter"]
    obj = models.Bbm(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    # Update odometer armada
    if obj.odometer_km and obj.odometer_km > armada.km_total:
        armada.km_total = obj.odometer_km
        db.commit()
    write_audit(db, user=user, aksi="create", objek=f"bbm#{obj.id}", detail=f"{armada.kode} · {obj.liter} L", request=request)
    return obj


@router.patch("/{bbm_id}", response_model=schemas.BbmOut)
def update_bbm(
    bbm_id: int,
    payload: schemas.BbmUpdate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Bbm, bbm_id)
    if not obj:
        raise HTTPException(404, "Log BBM tidak ditemukan")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="update", objek=f"bbm#{bbm_id}", request=request)
    return obj


@router.delete("/{bbm_id}", response_model=schemas.Message)
def delete_bbm(
    bbm_id: int,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Bbm, bbm_id)
    if not obj:
        raise HTTPException(404, "Log BBM tidak ditemukan")
    db.delete(obj)
    db.commit()
    write_audit(db, user=user, aksi="hapus", objek=f"bbm#{bbm_id}", request=request)
    return {"message": "Log BBM dihapus."}


@router.get("/summary", response_model=schemas.BbmSummary)
def summary(
    days: int = Query(30, ge=1, le=365),
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Ringkasan konsumsi BBM N hari terakhir (default 30) — total & per armada."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    # Aggregate global
    tot_liter = db.scalar(select(func.coalesce(func.sum(models.Bbm.liter), 0)).where(models.Bbm.waktu >= cutoff)) or 0.0
    tot_biaya = db.scalar(select(func.coalesce(func.sum(models.Bbm.total_rp), 0)).where(models.Bbm.waktu >= cutoff)) or 0.0
    tot_km    = db.scalar(select(func.coalesce(func.sum(models.Bbm.km_sejak_isi_terakhir), 0)).where(models.Bbm.waktu >= cutoff)) or 0.0
    kml       = (tot_km / tot_liter) if tot_liter else None

    # Per armada
    per_armada_rows = db.execute(
        select(
            models.Armada.kode,
            models.Armada.plat,
            func.coalesce(func.sum(models.Bbm.liter), 0),
            func.coalesce(func.sum(models.Bbm.total_rp), 0),
            func.coalesce(func.sum(models.Bbm.km_sejak_isi_terakhir), 0),
            func.coalesce(func.avg(models.Bbm.harga_per_liter), 0),
            func.count(models.Bbm.id),
        )
        .outerjoin(models.Bbm, (models.Bbm.armada_id == models.Armada.id) & (models.Bbm.waktu >= cutoff))
        .group_by(models.Armada.id)
        .order_by(models.Armada.kode)
    ).all()
    per_armada = []
    for kode, plat, liter, biaya, km, harga_avg, n in per_armada_rows:
        eff = (float(km) / float(liter)) if float(liter) > 0 else None
        per_armada.append(schemas.BbmPerArmadaRow(
            armada_kode=kode, armada_plat=plat,
            total_liter_30d=float(liter),
            total_biaya_rp_30d=float(biaya),
            total_km_30d=float(km),
            km_per_liter=eff,
            rata_harga_per_liter=float(harga_avg),
            n_isi=int(n),
        ))

    # Per jenis
    per_jenis_rows = db.execute(
        select(models.Bbm.jenis, func.sum(models.Bbm.liter), func.sum(models.Bbm.total_rp))
        .where(models.Bbm.waktu >= cutoff)
        .group_by(models.Bbm.jenis)
    ).all()
    per_jenis = {
        (j or "unknown"): {"liter": float(l or 0), "biaya_rp": float(b or 0)}
        for j, l, b in per_jenis_rows
    }

    return schemas.BbmSummary(
        total_liter=float(tot_liter),
        total_biaya_rp=float(tot_biaya),
        total_km=float(tot_km),
        km_per_liter_avg=kml,
        per_armada=per_armada,
        per_jenis=per_jenis,
    )
