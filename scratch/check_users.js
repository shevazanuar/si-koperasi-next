const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany({
    include: {
      // level: true // This might work if relation is defined, but it isn't in schema.prisma explicitly as a relation field
    }
  });
  
  const levels = await prisma.level.findMany();
  
  console.log('--- USERS ---');
  console.log(JSON.stringify(users, null, 2));
  console.log('--- LEVELS ---');
  console.log(JSON.stringify(levels, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
