/**
 * prisma/seed.js
 * Data dummy untuk testing tanpa menggunakan data asli.
 *
 * Jalankan: node prisma/seed.js
 * JANGAN dijalankan di database production!
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database dengan data dummy...\n");

  // ── 1. Profile Koperasi ───────────────────────────────────────────────────
  await prisma.$executeRawUnsafe(`
    INSERT INTO profile (id, koperasi, alamat, kota, hp, email)
    VALUES (1, 'KPRI Polines Dummy', 'Jl. Profesor Sudarto No.116', 'Semarang', '024-1234567', 'kpri@polines.ac.id')
    ON DUPLICATE KEY UPDATE koperasi = VALUES(koperasi)
  `);
  console.log("✓ Profile koperasi");

  // ── 2. Level (Role) ───────────────────────────────────────────────────────
  const levels = [
    { id: 1, level: "Administrator" },
    { id: 2, level: "Staff" },
  ];
  for (const l of levels) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO level (id, level) VALUES (?, ?) ON DUPLICATE KEY UPDATE level = VALUES(level)`,
      l.id, l.level
    );
  }
  console.log("✓ Level pengguna");

  // ── 3. Admin Users ────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("admin123", 12);
  const staffHash = await bcrypt.hash("staff123", 12);
  await prisma.$executeRawUnsafe(`
    INSERT INTO users (id, username, password, namalengkap, level_id, foto, blokir)
    VALUES
      (1, 'admin', ?, 'Administrator Koperasi', 1, 'default.png', 'T'),
      (2, 'staff', ?, 'Staff Koperasi', 2, 'default.png', 'T')
    ON DUPLICATE KEY UPDATE password = VALUES(password)
  `, adminHash, staffHash);
  console.log("✓ Admin & Staff users (password: admin123 / staff123)");

  // ── 4. Level Anggota ──────────────────────────────────────────────────────
  await prisma.$executeRawUnsafe(`
    INSERT INTO level_anggota (id, nama) VALUES (1, 'Pegawai Tetap'), (2, 'Pegawai Kontrak')
    ON DUPLICATE KEY UPDATE nama = VALUES(nama)
  `);
  console.log("✓ Level anggota");

  // ── 5. Jenis Simpanan ─────────────────────────────────────────────────────
  const jenisSimpanan = [
    [1, "Simpanan Pokok", 500000, "Simpanan wajib satu kali masuk"],
    [2, "Simpanan Wajib", 100000, "Simpanan wajib bulanan"],
    [3, "Simpanan Sukarela", 0, "Simpanan bebas"],
  ];
  for (const [id, nama, jumlah, ket] of jenisSimpanan) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO jenis_simpanan (id, nama, jumlah, keterangan) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE nama = VALUES(nama)`,
      id, nama, jumlah, ket
    );
  }
  console.log("✓ Jenis simpanan");

  // ── 6. Jenis Pinjaman ─────────────────────────────────────────────────────
  const jenisPinjaman = [
    [1, "Pinjaman Jangka Pendek", 12, "Bulan", 1.5, 10000000],
    [2, "Pinjaman Jangka Menengah", 24, "Bulan", 1.2, 25000000],
    [3, "Pinjaman Jangka Panjang", 36, "Bulan", 1.0, 50000000],
  ];
  for (const [id, nama, lama, satuan, bunga, jumlah] of jenisPinjaman) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO jenis_pinjaman (id, nama, lama, satuan, bunga, jumlah) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE nama = VALUES(nama)`,
      id, nama, lama, satuan, bunga, jumlah
    );
  }
  console.log("✓ Jenis pinjaman");

  // ── 7. Anggota Dummy ──────────────────────────────────────────────────────
  const pwdAnggota = await bcrypt.hash("anggota123", 12);
  const anggotaDummy = [
    { kode: "A001", nik: "197801012001011001", nama: "Budi Santoso", jk: "L", tempat_lahir: "Semarang", tgl_lahir: "1978-01-01", alamat: "Jl. Merdeka No.1", hp: "08111111111", email: "budi@example.com", perusahaan: "Polines" },
    { kode: "A002", nik: "198502152003022002", nama: "Siti Rahayu", jk: "P", tempat_lahir: "Solo",     tgl_lahir: "1985-02-15", alamat: "Jl. Pahlawan No.5", hp: "08222222222", email: "siti@example.com", perusahaan: "Polines" },
    { kode: "A003", nik: "199003202010011003", nama: "Ahmad Fauzi", jk: "L", tempat_lahir: "Kudus",    tgl_lahir: "1990-03-20", alamat: "Jl. Diponegoro No.9", hp: "08333333333", email: "ahmad@example.com", perusahaan: "Polines" },
  ];

  for (const a of anggotaDummy) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO anggota (kode, nik, nama, jk, tempat_lahir, tgl_lahir, alamat, hp, email, pwd, level_anggota_id, status, perusahaan, insert_date)
      VALUES (?,?,?,?,?,?,?,?,?,?,1,'Aktif',?,NOW())
      ON DUPLICATE KEY UPDATE nama = VALUES(nama)
    `, a.kode, a.nik, a.nama, a.jk, a.tempat_lahir, a.tgl_lahir, a.alamat, a.hp, a.email, pwdAnggota, a.perusahaan);
  }
  console.log("✓ 3 anggota dummy (password: anggota123, login dengan NIK)");

  console.log("\n✅ Seeding selesai!");
  console.log("─".repeat(45));
  console.log("Login Admin  : admin / admin123");
  console.log("Login Staff  : staff / staff123");
  console.log("Login Anggota: <NIK> / anggota123");
  console.log("─".repeat(45));
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error("❌ Seed error:", e.message); process.exit(1); });
