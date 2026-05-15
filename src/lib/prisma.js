import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

export default prisma;

// Named export alias so both `import prisma` and `import { prisma }` work
export { prisma };

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
