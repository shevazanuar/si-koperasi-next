import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const levels = await prisma.level.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json({ data: levels });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const level = await prisma.level.create({ data: { level: body.level, akses: "" } });
    return NextResponse.json({ message: "Data berhasil ditambahkan", data: level });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, level: levelName } = body;
    const level = await prisma.level.update({
      where: { id: parseInt(id) },
      data: { level: levelName },
    });
    return NextResponse.json({ message: "Data berhasil diperbarui", data: level });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await prisma.level.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
