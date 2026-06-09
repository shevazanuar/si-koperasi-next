const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Update admin
    const adminHash = await bcrypt.hash('admin', 12);
    const adminUser = await prisma.users.findFirst({ where: { username: 'admin' } });
    if (adminUser) {
        await prisma.users.update({
            where: { id: adminUser.id },
            data: { password: adminHash }
        });
        console.log('Admin password updated to "admin".');
    } else {
        console.log('Admin user not found.');
    }

    // Update strong
    const strongHash = await bcrypt.hash('strongkuwat!', 12);
    const strongUser = await prisma.users.findFirst({ where: { username: 'strong' } });
    if (strongUser) {
        await prisma.users.update({
            where: { id: strongUser.id },
            data: { password: strongHash }
        });
        console.log('Strong password updated to "strongkuwat!".');
    } else {
        console.log('Strong user not found in "users" table. Checking "anggota" (by NIK or nama)...');
        const anggotaNik = await prisma.anggota.findFirst({ where: { nik: 'strong' } });
        if (anggotaNik) {
             await prisma.anggota.update({
                where: { kode: anggotaNik.kode },
                data: { pwd: strongHash }
            });
            console.log('Strong password updated to "strongkuwat!" in anggota (by NIK).');
        } else {
            const anggotaNama = await prisma.anggota.findFirst({ where: { nama: 'strong' } });
            if (anggotaNama) {
                await prisma.anggota.update({
                    where: { kode: anggotaNama.kode },
                    data: { pwd: strongHash }
                });
                console.log('Strong password updated to "strongkuwat!" in anggota (by nama).');
            } else {
                console.log('Strong user not found anywhere.');
            }
        }
    }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
