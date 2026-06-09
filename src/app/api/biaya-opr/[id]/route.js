import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// BIGINT serialization workaround for JSON
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const data = await prisma.biaya_opr.findUnique({
      where: { id: BigInt(id) },
    });

    if (!data) {
      return NextResponse.json({ error: "Data biaya operasional tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET Detail Biaya Opr Error:", error);
    return NextResponse.json({ error: "Gagal memuat detail data biaya" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { kode_biaya, nama_biaya, nominal, tanggal, keterangan } = body;

    if (!kode_biaya || !nama_biaya || !nominal || !tanggal) {
      return NextResponse.json({ error: "Kode Biaya, Nama, Nominal, dan Tanggal wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.biaya_opr.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      return NextResponse.json({ error: "Data biaya operasional tidak ditemukan" }, { status: 404 });
    }

    // Check if new kode_biaya already exists in another record
    if (kode_biaya !== existing.kode_biaya) {
      const kodeExist = await prisma.biaya_opr.findUnique({
        where: { kode_biaya },
      });
      if (kodeExist) {
        return NextResponse.json({ error: "Kode Biaya sudah terdaftar" }, { status: 400 });
      }
    }

    const updatedBiaya = await prisma.biaya_opr.update({
      where: { id: BigInt(id) },
      data: {
        kode_biaya,
        nama_biaya,
        nominal,
        tanggal: new Date(tanggal),
        keterangan,
      },
    });

    return NextResponse.json({ success: true, data: updatedBiaya }, { status: 200 });
  } catch (error) {
    console.error("PUT Biaya Opr Error:", error);
    return NextResponse.json({ error: "Gagal mengubah data biaya operasional" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const existing = await prisma.biaya_opr.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      return NextResponse.json({ error: "Data biaya operasional tidak ditemukan" }, { status: 404 });
    }

    await prisma.biaya_opr.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ success: true, message: "Data berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("DELETE Biaya Opr Error:", error);
    return NextResponse.json({ error: "Gagal menghapus data biaya operasional" }, { status: 500 });
  }
}
