"""Jadwal Pemeliharaan armada — service berkala, KIR, brake, dll."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, write_audit

router = APIRouter(prefix="/api/pemeliharaan", tags=["pemeliharaan"])


@router.get("", response_model=list[schemas.PemeliharaanOut])
def list_pemeliharaan(
    armada_id: int | None = None,
    status_filter: str | None = None,
    limit: int = 100,
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = select(models.Pemeliharaan).order_by(desc(models.Pemeliharaan.tanggal_service_berikutnya)).limit(limit)
    if armada_id is not None:
        q = select(models.Pemeliharaan).where(models.Pemeliharaan.armada_id == armada_id).order_by(desc(models.Pemeliharaan.tanggal_service_berikutnya)).limit(limit)
    if status_filter:
        q = select(models.Pemeliharaan).where(models.Pemeliharaan.status == status_filter).order_by(desc(models.Pemeliharaan.tanggal_service_berikutnya)).limit(limit)
    return db.scalars(q).all()


@router.post("", response_model=schemas.PemeliharaanOut, status_code=status.HTTP_201_CREATED)
def create_pemeliharaan(
    payload: schemas.PemeliharaanCreate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    armada = db.get(models.Armada, payload.armada_id)
    if not armada:
        raise HTTPException(404, "Armada tidak ditemukan")
    obj = models.Pemeliharaan(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="create", objek=f"pemeliharaan#{obj.id}", detail=f"{armada.kode} · {obj.tipe}", request=request)
    return obj


@router.patch("/{pmh_id}", response_model=schemas.PemeliharaanOut)
def update_pemeliharaan(
    pmh_id: int,
    payload: schemas.PemeliharaanUpdate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Pemeliharaan, pmh_id)
    if not obj:
        raise HTTPException(404, "Jadwal pemeliharaan tidak ditemukan")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="update", objek=f"pemeliharaan#{pmh_id}", request=request)
    return obj


@router.delete("/{pmh_id}", response_model=schemas.Message)
def delete_pemeliharaan(
    pmh_id: int,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Pemeliharaan, pmh_id)
    if not obj:
        raise HTTPException(404, "Jadwal pemeliharaan tidak ditemukan")
    db.delete(obj)
    db.commit()
    write_audit(db, user=user, aksi="hapus", objek=f"pemeliharaan#{pmh_id}", request=request)
    return {"message": "Jadwal pemeliharaan dihapus."}


@router.get("/per-armada", response_model=list[schemas.PemeliharaanArmadaRow])
def per_armada(
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Ringkasan pemeliharaan per armada — dipakai halaman Jadwal Pemeliharaan.

    Untuk setiap armada, ambil entry pemeliharaan terbaru berdasarkan tanggal
    service berikutnya (upcoming). Hitung hari_ke_service (negatif = overdue).
    """
    now = datetime.now(timezone.utc)
    armadas = db.scalars(select(models.Armada).order_by(models.Armada.kode)).all()
    rows: list[schemas.PemeliharaanArmadaRow] = []
    for a in armadas:
        # Upcoming: berikutnya di masa depan
        upcoming = db.scalar(
            select(models.Pemeliharaan)
            .where(models.Pemeliharaan.armada_id == a.id)
            .where(models.Pemeliharaan.status != "selesai")
            .order_by(models.Pemeliharaan.tanggal_service_berikutnya)
            .limit(1)
        )
        # Last completed
        last = db.scalar(
            select(models.Pemeliharaan)
            .where(models.Pemeliharaan.armada_id == a.id)
            .order_by(desc(models.Pemeliharaan.tanggal_service_terakhir))
            .limit(1)
        )
        target = upcoming or last
        days = None
        if target and target.tanggal_service_berikutnya:
            days = (target.tanggal_service_berikutnya - now).days
        rows.append(schemas.PemeliharaanArmadaRow(
            armada_kode=a.kode,
            armada_plat=a.plat,
            odometer_km=a.km_total,
            service_terakhir_tgl=last.tanggal_service_terakhir if last else None,
            service_terakhir_km=last.odometer_terakhir_km if last else None,
            service_berikutnya_tgl=target.tanggal_service_berikutnya if target else None,
            service_berikutnya_km=target.odometer_target_km if target else None,
            tipe=target.tipe if target else None,
            kir_berlaku=target.kir_berlaku if target else None,
            status=target.status if target else "belum_ada_jadwal",
            hari_ke_service=days,
        ))
    return rows
