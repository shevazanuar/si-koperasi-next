import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.kategori_aset_tetap.findMany({
      orderBy: { nama_kategori: "desc" },
    });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data kategori aset" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.nama_kategori) return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });

    await prisma.kategori_aset_tetap.create({
      data: {
        nama_kategori: body.nama_kategori,
        created_at: new Date(),
      },
    });

    return NextResponse.json({ message: "Kategori aset berhasil ditambahkan" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan kategori aset" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body.id || !body.nama_kategori) return NextResponse.json({ error: "ID dan Nama kategori wajib diisi" }, { status: 400 });

    await prisma.kategori_aset_tetap.update({
      where: { id: parseInt(body.id) },
      data: {
        nama_kategori: body.nama_kategori,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ message: "Kategori aset berhasil diperbarui" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui kategori aset" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });

    // Cek apakah kategori sudah dipakai di aset_tetap
    const check = await prisma.aset_tetap.findFirst({
      where: { kategori_id: parseInt(id) }
    });

    if (check) {
      return NextResponse.json({ error: "Tidak dapat dihapus karena sudah dipakai pada data Aset Tetap" }, { status: 400 });
    }

    await prisma.kategori_aset_tetap.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Kategori aset berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus kategori aset" }, { status: 500 });
  }
}
