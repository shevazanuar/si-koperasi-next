const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Adding new columns to master_barang...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE master_barang
      ADD COLUMN deskripsi TEXT NULL AFTER kategori_id,
      ADD COLUMN gambar VARCHAR(255) NULL AFTER deskripsi,
      ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0 AFTER status;
    `);
    console.log("Columns added successfully.");
  } catch (err) {
    console.error("Error or columns already exist:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
