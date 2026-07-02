const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const sqlParams = [25];
    const raw = await prisma.$queryRawUnsafe('SELECT s.id, s.nomor, CAST(s.tgl AS CHAR) AS tgl, CAST(s.tgl_akhir AS CHAR) AS tgl_akhir, s.jumlah, s.jenis AS jenis_transaksi, s.entry, a.nik, a.nama AS nama_anggota, js.nama AS jenis_nama FROM simpanan s JOIN anggota a ON s.anggota_id = a.id LEFT JOIN jenis_simpanan js ON s.jenis_simpanan_id = js.id WHERE 1=1 ORDER BY s.tgl DESC LIMIT ?', ...sqlParams);
    console.log('Main query OK. Records:', raw.length);

    const summaryRaw = await prisma.$queryRawUnsafe("SELECT js.nama AS jenis_nama, COALESCE(SUM(CASE WHEN s.jenis = 'S' THEN s.jumlah ELSE 0 END) - SUM(CASE WHEN s.jenis = 'T' THEN s.jumlah ELSE 0 END), 0) AS total_saldo FROM jenis_simpanan js LEFT JOIN simpanan s ON s.jenis_simpanan_id = js.id GROUP BY js.id, js.nama");
    console.log('Summary query OK. Records:', summaryRaw.length);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
