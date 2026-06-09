import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// BIGINT serialization workaround for JSON
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const tgl1 = searchParams.get("tgl1");
    const tgl2 = searchParams.get("tgl2");
    
    // Server-side pagination parameters
    // const page = parseInt(searchParams.get("page") || "1");
    // const limit = parseInt(searchParams.get("limit") || "10");
    // const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.nama_biaya = { contains: search };
    }
    
    if (tgl1 && tgl2) {
      where.tanggal = {
        gte: new Date(tgl1),
        lte: new Date(tgl2),
      };
    }

    const data = await prisma.biaya_opr.findMany({
      where,
      orderBy: { tanggal: "desc" },
      // take: limit,
      // skip,
    });
    
    const totalRow = await prisma.biaya_opr.count({ where });

    const totalBiayaResult = await prisma.biaya_opr.aggregate({
      where,
      _sum: { nominal: true }
    });
    const totalNominal = totalBiayaResult._sum.nominal || 0;

    return NextResponse.json({
      data,
      totalRow,
      totalNominal,
      // page,
      // limit
    });
  } catch (error) {
    console.error("GET Biaya Opr Error:", error);
    return NextResponse.json({ error: "Gagal memuat data biaya operasional" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { kode_biaya, nama_biaya, nominal, tanggal, keterangan } = body;

    // Basic Validation
    if (!kode_biaya || !nama_biaya || !nominal || !tanggal) {
      return NextResponse.json({ error: "Kode Biaya, Nama, Nominal, dan Tanggal wajib diisi" }, { status: 400 });
    }

    // Check if kode_biaya exists
    const existing = await prisma.biaya_opr.findUnique({
      where: { kode_biaya },
    });

    if (existing) {
      return NextResponse.json({ error: "Kode Biaya sudah terdaftar" }, { status: 400 });
    }

    const newBiaya = await prisma.biaya_opr.create({
      data: {
        kode_biaya,
        nama_biaya,
        nominal,
        tanggal: new Date(tanggal),
        keterangan,
        created_by: 1, // Assume 1 for admin
      },
    });

    return NextResponse.json({ success: true, data: newBiaya }, { status: 201 });
  } catch (error) {
    console.error("POST Biaya Opr Error:", error);
    return NextResponse.json({ error: "Gagal menambah data biaya operasional" }, { status: 500 });
  }
}
