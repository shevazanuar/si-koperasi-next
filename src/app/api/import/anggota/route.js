import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { data } = await req.json();

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    let createdCount = 0;
    let skippedCount = 0;
    const errors = [];

    // Use a transaction or process one by one to avoid total failure
    for (const row of data) {
      try {
        const nik = String(row.NIK || row.nik || "").trim();
        const nama = String(row.Nama || row.nama || "").trim();

        if (!nik || !nama) {
          skippedCount++;
          continue;
        }

        // Check if exists
        const existing = await prisma.anggota.findFirst({
          where: { OR: [{ nik }, { noidentitas: nik }] }
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        // Handle Date (Excel sometimes gives serial numbers)
        let tglLahir = new Date();
        if (row["Tgl Lahir"] || row.tgl_lahir) {
          const rawDate = row["Tgl Lahir"] || row.tgl_lahir;
          tglLahir = new Date(rawDate);
          if (isNaN(tglLahir.getTime())) tglLahir = new Date();
        }

        await prisma.anggota.create({
          data: {
            nik,
            noidentitas: nik, // Usually same if not specified
            nama,
            jk: row.JK || row.jk || "L",
            tempat_lahir: row["Tempat Lahir"] || row.tempat_lahir || "-",
            tgl_lahir: tglLahir,
            alamat: row.Alamat || row.alamat || "-",
            kota: row.Kota || row.kota || "-",
            hp: String(row.HP || row.hp || "-"),
            unit_seksi: row["Unit/Seksi"] || row.unit_seksi || row.Unit || "-",
            jabatan: row.Jabatan || row.jabatan || "-",
            status: "Aktif",
            insert_date: new Date(),
          }
        });
        createdCount++;
      } catch (err) {
        console.error("Error importing row:", row, err);
        errors.push(`Gagal mengimpor ${row.Nama || 'Baris'}: ${err.message}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: createdCount, 
      skipped: skippedCount,
      errors: errors.slice(0, 10) // Only return first 10 errors
    });
  } catch (error) {
    console.error("API Error Import Anggota:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
