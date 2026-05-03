from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, write_audit

router = APIRouter(prefix="/api/insiden", tags=["insiden"])


def _next_tiket(db: Session) -> str:
    last = db.scalar(select(models.Insiden).order_by(desc(models.Insiden.id)).limit(1))
    n = (last.id + 1) if last else 1
    return f"INC-{n:04d}"


@router.get("", response_model=list[schemas.InsidenOut])
def list_insiden(
    status_filter: str | None = None,
    limit: int = 100,
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = select(models.Insiden).order_by(desc(models.Insiden.waktu)).limit(limit)
    if status_filter:
        q = select(models.Insiden).where(models.Insiden.status == status_filter).order_by(desc(models.Insiden.waktu)).limit(limit)
    return db.scalars(q).all()


@router.post("", response_model=schemas.InsidenOut, status_code=status.HTTP_201_CREATED)
def create_insiden(
    payload: schemas.InsidenCreate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = models.Insiden(
        tiket=_next_tiket(db),
        waktu=datetime.now(timezone.utc),
        **payload.model_dump(),
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="create", objek=f"insiden#{obj.tiket}", detail=obj.deskripsi[:80], request=request)
    return obj


@router.patch("/{insiden_id}", response_model=schemas.InsidenOut)
def update_insiden(
    insiden_id: int,
    payload: schemas.InsidenUpdate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Insiden, insiden_id)
    if not obj:
        raise HTTPException(404, "Insiden tidak ditemukan")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="update", objek=f"insiden#{obj.tiket}", request=request)
    return obj


@router.get("/stats/summary")
def stats_summary(_: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    from sqlalchemy import func as sa_func
    total = db.scalar(select(sa_func.count(models.Insiden.id))) or 0
    terbuka = db.scalar(select(sa_func.count(models.Insiden.id)).where(models.Insiden.status.in_(["terbuka", "investigasi", "tindakan"]))) or 0
    selesai = db.scalar(select(sa_func.count(models.Insiden.id)).where(models.Insiden.status == "selesai")) or 0
    by_kategori = db.execute(
        select(models.Insiden.kategori, sa_func.count(models.Insiden.id)).group_by(models.Insiden.kategori)
    ).all()
    return {
        "total": int(total),
        "terbuka": int(terbuka),
        "selesai": int(selesai),
        "per_kategori": {k: int(c) for k, c in by_kategori},
    }
