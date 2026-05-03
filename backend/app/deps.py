from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from . import models
from .auth import decode_token
from .database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    if not token:
        # also accept "Authorization: Bearer ..." manually (oauth2_scheme already handles)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Tidak terotentikasi")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token tidak valid")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token tidak lengkap")
    user = db.get(models.User, int(user_id))
    if not user or not user.aktif:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Pengguna nonaktif")
    request.state.user = user
    return user


def require_admin(user: models.User = Depends(get_current_user)) -> models.User:
    if user.role not in ("admin", "kepala_upt"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Hak akses tidak cukup")
    return user


def write_audit(
    db: Session,
    *,
    user: models.User | None,
    aksi: str,
    objek: str,
    detail: str | None = None,
    request: Request | None = None,
) -> None:
    entry = models.AuditLog(
        user_id=user.id if user else None,
        user_email=user.email if user else None,
        aksi=aksi,
        objek=objek,
        detail=detail,
        ip=(request.client.host if request and request.client else None),
        method=(request.method if request else None),
        path=(request.url.path if request else None),
    )
    db.add(entry)
    db.commit()
