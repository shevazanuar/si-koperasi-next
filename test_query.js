const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const data = await prisma.$queryRawUnsafe('SELECT a.id, a.nik, a.nama, a.perusahaan, la.nama as level_nama, a.status FROM anggota a LEFT JOIN level_anggota la ON a.level_anggota_id = la.id LIMIT 5');
  console.log(data);
}
run();
