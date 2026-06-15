const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin@123!!', 12);
  const strongPassword = await bcrypt.hash('Strong@123!!', 12);
  
  await prisma.users.update({
    where: { id: 1 },
    data: { password: adminPassword }
  });
  
  await prisma.users.update({
    where: { id: 2 },
    data: { password: strongPassword }
  });
  
  console.log('✅ Passwords updated successfully in the database!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
