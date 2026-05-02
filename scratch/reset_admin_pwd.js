const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // MD5 of 'admin'
  const newPasswordHash = '21232f297a57a5a743894a0e4a801fc3';
  
  const updatedUser = await prisma.users.update({
    where: { id: 1 }, // Account 'admin' has id: 1 based on previous check
    data: {
      password: newPasswordHash
    }
  });
  
  console.log('Password for user admin has been updated.');
  console.log('Username: admin');
  console.log('New Password: admin');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
