import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const menus = await prisma.menu.findMany({ orderBy: { kode: "asc" } });
    return NextResponse.json({ data: menus });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { kode, nama, url, icon, class: cls, root } = body;

    // Auto-generate kode if empty
    let finalKode = kode;
    if (!finalKode) {
      const rootVal = parseInt(root) || 0;
      if (rootVal === 0) {
        const last = await prisma.menu.findFirst({
          where: { root: 0 },
          orderBy: { kode: "desc" },
        });
        finalKode = last ? last.kode + 1 : 1;
      } else {
        const last = await prisma.menu.findFirst({
          where: { root: rootVal },
          orderBy: { kode: "desc" },
        });
        if (last) {
          const sub = parseInt(String(last.kode).slice(2)) + 1;
          finalKode = parseInt(String(rootVal) + String(sub).padStart(2, "0"));
        } else {
          finalKode = parseInt(String(rootVal) + "01");
        }
      }
    }

    const menu = await prisma.menu.create({
      data: {
        kode: parseInt(finalKode),
        nama,
        url: url || "",
        icon: icon || "",
        class: cls || "",
        root: parseInt(root) || 0,
        aktif: "Y",
      },
    });

    return NextResponse.json({ message: "Data berhasil ditambahkan", data: menu });
  } catch (error) {
    console.error("Menu POST Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, kode, nama, url, icon, class: cls, root } = body;

    const menu = await prisma.menu.update({
      where: { id: parseInt(id) },
      data: {
        kode: parseInt(kode),
        nama,
        url: url || "",
        icon: icon || "",
        class: cls || "",
        root: parseInt(root) || 0,
      },
    });

    return NextResponse.json({ message: "Data berhasil diperbarui", data: menu });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await prisma.menu.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
