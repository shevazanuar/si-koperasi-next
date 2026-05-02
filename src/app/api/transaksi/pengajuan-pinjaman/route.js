import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await prisma.$queryRawUnsafe(`
      SELECT a.nomor, a.tanggal, a.anggota_id, a.status, a.keperluan,
             b.nama as nama_jenis, c.nik, c.nama as nama_anggota,
             c.perusahaan, c.jabatan
      FROM pengajuan_pinjaman a
      JOIN jenis_pinjaman b ON a.jenis_pinjaman_id = b.id
      JOIN anggota c ON a.anggota_id = c.id
      ORDER BY a.id DESC
    `);
    const safe = data.map((d) => ({
      ...d,
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
    const body = await request.json();
    const { nomor, status } = body;
    await prisma.$executeRawUnsafe(
      "UPDATE pengajuan_pinjaman SET status=? WHERE nomor=?",
      status, nomor
    );
    return NextResponse.json({ message: `Status diperbarui menjadi ${status}` });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui status" }, { status: 500 });
  }
}
