import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pembelian = await prisma.penjualan.findMany({
      where: {
        anggota_id: user.id
      },
      orderBy: {
        tanggal_penjualan: "desc"
      },
      select: {
        id: true,
        kode_penjualan: true,
        tanggal_penjualan: true,
        total_harga: true,
        status: true,
        metode_pembayaran: true,
      }
    });

    return NextResponse.json(pembelian);
  } catch (error) {
    console.error("Error fetching pembelian:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
