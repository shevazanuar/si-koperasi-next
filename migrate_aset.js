const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Memulai migrasi kolom aset_tetap...");
  
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE aset_tetap ADD COLUMN tanggal_penghentian DATE NULL;`);
    console.log("Kolom tanggal_penghentian ditambahkan.");
  } catch(e) { console.log("Info:", e.message); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE aset_tetap ADD COLUMN nilai_residu DECIMAL(15,2) NOT NULL DEFAULT 0.00;`);
    console.log("Kolom nilai_residu ditambahkan.");
  } catch(e) { console.log("Info:", e.message); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE aset_tetap ADD COLUMN penyusutan_per_bulan DECIMAL(15,2) NOT NULL DEFAULT 0.00;`);
    console.log("Kolom penyusutan_per_bulan ditambahkan.");
  } catch(e) { console.log("Info:", e.message); }

  // Update existing data for penyusutan_per_bulan
  try {
    await prisma.$executeRawUnsafe(`UPDATE aset_tetap SET penyusutan_per_bulan = IF(masa_manfaat > 0, (nilai_pembelian - nilai_residu) / masa_manfaat, 0);`);
    console.log("Data penyusutan_per_bulan diperbarui.");
  } catch(e) { console.log("Info:", e.message); }

  console.log("Selesai migrasi.");
}

main().finally(() => prisma.$disconnect());
