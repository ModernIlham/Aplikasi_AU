from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import create_access_token, hash_password, verify_password
from ..database import get_db
from ..deps import get_current_user, write_audit

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    exists = db.scalar(select(models.User).where(models.User.email == payload.email))
    if exists:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    user = models.User(
        email=payload.email,
        nama=payload.nama,
        password_hash=hash_password(payload.password),
        nip=payload.nip,
        role=payload.role,
        unit_kerja=payload.unit_kerja,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.scalar(select(models.User).where(models.User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email atau password salah")
    if not user.aktif:
        raise HTTPException(status_code=403, detail="Akun nonaktif. Hubungi admin.")
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    token, expires_in = create_access_token(str(user.id), {"role": user.role, "email": user.email})
    write_audit(db, user=user, aksi="login", objek="auth", detail="login sukses", request=request)
    return schemas.TokenResponse(access_token=token, expires_in=expires_in, user=schemas.UserOut.model_validate(user))


@router.get("/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(get_current_user)):
    return user


@router.post("/logout", response_model=schemas.Message)
def logout(request: Request, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    write_audit(db, user=user, aksi="logout", objek="auth", request=request)
    return {"message": "Logout dicatat. Hapus token dari klien untuk menyelesaikan sesi."}


@router.post("/change-password", response_model=schemas.Message)
def change_password(
    payload: schemas.PasswordChange,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.old_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Password lama salah")
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    write_audit(db, user=user, aksi="ubah_password", objek=f"user#{user.id}", request=request)
    return {"message": "Password berhasil diubah."}
