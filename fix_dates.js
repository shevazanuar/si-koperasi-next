const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const tablesWithDates = [
      'jenis_pinjaman', 'simpanan', 'pengajuan_pinjaman', 'pinjaman_detail', 'pinjaman_header',
      'aset_tetap', 'mutasi_kas_bank', 'aset_lancar'
    ];
    
    // Quick query to nullify zero dates in the database
    await prisma.$executeRawUnsafe(`UPDATE jenis_pinjaman SET insert_date = NULL WHERE insert_date = '0000-00-00 00:00:00'`);
    await prisma.$executeRawUnsafe(`UPDATE jenis_pinjaman SET update_date = NULL WHERE update_date = '0000-00-00 00:00:00'`);
    
    // We should probably do it for other tables too just in case
    await prisma.$executeRawUnsafe(`UPDATE anggota SET insert_date = NULL WHERE insert_date = '0000-00-00 00:00:00'`);
    await prisma.$executeRawUnsafe(`UPDATE anggota SET update_date = NULL WHERE update_date = '0000-00-00 00:00:00'`);
    await prisma.$executeRawUnsafe(`UPDATE anggota SET tgl_masuk = NULL WHERE tgl_masuk = '0000-00-00 00:00:00'`);
    await prisma.$executeRawUnsafe(`UPDATE anggota SET tgl_lahir = NULL WHERE tgl_lahir = '0000-00-00 00:00:00'`);

    console.log('Fixed zero dates in DB.');
  } catch (e) {
    console.error(e.message);
  }
}

main().finally(() => prisma.$disconnect());
