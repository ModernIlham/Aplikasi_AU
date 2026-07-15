# Backend — Sistem Penjadwalan Bus Massal

REST API berbasis **FastAPI + PostgreSQL** untuk modul: jadwal/trip, armada, sopir, halte, audit log, insiden, notifikasi, dan user. Server ini juga sekaligus melayani frontend HTML dari folder root project, sehingga cukup satu proses untuk demo end-to-end.

## Prasyarat

- Python 3.11+
- Docker (untuk PostgreSQL via `docker compose`) **atau** PostgreSQL lokal yang sudah jalan

## 1. Jalankan PostgreSQL (Docker)

```bash
cd backend
docker compose up -d
```

Atau pakai PostgreSQL milik Anda sendiri — tinggal sesuaikan `DATABASE_URL` di `.env`.

## 2. Install dependency Python

```bash
cd backend
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## 3. Konfigurasi env

```bash
cp .env.example .env
# Edit .env kalau perlu (terutama JWT_SECRET di production)
```

## 4. Seed data awal

```bash
python seed.py
```

Akan dibuat: 4 user, 7 halte (Koridor 1E IKN), 5 armada, 8 sopir, ~77 trip, 6 insiden, 5 notifikasi, dan beberapa audit log.

## 5. Jalankan server

```bash
uvicorn app.main:app --reload --port 8000
```

Buka:

| URL                                         | Isi                                              |
| ------------------------------------------- | ------------------------------------------------ |
| http://localhost:8000/                      | Frontend HTML (otomatis redirect ke aplikasi)    |
| http://localhost:8000/docs                  | **Swagger UI** — dokumentasi API interaktif      |
| http://localhost:8000/redoc                 | ReDoc                                            |
| http://localhost:8000/api/health            | Health check                                     |

## 6. Login

Default kredensial setelah seed:

| Email                  | Password      | Role             |
| ---------------------- | ------------- | ---------------- |
| `rizki@dephub.go.id`   | `password123` | perencana_madya  |
| `haryanto@dephub.go.id`| `password123` | kepala_upt       |
| `sri@dephub.go.id`     | `password123` | operator_jadwal  |
| `admin@dephub.go.id`   | `admin1234`   | admin            |

Frontend menyimpan token JWT di `localStorage` setelah login dan otomatis melampirkan `Authorization: Bearer <token>` ke setiap request.

## Endpoint utama

Semua endpoint kecuali `/api/auth/*` membutuhkan header `Authorization: Bearer <token>`.

| Method  | Path                                  | Keterangan                                |
| ------- | ------------------------------------- | ----------------------------------------- |
| POST    | `/api/auth/register`                  | Buat user baru                            |
| POST    | `/api/auth/login`                     | Login (email + password) → JWT            |
| GET     | `/api/auth/me`                        | Profil user aktif                         |
| POST    | `/api/auth/change-password`           | Ubah password                             |
| GET     | `/api/users`                          | List user                                 |
| GET/POST/PATCH/DELETE | `/api/armada`           | CRUD armada                               |
| GET/POST/PATCH/DELETE | `/api/sopir`            | CRUD sopir                                |
| GET/POST/PATCH/DELETE | `/api/halte`            | CRUD halte                                |
| GET/POST/PATCH/DELETE | `/api/trip`             | CRUD trip / jadwal                        |
| GET     | `/api/trip/summary/per-armada`        | Ringkasan trip per armada (Utilisasi)     |
| GET/POST/PATCH        | `/api/insiden`          | CRUD insiden                              |
| GET     | `/api/insiden/stats/summary`          | Statistik insiden                         |
| GET/POST              | `/api/notifikasi`       | List & buat notifikasi                    |
| POST    | `/api/notifikasi/read-all`            | Tandai semua dibaca                       |
| GET     | `/api/audit`                          | Riwayat aktivitas (audit log)             |
| GET     | `/api/dashboard/summary`              | KPI dashboard                             |
| GET/POST/PATCH/DELETE | `/api/periode`          | CRUD periode operasi (window 24 jam)      |
| GET/PATCH | `/api/pengaduan`                    | Pengaduan publik (internal)               |
| POST    | `/api/pengaduan/public`               | **Public** (no-auth) — submit pengaduan   |
| GET     | `/api/pengaduan/stats/summary`        | Statistik pengaduan + rating              |
| POST    | `/api/posisi/ping`                    | Kirim posisi GPS armada                   |
| GET     | `/api/posisi/live`                    | Posisi terbaru per armada (Peta Live)     |
| POST    | `/api/posisi/mock-tick`               | Generate mock GPS untuk demo              |
| GET     | `/api/posisi/{armada_id}`             | Riwayat posisi per armada                 |
| GET     | `/api/compliance/spm`                 | Validasi SPM otomatis (Permenhub 27/2015) |
| GET/POST/PATCH/DELETE | `/api/pemeliharaan`     | Jadwal service, KIR, brake per armada     |
| GET     | `/api/pemeliharaan/per-armada`        | Ringkasan pemeliharaan per armada         |
| GET/POST/PATCH/DELETE | `/api/tarif`            | Struktur tarif per kategori penumpang     |
| GET     | `/api/tarif/summary`                  | Total pax & pendapatan per kategori       |

Semua write-operation otomatis mencatat entri ke `audit_logs` (lihat halaman **Riwayat Aktivitas** di frontend).

## Struktur folder

```
backend/
├── app/
│   ├── main.py            # FastAPI entrypoint + static frontend mount
│   ├── config.py          # Settings via .env
│   ├── database.py        # SQLAlchemy engine + session
│   ├── models.py          # 8 SQLAlchemy models
│   ├── schemas.py         # Pydantic v2 schemas
│   ├── auth.py            # JWT + bcrypt
│   ├── deps.py            # FastAPI dependencies (auth, audit)
│   └── routers/           # 9 router modules (CRUD per entitas)
├── seed.py                # Isi data awal Koridor 1E
├── docker-compose.yml     # PostgreSQL container
├── .env.example
└── requirements.txt
```

## Pengembangan

- **Auto-reload**: `uvicorn app.main:app --reload` — perubahan kode otomatis ter-restart.
- **Migrasi**: untuk dev, tabel dibuat otomatis via `Base.metadata.create_all`. Untuk production, gunakan Alembic (`alembic init alembic`).
- **Tambah modul**: bikin model di `app/models.py`, schema di `app/schemas.py`, router di `app/routers/<nama>.py`, lalu `app.include_router(...)` di `app/main.py`.

## Catatan keamanan untuk production

1. **Ganti `JWT_SECRET`** ke string acak ≥ 32 karakter.
2. Aktifkan HTTPS (reverse proxy: nginx / Caddy).
3. Set `CORS_ORIGINS` ke domain spesifik, **bukan** wildcard.
4. Pertimbangkan rate limiting (mis. `slowapi`) di endpoint `/api/auth/login`.
5. Backup PostgreSQL berkala.
6. Tambahkan Alembic + migrasi versi.
