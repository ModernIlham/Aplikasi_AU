from __future__ import annotations

from datetime import datetime, time

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


# ─── Enums-as-strings (kept loose for flexibility) ──────────────────────────

ROLES = ("perencana_madya", "kepala_upt", "operator_jadwal", "auditor", "admin")
ARMADA_STATUS = ("aktif", "perbaikan", "non_aktif")
SOPIR_STATUS = ("aktif", "cuti", "non_aktif")
INSIDEN_KATEGORI = ("operasional", "teknis", "pelayanan", "keselamatan", "eksternal", "sdm")
INSIDEN_DAMPAK = ("rendah", "sedang", "tinggi")
INSIDEN_STATUS = ("terbuka", "investigasi", "tindakan", "selesai")
NOTIF_TINGKAT = ("info", "peringatan", "kritis")
TRIP_KATEGORI = ("peak", "off_peak", "transisi", "break", "standby", "sisipan", "deadhead")
PERIODE_KATEGORI = ("peak", "off_peak", "transisi", "break", "late", "tutup")
PENGADUAN_STATUS = ("baru", "ditinjau", "tindak_lanjut", "selesai", "ditolak")
PENGADUAN_KANAL = ("web", "email", "telepon", "wa", "sosmed", "lapor", "datang_langsung")
PEMELIHARAAN_TIPE = ("berkala_10k", "berkala_50k", "major", "kir", "spot", "brake", "engine")
PEMELIHARAAN_STATUS = ("terjadwal", "sedang_dikerjakan", "selesai", "batal")
TARIF_KATEGORI = ("dewasa", "pelajar", "lansia", "difabel", "asn_subsidi")


# ─── User ──────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(160), unique=True, index=True, nullable=False)
    nip: Mapped[str | None] = mapped_column(String(32), unique=True, index=True)
    nama: Mapped[str] = mapped_column(String(160), nullable=False)
    role: Mapped[str] = mapped_column(String(40), nullable=False, default="operator_jadwal")
    unit_kerja: Mapped[str | None] = mapped_column(String(160))
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    aktif: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─── Halte ─────────────────────────────────────────────────────────────────

class Halte(Base):
    __tablename__ = "haltes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    kode: Mapped[str] = mapped_column(String(16), unique=True, index=True, nullable=False)
    nama: Mapped[str] = mapped_column(String(160), nullable=False)
    urutan: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    km: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    lat: Mapped[float | None] = mapped_column(Float)
    lon: Mapped[float | None] = mapped_column(Float)
    kapasitas_naik: Mapped[int] = mapped_column(Integer, default=0)
    fasilitas: Mapped[str | None] = mapped_column(Text)
    aktif: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─── Armada ────────────────────────────────────────────────────────────────

class Armada(Base):
    __tablename__ = "armadas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    kode: Mapped[str] = mapped_column(String(16), unique=True, index=True, nullable=False)
    plat: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    tipe: Mapped[str] = mapped_column(String(40), default="reguler", nullable=False)
    kapasitas: Mapped[int] = mapped_column(Integer, default=80, nullable=False)
    tahun: Mapped[int] = mapped_column(Integer, default=2024, nullable=False)
    km_total: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="aktif", nullable=False)
    catatan: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    trips: Mapped[list["Trip"]] = relationship(back_populates="armada")


# ─── Sopir ─────────────────────────────────────────────────────────────────

class Sopir(Base):
    __tablename__ = "sopirs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    kode: Mapped[str] = mapped_column(String(16), unique=True, index=True, nullable=False)
    nama: Mapped[str] = mapped_column(String(160), nullable=False)
    nik: Mapped[str | None] = mapped_column(String(32), unique=True)
    no_sim: Mapped[str | None] = mapped_column(String(32))
    sim_expired: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    no_hp: Mapped[str | None] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(20), default="aktif", nullable=False)
    jam_kerja_minggu: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    catatan: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    trips: Mapped[list["Trip"]] = relationship(back_populates="sopir")


# ─── Trip / Jadwal ─────────────────────────────────────────────────────────

class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nomor: Mapped[int] = mapped_column(Integer, nullable=False)  # 1..N untuk satu hari
    arah: Mapped[str] = mapped_column(String(16), default="berangkat", nullable=False)
    armada_id: Mapped[int | None] = mapped_column(ForeignKey("armadas.id"), index=True)
    sopir_id: Mapped[int | None] = mapped_column(ForeignKey("sopirs.id"), index=True)
    waktu_berangkat: Mapped[time] = mapped_column(Time, nullable=False)
    waktu_tiba: Mapped[time] = mapped_column(Time, nullable=False)
    durasi_menit: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    kategori: Mapped[str] = mapped_column(String(20), default="off_peak", nullable=False)
    is_sisipan: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    block_id: Mapped[int | None] = mapped_column(Integer)
    catatan: Mapped[str | None] = mapped_column(Text)
    tanggal: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    armada: Mapped[Armada | None] = relationship(back_populates="trips")
    sopir: Mapped[Sopir | None] = relationship(back_populates="trips")


# ─── Insiden ───────────────────────────────────────────────────────────────

class Insiden(Base):
    __tablename__ = "insidens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tiket: Mapped[str] = mapped_column(String(16), unique=True, index=True, nullable=False)
    waktu: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    deskripsi: Mapped[str] = mapped_column(Text, nullable=False)
    armada_kode: Mapped[str | None] = mapped_column(String(16))
    lokasi: Mapped[str | None] = mapped_column(String(160))
    kategori: Mapped[str] = mapped_column(String(40), default="operasional", nullable=False)
    dampak: Mapped[str] = mapped_column(String(20), default="rendah", nullable=False)
    pic: Mapped[str | None] = mapped_column(String(160))
    status: Mapped[str] = mapped_column(String(20), default="terbuka", nullable=False)
    tindak_lanjut: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─── Notifikasi ────────────────────────────────────────────────────────────

class Notifikasi(Base):
    __tablename__ = "notifikasis"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    waktu: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    tingkat: Mapped[str] = mapped_column(String(20), default="info", nullable=False)
    pesan: Mapped[str] = mapped_column(Text, nullable=False)
    sumber: Mapped[str | None] = mapped_column(String(80))
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), index=True)
    dibaca: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


# ─── Audit Log ─────────────────────────────────────────────────────────────

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    waktu: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), index=True)
    user_email: Mapped[str | None] = mapped_column(String(160))  # snapshot
    aksi: Mapped[str] = mapped_column(String(40), nullable=False)
    objek: Mapped[str] = mapped_column(String(160), nullable=False)
    detail: Mapped[str | None] = mapped_column(Text)
    ip: Mapped[str | None] = mapped_column(String(64))
    method: Mapped[str | None] = mapped_column(String(8))
    path: Mapped[str | None] = mapped_column(String(255))


# ─── Periode Operasi (window scheduling) ───────────────────────────────────

class Periode(Base):
    """Window operasi 24 jam — basis untuk perencanaan headway per periode.

    Contoh: P03 (Peak Pagi) 06:00–07:00, headway 15 m, kategori "peak".
    """
    __tablename__ = "periodes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    kode: Mapped[str] = mapped_column(String(8), unique=True, index=True, nullable=False)  # P01..P25
    nama: Mapped[str] = mapped_column(String(80), nullable=False)
    jam_mulai: Mapped[time] = mapped_column(Time, nullable=False)
    jam_selesai: Mapped[time] = mapped_column(Time, nullable=False)
    kategori: Mapped[str] = mapped_column(String(20), default="off_peak", nullable=False)
    headway_target_menit: Mapped[float | None] = mapped_column(Float)
    armada_target: Mapped[int | None] = mapped_column(Integer)
    aktif: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    catatan: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─── Pengaduan Publik (UU 25/2009 Pelayanan Publik) ────────────────────────

class Pengaduan(Base):
    __tablename__ = "pengaduans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tiket: Mapped[str] = mapped_column(String(16), unique=True, index=True, nullable=False)  # PGD-0001
    waktu: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    pelapor_nama: Mapped[str] = mapped_column(String(160), nullable=False)
    pelapor_kontak: Mapped[str | None] = mapped_column(String(80))
    kanal: Mapped[str] = mapped_column(String(20), default="web", nullable=False)
    isi: Mapped[str] = mapped_column(Text, nullable=False)
    rute: Mapped[str | None] = mapped_column(String(40))
    halte: Mapped[str | None] = mapped_column(String(40))
    armada_kode: Mapped[str | None] = mapped_column(String(16))
    status: Mapped[str] = mapped_column(String(20), default="baru", nullable=False)
    pic: Mapped[str | None] = mapped_column(String(160))
    tanggapan: Mapped[str | None] = mapped_column(Text)
    rating: Mapped[int | None] = mapped_column(Integer)  # 1..5 setelah selesai
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─── Posisi Bus (GPS ping) ─────────────────────────────────────────────────

class PosisiBus(Base):
    """Snapshot posisi armada — append-only. Dipakai oleh halaman Peta Live.

    Disimpan ringan; tabel ini boleh di-prune berkala (mis. retain 30 hari).
    """
    __tablename__ = "posisi_bus"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    armada_id: Mapped[int] = mapped_column(ForeignKey("armadas.id"), index=True, nullable=False)
    waktu: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lon: Mapped[float] = mapped_column(Float, nullable=False)
    speed_kmh: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    heading: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 0–359
    halte_kode: Mapped[str | None] = mapped_column(String(16))  # halte terdekat saat ini
    delay_menit: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # vs jadwal
    sumber: Mapped[str] = mapped_column(String(20), default="gps", nullable=False)  # gps|mock|manual

    armada: Mapped[Armada] = relationship()


# ─── Pemeliharaan (Service schedule & KIR) ─────────────────────────────────

class Pemeliharaan(Base):
    __tablename__ = "pemeliharaans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    armada_id: Mapped[int] = mapped_column(ForeignKey("armadas.id"), index=True, nullable=False)
    tipe: Mapped[str] = mapped_column(String(20), default="berkala_10k", nullable=False)
    tanggal_service_terakhir: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    odometer_terakhir_km: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    tanggal_service_berikutnya: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    odometer_target_km: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    kir_berlaku: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    biaya_rp: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    catatan: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="terjadwal", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    armada: Mapped[Armada] = relationship()


# ─── Tarif (Fare structure) ────────────────────────────────────────────────

class Tarif(Base):
    __tablename__ = "tarifs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    kategori: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    label: Mapped[str] = mapped_column(String(80), nullable=False)  # "Dewasa Umum", dll
    tarif_rp: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    verifikasi: Mapped[str | None] = mapped_column(String(80))  # "KIA/KTM", "Kartu Disabilitas"
    pax_per_hari: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    aktif: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    efektif_mulai: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    catatan: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
