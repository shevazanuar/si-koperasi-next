const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { nama_kategori: "Sembako" },
    { nama_kategori: "Kebutuhan Rumah Tangga" },
    { nama_kategori: "Makanan Ringan" },
    { nama_kategori: "Minuman" },
    { nama_kategori: "Alat Tulis Kantor" },
    { nama_kategori: "Pakaian & Aksesoris" }
  ];

  console.log("Seeding kategori_produk...");
  
  for (const cat of categories) {
    // Check if exists to prevent duplicates if run multiple times
    const existing = await prisma.kategori_produk.findFirst({
      where: { nama_kategori: cat.nama_kategori }
    });

    if (!existing) {
      await prisma.kategori_produk.create({
        data: cat
      });
      console.log(`Added: ${cat.nama_kategori}`);
    } else {
      console.log(`Skipped (already exists): ${cat.nama_kategori}`);
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
