const { PrismaClient } = require('@prisma/client');
try {
    const p = new PrismaClient();
    console.log("Success with empty constructor");
} catch (e) {
    console.log("Error type:", e.constructor.name);
    console.log("Error message:", e.message);
}
