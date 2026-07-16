"""Posisi GPS armada untuk halaman Peta Koridor Live.

Endpoint utama:
- POST  /api/posisi/ping            — armada/operator mengirim posisi (GPS device)
- GET   /api/posisi/live            — posisi terbaru per armada (untuk Peta Live)
- GET   /api/posisi/{armada_id}     — riwayat posisi 1 armada
- POST  /api/posisi/mock-tick       — generate mock GPS untuk demo (dev only)
"""

from __future__ import annotations

import math
import random
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/posisi", tags=["posisi"])


@router.post("/ping", response_model=schemas.PosisiBusOut, status_code=status.HTTP_201_CREATED)
def ping_position(
    payload: schemas.PosisiBusCreate,
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    armada = db.get(models.Armada, payload.armada_id)
    if not armada:
        raise HTTPException(404, "Armada tidak ditemukan")
    obj = models.PosisiBus(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/live", response_model=list[schemas.PosisiBusLive])
def live_positions(
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Posisi terbaru per armada aktif. Sumber bisa GPS sungguhan atau mock-tick."""
    armadas = db.scalars(
        select(models.Armada).where(models.Armada.status == "aktif").order_by(models.Armada.kode)
    ).all()
    out: list[schemas.PosisiBusLive] = []
    for a in armadas:
        last = db.scalar(
            select(models.PosisiBus)
            .where(models.PosisiBus.armada_id == a.id)
            .order_by(desc(models.PosisiBus.waktu))
            .limit(1)
        )
        if not last:
            continue
        out.append(schemas.PosisiBusLive(
            armada_kode=a.kode,
            armada_plat=a.plat,
            armada_status=a.status,
            lat=last.lat, lon=last.lon,
            speed_kmh=last.speed_kmh, heading=last.heading,
            halte_kode=last.halte_kode, delay_menit=last.delay_menit,
            waktu=last.waktu,
        ))
    return out


@router.get("/{armada_id}", response_model=list[schemas.PosisiBusOut])
def history(
    armada_id: int,
    limit: int = Query(100, ge=1, le=2000),
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(models.PosisiBus)
        .where(models.PosisiBus.armada_id == armada_id)
        .order_by(desc(models.PosisiBus.waktu))
        .limit(limit)
    ).all()


@router.post("/mock-tick", response_model=list[schemas.PosisiBusLive])
def mock_tick(
    _: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate satu tick GPS palsu untuk semua armada aktif.

    Berguna untuk dev/demo tanpa GPS device sungguhan. Posisi diinterpolasi
    di sepanjang halte (urut by `urutan`), dengan random walk kecil.
    """
    armadas = db.scalars(
        select(models.Armada).where(models.Armada.status == "aktif").order_by(models.Armada.kode)
    ).all()
    haltes = db.scalars(select(models.Halte).order_by(models.Halte.urutan)).all()
    if not haltes:
        raise HTTPException(400, "Belum ada halte. Jalankan seed.py terlebih dahulu.")

    # Default lat/lon untuk halte yang belum punya koordinat (mock IKN sekitar -0.95, 116.7)
    base_lat, base_lon = -0.95, 116.70
    coords: list[tuple[float, float, str]] = []
    for h in haltes:
        lat = h.lat if h.lat is not None else (base_lat + (h.urutan - 1) * 0.012)
        lon = h.lon if h.lon is not None else (base_lon + (h.urutan - 1) * 0.008)
        coords.append((lat, lon, h.kode))

    out: list[schemas.PosisiBusLive] = []
    now = datetime.now(timezone.utc)
    for i, a in enumerate(armadas):
        # Tiap armada di-anchor ke halte berbeda, lalu jitter
        idx = (i * 2 + (now.minute // 5)) % len(coords)
        lat, lon, halte_kode = coords[idx]
        lat += random.uniform(-0.0008, 0.0008)
        lon += random.uniform(-0.0008, 0.0008)
        speed = random.uniform(28.0, 45.0)
        heading = random.uniform(0.0, 359.0)
        delay = round(random.uniform(-1.5, 4.0), 1)
        ping = models.PosisiBus(
            armada_id=a.id, lat=lat, lon=lon,
            speed_kmh=speed, heading=heading,
            halte_kode=halte_kode, delay_menit=delay,
            sumber="mock",
        )
        db.add(ping)
        db.flush()
        out.append(schemas.PosisiBusLive(
            armada_kode=a.kode, armada_plat=a.plat, armada_status=a.status,
            lat=lat, lon=lon, speed_kmh=speed, heading=heading,
            halte_kode=halte_kode, delay_menit=delay, waktu=ping.waktu or now,
        ))
    db.commit()
    return out
