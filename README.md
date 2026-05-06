# 🏦 Sistem Informasi Koperasi (Next.js Edition)

Selamat datang di Sistem Informasi Koperasi modern yang dibangun menggunakan **Next.js 16**. Proyek ini merupakan hasil migrasi dari sistem berbasis PHP ke stack teknologi modern untuk meningkatkan performa, keamanan, dan pengalaman pengguna.

## 🚀 Fitur Utama
- **Dashboard Admin & Anggota**: Tampilan yang responsif dan modern.
- **Manajemen Pinjaman**: Alur pengajuan, persetujuan, hingga detail cicilan.
- **Laporan Keuangan**: Visualisasi data menggunakan Recharts.
- **Ekspor Data**: Dukungan ekspor ke format PDF (jspdf) dan Excel (xlsx).
- **Notifikasi Email**: Integrasi Nodemailer untuk verifikasi dan notifikasi.

## 🛠️ Stack Teknologi
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Validation**: [Zod](https://zod.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

---

## 🏁 Memulai Pengembangan

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek di lingkungan lokal Anda.

### 1. Prasyarat
Pastikan Anda sudah menginstal:
- [Node.js](https://nodejs.org/) (Versi terbaru direkomendasikan)
- [MySQL](https://www.mysql.com/) atau XAMPP untuk database

### 2. Instalasi Dependensi
Jalankan perintah berikut di terminal untuk menginstal semua package yang dibutuhkan:
```bash
npm install
```

### 3. Konfigurasi Database (Prisma & Env)
Buat file `.env` di root direktori (jika belum ada) dan sesuaikan konfigurasinya:
```env
DATABASE_URL="mysql://root:@localhost:3306/kpripolinesdb"
# Tambahkan konfigurasi email jika diperlukan
SMTP_HOST="smtp.example.com"
SMTP_USER="user@example.com"
SMTP_PASS="password"
```

Setelah konfigurasi `.env` selesai, jalankan Prisma Client generator:
```bash
npx prisma generate
```

### 4. Menjalankan Aplikasi
Jalankan server pengembangan:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

---

## 📂 Struktur Folder Penting
- `src/app`: Logika routing dan UI (App Router).
- `src/app/api`: Endpoint API backend.
- `prisma/`: Skema database dan migrasi.
- `public/`: Aset statis seperti gambar dan logo.

---

## 📝 Catatan Penting
- Pastikan database `kpripolinesdb` sudah ada di MySQL Anda sebelum menjalankan aplikasi.
- Jika ada perubahan pada `prisma/schema.prisma`, selalu jalankan `npx prisma generate` kembali.
