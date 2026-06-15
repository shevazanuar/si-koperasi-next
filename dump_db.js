const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.profile.findMany();
  const level = await prisma.level.findMany();
  const users = await prisma.users.findMany();
  const level_anggota = await prisma.level_anggota.findMany();
  
  const jenis_simpanan = await prisma.jenis_simpanan.findMany({
    select: { id: true, nama: true, jumlah: true, keterangan: true, user_id: true }
  });
  
  const jenis_pinjaman = await prisma.jenis_pinjaman.findMany({
    select: { id: true, nama: true, lama: true, satuan: true, bunga: true, jumlah: true, user_id: true }
  });
  
  const anggota = await prisma.anggota.findMany({
    select: { id: true, kode: true, nik: true, noidentitas: true, nama: true, jk: true, tempat_lahir: true, alamat: true, kota: true, hp: true, perusahaan: true, unit_seksi: true, jabatan: true, level_anggota_id: true, gaji: true, nama_pasangan: true, jml_anak: true, status: true, foto: true, pwd: true, user_id: true, dokumen: true, email: true }
  });

  const data = {
    profile,
    level,
    users,
    level_anggota,
    jenis_simpanan,
    jenis_pinjaman,
    anggota,
  };

  fs.writeFileSync("db_dump.json", JSON.stringify(data, null, 2));
  console.log("Dumped data to db_dump.json");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
