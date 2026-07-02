const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.anggota.findFirst({ where: { nama: { contains: 'Naopang' } } });
  console.log("User ID:", user?.id);
  
  if (user) {
    const notifications = [];
    
    // 0. Info
    const info = await prisma.informasi.findMany({ orderBy: { id: 'desc' }, take: 2 });
    console.log("Info count:", info.length);
    
    // 1. Pengajuan
    const pengajuan = await prisma.pengajuan_pinjaman.findMany({
      where: { anggota_id: user.id, status: { in: ['Acc', 'Cancel'] } },
      orderBy: { update_date: 'desc' },
      take: 3
    });
    console.log("Pengajuan count:", pengajuan.length);
    
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
