from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, write_audit

router = APIRouter(prefix="/api/trip", tags=["trip"])


@router.get("", response_model=list[schemas.TripOut])
def list_trip(
    armada_id: int | None = None,
    arah: str | None = None,
    is_sisipan: bool | None = None,
    limit: int = Query(500, ge=1, le=2000),
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = select(models.Trip).order_by(models.Trip.nomor)
    if armada_id is not None:
        q = q.where(models.Trip.armada_id == armada_id)
    if arah:
        q = q.where(models.Trip.arah == arah)
    if is_sisipan is not None:
        q = q.where(models.Trip.is_sisipan == is_sisipan)
    return db.scalars(q.limit(limit)).all()


@router.post("", response_model=schemas.TripOut, status_code=status.HTTP_201_CREATED)
def create_trip(
    payload: schemas.TripCreate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = models.Trip(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="create", objek=f"trip#{obj.id}", request=request)
    return obj


@router.patch("/{trip_id}", response_model=schemas.TripOut)
def update_trip(
    trip_id: int,
    payload: schemas.TripUpdate,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Trip, trip_id)
    if not obj:
        raise HTTPException(404, "Trip tidak ditemukan")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    write_audit(db, user=user, aksi="update", objek=f"trip#{trip_id}", request=request)
    return obj


@router.delete("/{trip_id}", response_model=schemas.Message)
def delete_trip(
    trip_id: int,
    request: Request,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.get(models.Trip, trip_id)
    if not obj:
        raise HTTPException(404, "Trip tidak ditemukan")
    db.delete(obj)
    db.commit()
    write_audit(db, user=user, aksi="hapus", objek=f"trip#{trip_id}", request=request)
    return {"message": "Trip dihapus."}


@router.get("/summary/per-armada", response_model=list[dict])
def summary_per_armada(
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Ringkasan jumlah trip per armada — dipakai oleh halaman Utilisasi."""
    from sqlalchemy import func as sa_func

    rows = db.execute(
        select(
            models.Armada.kode,
            models.Armada.plat,
            models.Armada.kapasitas,
            sa_func.count(models.Trip.id),
        )
        .outerjoin(models.Trip, models.Trip.armada_id == models.Armada.id)
        .group_by(models.Armada.id)
        .order_by(models.Armada.kode)
    ).all()
    return [
        {"kode": kode, "plat": plat, "kapasitas": kap, "trip_count": int(n or 0)}
        for kode, plat, kap, n in rows
    ]
