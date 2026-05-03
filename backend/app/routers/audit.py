from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.get("", response_model=list[schemas.AuditOut])
def list_audit(
    user_id: int | None = None,
    aksi: str | None = None,
    limit: int = Query(50, ge=1, le=500),
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = select(models.AuditLog).order_by(desc(models.AuditLog.waktu)).limit(limit)
    if user_id is not None:
        q = select(models.AuditLog).where(models.AuditLog.user_id == user_id).order_by(desc(models.AuditLog.waktu)).limit(limit)
    if aksi:
        q = select(models.AuditLog).where(models.AuditLog.aksi == aksi).order_by(desc(models.AuditLog.waktu)).limit(limit)
    return db.scalars(q).all()
