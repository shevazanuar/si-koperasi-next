const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
  try {
    const detail = await prisma.pinjaman_detail.findFirst();
    if (detail) {
      const data = await prisma.pinjaman_detail.update({
        where: { id: detail.id },
        data: {
          nomor_bayar: "B2026000001",
          tgl_bayar: new Date().toISOString().split("T")[0],
          jumlah_bayar: 1000,
          update_date: new Date(),
        },
      });
      console.log("updated:", data);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
