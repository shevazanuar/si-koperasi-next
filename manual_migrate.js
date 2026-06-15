const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Memulai migrasi manual...");

  // 1. Alter Table simpanan
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE simpanan ADD COLUMN metode_pembayaran VARCHAR(50) NULL;`);
    console.log("Kolom metode_pembayaran ditambahkan ke simpanan");
  } catch(e) { console.log("Info: ", e.message); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE simpanan ADD COLUMN kas_id INT NULL;`);
    console.log("Kolom kas_id ditambahkan ke simpanan");
  } catch(e) { console.log("Info: ", e.message); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE simpanan ADD COLUMN akun_bank_id INT NULL;`);
    console.log("Kolom akun_bank_id ditambahkan ke simpanan");
  } catch(e) { console.log("Info: ", e.message); }

  // 2. Alter Table pinjaman_header
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE pinjaman_header ADD COLUMN sumber_dana VARCHAR(50) NULL;`);
    console.log("Kolom sumber_dana ditambahkan ke pinjaman_header");
  } catch(e) { console.log("Info: ", e.message); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE pinjaman_header ADD COLUMN kas_id INT NULL;`);
    console.log("Kolom kas_id ditambahkan ke pinjaman_header");
  } catch(e) { console.log("Info: ", e.message); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE pinjaman_header ADD COLUMN akun_bank_id INT NULL;`);
    console.log("Kolom akun_bank_id ditambahkan ke pinjaman_header");
  } catch(e) { console.log("Info: ", e.message); }

  // 3. Create Table kas
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS kas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_kas VARCHAR(100) NOT NULL,
        saldo DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        status VARCHAR(20) NOT NULL DEFAULT 'Aktif',
        created_by INT NULL,
        updated_by INT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log("Tabel kas berhasil dibuat/sudah ada");
  } catch(e) { console.log("Error create kas: ", e.message); }

  // 4. Create Table akun_bank
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS akun_bank (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_bank VARCHAR(100) NOT NULL,
        nomor_rekening VARCHAR(50) NOT NULL,
        nama_pemilik VARCHAR(100) NOT NULL,
        saldo DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        status VARCHAR(20) NOT NULL DEFAULT 'Aktif',
        created_by INT NULL,
        updated_by INT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log("Tabel akun_bank berhasil dibuat/sudah ada");
  } catch(e) { console.log("Error create akun_bank: ", e.message); }

  // 5. Create Table mutasi_kas_bank
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS mutasi_kas_bank (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tanggal DATETIME NOT NULL,
        jenis_mutasi ENUM('Kas_ke_Bank', 'Bank_ke_Kas') NOT NULL,
        dari_kas_id INT NULL,
        ke_akun_bank_id INT NULL,
        dari_akun_bank_id INT NULL,
        ke_kas_id INT NULL,
        nominal DECIMAL(15,2) NOT NULL,
        bukti_transfer VARCHAR(255) NULL,
        keterangan TEXT NULL,
        created_by INT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log("Tabel mutasi_kas_bank berhasil dibuat/sudah ada");
  } catch(e) { console.log("Error create mutasi: ", e.message); }

  // 6. Create Table aset_lancar
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS aset_lancar (
        id INT AUTO_INCREMENT PRIMARY KEY,
        jenis_aset VARCHAR(100) NOT NULL,
        nominal DECIMAL(15,2) NOT NULL,
        keterangan TEXT NULL,
        created_by INT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log("Tabel aset_lancar berhasil dibuat/sudah ada");
  } catch(e) { console.log("Error create aset_lancar: ", e.message); }

  // 7. Create Table kategori_aset_tetap
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS kategori_aset_tetap (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_kategori VARCHAR(100) NOT NULL,
        keterangan TEXT NULL,
        created_by INT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log("Tabel kategori_aset_tetap berhasil dibuat/sudah ada");
  } catch(e) { console.log("Error create kategori: ", e.message); }

  // 8. Create Table aset_tetap
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS aset_tetap (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_aset VARCHAR(255) NOT NULL,
        kategori_id INT NOT NULL,
        tanggal_pembelian DATE NOT NULL,
        nilai_pembelian DECIMAL(15,2) NOT NULL,
        masa_manfaat INT NOT NULL,
        sumber_dana VARCHAR(50) NULL,
        kas_id INT NULL,
        akun_bank_id INT NULL,
        created_by INT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log("Tabel aset_tetap berhasil dibuat/sudah ada");
  } catch(e) { console.log("Error create aset_tetap: ", e.message); }

  console.log("Selesai!");
}

main().finally(() => prisma.$disconnect());
