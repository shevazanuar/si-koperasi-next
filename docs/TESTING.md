# Testing SI Koperasi

Dokumen ini berisi panduan skenario pengujian fungsional dan keamanan untuk Sistem Informasi Koperasi.

## 1. Login
- [ ] Input username/password valid (Admin & Anggota)
- [ ] Input password salah
- [ ] Coba login gagal 5x berturut-turut untuk validasi fitur *Rate Limit*
- [ ] Verifikasi auto-migrate password lama (MD5) ke bcrypt saat anggota login pertama kali

## 2. Simpanan
- [ ] Tambah simpanan dengan nominal valid (> 0)
- [ ] Coba tambah simpanan dengan nominal 0 (Harus ditolak sistem)
- [ ] Coba tambah simpanan dengan nominal negatif (Harus ditolak sistem)

## 3. Penarikan
- [ ] Lakukan penarikan dengan saldo mencukupi
- [ ] Lakukan penarikan melebihi saldo anggota (Harus ditolak sistem)
- [ ] Akses endpoint penarikan dengan *role* Anggota (Harus ditolak karena ini area Admin)

## 4. Pinjaman
- [ ] Anggota mengajukan pinjaman baru
- [ ] Admin menyetujui (Approve) pinjaman
- [ ] Admin menolak (Cancel) pengajuan pinjaman
- [ ] Cek jadwal cicilan otomatis (angsuran pokok + bunga) yang dibuat sistem setelah disetujui

## 5. Pembayaran Cicilan
- [ ] Bayar cicilan dengan nominal sesuai tagihan
- [ ] Bayar cicilan dengan nominal melebihi tagihan (Harus ditolak sistem)
- [ ] Batalkan (hapus) pembayaran cicilan, lalu pastikan cicilan kembali ke status belum dibayar

## 6. Audit Log
- [ ] Pastikan *Login sukses* tercatat
- [ ] Pastikan *Login gagal* tercatat beserta IP Address
- [ ] Pastikan aksi *Tambah Simpanan* dan *Penarikan* tercatat dengan data nominal
- [ ] Pastikan *Approve Pinjaman* tercatat beserta relasi pengajuan ke ID Pinjaman baru
- [ ] Pastikan *Bayar Cicilan* merekam perubahan saldo cicilan (Data sebelum dan sesudah)

## 7. Backup Otomatis
- [ ] Jalankan skrip `node scripts/backup-db.js`
- [ ] Pastikan *file* `.sql` terbuat di folder eksternal yang aman
- [ ] Pastikan riwayat cadangan > 30 hari dihapus otomatis
