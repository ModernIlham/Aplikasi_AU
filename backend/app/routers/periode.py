from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, write_audit

router = APIRouter(prefix="/api/periode", tags=["periode"])


@router.get("", response_model=list[schemas.PeriodeOut])
def list_periode(
    aktif: bool | None = None,
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = select(models.Periode).order_by(models.Periode.kode)
    if aktif is not None:
        q = q.where(models.Periode.aktif == aktif)
    return db.scalars(q).all()


@router.post("", response_model=schemas.PeriodeOut, status_code=status.HTTP_201_CREATED)
def create_periode(
    payload: schemas.PeriodeCreate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if db.scalar(select(models.Periode).where(models.Periode.kode == payload.kode)):
        raise HTTPException(400, "Kode periode sudah ada")
    obj = models.Periode(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="create", objek=f"periode#{obj.id}", detail=obj.kode, request=request)
    return obj


@router.patch("/{periode_id}", response_model=schemas.PeriodeOut)
def update_periode(
    periode_id: int,
    payload: schemas.PeriodeUpdate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Periode, periode_id)
    if not obj:
        raise HTTPException(404, "Periode tidak ditemukan")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="update", objek=f"periode#{periode_id}", request=request)
    return obj


@router.delete("/{periode_id}", response_model=schemas.Message)
def delete_periode(
    periode_id: int,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Periode, periode_id)
    if not obj:
        raise HTTPException(404, "Periode tidak ditemukan")
    db.delete(obj)
    db.commit()
    write_audit(db, user=user, aksi="hapus", objek=f"periode#{periode_id}", request=request)
    return {"message": "Periode dihapus."}
