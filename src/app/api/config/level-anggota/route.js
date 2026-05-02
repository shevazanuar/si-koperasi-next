import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await prisma.level_anggota.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const data = await prisma.level_anggota.create({
      data: { nama: body.nama, insert_date: new Date() },
    });
    return NextResponse.json({ message: "Data berhasil ditambahkan", data });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const data = await prisma.level_anggota.update({
      where: { id: parseInt(body.id) },
      data: { nama: body.nama, update_date: new Date() },
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
    await prisma.level_anggota.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
