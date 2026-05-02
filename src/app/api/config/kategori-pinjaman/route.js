import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await prisma.kategori_pinjaman.findMany({ orderBy: { kategpinj_id: "asc" } });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { kategpinj_kode, kategpinj_nama } = body;
    // Get next ID
    const last = await prisma.kategori_pinjaman.findFirst({ orderBy: { kategpinj_id: "desc" } });
    const nextId = last ? last.kategpinj_id + 1 : 1;
    const data = await prisma.kategori_pinjaman.create({
      data: { kategpinj_id: nextId, kategpinj_kode: kategpinj_kode || String(nextId).padStart(4, "0"), kategpinj_nama },
    });
    return NextResponse.json({ message: "Data berhasil ditambahkan", data });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, kategpinj_kode, kategpinj_nama } = body;
    // Need to find by id to get the kode for composite key
    const existing = await prisma.kategori_pinjaman.findFirst({ where: { kategpinj_id: parseInt(id) } });
    if (!existing) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    const data = await prisma.kategori_pinjaman.update({
      where: { kategpinj_id_kategpinj_kode: { kategpinj_id: parseInt(id), kategpinj_kode: existing.kategpinj_kode } },
      data: { kategpinj_kode: kategpinj_kode || existing.kategpinj_kode, kategpinj_nama },
    });
    return NextResponse.json({ message: "Data berhasil diperbarui", data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const existing = await prisma.kategori_pinjaman.findFirst({ where: { kategpinj_id: parseInt(id) } });
    if (!existing) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    await prisma.kategori_pinjaman.delete({
      where: { kategpinj_id_kategpinj_kode: { kategpinj_id: parseInt(id), kategpinj_kode: existing.kategpinj_kode } },
    });
    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
