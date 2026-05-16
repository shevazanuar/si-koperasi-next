# Dokumentasi SI Koperasi - Keamanan Sistem

Dokumen ini merangkum lapisan keamanan (*Security Hardening*) yang diterapkan pada Sistem Informasi Koperasi KPRI Polines. Implementasi ini memastikan aplikasi siap produksi, melindungi dari serangan umum, serta memiliki jejak audit yang jelas untuk setiap transaksi keuangan.

## 1. Lapisan Keamanan Utama

| Fitur | Status | Keterangan |
|-------|--------|------------|
| **Bcrypt Password Hashing** | Selesai | Sandi (password) kini di-hash otomatis dengan bcrypt. Termasuk auto-migrate dari sistem lama (MD5). |
| **Pencegahan SQL Injection** | Selesai (Parsial) | Modul laporan utama sudah menggunakan `Prisma Tagged Templates` dengan *parameter binding* aman. Beberapa modul konfigurasi lama masih dalam proses refactor dari `$queryRawUnsafe` menuju Prisma ORM. |
| **Session Terenkripsi (iron-session)** | Selesai | Session auth tidak lagi menyimpan JSON mentah. Di-signed & dienkripsi dengan `httpOnly` dan `sameSite: lax` untuk mencegah pencurian cookie dan CSRF ringan. |
| **Proteksi Rate Limiting** | Selesai | Mencegah eksploitasi *brute-force* pada endpoint `login` dan `lupa-password` (Batas: 5 percobaan / 15 menit per IP). |
| **Validasi Backend (Zod)** | Selesai | Seluruh form yang berinteraksi dengan database divalidasi ganda di server untuk mencegah input palsu dari *DevTools* (misal: penarikan tunai nilai minus). |
| **Data Privacy (Seed Dummy)** | Selesai | Database *dump* asli sudah diproteksi. Evaluasi/testing menggunakan skrip `prisma/seed.js` untuk membuat data admin dan anggota *dummy*. |

## 2. Integritas Data Transaksi Keuangan

Mengingat koperasi menangani dana nyata, beberapa penyesuaian wajib diterapkan pada inti aplikasi:

- **Pencegahan Saldo Minus:** Sistem otomatis memblokir penarikan simpanan yang melebihi jumlah saldo aktual pengguna.
- **Batasan Pembayaran Cicilan:** Nominal pembayaran cicilan tidak bisa melebihi tagihan bulanan (angsuran pokok + bunga).
- **Transaksi Basis Data Atomik (`prisma.$transaction`)**: Untuk aksi kompleks (contoh: *Approve Pinjaman*), pembuatan *header* pinjaman, pembuatan jadwal cicilan bulan-per-bulan, pengubahan status pengajuan, dan log jejak diawasi secara atomik. Jika ada 1 yang gagal (misal server mati), *seluruh langkah digagalkan* untuk mencegah uang hilang atau tercatat setengah-setengah.

## 3. Jejak Audit (Audit Trail)

Tabel `audit_log` digunakan untuk melacak siapapun yang mengubah data berharga. Laporan yang diaudit:

1. `LOGIN_SUCCESS` / `LOGIN_FAILED`
2. `TAMBAH_ANGGOTA` / `EDIT_ANGGOTA`
3. `TAMBAH_SIMPANAN` / `TAMBAH_PENARIKAN`
4. `APPROVE_PINJAMAN` / `TOLAK_PINJAMAN`
5. `BAYAR_CICILAN` / `HAPUS_PEMBAYARAN`

**Format Penyimpanan:** Sistem merekam IP Address, waktu persis, ID Pengguna, dan membandingkan *snapshot JSON* data `before_data` dan `after_data` (Data sebelum diubah dan data setelah diubah). Halaman pemantauan khusus admin tersedia di `/dashboard/audit-log`.

## 4. Keamanan Infrastruktur

- **Automated MySQL Backup:** Skrip backup harian (`scripts/backup-db.js`) dijadwalkan jalan secara berkala. Skrip ini menjatuhkan *dump SQL* ke direktori aman di luar root publik (`htdocs`), mencegah pengunjung mendownload isi database secara cuma-cuma. Skrip otomatis menghapus file log jika usianya melebihi 30 hari.
