"""Isi database dengan data realistik untuk Koridor 1E (IKN).

Jalankan: `python seed.py` (dari folder backend, setelah `pip install -r requirements.txt`).
Aman dijalankan ulang — script ini idempotent (hanya menambah jika tabel kosong).
"""

from datetime import datetime, time, timedelta, timezone

from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app.models import (
    Armada,
    AuditLog,
    Halte,
    Insiden,
    Notifikasi,
    Pengaduan,
    Periode,
    Sopir,
    Trip,
    User,
)


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            users = [
                User(
                    email="rizki@dephub.go.id",
                    nip="19850412 200912 1 003",
                    nama="Ir. Rizki Aditama, M.T.",
                    role="perencana_madya",
                    unit_kerja="BPTJ — OIKN",
                    password_hash=hash_password("password123"),
                ),
                User(
                    email="haryanto@dephub.go.id",
                    nip="19720718 199703 1 002",
                    nama="Drs. Haryanto, M.T.",
                    role="kepala_upt",
                    unit_kerja="BPTJ — OIKN",
                    password_hash=hash_password("password123"),
                ),
                User(
                    email="sri@dephub.go.id",
                    nip="19900521 201507 2 001",
                    nama="Sri Yulianti, S.T.",
                    role="operator_jadwal",
                    unit_kerja="BPTJ — OIKN",
                    password_hash=hash_password("password123"),
                ),
                User(
                    email="admin@dephub.go.id",
                    nama="Administrator Sistem",
                    role="admin",
                    unit_kerja="Pusdatin DJPD",
                    password_hash=hash_password("admin1234"),
                ),
            ]
            db.add_all(users)
            db.commit()
            print(f"  ✓ {len(users)} pengguna dibuat")

        if db.query(Halte).count() == 0:
            haltes = [
                Halte(kode="SCB", nama="Sudirman Central Business District", urutan=1, km=0.00, kapasitas_naik=120, fasilitas="Atap, kursi, info digital"),
                Halte(kode="KMG", nama="Karang Mumus Gerbang",                urutan=2, km=4.20, kapasitas_naik=80,  fasilitas="Atap, kursi"),
                Halte(kode="BSD", nama="Bumi Serpong Damai",                  urutan=3, km=9.10, kapasitas_naik=100, fasilitas="Atap, kursi, info digital, P3K"),
                Halte(kode="ALS", nama="Alam Sutera",                         urutan=4, km=14.30,kapasitas_naik=80,  fasilitas="Atap, kursi"),
                Halte(kode="SRP", nama="Serpong",                             urutan=5, km=19.80,kapasitas_naik=80,  fasilitas="Atap, kursi"),
                Halte(kode="GDG", nama="Gading Serpong",                      urutan=6, km=24.90,kapasitas_naik=80,  fasilitas="Atap, kursi"),
                Halte(kode="TKB", nama="Terminal Kebon",                      urutan=7, km=31.80,kapasitas_naik=150, fasilitas="Atap, kursi, info digital, toilet, P3K"),
            ]
            db.add_all(haltes)
            db.commit()
            print(f"  ✓ {len(haltes)} halte dibuat")

        if db.query(Armada).count() == 0:
            armadas = [
                Armada(kode="B-01", plat="B 7001 IKN", tipe="reguler", kapasitas=80, tahun=2024, km_total=24500, status="aktif"),
                Armada(kode="B-02", plat="B 7002 IKN", tipe="reguler", kapasitas=80, tahun=2024, km_total=23800, status="aktif"),
                Armada(kode="B-03", plat="B 7003 IKN", tipe="reguler", kapasitas=80, tahun=2024, km_total=22100, status="aktif"),
                Armada(kode="B-04", plat="B 7004 IKN", tipe="sisipan", kapasitas=80, tahun=2025, km_total=8200,  status="aktif", catatan="Sisipan peak"),
                Armada(kode="B-05", plat="B 7005 IKN", tipe="reguler", kapasitas=80, tahun=2023, km_total=46000, status="perbaikan", catatan="Servis besar 06 Mei"),
            ]
            db.add_all(armadas)
            db.commit()
            print(f"  ✓ {len(armadas)} armada dibuat")

        if db.query(Sopir).count() == 0:
            now = datetime.now(timezone.utc)
            sopirs = [
                Sopir(kode="S-01", nama="Hadi Pranoto",       nik="3171012345670001", no_sim="SIM-B1-001", sim_expired=now + timedelta(days=540), no_hp="081234567001", status="aktif", jam_kerja_minggu=42.5),
                Sopir(kode="S-02", nama="Bambang Setiawan",   nik="3171012345670002", no_sim="SIM-B1-002", sim_expired=now + timedelta(days=300), no_hp="081234567002", status="aktif", jam_kerja_minggu=39.0),
                Sopir(kode="S-03", nama="Joko Susanto",       nik="3171012345670003", no_sim="SIM-B1-003", sim_expired=now + timedelta(days=720), no_hp="081234567003", status="aktif", jam_kerja_minggu=40.0),
                Sopir(kode="S-04", nama="Agus Riyanto",       nik="3171012345670004", no_sim="SIM-B1-004", sim_expired=now + timedelta(days=180), no_hp="081234567004", status="aktif", jam_kerja_minggu=38.5),
                Sopir(kode="S-05", nama="Slamet Widodo",      nik="3171012345670005", no_sim="SIM-B1-005", sim_expired=now + timedelta(days=900), no_hp="081234567005", status="aktif", jam_kerja_minggu=41.0),
                Sopir(kode="S-06", nama="Tri Hartono",        nik="3171012345670006", no_sim="SIM-B1-006", sim_expired=now + timedelta(days=420), no_hp="081234567006", status="aktif", jam_kerja_minggu=37.5),
                Sopir(kode="S-07", nama="Suparman",            nik="3171012345670007", no_sim="SIM-B1-007", sim_expired=now + timedelta(days=60),  no_hp="081234567007", status="cuti",   jam_kerja_minggu=0.0,  catatan="Cuti tahunan"),
                Sopir(kode="S-08", nama="Eko Prasetyo",        nik="3171012345670008", no_sim="SIM-B1-008", sim_expired=now + timedelta(days=600), no_hp="081234567008", status="aktif", jam_kerja_minggu=39.5),
            ]
            db.add_all(sopirs)
            db.commit()
            print(f"  ✓ {len(sopirs)} sopir dibuat")

        if db.query(Trip).count() == 0:
            trips: list[Trip] = []
            armadas = db.query(Armada).filter(Armada.status == "aktif").order_by(Armada.kode).all()
            sopirs  = db.query(Sopir).filter(Sopir.status == "aktif").order_by(Sopir.kode).all()
            # 22 trip × 3 reguler bus + 11 trip × 1 sisipan = 77 trip
            n = 1
            base_min = 6 * 60  # 06:00
            cycle = 45  # min
            service = 25
            for i, bus in enumerate(armadas[:3]):
                start = base_min + i * 15
                for k in range(22):
                    dep = start + k * cycle
                    arr = dep + service
                    if 360 <= dep < 510 or 990 <= dep < 1170:
                        kat = "peak"
                    elif 510 <= dep < 540:
                        kat = "transisi"
                    elif 1080 <= dep < 1110:
                        kat = "break"
                    else:
                        kat = "off_peak"
                    trips.append(Trip(
                        nomor=n,
                        arah="berangkat" if k % 2 == 0 else "pulang",
                        armada_id=bus.id,
                        sopir_id=sopirs[i % len(sopirs)].id if sopirs else None,
                        waktu_berangkat=time(dep // 60 % 24, dep % 60),
                        waktu_tiba=time(arr // 60 % 24, arr % 60),
                        durasi_menit=service,
                        kategori=kat,
                        is_sisipan=False,
                    ))
                    n += 1
            sisipan_bus = next((b for b in db.query(Armada).filter(Armada.kode == "B-04").all()), None)
            if sisipan_bus:
                # 11 trip peak only (07:00–08:30 dan 16:30–18:00)
                slots = [420, 442, 464, 486, 508,    990, 1012, 1034, 1056, 1078, 1100]
                for k, dep in enumerate(slots):
                    arr = dep + service
                    trips.append(Trip(
                        nomor=n,
                        arah="berangkat" if k % 2 == 0 else "pulang",
                        armada_id=sisipan_bus.id,
                        sopir_id=sopirs[(k + 3) % len(sopirs)].id if sopirs else None,
                        waktu_berangkat=time(dep // 60 % 24, dep % 60),
                        waktu_tiba=time(arr // 60 % 24, arr % 60),
                        durasi_menit=service,
                        kategori="sisipan",
                        is_sisipan=True,
                    ))
                    n += 1
            db.add_all(trips)
            db.commit()
            print(f"  ✓ {len(trips)} trip dibuat")

        if db.query(Periode).count() == 0:
            periodes = [
                Periode(kode="P01", nama="Buka Pagi",        jam_mulai=time(5,  0), jam_selesai=time(5, 30), kategori="off_peak", headway_target_menit=20.0, armada_target=2),
                Periode(kode="P02", nama="Pra-Peak",          jam_mulai=time(5, 30), jam_selesai=time(6,  0), kategori="transisi", headway_target_menit=18.0, armada_target=3),
                Periode(kode="P03", nama="Peak Pagi 1",       jam_mulai=time(6,  0), jam_selesai=time(7,  0), kategori="peak",     headway_target_menit=15.0, armada_target=3),
                Periode(kode="P04", nama="Peak Pagi 2",       jam_mulai=time(7,  0), jam_selesai=time(8,  0), kategori="peak",     headway_target_menit=10.0, armada_target=4),
                Periode(kode="P05", nama="Peak Pagi 3",       jam_mulai=time(8,  0), jam_selesai=time(8, 30), kategori="peak",     headway_target_menit=12.0, armada_target=4),
                Periode(kode="P06", nama="Transisi Pagi",     jam_mulai=time(8, 30), jam_selesai=time(9,  0), kategori="transisi", headway_target_menit=15.0, armada_target=3),
                Periode(kode="P07", nama="Off-Peak Siang",    jam_mulai=time(9,  0), jam_selesai=time(14, 0), kategori="off_peak", headway_target_menit=15.0, armada_target=3),
                Periode(kode="P08", nama="Pra-Sore",           jam_mulai=time(14, 0), jam_selesai=time(15,30), kategori="transisi", headway_target_menit=15.0, armada_target=3),
                Periode(kode="P09", nama="Peak Sore 1",       jam_mulai=time(15,30), jam_selesai=time(17, 0), kategori="peak",     headway_target_menit=12.0, armada_target=4),
                Periode(kode="P10", nama="Peak Sore 2",       jam_mulai=time(17, 0), jam_selesai=time(19,30), kategori="peak",     headway_target_menit=10.0, armada_target=4),
                Periode(kode="P11", nama="Off-Peak Malam",    jam_mulai=time(19,30), jam_selesai=time(21, 0), kategori="off_peak", headway_target_menit=15.0, armada_target=3),
                Periode(kode="P12", nama="Late",               jam_mulai=time(21, 0), jam_selesai=time(22, 0), kategori="late",     headway_target_menit=20.0, armada_target=2),
                Periode(kode="P13", nama="Last Trip",          jam_mulai=time(22, 0), jam_selesai=time(22,30), kategori="late",     headway_target_menit=30.0, armada_target=1),
                Periode(kode="P14", nama="Tutup",              jam_mulai=time(22,30), jam_selesai=time(23,59), kategori="tutup",    aktif=False),
            ]
            db.add_all(periodes)
            db.commit()
            print(f"  ✓ {len(periodes)} periode operasi dibuat")

        if db.query(Pengaduan).count() == 0:
            now = datetime.now(timezone.utc)
            pengaduans = [
                Pengaduan(tiket="PGD-0001", waktu=now - timedelta(hours=2),  pelapor_nama="Budi Santoso",     pelapor_kontak="081298765432", kanal="wa",     isi="Bus B-02 melaju terlalu kencang di tikungan dekat halte 4.",                       rute="1E", halte="H4",  armada_kode="B-02", status="ditinjau", pic="Sri Yulianti"),
                Pengaduan(tiket="PGD-0002", waktu=now - timedelta(hours=8),  pelapor_nama="Ani Lestari",      pelapor_kontak="ani@gmail.com", kanal="email", isi="AC bus tidak dingin, penumpang lain juga mengeluh.",                                rute="1E", halte=None,  armada_kode="B-04", status="tindak_lanjut", pic="Bengkel"),
                Pengaduan(tiket="PGD-0003", waktu=now - timedelta(days=1),   pelapor_nama="Pak Hadi",          pelapor_kontak="082112345678", kanal="telepon",isi="Bus tidak datang sesuai jadwal, saya tunggu 25 menit di halte BSD.",               rute="1E", halte="BSD", armada_kode=None,    status="selesai", pic="Sri Yulianti", tanggapan="Bus mengalami keterlambatan akibat kemacetan tidak terduga. Mohon maaf atas ketidaknyamanan.", rating=3),
                Pengaduan(tiket="PGD-0004", waktu=now - timedelta(days=2),   pelapor_nama="Siti Aminah",       pelapor_kontak=None,            kanal="lapor",  isi="Halte SCB kurang penerangan saat malam. Tolong dipasang lampu tambahan.",          rute="1E", halte="SCB", armada_kode=None,    status="tindak_lanjut", pic="Manajemen Halte"),
                Pengaduan(tiket="PGD-0005", waktu=now - timedelta(days=3),   pelapor_nama="Joko Supardi",      pelapor_kontak="joko@example.com", kanal="web",  isi="Apresiasi: sopir Bus B-01 sangat ramah dan membantu lansia naik. Terima kasih!",   rute="1E", halte=None,  armada_kode="B-01", status="selesai", pic="Manajemen", tanggapan="Terima kasih atas apresiasinya. Akan kami sampaikan kepada sopir.", rating=5),
                Pengaduan(tiket="PGD-0006", waktu=now - timedelta(days=4),   pelapor_nama="Endang Wahyuni",    pelapor_kontak="081100002222", kanal="sosmed", isi="Tarif Rp 3.500 terlalu mahal untuk pelajar. Bisa diberi diskon?",                  rute="1E", halte=None,  armada_kode=None,    status="ditolak", pic="Manajemen", tanggapan="Tarif sudah mengikuti SK Walikota. Kartu pelajar tidak berlaku diskon di koridor ini."),
            ]
            db.add_all(pengaduans)
            db.commit()
            print(f"  ✓ {len(pengaduans)} pengaduan publik dibuat")

        if db.query(Insiden).count() == 0:
            now = datetime.now(timezone.utc)
            insidens = [
                Insiden(tiket="INC-0001", waktu=now - timedelta(hours=1),  deskripsi="Bus terlambat 12 menit akibat penumpukan di Halte 4",            armada_kode="B-02", lokasi="H4 → H5", kategori="operasional", dampak="tinggi", pic="Sri Yulianti", status="investigasi"),
                Insiden(tiket="INC-0002", waktu=now - timedelta(hours=3),  deskripsi="AC kabin penumpang tidak dingin (laporan penumpang)",           armada_kode="B-04", lokasi="H1",      kategori="teknis",      dampak="sedang", pic="Bengkel",        status="tindakan"),
                Insiden(tiket="INC-0003", waktu=now - timedelta(days=1),   deskripsi="Pintu otomatis macet, ditangani manual oleh kondektur",          armada_kode="B-01", lokasi="H6",      kategori="teknis",      dampak="rendah", pic="Bengkel",        status="selesai"),
                Insiden(tiket="INC-0004", waktu=now - timedelta(days=1, hours=3), deskripsi="Demonstrasi sementara di sekitar Halte 3, rute dibelokkan", armada_kode=None,  lokasi="H3",      kategori="eksternal",   dampak="sedang", pic="Pengawas Lapangan", status="selesai"),
                Insiden(tiket="INC-0005", waktu=now - timedelta(days=2),   deskripsi="Penumpang sakit, evakuasi ke RS terdekat (10 menit)",            armada_kode="B-03", lokasi="H5",      kategori="pelayanan",   dampak="sedang", pic="Sopir + Tim P3K", status="selesai"),
                Insiden(tiket="INC-0006", waktu=now - timedelta(days=3),   deskripsi="Tabrakan minor dengan motor, tidak ada korban",                  armada_kode="B-02", lokasi="H2 → H3", kategori="keselamatan", dampak="tinggi", pic="Pengawas Lapangan", status="selesai"),
            ]
            db.add_all(insidens)
            db.commit()
            print(f"  ✓ {len(insidens)} insiden dibuat")

        if db.query(Notifikasi).count() == 0:
            now = datetime.now(timezone.utc)
            user_admin = db.query(User).filter(User.role == "admin").first()
            uid = user_admin.id if user_admin else None
            notifs = [
                Notifikasi(waktu=now - timedelta(minutes=4),  tingkat="kritis",     pesan="Bus B-02 menyimpang > 5 menit dari jadwal trip ke-7. Headway peak terganggu.", sumber="Peta Live",      user_id=uid),
                Notifikasi(waktu=now - timedelta(minutes=18), tingkat="peringatan", pesan="SPM headway peak pagi 12,4 m > ambang 10 m (Permenhub 27/2015 §5).",          sumber="Audit SPM",      user_id=uid),
                Notifikasi(waktu=now - timedelta(minutes=30), tingkat="peringatan", pesan="Sopir Hadi P. mendekati batas 8 jam (sisa 28 menit). Permenhub 79/2013.",      sumber="Roster Sopir",   user_id=uid),
                Notifikasi(waktu=now - timedelta(hours=1),    tingkat="info",       pesan="Skenario A — Sisipan Peak Pagi berhasil diadopsi sebagai jadwal aktif.",       sumber="Komparasi",      user_id=uid),
                Notifikasi(waktu=now - timedelta(hours=2),    tingkat="info",       pesan="Pemeliharaan terjadwal Bus B-04 akan jatuh dalam 3 hari (target KM tercapai).", sumber="Pemeliharaan",   user_id=uid),
            ]
            db.add_all(notifs)
            db.commit()
            print(f"  ✓ {len(notifs)} notifikasi dibuat")

        if db.query(AuditLog).count() == 0:
            now = datetime.now(timezone.utc)
            users_q = db.query(User).all()
            audits = [
                AuditLog(waktu=now - timedelta(minutes=4),  user_id=users_q[0].id, user_email=users_q[0].email, aksi="view",    objek="dashboard",                detail="Buka Dashboard Koridor 1E"),
                AuditLog(waktu=now - timedelta(minutes=8),  user_id=users_q[1].id, user_email=users_q[1].email, aksi="setujui", objek="jadwal",                   detail="Sah jadwal Skenario A — 76 trip"),
                AuditLog(waktu=now - timedelta(minutes=18), user_id=users_q[2].id, user_email=users_q[2].email, aksi="update",  objek="periode_operasi",          detail="Ubah headway peak pagi 15m → 12m"),
                AuditLog(waktu=now - timedelta(minutes=30), user_id=users_q[2].id, user_email=users_q[2].email, aksi="create",  objek="trip_sisipan",             detail="Tambah Sisipan Bus B-04"),
                AuditLog(waktu=now - timedelta(hours=2),    user_id=users_q[0].id, user_email=users_q[0].email, aksi="generate",objek="laporan_harian",           detail="Cetak Laporan 02 Mei 2026"),
            ]
            db.add_all(audits)
            db.commit()
            print(f"  ✓ {len(audits)} entry audit log dibuat")

        print("\n✅ Seed selesai. Login dengan:")
        print("   email:    rizki@dephub.go.id      password: password123")
        print("   email:    admin@dephub.go.id      password: admin1234")
    finally:
        db.close()


if __name__ == "__main__":
    print("Seeding database…")
    main()
