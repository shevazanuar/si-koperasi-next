import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const data = await prisma.$queryRawUnsafe(`
      SELECT a.id, a.nomor, a.tanggal, a.anggota_id, a.status, a.keperluan,
             a.jumlah, a.lama, a.satuan,
             b.nama as nama_jenis, c.nik, c.nama as nama_anggota,
             c.perusahaan, c.jabatan
      FROM pengajuan_pinjaman a
      LEFT JOIN jenis_pinjaman b ON a.jenis_pinjaman_id = b.id
      LEFT JOIN anggota c ON a.anggota_id = c.id
      ORDER BY a.id DESC
    `);
    const safe = data.map((d) => ({
      ...d,
      id: typeof d.id === "bigint" ? Number(d.id) : d.id,
      nama_jenis: d.nama_jenis || "Pinjaman Umum",
      nama_anggota: d.nama_anggota || "Tidak Ditemukan",
      tanggal: d.tanggal ? new Date(d.tanggal).toISOString() : null,
    }));
    return NextResponse.json({ data: safe });
  } catch (error) {
    console.error("Pengajuan GET Error:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Hanya Admin yang dapat memproses pengajuan." }, { status: 403 });
    }

    const body = await request.json();
    const { nomor, status } = body;

    if (status === "Acc") {
      // 1. Get Pengajuan Details
      const pengajuan = await prisma.pengajuan_pinjaman.findFirst({
        where: { nomor: nomor },
        select: {
          anggota_id: true,
          jenis_pinjaman_id: true,
          lama: true,
          satuan: true,
          bunga: true,
          jumlah: true,
          user_id: true
        }
      });

      if (!pengajuan) {
        return NextResponse.json({ error: "Data pengajuan tidak ditemukan" }, { status: 404 });
      }

      // 2. Generate Nomor Pinjaman (Format: P + Tahun + 000000)
      const now = new Date();
      const year = now.getFullYear();
      const prefix = `P${year}`;

      const lastPinjaman = await prisma.pinjaman_header.findFirst({
        where: { nomor: { startsWith: prefix } },
        orderBy: { nomor: "desc" },
      });

      let counter = 1;
      if (lastPinjaman && lastPinjaman.nomor) {
        const lastNum = parseInt(lastPinjaman.nomor.substring(5));
        counter = lastNum + 1;
      }
      const nomorPinjaman = `${prefix}${counter.toString().padStart(6, "0")}`;

      // 3. Create Pinjaman Header (Masuk ke halaman Pinjaman)
      const newPinjaman = await prisma.pinjaman_header.create({
        data: {
          nomor: nomorPinjaman,
          tgl: new Date(),
          anggota_id: pengajuan.anggota_id,
          jenis_pinjaman_id: pengajuan.jenis_pinjaman_id,
          lama: pengajuan.lama || 0,
          satuan: pengajuan.satuan || "Bulan",
          bunga: pengajuan.bunga || 0,
          jumlah: Math.round(pengajuan.jumlah || 0),
          user_id: pengajuan.user_id || 1,
          insert_date: new Date(),
        }
      });

      // 4. Generate Pinjaman Details (Installment Schedule)
      const lama = pengajuan.lama || 1;
      const pokok = Math.round(pengajuan.jumlah || 0);
      const bungaPersen = pengajuan.bunga || 0;
      
      const angsuranPokok = Math.floor(pokok / lama);
      const angsuranBunga = Math.round((pokok * bungaPersen) / 100);
      
      const details = [];
      const startDate = new Date();
      
      for (let i = 1; i <= lama; i++) {
        // Simple monthly increment for due date
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + i);
        
        details.push({
          pinjaman_id: newPinjaman.id,
          cicilan: i,
          angsuran: i === lama ? (pokok - (angsuranPokok * (lama - 1))) : angsuranPokok, // Adjust last payment for rounding
          bunga: angsuranBunga,
          tgl_jatuh_tempo: dueDate,
          jumlah_bayar: 0,
          insert_user_id: user.id,
          insert_date: new Date(),
        });
      }

      await prisma.pinjaman_detail.createMany({
        data: details
      });
    }

    // 5. Update Pengajuan Status
    await prisma.pengajuan_pinjaman.updateMany({
      where: { nomor: nomor },
      data: { 
        status: status,
        update_date: new Date()
      }
    });

    return NextResponse.json({ message: `Pengajuan ${status === 'Acc' ? 'disetujui dan pinjaman telah diterbitkan' : 'telah ditolak'}` });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status: " + error.message }, { status: 500 });
  }
}
