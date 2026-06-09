const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const res = await prisma.$queryRaw\`DESCRIBE anggota;\`;
  console.log(res);
}
main().catch(console.error).finally(() => prisma.$disconnect());
