const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
  try {
    const year = new Date().getFullYear();
    const last = await prisma.simpanan.findFirst({
      where: {
        jenis: "T",
        tgl: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) },
      },
      orderBy: { nomor: "desc" },
    });
    console.log("last simpanan:", last);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
