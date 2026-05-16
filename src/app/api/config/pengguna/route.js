import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";

export async function GET() {
  try {
    const users = await prisma.users.findMany({ orderBy: { id: "asc" } });
    const levels = await prisma.level.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json({ data: users, levels });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, namalengkap, password, level_id, blokir } = body;

    const dt = {
      username,
      namalengkap,
      password: await hashPassword(password),
      level_id: parseInt(level_id),
      foto: "",
      blokir: blokir || "T",
    };

    const user = await prisma.users.create({ data: dt });
    return NextResponse.json({ message: "Data berhasil ditambahkan", data: user });
  } catch (error) {
    console.error("Pengguna POST Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, username, namalengkap, password, level_id, blokir } = body;

    const dt = {
      username,
      namalengkap,
      level_id: parseInt(level_id),
      blokir: blokir || "T",
    };

    if (password) {
      dt.password = await hashPassword(password);
    }

    const user = await prisma.users.update({ where: { id: parseInt(id) }, data: dt });
    return NextResponse.json({ message: "Data berhasil diperbarui", data: user });
  } catch (error) {
    console.error("Pengguna PUT Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await prisma.users.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
