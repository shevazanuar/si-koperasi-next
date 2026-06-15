import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ count: 0 });
    }

    const count = await prisma.pengajuan_pinjaman.count({
      where: {
        OR: [
          { status: "Open" },
          { status: null }
        ]
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("GET Pending Count Error:", error);
    return NextResponse.json({ count: 0 });
  }
}
