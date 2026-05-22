'use server';

import prisma from '@/lib/prisma';

export async function generateLaporanPendapatan(tahun, bulan = null) {
  try {
    // 1. Tentukan rentang tanggal
    let startDate, endDate;
    if (bulan) {
      // Bulanan
      const year = parseInt(tahun);
      const month = parseInt(bulan) - 1; // 0-indexed in JS
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0, 23, 59, 59); // Last day of month
    } else {
      // Tahunan
      const year = parseInt(tahun);
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    }

    // 2. Laba Penjualan
    // Filter by tanggal_penjualan
    const penjualan = await prisma.penjualan.findMany({
      where: {
        tanggal_penjualan: {
          gte: startDate,
          lte: endDate,
        },
        status: 'Selesai',
      },
    });
    
    const labaPenjualan = penjualan.reduce((total, p) => total + parseFloat(p.total_laba || 0), 0);

    // 3. Bunga Pinjaman dan Biaya Admin
    // Format tgl_bayar di database adalah string Char(11), misal: "2026-05-21"
    // Kita tarik semua pinjaman_detail yang ada tgl_bayarnya, lalu filter di JS
    // (Bisa juga disearch dengan startsWith jika formatnya konsisten yyyy-MM)
    
    // Namun untuk lebih aman, kita ambil semua yang tidak kosong dan bandingkan
    const pinjamanDetails = await prisma.pinjaman_detail.findMany({
      where: {
        tgl_bayar: {
          not: "",
        }
      }
    });

    let bungaPinjaman = 0;
    let biayaAdmin = 0;

    pinjamanDetails.forEach((pd) => {
      // Asumsi tgl_bayar formatnya yyyy-mm-dd
      if (pd.tgl_bayar && pd.tgl_bayar.length >= 10) {
        const pdDateStr = pd.tgl_bayar.substring(0, 10);
        const pdDate = new Date(pdDateStr);
        
        if (pdDate >= startDate && pdDate <= endDate) {
          bungaPinjaman += (pd.bunga || 0);
          // Biaya admin = 1% dari jumlah bayar
          biayaAdmin += (pd.jumlah_bayar || 0) * 0.01;
        }
      }
    });

    // Bulatkan hasil perhitungan
    bungaPinjaman = Math.round(bungaPinjaman);
    biayaAdmin = Math.round(biayaAdmin);
    
    const results = [
      {
        jenis_pendapatan: "Bunga Pinjaman",
        nominal: bungaPinjaman,
      },
      {
        jenis_pendapatan: "Biaya Admin (1%)",
        nominal: biayaAdmin,
      },
      {
        jenis_pendapatan: "Laba Penjualan Barang",
        nominal: labaPenjualan,
      }
    ];

    return {
      success: true,
      data: results,
      total: bungaPinjaman + biayaAdmin + labaPenjualan,
      periode: bulan ? `Bulan ${bulan} Tahun ${tahun}` : `Tahun ${tahun}`
    };

  } catch (error) {
    console.error('Error generate laporan pendapatan:', error);
    return { success: false, error: 'Gagal menghasilkan laporan pendapatan' };
  }
}

export async function simpanPendapatanTahunan(tahun) {
  try {
    const report = await generateLaporanPendapatan(tahun);
    if (!report.success) return report;

    const periodeStr = `Tahun ${tahun}`;

    // Hapus data lama untuk tahun yang sama agar tidak duplikat
    await prisma.pendapatan.deleteMany({
      where: {
        periode: periodeStr
      }
    });

    // Insert data baru
    const insertData = report.data.map(item => ({
      jenis_pendapatan: item.jenis_pendapatan,
      nominal: item.nominal,
      tanggal_laporan: new Date(), // Waktu simpan
      periode: periodeStr
    }));

    await prisma.pendapatan.createMany({
      data: insertData
    });

    return { success: true, message: 'Data pendapatan tahunan berhasil disimpan ke database.' };
  } catch (error) {
    console.error('Error simpan pendapatan tahunan:', error);
    return { success: false, error: 'Gagal menyimpan pendapatan tahunan' };
  }
}
