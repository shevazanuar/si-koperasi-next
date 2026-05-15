const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
  try {
    const data = await prisma.simpanan.create({
      data: {
        nomor: "T2026000002",
        tgl: new Date("2026-05-08"),
        tgl_akhir: new Date("2026-05-08"),
        anggota_id: 312,
        jenis_simpanan_id: 1,
        jumlah: 1000,
        jenis: "T",
        user_id: 1,
        insert_date: new Date(),
      },
    });
    console.log("created:", data);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
