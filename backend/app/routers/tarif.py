"""Tarif & pendapatan — struktur tarif per kategori penumpang."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, write_audit

router = APIRouter(prefix="/api/tarif", tags=["tarif"])


@router.get("", response_model=list[schemas.TarifOut])
def list_tarif(
    aktif: bool | None = None,
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = select(models.Tarif).order_by(models.Tarif.id)
    if aktif is not None:
        q = q.where(models.Tarif.aktif == aktif)
    return db.scalars(q).all()


@router.post("", response_model=schemas.TarifOut, status_code=status.HTTP_201_CREATED)
def create_tarif(
    payload: schemas.TarifCreate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if db.scalar(select(models.Tarif).where(models.Tarif.kategori == payload.kategori)):
        raise HTTPException(400, "Kategori tarif sudah ada")
    obj = models.Tarif(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="create", objek=f"tarif#{obj.id}", detail=obj.kategori, request=request)
    return obj


@router.patch("/{tarif_id}", response_model=schemas.TarifOut)
def update_tarif(
    tarif_id: int,
    payload: schemas.TarifUpdate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Tarif, tarif_id)
    if not obj:
        raise HTTPException(404, "Tarif tidak ditemukan")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="update", objek=f"tarif#{tarif_id}", request=request)
    return obj


@router.delete("/{tarif_id}", response_model=schemas.Message)
def delete_tarif(
    tarif_id: int,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Tarif, tarif_id)
    if not obj:
        raise HTTPException(404, "Tarif tidak ditemukan")
    db.delete(obj)
    db.commit()
    write_audit(db, user=user, aksi="hapus", objek=f"tarif#{tarif_id}", request=request)
    return {"message": "Tarif dihapus."}


@router.get("/summary", response_model=schemas.TarifSummary)
def summary(_: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(models.Tarif).where(models.Tarif.aktif == True).order_by(models.Tarif.id)).all()  # noqa: E712
    total_pax = sum(r.pax_per_hari for r in rows)
    total_rp = sum(r.pax_per_hari * r.tarif_rp for r in rows)
    per_kat = [{
        "kategori": r.kategori,
        "label": r.label,
        "tarif_rp": r.tarif_rp,
        "pax": r.pax_per_hari,
        "pendapatan_rp": r.pax_per_hari * r.tarif_rp,
        "verifikasi": r.verifikasi,
    } for r in rows]
    return schemas.TarifSummary(
        total_pax=total_pax,
        total_pendapatan=total_rp,
        per_kategori=per_kat,
    )
