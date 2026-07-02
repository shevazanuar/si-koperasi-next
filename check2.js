const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const anggotaId = 557;
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  try {
    const tagihan = await prisma.pinjaman_detail.findMany({
      where: {
        pinjaman_header: {
          anggota_id: anggotaId
        },
        tgl_bayar: { equals: "" },
        tgl_jatuh_tempo: {
          lte: nextWeek
        }
      },
      include: {
        pinjaman_header: {
          select: { nomor: true }
        }
      }
    });
    console.log("Tagihan count:", tagihan.length);
  } catch (e) {
    console.error("Tagihan Error:", e.message);
  }
}
main().finally(() => prisma.$disconnect());
