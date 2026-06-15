const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE anggota ADD COLUMN simpanan_wajib_per_bulan INT DEFAULT NULL;');
    console.log('Successfully added column to MySQL');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
