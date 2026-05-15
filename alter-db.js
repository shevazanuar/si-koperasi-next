const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE users MODIFY password VARCHAR(255) NOT NULL`);
  console.log("users table altered.");
  await prisma.$executeRawUnsafe(`ALTER TABLE anggota MODIFY pwd VARCHAR(255)`);
  console.log("anggota table altered.");
  
  // also alter the duplicate tables just in case to avoid sync issues
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE anggota_asli MODIFY pwd VARCHAR(255)`);
    await prisma.$executeRawUnsafe(`ALTER TABLE anggota_copy1 MODIFY pwd VARCHAR(255)`);
  } catch (e) {
    console.log("Could not alter duplicate tables, this is fine if they don't exist.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
