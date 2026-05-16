import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const pembelian = await prisma.penjualan.findFirst({
      where: {
        id: Number(id),
        anggota_id: user.id // Security check
      },
      select: {
        id: true,
        kode_penjualan: true,
        tanggal_penjualan: true,
        total_harga: true,
        status: true,
        metode_pembayaran: true,
        detail: {
          select: {
            id: true,
            qty: true,
            harga_jual: true,
            subtotal_harga: true,
            barang: {
              select: {
                kode_barang: true,
                nama_barang: true,
                gambar: true,
                satuan: true,
              }
            }
          }
        }
      }
    });

    if (!pembelian) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(pembelian);
  } catch (error) {
    console.error("Error fetching detail pembelian:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
