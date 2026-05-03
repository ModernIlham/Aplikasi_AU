from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, require_admin, write_audit

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[schemas.UserOut])
def list_users(_: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.scalars(select(models.User).order_by(models.User.id)).all()


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, _: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(404, "User tidak ditemukan")
    return user


@router.patch("/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    payload: schemas.UserUpdate,
    request: Request,
    actor: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(404, "User tidak ditemukan")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(user, k, v)
    db.commit()
    db.refresh(user)
    write_audit(db, user=actor, aksi="update", objek=f"user#{user_id}", request=request)
    return user


@router.delete("/{user_id}", response_model=schemas.Message)
def deactivate_user(
    user_id: int,
    request: Request,
    actor: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(404, "User tidak ditemukan")
    user.aktif = False
    db.commit()
    write_audit(db, user=actor, aksi="nonaktifkan", objek=f"user#{user_id}", request=request)
    return {"message": "Pengguna dinonaktifkan."}
