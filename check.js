const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const anggota = await prisma.anggota.findFirst();
  console.log("Anggota:", anggota.tgl_masuk, anggota.insert_date);
  
  const simpanan = await prisma.jenis_simpanan.findMany();
  console.log("Jenis Simpanan:", simpanan);
}

main().finally(() => prisma.$disconnect());
