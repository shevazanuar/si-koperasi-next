import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { serializeBigInt } from "@/lib/serialize";

export async function GET() {
  try {
    const profile = await prisma.$queryRawUnsafe("SELECT * FROM profile WHERE id = 1 LIMIT 1");
    return NextResponse.json({ data: serializeBigInt(profile[0]) || null });
  } catch (error) {
    console.error("Profil GET Error:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { koperasi, alamat, kota, hp, email } = body;

    await prisma.$executeRawUnsafe(
      `UPDATE profile SET koperasi=?, alamat=?, kota=?, hp=?, email=? WHERE id=1`,
      koperasi || "",
      alamat || "",
      kota || "",
      hp || "",
      email || ""
    );

    return NextResponse.json({ message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error("Profil PUT Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}
