const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fungsi untuk membuat idBigInt support JSON.stringify
BigInt.prototype.toJSON = function() { return this.toString() }

async function main() {
  console.log("Memulai proses seeding dan migrasi data...");

  try {
    // 1. Migrasi dari Biaya Operasional ke Aset Tetap
    const biayaBarang = await prisma.biaya_opr.findMany({
      where: {
        OR: [
          { nama_biaya: { contains: "barang" } },
          { nama_biaya: { contains: "beli" } },
          { nama_biaya: { contains: "aset" } },
          { nama_biaya: { contains: "inventaris" } },
          { keterangan: { contains: "barang" } }
        ]
      }
    });

    if (biayaBarang.length > 0) {
      // Pastikan ada kategori_aset_tetap default
      let kategoriDefault = await prisma.kategori_aset_tetap.findFirst();
      if (!kategoriDefault) {
        kategoriDefault = await prisma.kategori_aset_tetap.create({
          data: { nama_kategori: "Inventaris Migrasi" }
        });
      }

      for (const b of biayaBarang) {
        // Cek apakah sudah dimigrasi
        const exists = await prisma.aset_tetap.findFirst({
          where: { nama_aset: b.nama_biaya, nilai_pembelian: b.nominal }
        });

        if (!exists) {
          await prisma.aset_tetap.create({
            data: {
              nama_aset: b.nama_biaya,
              kategori_id: kategoriDefault.id,
              tanggal_pembelian: new Date(b.tanggal),
              nilai_pembelian: b.nominal,
              masa_manfaat: 48, // Default 4 tahun / 48 bulan
              sumber_dana: "Kas", // Asumsi
              created_at: b.created_at
            }
          });
          console.log(`Berhasil migrasi biaya: ${b.nama_biaya}`);
        }
      }
    } else {
      console.log("Tidak ada data biaya operasional yang mirip pembelian barang.");
    }

    // 2. Tambah Data Dummy Kas
    const kasData = [
      { nama_kas: "Kas Utama", saldo: 25000000, status: "Aktif" },
      { nama_kas: "Kas Kecil (Petty Cash)", saldo: 5000000, status: "Aktif" }
    ];

    let insertedKas = [];
    for (const k of kasData) {
      const exists = await prisma.kas.findFirst({ where: { nama_kas: k.nama_kas } });
      if (!exists) {
        insertedKas.push(await prisma.kas.create({ data: k }));
        console.log(`Dummy Kas ditambahkan: ${k.nama_kas}`);
      } else {
        insertedKas.push(exists);
      }
    }

    // 3. Tambah Data Dummy Bank
    const bankData = [
      { nama_bank: "Bank BCA", nomor_rekening: "1234567890", nama_pemilik: "Koperasi Polines", saldo: 150000000, status: "Aktif" },
      { nama_bank: "Bank Mandiri", nomor_rekening: "0987654321", nama_pemilik: "Koperasi Polines", saldo: 75000000, status: "Aktif" }
    ];

    let insertedBank = [];
    for (const b of bankData) {
      const exists = await prisma.akun_bank.findFirst({ where: { nomor_rekening: b.nomor_rekening } });
      if (!exists) {
        insertedBank.push(await prisma.akun_bank.create({ data: b }));
        console.log(`Dummy Bank ditambahkan: ${b.nama_bank}`);
      } else {
        insertedBank.push(exists);
      }
    }

    // 4. Tambah Data Dummy Mutasi (Transfer)
    if (insertedKas.length > 0 && insertedBank.length > 0) {
      const kasUtama = insertedKas[0];
      const bankBCA = insertedBank[0];

      const existsMutasi = await prisma.mutasi_kas_bank.findFirst({ where: { nominal: 1000000 } });
      if (!existsMutasi) {
        await prisma.mutasi_kas_bank.create({
          data: {
            tanggal: new Date(),
            jenis_mutasi: "Bank_ke_Kas",
            dari_akun_bank_id: bankBCA.id,
            ke_kas_id: kasUtama.id,
            nominal: 1000000,
            bukti_transfer: "dummy_bukti.jpg",
            keterangan: "Tarik tunai untuk operasional",
          }
        });
        console.log("Dummy Mutasi ditambahkan.");
      }
    }

    // 5. Tambah Data Dummy Kategori & Aset Tetap
    const kategoriLaptop = await prisma.kategori_aset_tetap.findFirst({ where: { nama_kategori: "Elektronik" } });
    let idElektronik = kategoriLaptop ? kategoriLaptop.id : null;
    if (!idElektronik) {
      const newKat = await prisma.kategori_aset_tetap.create({
        data: { nama_kategori: "Elektronik" }
      });
      idElektronik = newKat.id;
    }

    const existsLaptop = await prisma.aset_tetap.findFirst({ where: { nama_aset: "Laptop Lenovo ThinkPad" } });
    if (!existsLaptop) {
      // Create it with a date 12 months ago to see depreciation working
      const dateBeli = new Date();
      dateBeli.setFullYear(dateBeli.getFullYear() - 1); // 1 tahun lalu
      
      await prisma.aset_tetap.create({
        data: {
          nama_aset: "Laptop Lenovo ThinkPad",
          kategori_id: idElektronik,
          tanggal_pembelian: dateBeli,
          nilai_pembelian: 15000000,
          masa_manfaat: 48, // 4 tahun
          sumber_dana: "Bank",
          akun_bank_id: insertedBank[0]?.id || null
        }
      });
      console.log("Dummy Aset Tetap (Laptop) ditambahkan.");
    }

  } catch (error) {
    console.error("Terjadi kesalahan:", error.message);
  }

  console.log("Selesai!");
}

main().finally(() => prisma.$disconnect());
