const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Jenis Simpanan:', await prisma.jenis_simpanan.findMany());
  console.log('Simpanan (Wajib):', await prisma.simpanan.findMany({
    where: { jenis_simpanan_id: 2 }, // Assuming Wajib is 2
    take: 5
  }));
}

main().catch(console.error).finally(() => prisma.$disconnect());
