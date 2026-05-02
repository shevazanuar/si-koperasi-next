import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data } = await req.json();

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    let createdCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const row of data) {
      try {
        const nik = String(row.NIK || row.nik || "").trim();
        const jumlah = parseFloat(row.Jumlah || row.jumlah || 0);

        if (!nik || isNaN(jumlah) || jumlah <= 0) {
          skippedCount++;
          continue;
        }

        // Find anggota
        const anggota = await prisma.anggota.findFirst({
          where: { OR: [{ nik }, { noidentitas: nik }] },
          select: { id: true }
        });

        if (!anggota) {
          errors.push(`Anggota dengan NIK ${nik} tidak ditemukan.`);
          skippedCount++;
          continue;
        }

        // Handle Date
        let tgl = new Date();
        if (row.Tanggal || row.tanggal || row.tgl) {
          tgl = new Date(row.Tanggal || row.tanggal || row.tgl);
          if (isNaN(tgl.getTime())) tgl = new Date();
        }

        await prisma.simpanan.create({
          data: {
            nomor: String(row.Nomor || row.nomor || `SIM-${Date.now()}-${createdCount}`),
            tgl,
            tgl_akhir: tgl,
            anggota_id: anggota.id,
            jenis_simpanan_id: parseInt(row["Jenis Simpanan ID"] || row.jenis_simpanan_id || 1), // Default to 1 (Pokok/Wajib usually)
            jumlah,
            user_id: user.id,
            insert_date: new Date(),
            entry: "I"
          }
        });
        createdCount++;
      } catch (err) {
        console.error("Error importing simpanan row:", row, err);
        errors.push(`Gagal mengimpor: ${err.message}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: createdCount, 
      skipped: skippedCount,
      errors: errors.slice(0, 10)
    });
  } catch (error) {
    console.error("API Error Import Simpanan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
