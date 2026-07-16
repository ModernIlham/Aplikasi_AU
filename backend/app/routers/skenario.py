"""Skenario Jadwal — variasi konfigurasi operasi untuk Komparasi & Optimasi."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, write_audit

router = APIRouter(prefix="/api/skenario", tags=["skenario"])


def _next_kode(db: Session) -> str:
    last = db.scalar(select(models.Skenario).order_by(desc(models.Skenario.id)).limit(1))
    n = (last.id + 1) if last else 1
    return f"SK-{n:04d}"


@router.get("", response_model=list[schemas.SkenarioOut])
def list_skenario(
    status_filter: str | None = None,
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = select(models.Skenario).order_by(desc(models.Skenario.adalah_baseline), desc(models.Skenario.skor_mutu))
    if status_filter:
        q = q.where(models.Skenario.status == status_filter)
    return db.scalars(q).all()


@router.post("", response_model=schemas.SkenarioOut, status_code=status.HTTP_201_CREATED)
def create_skenario(
    payload: schemas.SkenarioCreate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = models.Skenario(
        kode=_next_kode(db),
        pembuat_id=user.id,
        **payload.model_dump(),
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="create", objek=f"skenario#{obj.kode}", detail=obj.nama, request=request)
    return obj


@router.get("/{skenario_id}", response_model=schemas.SkenarioOut)
def get_skenario(skenario_id: int, _: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    obj = db.get(models.Skenario, skenario_id)
    if not obj:
        raise HTTPException(404, "Skenario tidak ditemukan")
    return obj


@router.patch("/{skenario_id}", response_model=schemas.SkenarioOut)
def update_skenario(
    skenario_id: int,
    payload: schemas.SkenarioUpdate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Skenario, skenario_id)
    if not obj:
        raise HTTPException(404, "Skenario tidak ditemukan")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="update", objek=f"skenario#{obj.kode}", request=request)
    return obj


@router.post("/{skenario_id}/aktifkan", response_model=schemas.SkenarioOut)
def aktifkan(
    skenario_id: int,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Tetapkan sebagai skenario aktif — hanya satu yang aktif sekaligus."""
    obj = db.get(models.Skenario, skenario_id)
    if not obj:
        raise HTTPException(404, "Skenario tidak ditemukan")
    # Nonaktifkan yang lain
    others = db.scalars(select(models.Skenario).where(models.Skenario.adalah_aktif == True)).all()  # noqa: E712
    for o in others:
        o.adalah_aktif = False
    obj.adalah_aktif = True
    obj.status = "aktif"
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="aktifkan", objek=f"skenario#{obj.kode}", detail=obj.nama, request=request)
    return obj


@router.delete("/{skenario_id}", response_model=schemas.Message)
def delete_skenario(
    skenario_id: int,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Skenario, skenario_id)
    if not obj:
        raise HTTPException(404, "Skenario tidak ditemukan")
    if obj.adalah_aktif:
        raise HTTPException(400, "Skenario aktif tidak boleh dihapus.")
    if obj.adalah_baseline:
        raise HTTPException(400, "Baseline tidak boleh dihapus.")
    db.delete(obj)
    db.commit()
    write_audit(db, user=user, aksi="hapus", objek=f"skenario#{obj.kode}", request=request)
    return {"message": "Skenario dihapus."}


@router.get("/komparasi/data", response_model=schemas.SkenarioKomparasi)
def komparasi(
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Data untuk halaman Komparasi Skenario — baseline vs semua kandidat."""
    baseline = db.scalar(select(models.Skenario).where(models.Skenario.adalah_baseline == True).limit(1))  # noqa: E712
    kandidat = db.scalars(
        select(models.Skenario)
        .where(models.Skenario.adalah_baseline == False)  # noqa: E712
        .order_by(desc(models.Skenario.skor_mutu))
    ).all()
    delta: dict = {}
    if baseline:
        for k in kandidat:
            delta[k.kode] = {
                "trip_delta":       k.total_trip - baseline.total_trip,
                "km_delta":         k.total_km - baseline.total_km,
                "biaya_delta_rp":   k.biaya_rp_hari - baseline.biaya_rp_hari,
                "pendapatan_delta_rp": k.pendapatan_rp_hari - baseline.pendapatan_rp_hari,
                "skor_delta":       k.skor_mutu - baseline.skor_mutu,
            }
    return schemas.SkenarioKomparasi(baseline=baseline, kandidat=kandidat, delta=delta)
