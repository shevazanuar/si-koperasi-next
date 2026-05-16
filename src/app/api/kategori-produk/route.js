import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const kategori = await prisma.kategori_produk.findMany({
      orderBy: { nama_kategori: "asc" },
    });
    return NextResponse.json(kategori);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
