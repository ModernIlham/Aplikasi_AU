from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, write_audit

router = APIRouter(prefix="/api/halte", tags=["halte"])


@router.get("", response_model=list[schemas.HalteOut])
def list_halte(_: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.scalars(select(models.Halte).order_by(models.Halte.urutan)).all()


@router.post("", response_model=schemas.HalteOut, status_code=status.HTTP_201_CREATED)
def create_halte(
    payload: schemas.HalteCreate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if db.scalar(select(models.Halte).where(models.Halte.kode == payload.kode)):
        raise HTTPException(400, "Kode halte sudah ada")
    obj = models.Halte(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="create", objek=f"halte#{obj.id}", detail=obj.nama, request=request)
    return obj


@router.patch("/{halte_id}", response_model=schemas.HalteOut)
def update_halte(
    halte_id: int,
    payload: schemas.HalteUpdate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Halte, halte_id)
    if not obj:
        raise HTTPException(404, "Halte tidak ditemukan")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="update", objek=f"halte#{halte_id}", request=request)
    return obj


@router.delete("/{halte_id}", response_model=schemas.Message)
def delete_halte(
    halte_id: int,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Halte, halte_id)
    if not obj:
        raise HTTPException(404, "Halte tidak ditemukan")
    db.delete(obj)
    db.commit()
    write_audit(db, user=user, aksi="hapus", objek=f"halte#{halte_id}", request=request)
    return {"message": "Halte dihapus."}
