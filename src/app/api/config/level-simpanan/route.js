import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Join with jenis_simpanan and level_anggota for display
    const data = await prisma.level_simpanan.findMany({ orderBy: { id: "asc" } });
    const jenisSimpanan = await prisma.jenis_simpanan.findMany({ select: { id: true, nama: true } });
    const levelAnggota = await prisma.level_anggota.findMany({ select: { id: true, nama: true } });

    const enriched = data.map((item) => ({
      ...item,
      nama_jenis: jenisSimpanan.find((j) => j.id === item.jenis_simpanan_id)?.nama || "-",
      nama_level: levelAnggota.find((l) => l.id === item.level_anggota_id)?.nama || "-",
    }));

    return NextResponse.json({ data: enriched, jenisSimpanan, levelAnggota });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { level_anggota_id, jenis_simpanan_id, jumlah } = body;
    const data = await prisma.level_simpanan.create({
      data: {
        level_anggota_id: parseInt(level_anggota_id),
        jenis_simpanan_id: parseInt(jenis_simpanan_id),
        jumlah: parseInt(jumlah) || 0,
        insert_date: new Date(),
      },
    });
    return NextResponse.json({ message: "Data berhasil ditambahkan", data });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, level_anggota_id, jenis_simpanan_id, jumlah } = body;
    const data = await prisma.level_simpanan.update({
      where: { id: parseInt(id) },
      data: {
        level_anggota_id: parseInt(level_anggota_id),
        jenis_simpanan_id: parseInt(jenis_simpanan_id),
        jumlah: parseInt(jumlah) || 0,
        update_date: new Date(),
      },
    });
    return NextResponse.json({ message: "Data berhasil diperbarui", data });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await prisma.level_simpanan.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
