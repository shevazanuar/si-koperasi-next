import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const barang = await prisma.master_barang.findMany({
      where: {
        status: "Aktif",
      },
      orderBy: { nama_barang: "asc" },
      include: {
        kategori: true
      }
    });
    
    // We parse the decimal fields
    const parsedBarang = barang.map(b => ({
      ...b,
      harga_modal: Number(b.harga_modal),
      harga_jual: Number(b.harga_jual),
    }));

    return NextResponse.json(parsedBarang);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
