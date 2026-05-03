from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from . import models  # noqa: F401  (register models)
from .config import get_settings
from .database import Base, engine, get_db
from .deps import get_current_user
from .routers import armada, audit, auth, halte, insiden, notifikasi, sopir, trip, users

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Auto-create tables on startup (dev convenience).
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Sistem Penjadwalan Bus Massal — API",
    description="REST API untuk modul jadwal/trip, armada, sopir, halte, audit log, insiden, notifikasi, dan user.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(armada.router)
app.include_router(sopir.router)
app.include_router(halte.router)
app.include_router(trip.router)
app.include_router(insiden.router)
app.include_router(notifikasi.router)
app.include_router(audit.router)


# ─── Dashboard / Health ─────────────────────────────────────────────────────

@app.get("/api/health", tags=["meta"])
def health():
    return {"status": "ok"}


@app.get("/api/dashboard/summary", tags=["meta"])
def dashboard_summary(_: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    armada_aktif = db.scalar(select(func.count(models.Armada.id)).where(models.Armada.status == "aktif")) or 0
    sopir_aktif  = db.scalar(select(func.count(models.Sopir.id)).where(models.Sopir.status == "aktif")) or 0
    halte_aktif  = db.scalar(select(func.count(models.Halte.id)).where(models.Halte.aktif == True)) or 0  # noqa: E712
    trip_total   = db.scalar(select(func.count(models.Trip.id))) or 0
    trip_sisipan = db.scalar(select(func.count(models.Trip.id)).where(models.Trip.is_sisipan == True)) or 0  # noqa: E712
    insiden_open = db.scalar(select(func.count(models.Insiden.id)).where(
        models.Insiden.status.in_(["terbuka", "investigasi", "tindakan"])
    )) or 0
    notif_unread = db.scalar(select(func.count(models.Notifikasi.id)).where(models.Notifikasi.dibaca == False)) or 0  # noqa: E712
    return {
        "armada_aktif": int(armada_aktif),
        "sopir_aktif": int(sopir_aktif),
        "halte_aktif": int(halte_aktif),
        "trip_total": int(trip_total),
        "trip_sisipan": int(trip_sisipan),
        "insiden_open": int(insiden_open),
        "notifikasi_unread": int(notif_unread),
    }


# ─── Frontend static mount ──────────────────────────────────────────────────
# Project root (one level up from `backend/`).
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
FRONTEND_HTML = PROJECT_ROOT / "JADWAL BUS - Redesign.html"
INDEX_HTML = PROJECT_ROOT / "index.html"


@app.get("/", include_in_schema=False)
def root():
    if INDEX_HTML.exists():
        return FileResponse(INDEX_HTML)
    if FRONTEND_HTML.exists():
        return FileResponse(FRONTEND_HTML)
    return RedirectResponse("/docs")


@app.get("/JADWAL BUS - Redesign.html", include_in_schema=False)
def serve_main_html():
    if FRONTEND_HTML.exists():
        return FileResponse(FRONTEND_HTML)
    return RedirectResponse("/docs")


# Mount remaining static files at /static/* (extend later as needed).
STATIC_DIR = PROJECT_ROOT / "static"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
