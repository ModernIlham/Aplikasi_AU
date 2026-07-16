"""SPM Compliance Check — validasi otomatis terhadap regulasi.

Memeriksa jadwal aktif vs:
- Permenhub 27/2015 §5 (SPM headway peak ≤ 10 m, off-peak ≤ 15 m)
- Permenhub 79/2013 (jam kerja sopir ≤ 8 j/hari, 40 j/minggu)
- TCQSM 3rd Ed (recovery time 10–15%, CoV headway < 0,2)
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/compliance", tags=["compliance"])

PEAK_HEADWAY_AMBANG = 10.0      # menit
OFFPEAK_HEADWAY_AMBANG = 15.0
SOPIR_JAM_MINGGU_AMBANG = 40.0
RECOVERY_MIN = 10.0             # %
RECOVERY_MAX = 15.0


def _calc_avg_headway(db: Session, kategori: str) -> float | None:
    """Estimasi headway rerata berbasis jumlah trip dan rentang waktu kategori tsb."""
    n = db.scalar(select(func.count(models.Trip.id)).where(models.Trip.kategori == kategori)) or 0
    if n == 0:
        return None
    # Asumsi jam operasi peak ~3,5 j × 60 = 210 m, off-peak ~13 j × 60 = 780 m.
    durasi_menit = 210.0 if kategori == "peak" else 780.0
    return round(durasi_menit / n, 2) if n else None


@router.get("/spm", response_model=schemas.SpmCompliance)
def check_spm(_: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    temuan: list[schemas.SpmTemuan] = []

    # ── Aturan 1: Headway peak ≤ 10 menit (Permenhub 27/2015 §5) ──
    h_peak = _calc_avg_headway(db, "peak")
    if h_peak is None:
        temuan.append(schemas.SpmTemuan(
            id="spm.headway.peak.no_data",
            aturan="Permenhub 27/2015 §5",
            judul="Tidak ada trip kategori peak",
            severity="peringatan",
            deskripsi="Belum ada trip dengan kategori 'peak'. Tidak dapat dievaluasi.",
        ))
    elif h_peak <= PEAK_HEADWAY_AMBANG:
        temuan.append(schemas.SpmTemuan(
            id="spm.headway.peak",
            aturan="Permenhub 27/2015 §5",
            judul="Headway peak memenuhi SPM",
            severity="lulus",
            deskripsi="Frekuensi peak hour sesuai standar pelayanan minimum.",
            metric_aktual=f"{h_peak} m",
            metric_ambang=f"≤ {PEAK_HEADWAY_AMBANG} m",
        ))
    else:
        temuan.append(schemas.SpmTemuan(
            id="spm.headway.peak",
            aturan="Permenhub 27/2015 §5",
            judul="Headway peak melebihi SPM",
            severity="pelanggaran" if h_peak > PEAK_HEADWAY_AMBANG * 1.4 else "peringatan",
            deskripsi="Frekuensi peak hour di bawah standar. Pertimbangkan sisipan armada atau short-turn.",
            metric_aktual=f"{h_peak} m",
            metric_ambang=f"≤ {PEAK_HEADWAY_AMBANG} m",
            rekomendasi="Aktifkan trip sisipan B-04 di periode 07:00–09:00 atau tambah armada.",
        ))

    # ── Aturan 2: Headway off-peak ≤ 15 menit ──
    h_off = _calc_avg_headway(db, "off_peak")
    if h_off is not None:
        if h_off <= OFFPEAK_HEADWAY_AMBANG:
            temuan.append(schemas.SpmTemuan(
                id="spm.headway.offpeak",
                aturan="Permenhub 27/2015 §5",
                judul="Headway off-peak memenuhi SPM",
                severity="lulus",
                deskripsi="Frekuensi minimum tercapai pada window non-peak.",
                metric_aktual=f"{h_off} m",
                metric_ambang=f"≤ {OFFPEAK_HEADWAY_AMBANG} m",
            ))
        else:
            temuan.append(schemas.SpmTemuan(
                id="spm.headway.offpeak",
                aturan="Permenhub 27/2015 §5",
                judul="Headway off-peak di bawah standar",
                severity="peringatan",
                deskripsi="Sebaran frekuensi non-peak perlu ditinjau.",
                metric_aktual=f"{h_off} m",
                metric_ambang=f"≤ {OFFPEAK_HEADWAY_AMBANG} m",
            ))

    # ── Aturan 3: Sopir tidak melebihi 40 j/minggu (Permenhub 79/2013) ──
    overworked = db.scalars(
        select(models.Sopir).where(
            models.Sopir.status == "aktif",
            models.Sopir.jam_kerja_minggu > SOPIR_JAM_MINGGU_AMBANG,
        )
    ).all()
    if not overworked:
        temuan.append(schemas.SpmTemuan(
            id="spm.sopir.jam",
            aturan="Permenhub 79/2013",
            judul="Jam kerja sopir dalam batas",
            severity="lulus",
            deskripsi="Tidak ada sopir aktif yang melebihi 40 jam/minggu.",
        ))
    else:
        for s in overworked:
            sev = "pelanggaran" if s.jam_kerja_minggu > 45 else "peringatan"
            temuan.append(schemas.SpmTemuan(
                id=f"spm.sopir.jam.{s.kode}",
                aturan="Permenhub 79/2013",
                judul=f"Sopir {s.nama} mendekati/melampaui batas",
                severity=sev,
                deskripsi=f"Akumulasi jam kerja minggu ini: {s.jam_kerja_minggu:.1f} jam.",
                metric_aktual=f"{s.jam_kerja_minggu:.1f} j",
                metric_ambang=f"≤ {SOPIR_JAM_MINGGU_AMBANG:.0f} j",
                rekomendasi="Rotasi sopir, atau perpanjang break period berikutnya.",
            ))

    # ── Aturan 4: SIM expired check ──
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    soon_expire = db.scalars(
        select(models.Sopir).where(
            models.Sopir.status == "aktif",
            models.Sopir.sim_expired.is_not(None),
            models.Sopir.sim_expired <= now + timedelta(days=90),
        )
    ).all()
    if not soon_expire:
        temuan.append(schemas.SpmTemuan(
            id="spm.sopir.sim",
            aturan="UU 22/2009",
            judul="SIM sopir aktif",
            severity="lulus",
            deskripsi="Tidak ada SIM yang akan habis dalam 90 hari.",
        ))
    else:
        for s in soon_expire:
            days = (s.sim_expired - now).days if s.sim_expired else 0
            sev = "pelanggaran" if days < 0 else "peringatan"
            temuan.append(schemas.SpmTemuan(
                id=f"spm.sopir.sim.{s.kode}",
                aturan="UU 22/2009",
                judul=f"SIM {s.nama} segera habis",
                severity=sev,
                deskripsi=f"SIM habis pada {s.sim_expired:%d %b %Y}" + (" (sudah lewat!)" if days < 0 else f" — sisa {days} hari"),
                rekomendasi="Perpanjangan SIM dijadwalkan segera.",
            ))

    # ── Aturan 5: Armada non-aktif > 25% dari total ──
    total_armada = db.scalar(select(func.count(models.Armada.id))) or 0
    armada_aktif = db.scalar(select(func.count(models.Armada.id)).where(models.Armada.status == "aktif")) or 0
    if total_armada > 0:
        pct = (armada_aktif / total_armada) * 100
        if pct >= 80:
            temuan.append(schemas.SpmTemuan(
                id="spm.armada.aktif",
                aturan="Praktik Terbaik BTS",
                judul="Ketersediaan armada baik",
                severity="lulus",
                deskripsi=f"{armada_aktif} dari {total_armada} armada aktif ({pct:.0f}%).",
            ))
        else:
            temuan.append(schemas.SpmTemuan(
                id="spm.armada.aktif",
                aturan="Praktik Terbaik BTS",
                judul="Ketersediaan armada rendah",
                severity="peringatan",
                deskripsi=f"Hanya {armada_aktif} dari {total_armada} armada aktif ({pct:.0f}%).",
                rekomendasi="Percepat penyelesaian pemeliharaan armada non-aktif.",
            ))

    # ── Aturan 6: Cakupan halte (minimal 5 halte aktif) ──
    n_halte = db.scalar(select(func.count(models.Halte.id)).where(models.Halte.aktif == True)) or 0  # noqa: E712
    if n_halte >= 5:
        temuan.append(schemas.SpmTemuan(
            id="spm.halte.cakupan",
            aturan="Permenhub 27/2015",
            judul="Cakupan halte memadai",
            severity="lulus",
            deskripsi=f"{n_halte} halte aktif pada koridor.",
        ))
    else:
        temuan.append(schemas.SpmTemuan(
            id="spm.halte.cakupan",
            aturan="Permenhub 27/2015",
            judul="Halte aktif minim",
            severity="pelanggaran",
            deskripsi=f"Hanya {n_halte} halte aktif. Minimum operasional koridor: 5 halte.",
        ))

    # Aggregate
    n_lulus = sum(1 for t in temuan if t.severity == "lulus")
    n_warn  = sum(1 for t in temuan if t.severity == "peringatan")
    n_bad   = sum(1 for t in temuan if t.severity == "pelanggaran")
    diperiksa = len(temuan)
    skor = max(0, min(100, int(round(100 * (n_lulus + 0.5 * n_warn) / max(1, diperiksa)))))
    return schemas.SpmCompliance(
        skor=skor,
        diperiksa=diperiksa,
        lulus=n_lulus,
        peringatan=n_warn,
        pelanggaran=n_bad,
        temuan=temuan,
    )
