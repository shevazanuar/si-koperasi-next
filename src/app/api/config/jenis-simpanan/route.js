import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await prisma.jenis_simpanan.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama, jumlah, keterangan } = body;
    const data = await prisma.jenis_simpanan.create({
      data: { nama, jumlah: parseInt(jumlah) || 0, keterangan: keterangan || "", insert_date: new Date() },
    });
    return NextResponse.json({ message: "Data berhasil ditambahkan", data });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, nama, jumlah, keterangan } = body;
    const data = await prisma.jenis_simpanan.update({
      where: { id: parseInt(id) },
      data: { nama, jumlah: parseInt(jumlah) || 0, keterangan: keterangan || "", update_date: new Date() },
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
    await prisma.jenis_simpanan.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
