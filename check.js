import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const data = await prisma.$queryRawUnsafe("SELECT id, nama FROM jenis_simpanan ORDER BY id ASC");
  console.log(data);
}
main().finally(() => prisma.$disconnect());
