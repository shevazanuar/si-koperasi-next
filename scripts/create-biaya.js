const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Creating biaya_opr table...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS biaya_opr (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      kode_biaya VARCHAR(30) UNIQUE NOT NULL,
      nama_biaya VARCHAR(150) NOT NULL,
      nominal DECIMAL(18,2) NOT NULL,
      tanggal DATE NOT NULL,
      keterangan TEXT NULL,
      created_by BIGINT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  console.log('Table biaya_opr created successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
