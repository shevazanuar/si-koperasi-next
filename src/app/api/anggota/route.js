import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  try {
    const anggota = await prisma.anggota.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { nama: { contains: search } },
                { kode: { contains: search } },
                { nik: { contains: search } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        kode: true,
        nama: true,
        nik: true,
        hp: true,
        status: true,
        email: true,
        perusahaan: true,
      },
      orderBy: { nama: "asc" },
    });

    return NextResponse.json({ success: true, data: anggota });
  } catch (error) {
    console.error("GET /api/anggota error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data anggota" },
      { status: 500 }
    );
  }
}
