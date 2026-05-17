# API Documentation

Dokumen ini merangkum sebagian *endpoint* API penting pada Sistem Informasi Koperasi, beserta mekanisme pengamanannya.

## Auth

### POST `/login`
- **Fungsi**: Autentikasi untuk Admin, Staff, dan Anggota.
- **Security**: 
  - Rate limited (maks. 5 percobaan gagal per 15 menit per IP).
  - Validasi *hash* Bcrypt.
  - *Audit log* merekam aktivitas masuk sukses maupun gagal.
  - Memanfaatkan `iron-session` untuk membuat cookie sesi terenkripsi (tidak berwujud JSON mentah).

---

## Laporan

### GET `/api/laporan`
- **Query Params**:
  - `type` (simpanan, pinjaman, tunggakan, dll)
  - `from` (tanggal awal)
  - `to` (tanggal akhir)
  - `anggota_id` (opsional)
  - `jenis_simpanan` (opsional)
  - `perusahaan` (opsional)
- **Security**:
  - Pemanggilan *database* ketat menggunakan *parameter binding* melalui fitur `Prisma Tagged Template Literals` (`prisma.$queryRaw\`...\``). 
  - Segala interpolasi string manual (`$queryRawUnsafe`) telah dihilangkan untuk mencegah eksploitasi SQL Injection.

---

## Transaksi Keuangan

### POST `/api/transaksi/penarikan`
- **Action (`body.action`)**:
  - `detail`: Melihat histori penarikan anggota.
  - `saldo`: Mengecek saldo simpanan berjalan.
  - `simpan`: Mengeksekusi penarikan dana.
  - `hapus`: Membatalkan (menghapus) transaksi penarikan.
- **Security**:
  - Pengecekan *Role* (Hanya Admin yang dapat mengeksekusi `simpan` dan `hapus`).
  - Validasi input ketat dengan pustaka **Zod**.
  - Pengecekan sisa saldo: Nominal penarikan **tidak boleh** melebihi sisa saldo.
  - Setiap penarikan berhasil akan dicatat dalam tabel `audit_log`.

### POST `/api/transaksi/pembayaran`
- **Action (`body.action`)**:
  - `bayar`: Mengeksekusi pembayaran suatu angsuran/cicilan.
  - `hapus`: Membatalkan transaksi pembayaran.
- **Security**:
  - Pengecekan *Role* (Khusus Admin).
  - Pengecekan plafon tagihan: Nominal bayar **tidak boleh** melebihi tanggungan bulan terkait (Pokok + Bunga).
  - Pembayaran dicatat dalam tabel `audit_log` (*before & after data*).

### PUT `/api/transaksi/pengajuan-pinjaman`
- **Fungsi**: Memproses (*Approve* / *Cancel*) pengajuan pinjaman dari anggota.
- **Security**:
  - Transaksi Basis Data Atomik (`prisma.$transaction`). Pengubahan status, pembuatan identitas pinjaman baru, jadwal cicilan, dan pencatatan log dilakukan dalam 1 komit atomik ke *database*.
  - Menghindari manipulasi data parsial apabila server mati di tengah proses (Rollback otomatis).
