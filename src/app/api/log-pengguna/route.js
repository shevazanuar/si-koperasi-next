import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sessions = await prisma.ci_sessions.findMany({
      orderBy: { timestamp: "desc" },
      take: 200,
    });

    const data = sessions.map((s) => ({
      id: s.id,
      ip_address: s.ip_address,
      timestamp: s.timestamp,
      datetime: new Date(s.timestamp * 1000).toISOString(),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Log GET Error:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all");

    if (all === "true") {
      await prisma.$executeRawUnsafe("TRUNCATE TABLE ci_sessions");
      return NextResponse.json({ message: "Semua log berhasil dihapus" });
    }

    const id = searchParams.get("id");
    const ip = searchParams.get("ip");
    if (id && ip) {
      await prisma.ci_sessions.delete({
        where: { id_ip_address: { id, ip_address: ip } },
      });
    }

    return NextResponse.json({ message: "Log berhasil dihapus" });
  } catch (error) {
    console.error("Log DELETE Error:", error);
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
