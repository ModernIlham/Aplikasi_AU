from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, write_audit

router = APIRouter(prefix="/api/sopir", tags=["sopir"])


@router.get("", response_model=list[schemas.SopirOut])
def list_sopir(
    status_filter: str | None = None,
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = select(models.Sopir).order_by(models.Sopir.kode)
    if status_filter:
        q = q.where(models.Sopir.status == status_filter)
    return db.scalars(q).all()


@router.post("", response_model=schemas.SopirOut, status_code=status.HTTP_201_CREATED)
def create_sopir(
    payload: schemas.SopirCreate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if db.scalar(select(models.Sopir).where(models.Sopir.kode == payload.kode)):
        raise HTTPException(400, "Kode sopir sudah ada")
    obj = models.Sopir(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="create", objek=f"sopir#{obj.id}", detail=obj.nama, request=request)
    return obj


@router.get("/{sopir_id}", response_model=schemas.SopirOut)
def get_sopir(sopir_id: int, _: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    obj = db.get(models.Sopir, sopir_id)
    if not obj:
        raise HTTPException(404, "Sopir tidak ditemukan")
    return obj


@router.patch("/{sopir_id}", response_model=schemas.SopirOut)
def update_sopir(
    sopir_id: int,
    payload: schemas.SopirUpdate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Sopir, sopir_id)
    if not obj:
        raise HTTPException(404, "Sopir tidak ditemukan")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="update", objek=f"sopir#{sopir_id}", request=request)
    return obj


@router.delete("/{sopir_id}", response_model=schemas.Message)
def delete_sopir(
    sopir_id: int,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Sopir, sopir_id)
    if not obj:
        raise HTTPException(404, "Sopir tidak ditemukan")
    db.delete(obj)
    db.commit()
    write_audit(db, user=user, aksi="hapus", objek=f"sopir#{sopir_id}", request=request)
    return {"message": "Sopir dihapus."}
