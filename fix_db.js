import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE level MODIFY id INT UNSIGNED AUTO_INCREMENT;');
    console.log('level altered');
  } catch (e) {
    console.log(e.message);
  }
  
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE level_anggota MODIFY id INT UNSIGNED AUTO_INCREMENT;');
    console.log('level_anggota altered');
  } catch (e) {
    console.log(e.message);
  }
  
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE level_simpanan MODIFY id INT UNSIGNED AUTO_INCREMENT;');
    console.log('level_simpanan altered');
  } catch (e) {
    console.log(e.message);
  }
}

main().finally(() => prisma.$disconnect());
