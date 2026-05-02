import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const levels = await prisma.level.findMany({ orderBy: { id: "asc" } });
    const menus = await prisma.menu.findMany({ orderBy: { kode: "asc" } });
    return NextResponse.json({ levels, menus });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { level_id, akses } = body;

    // akses is an array of menu IDs
    const aksesStr = Array.isArray(akses) ? akses.join(",") : akses;

    await prisma.level.update({
      where: { id: parseInt(level_id) },
      data: { akses: aksesStr },
    });

    return NextResponse.json({ message: "Akses menu berhasil diperbarui" });
  } catch (error) {
    console.error("Management Menu PUT Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}
