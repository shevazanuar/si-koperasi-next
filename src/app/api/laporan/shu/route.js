import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tgl1 = searchParams.get("tgl1");
    const tgl2 = searchParams.get("tgl2");
    const anggota_id = searchParams.get("anggota_id");

    // SHU = based on pinjaman_header (bunga paid = profit)
    const where = {};
    if (anggota_id) where.anggota_id = parseInt(anggota_id);
    if (tgl1 && tgl2) {
      where.tgl = { gte: new Date(tgl1), lte: new Date(tgl2) };
    }

    const headers = await prisma.pinjaman_header.findMany({
      where,
      orderBy: { nomor: "desc" },
    });

    const anggotaIds = [...new Set(headers.map((h) => h.anggota_id))];
    const jenisPinjamanIds = [...new Set(headers.map((h) => h.jenis_pinjaman_id))];

    const anggotaList = await prisma.anggota.findMany({
      where: { id: { in: anggotaIds } },
      select: { id: true, nik: true, nama: true, jk: true },
    });

    const jenisList = await prisma.$queryRawUnsafe(
      `SELECT id, nama FROM jenis_pinjaman WHERE id IN (${jenisPinjamanIds.length ? jenisPinjamanIds.join(",") : "0"})`
    );

    const anggotaMap = Object.fromEntries(anggotaList.map((a) => [a.id, a]));
    const jenisMap = Object.fromEntries(jenisList.map((j) => [Number(j.id), j.nama]));

    const data = headers.map((h) => ({
      id: h.id,
      nomor: h.nomor,
      tgl: h.tgl?.toISOString() || null,
      jumlah: h.jumlah,
      bunga: h.bunga,
      lama: h.lama,
      satuan: h.satuan,
      nik: anggotaMap[h.anggota_id]?.nik || "-",
      nama_anggota: anggotaMap[h.anggota_id]?.nama || "-",
      jk: anggotaMap[h.anggota_id]?.jk || "-",
      nama_pinjaman: jenisMap[h.jenis_pinjaman_id] || "-",
    }));

    const anggotaForFilter = await prisma.anggota.findMany({
      select: { id: true, nama: true, nik: true },
      orderBy: { nama: "asc" },
    });

    return NextResponse.json({ data, anggotaList: anggotaForFilter });
  } catch (error) {
    console.error("Laporan SHU Error:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}
