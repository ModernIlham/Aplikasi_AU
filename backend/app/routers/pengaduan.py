from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, write_audit

router = APIRouter(prefix="/api/pengaduan", tags=["pengaduan"])


def _next_tiket(db: Session) -> str:
    last = db.scalar(select(models.Pengaduan).order_by(desc(models.Pengaduan.id)).limit(1))
    n = (last.id + 1) if last else 1
    return f"PGD-{n:04d}"


# Public submission — no auth required (sesuai semangat UU 25/2009)
public_router = APIRouter(prefix="/api/pengaduan/public", tags=["pengaduan-public"])


@public_router.post("", response_model=schemas.PengaduanOut, status_code=status.HTTP_201_CREATED)
def submit_public(
    payload: schemas.PengaduanCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    obj = models.Pengaduan(
        tiket=_next_tiket(db),
        waktu=datetime.now(timezone.utc),
        **payload.model_dump(),
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    # Audit log untuk submission publik (tanpa user)
    write_audit(db, user=None, aksi="create_public", objek=f"pengaduan#{obj.tiket}", detail=obj.isi[:80], request=request)
    return obj


# Internal endpoints — require auth
@router.get("", response_model=list[schemas.PengaduanOut])
def list_pengaduan(
    status_filter: str | None = None,
    limit: int = 100,
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = select(models.Pengaduan).order_by(desc(models.Pengaduan.waktu)).limit(limit)
    if status_filter:
        q = select(models.Pengaduan).where(models.Pengaduan.status == status_filter).order_by(desc(models.Pengaduan.waktu)).limit(limit)
    return db.scalars(q).all()


@router.patch("/{pengaduan_id}", response_model=schemas.PengaduanOut)
def update_pengaduan(
    pengaduan_id: int,
    payload: schemas.PengaduanUpdate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Pengaduan, pengaduan_id)
    if not obj:
        raise HTTPException(404, "Pengaduan tidak ditemukan")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="update", objek=f"pengaduan#{obj.tiket}", request=request)
    return obj


@router.get("/stats/summary")
def stats_summary(_: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    total = db.scalar(select(func.count(models.Pengaduan.id))) or 0
    baru = db.scalar(select(func.count(models.Pengaduan.id)).where(models.Pengaduan.status == "baru")) or 0
    selesai = db.scalar(select(func.count(models.Pengaduan.id)).where(models.Pengaduan.status == "selesai")) or 0
    by_kanal = db.execute(
        select(models.Pengaduan.kanal, func.count(models.Pengaduan.id)).group_by(models.Pengaduan.kanal)
    ).all()
    rating_avg = db.scalar(select(func.avg(models.Pengaduan.rating))) or 0
    return {
        "total": int(total),
        "baru": int(baru),
        "selesai": int(selesai),
        "rating_avg": round(float(rating_avg), 2),
        "per_kanal": {k: int(c) for k, c in by_kanal},
    }
