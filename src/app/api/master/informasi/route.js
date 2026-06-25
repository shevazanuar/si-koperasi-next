import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await prisma.informasi.findMany({
      orderBy: { id: 'desc' }
    });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Informasi GET Error:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { judul, isi } = body;
    await prisma.informasi.create({
      data: {
        judul: judul || "",
        isi: isi || "",
        user_id: 1,
        insert_date: new Date(),
        update_date: new Date()
      }
    });
    return NextResponse.json({ message: "Informasi berhasil ditambahkan" });
  } catch (error) {
    console.error("Informasi POST Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data", detail: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, judul, isi } = body;
    await prisma.informasi.update({
      where: { id: parseInt(id) },
      data: {
        judul: judul || "",
        isi: isi || "",
        update_date: new Date()
      }
    });
    return NextResponse.json({ message: "Informasi berhasil diperbarui" });
  } catch (error) {
    console.error("Informasi PUT Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data", detail: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await prisma.informasi.delete({
      where: { id: parseInt(id) }
    });
    return NextResponse.json({ message: "Informasi berhasil dihapus" });
  } catch (error) {
    console.error("Informasi DELETE Error:", error);
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
