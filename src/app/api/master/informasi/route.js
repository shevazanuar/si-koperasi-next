import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { serializeBigInt } from "@/lib/serialize";

export async function GET() {
  try {
    const data = await prisma.$queryRawUnsafe("SELECT * FROM informasi ORDER BY id DESC");
    const safe = data.map((d) => ({
      ...d,
      id: typeof d.id === 'bigint' ? Number(d.id) : d.id,
      insert_date: d.insert_date ? new Date(d.insert_date).toISOString() : null,
      update_date: d.update_date ? new Date(d.update_date).toISOString() : null,
    }));
    return NextResponse.json({ data: safe });
  } catch (error) {
    console.error("Informasi GET Error:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { judul, isi } = body;
    await prisma.$executeRawUnsafe(
      "INSERT INTO informasi (judul, isi, user_id, insert_date) VALUES (?, ?, ?, NOW())",
      judul || "", isi || "", 1
    );
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
    await prisma.$executeRawUnsafe(
      "UPDATE informasi SET judul=?, isi=?, update_date=NOW() WHERE id=?",
      judul || "", isi || "", parseInt(id)
    );
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
    await prisma.$executeRawUnsafe("DELETE FROM informasi WHERE id=?", parseInt(id));
    return NextResponse.json({ message: "Informasi berhasil dihapus" });
  } catch (error) {
    console.error("Informasi DELETE Error:", error);
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
