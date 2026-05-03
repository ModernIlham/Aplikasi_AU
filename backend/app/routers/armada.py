from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, write_audit

router = APIRouter(prefix="/api/armada", tags=["armada"])


@router.get("", response_model=list[schemas.ArmadaOut])
def list_armada(
    status_filter: str | None = None,
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = select(models.Armada).order_by(models.Armada.kode)
    if status_filter:
        q = q.where(models.Armada.status == status_filter)
    return db.scalars(q).all()


@router.post("", response_model=schemas.ArmadaOut, status_code=status.HTTP_201_CREATED)
def create_armada(
    payload: schemas.ArmadaCreate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if db.scalar(select(models.Armada).where(models.Armada.kode == payload.kode)):
        raise HTTPException(400, "Kode armada sudah ada")
    obj = models.Armada(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="create", objek=f"armada#{obj.id}", detail=obj.kode, request=request)
    return obj


@router.get("/{armada_id}", response_model=schemas.ArmadaOut)
def get_armada(armada_id: int, _: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    obj = db.get(models.Armada, armada_id)
    if not obj:
        raise HTTPException(404, "Armada tidak ditemukan")
    return obj


@router.patch("/{armada_id}", response_model=schemas.ArmadaOut)
def update_armada(
    armada_id: int,
    payload: schemas.ArmadaUpdate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Armada, armada_id)
    if not obj:
        raise HTTPException(404, "Armada tidak ditemukan")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="update", objek=f"armada#{armada_id}", request=request)
    return obj


@router.delete("/{armada_id}", response_model=schemas.Message)
def delete_armada(
    armada_id: int,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Armada, armada_id)
    if not obj:
        raise HTTPException(404, "Armada tidak ditemukan")
    db.delete(obj)
    db.commit()
    write_audit(db, user=user, aksi="hapus", objek=f"armada#{armada_id}", request=request)
    return {"message": "Armada dihapus."}
