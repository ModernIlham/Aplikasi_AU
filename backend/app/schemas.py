from __future__ import annotations

from datetime import datetime, time
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ─── Helpers ────────────────────────────────────────────────────────────────

class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ─── Auth ──────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=4, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    user: "UserOut"


class RegisterRequest(BaseModel):
    email: EmailStr
    nama: str
    password: str = Field(min_length=8, max_length=128)
    nip: str | None = None
    role: str = "operator_jadwal"
    unit_kerja: str | None = None


# ─── User ──────────────────────────────────────────────────────────────────

class UserOut(ORMModel):
    id: int
    email: EmailStr
    nip: str | None = None
    nama: str
    role: str
    unit_kerja: str | None = None
    aktif: bool
    last_login_at: datetime | None = None


class UserUpdate(BaseModel):
    nama: str | None = None
    nip: str | None = None
    role: str | None = None
    unit_kerja: str | None = None
    aktif: bool | None = None


class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(min_length=8, max_length=128)


# ─── Halte ─────────────────────────────────────────────────────────────────

class HalteBase(BaseModel):
    kode: str
    nama: str
    urutan: int = 0
    km: float = 0.0
    lat: float | None = None
    lon: float | None = None
    kapasitas_naik: int = 0
    fasilitas: str | None = None
    aktif: bool = True


class HalteCreate(HalteBase):
    pass


class HalteUpdate(BaseModel):
    nama: str | None = None
    urutan: int | None = None
    km: float | None = None
    lat: float | None = None
    lon: float | None = None
    kapasitas_naik: int | None = None
    fasilitas: str | None = None
    aktif: bool | None = None


class HalteOut(HalteBase, ORMModel):
    id: int
    created_at: datetime


# ─── Armada ────────────────────────────────────────────────────────────────

class ArmadaBase(BaseModel):
    kode: str
    plat: str
    tipe: str = "reguler"
    kapasitas: int = 80
    tahun: int = 2024
    km_total: float = 0.0
    status: str = "aktif"
    catatan: str | None = None


class ArmadaCreate(ArmadaBase):
    pass


class ArmadaUpdate(BaseModel):
    plat: str | None = None
    tipe: str | None = None
    kapasitas: int | None = None
    tahun: int | None = None
    km_total: float | None = None
    status: str | None = None
    catatan: str | None = None


class ArmadaOut(ArmadaBase, ORMModel):
    id: int
    created_at: datetime


# ─── Sopir ─────────────────────────────────────────────────────────────────

class SopirBase(BaseModel):
    kode: str
    nama: str
    nik: str | None = None
    no_sim: str | None = None
    sim_expired: datetime | None = None
    no_hp: str | None = None
    status: str = "aktif"
    jam_kerja_minggu: float = 0.0
    catatan: str | None = None


class SopirCreate(SopirBase):
    pass


class SopirUpdate(BaseModel):
    nama: str | None = None
    nik: str | None = None
    no_sim: str | None = None
    sim_expired: datetime | None = None
    no_hp: str | None = None
    status: str | None = None
    jam_kerja_minggu: float | None = None
    catatan: str | None = None


class SopirOut(SopirBase, ORMModel):
    id: int
    created_at: datetime


# ─── Trip ──────────────────────────────────────────────────────────────────

class TripBase(BaseModel):
    nomor: int
    arah: str = "berangkat"
    armada_id: int | None = None
    sopir_id: int | None = None
    waktu_berangkat: time
    waktu_tiba: time
    durasi_menit: int = 0
    kategori: str = "off_peak"
    is_sisipan: bool = False
    block_id: int | None = None
    catatan: str | None = None


class TripCreate(TripBase):
    pass


class TripUpdate(BaseModel):
    armada_id: int | None = None
    sopir_id: int | None = None
    waktu_berangkat: time | None = None
    waktu_tiba: time | None = None
    durasi_menit: int | None = None
    kategori: str | None = None
    is_sisipan: bool | None = None
    block_id: int | None = None
    catatan: str | None = None


class TripOut(TripBase, ORMModel):
    id: int
    tanggal: datetime


# ─── Insiden ───────────────────────────────────────────────────────────────

class InsidenBase(BaseModel):
    deskripsi: str
    armada_kode: str | None = None
    lokasi: str | None = None
    kategori: str = "operasional"
    dampak: str = "rendah"
    pic: str | None = None
    status: str = "terbuka"
    tindak_lanjut: str | None = None


class InsidenCreate(InsidenBase):
    pass


class InsidenUpdate(BaseModel):
    deskripsi: str | None = None
    armada_kode: str | None = None
    lokasi: str | None = None
    kategori: str | None = None
    dampak: str | None = None
    pic: str | None = None
    status: str | None = None
    tindak_lanjut: str | None = None


class InsidenOut(InsidenBase, ORMModel):
    id: int
    tiket: str
    waktu: datetime
    created_at: datetime


# ─── Notifikasi ────────────────────────────────────────────────────────────

class NotifikasiCreate(BaseModel):
    tingkat: str = "info"
    pesan: str
    sumber: str | None = None
    user_id: int | None = None


class NotifikasiOut(ORMModel):
    id: int
    waktu: datetime
    tingkat: str
    pesan: str
    sumber: str | None = None
    user_id: int | None = None
    dibaca: bool


# ─── Audit ─────────────────────────────────────────────────────────────────

class AuditOut(ORMModel):
    id: int
    waktu: datetime
    user_id: int | None = None
    user_email: str | None = None
    aksi: str
    objek: str
    detail: str | None = None
    ip: str | None = None
    method: str | None = None
    path: str | None = None


# ─── Periode Operasi ───────────────────────────────────────────────────────

class PeriodeBase(BaseModel):
    kode: str
    nama: str
    jam_mulai: time
    jam_selesai: time
    kategori: str = "off_peak"
    headway_target_menit: float | None = None
    armada_target: int | None = None
    aktif: bool = True
    catatan: str | None = None


class PeriodeCreate(PeriodeBase):
    pass


class PeriodeUpdate(BaseModel):
    nama: str | None = None
    jam_mulai: time | None = None
    jam_selesai: time | None = None
    kategori: str | None = None
    headway_target_menit: float | None = None
    armada_target: int | None = None
    aktif: bool | None = None
    catatan: str | None = None


class PeriodeOut(PeriodeBase, ORMModel):
    id: int
    created_at: datetime


# ─── Pengaduan ─────────────────────────────────────────────────────────────

class PengaduanBase(BaseModel):
    pelapor_nama: str
    pelapor_kontak: str | None = None
    kanal: str = "web"
    isi: str
    rute: str | None = None
    halte: str | None = None
    armada_kode: str | None = None


class PengaduanCreate(PengaduanBase):
    pass


class PengaduanUpdate(BaseModel):
    status: str | None = None
    pic: str | None = None
    tanggapan: str | None = None
    rating: int | None = None


class PengaduanOut(PengaduanBase, ORMModel):
    id: int
    tiket: str
    waktu: datetime
    status: str
    pic: str | None = None
    tanggapan: str | None = None
    rating: int | None = None
    created_at: datetime


# ─── Posisi Bus (GPS) ──────────────────────────────────────────────────────

class PosisiBusCreate(BaseModel):
    armada_id: int
    lat: float
    lon: float
    speed_kmh: float = 0.0
    heading: float = 0.0
    halte_kode: str | None = None
    delay_menit: float = 0.0
    sumber: str = "gps"


class PosisiBusOut(ORMModel):
    id: int
    armada_id: int
    waktu: datetime
    lat: float
    lon: float
    speed_kmh: float
    heading: float
    halte_kode: str | None = None
    delay_menit: float
    sumber: str


class PosisiBusLive(BaseModel):
    """Posisi terbaru per armada untuk halaman Peta Live."""
    armada_kode: str
    armada_plat: str
    armada_status: str
    lat: float
    lon: float
    speed_kmh: float
    heading: float
    halte_kode: str | None
    delay_menit: float
    waktu: datetime


# ─── SPM Compliance ────────────────────────────────────────────────────────

class SpmTemuan(BaseModel):
    id: str  # e.g. "spm.headway.peak"
    aturan: str  # "Permenhub 27/2015 §5"
    judul: str
    severity: Literal["lulus", "peringatan", "pelanggaran"]
    deskripsi: str
    metric_aktual: str | None = None
    metric_ambang: str | None = None
    rekomendasi: str | None = None


class SpmCompliance(BaseModel):
    skor: int  # 0..100
    diperiksa: int
    lulus: int
    peringatan: int
    pelanggaran: int
    temuan: list[SpmTemuan]


# ─── Generic ───────────────────────────────────────────────────────────────

class Message(BaseModel):
    message: str


# Resolve forward ref
TokenResponse.model_rebuild()
