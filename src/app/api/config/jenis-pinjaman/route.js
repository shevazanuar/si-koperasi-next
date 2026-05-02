import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Use raw SQL to avoid Prisma's strict date parsing (zero date issue)
export async function GET() {
  try {
    const data = await prisma.$queryRawUnsafe(
      "SELECT id, nama, lama, satuan, bunga, jumlah FROM jenis_pinjaman ORDER BY id ASC"
    );
    const safe = data.map((d) => ({
      id: Number(d.id),
      nama: d.nama,
      lama: d.lama,
      satuan: d.satuan,
      bunga: d.bunga,
      jumlah: d.jumlah,
    }));
    return NextResponse.json({ data: safe });
  } catch (error) {
    console.error("Jenis Pinjaman GET Error:", error);
    return NextResponse.json({ error: "Gagal memuat data", detail: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama, lama, satuan, bunga, jumlah } = body;
    await prisma.$executeRawUnsafe(
      "INSERT INTO jenis_pinjaman (nama, lama, satuan, bunga, jumlah, insert_date) VALUES (?, ?, ?, ?, ?, NOW())",
      nama || "", parseInt(lama) || 0, satuan || "Bulan", parseFloat(bunga) || 0, parseInt(jumlah) || 0
    );
    return NextResponse.json({ message: "Data berhasil ditambahkan" });
  } catch (error) {
    console.error("Jenis Pinjaman POST Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, nama, lama, satuan, bunga, jumlah } = body;
    await prisma.$executeRawUnsafe(
      "UPDATE jenis_pinjaman SET nama=?, lama=?, satuan=?, bunga=?, jumlah=?, update_date=NOW() WHERE id=?",
      nama || "", parseInt(lama) || 0, satuan || "Bulan", parseFloat(bunga) || 0, parseInt(jumlah) || 0, parseInt(id)
    );
    return NextResponse.json({ message: "Data berhasil diperbarui" });
  } catch (error) {
    console.error("Jenis Pinjaman PUT Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await prisma.$executeRawUnsafe("DELETE FROM jenis_pinjaman WHERE id=?", parseInt(id));
    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
