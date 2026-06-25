import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [kasList, bankList] = await Promise.all([
      prisma.kas.findMany({ where: { status: "Aktif" }, select: { id: true, nama_kas: true, saldo: true } }),
      prisma.akun_bank.findMany({ where: { status: "Aktif" }, select: { id: true, nama_bank: true, nomor_rekening: true, saldo: true } })
    ]);

    // Map bigints to numbers
    const kas = kasList.map(k => ({
      ...k,
      saldo: Number(k.saldo)
    }));

    const bank = bankList.map(b => ({
      ...b,
      saldo: Number(b.saldo)
    }));

    return NextResponse.json({ kas, bank });
  } catch (error) {
    console.error("Sumber Dana GET Error:", error);
    return NextResponse.json({ error: "Gagal memuat sumber dana" }, { status: 500 });
  }
}
