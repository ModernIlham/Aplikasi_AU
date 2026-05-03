from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, write_audit

router = APIRouter(prefix="/api/notifikasi", tags=["notifikasi"])


@router.get("", response_model=list[schemas.NotifikasiOut])
def list_notif(
    only_unread: bool = False,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = select(models.Notifikasi).order_by(desc(models.Notifikasi.waktu)).limit(100)
    if only_unread:
        q = select(models.Notifikasi).where(models.Notifikasi.dibaca == False).order_by(desc(models.Notifikasi.waktu)).limit(100)  # noqa: E712
    return db.scalars(q).all()


@router.post("", response_model=schemas.NotifikasiOut, status_code=status.HTTP_201_CREATED)
def create_notif(
    payload: schemas.NotifikasiCreate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = models.Notifikasi(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="create", objek=f"notifikasi#{obj.id}", request=request)
    return obj


@router.post("/{notif_id}/read", response_model=schemas.NotifikasiOut)
def mark_read(
    notif_id: int,
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Notifikasi, notif_id)
    if not obj:
        raise HTTPException(404, "Notifikasi tidak ditemukan")
    obj.dibaca = True
    db.commit()
    db.refresh(obj)
    return obj


@router.post("/read-all", response_model=schemas.Message)
def mark_all_read(
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notifs = db.scalars(select(models.Notifikasi).where(models.Notifikasi.dibaca == False)).all()  # noqa: E712
    for n in notifs:
        n.dibaca = True
    db.commit()
    write_audit(db, user=user, aksi="read_all", objek="notifikasi", detail=f"{len(notifs)} notifikasi", request=request)
    return {"message": f"{len(notifs)} notifikasi ditandai dibaca."}
