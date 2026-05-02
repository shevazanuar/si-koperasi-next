import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/serialize";

export const dynamic = "force-dynamic";

// perusahaan has @@ignore so use raw SQL
export async function GET() {
  try {
    const data = await prisma.$queryRawUnsafe("SELECT * FROM perusahaan ORDER BY id ASC");
    return NextResponse.json({ data: serializeBigInt(data) });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama } = body;
    await prisma.$executeRawUnsafe(
      "INSERT INTO perusahaan (nama, insert_date) VALUES (?, NOW())", nama
    );
    return NextResponse.json({ message: "Data berhasil ditambahkan" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, nama } = body;
    await prisma.$executeRawUnsafe(
      "UPDATE perusahaan SET nama=?, update_date=NOW() WHERE id=?", nama, parseInt(id)
    );
    return NextResponse.json({ message: "Data berhasil diperbarui" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await prisma.$executeRawUnsafe("DELETE FROM perusahaan WHERE id=?", parseInt(id));
    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
