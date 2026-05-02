import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tgl1 = searchParams.get("tgl1");
    const tgl2 = searchParams.get("tgl2");
    const status = searchParams.get("status") || "Aktif";
    const perusahaan = searchParams.get("perusahaan") || "";

    // NULLIF handles 0000-00-00 MySQL zero-dates by returning NULL instead
    let query = `SELECT id, nik, nama, jk, jabatan, perusahaan, status,
      NULLIF(CAST(tgl_masuk AS CHAR), '0000-00-00') as tgl_masuk
      FROM anggota WHERE 1=1`;
    const params = [];

    if (status) { query += " AND status = ?"; params.push(status); }
    if (perusahaan) { query += " AND perusahaan = ?"; params.push(perusahaan); }
    if (tgl1 && tgl2) { query += " AND tgl_masuk >= ? AND tgl_masuk <= ?"; params.push(tgl1, tgl2); }
    query += " ORDER BY nama ASC";

    const data = await prisma.$queryRawUnsafe(query, ...params);

    const safe = data.map((d) => ({
      id: Number(d.id),
      nik: d.nik,
      nama: d.nama,
      jk: d.jk,
      jabatan: d.jabatan,
      perusahaan: d.perusahaan,
      status: d.status,
      tgl_masuk: d.tgl_masuk ? new Date(d.tgl_masuk).toISOString() : null,
    }));

    // Get unique perusahaan list for filter dropdown
    const perusahaanRaw = await prisma.$queryRawUnsafe(
      "SELECT DISTINCT perusahaan FROM anggota WHERE perusahaan IS NOT NULL AND perusahaan != '' ORDER BY perusahaan"
    );

    return NextResponse.json({
      data: safe,
      perusahaanList: perusahaanRaw.map((p) => p.perusahaan).filter(Boolean),
    });
  } catch (error) {
    console.error("Laporan Anggota Error:", error);
    return NextResponse.json({ error: "Gagal memuat data", detail: error.message }, { status: 500 });
  }
}
