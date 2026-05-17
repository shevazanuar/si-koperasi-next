import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const kategori_id = searchParams.get("kategori");

    const produk = await prisma.master_barang.findMany({
      where: {
        status: "Aktif",
        stok: {
          gt: 0,
        },
        ...(search
          ? {
              OR: [
                { nama_barang: { contains: search } },
                { deskripsi: { contains: search } },
                { kode_barang: { contains: search } }
              ],
            }
          : {}),
        ...(kategori_id
          ? { kategori_id: Number(kategori_id) }
          : {}),
      },
      select: {
        id: true,
        kode_barang: true,
        nama_barang: true,
        deskripsi: true,
        gambar: true,
        stok: true,
        satuan: true,
        harga_jual: true,
        is_featured: true,
        kategori: {
          select: {
            id: true,
            nama_kategori: true,
          },
        },
      },
      orderBy: [
        { is_featured: "desc" },
        { nama_barang: "asc" },
      ],
    });

    return NextResponse.json(produk);
  } catch (error) {
    console.error("Error fetching katalog:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
