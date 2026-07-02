import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const logs = await prisma.audit_log.findMany({
      orderBy: { created_at: "desc" },
      take: 5,
    });
    
    // Format the response for the UI
    const formattedLogs = logs.map(log => {
      let title = "Aktivitas Sistem";
      
      if (log.aksi === "login") {
        title = `Login: ${log.username || "Seseorang"}`;
      } else if (log.aksi && log.tabel) {
        // e.g. "insert", "update", "delete"
        const aksiStr = log.aksi === "insert" ? "Tambah" : log.aksi === "update" ? "Ubah" : log.aksi === "delete" ? "Hapus" : log.aksi;
        title = `${aksiStr} data di ${log.tabel.replace(/_/g, " ")}`;
      } else if (log.keterangan) {
        title = log.keterangan;
      }

      return {
        id: log.id,
        title: title,
        amount: null, // No amount for general log, or we can use keterangan
        username: log.username,
        date: log.created_at,
        aksi: log.aksi,
      };
    });

    return NextResponse.json(formattedLogs);
  } catch (error) {
    console.error("Error fetching aktivitas terbaru:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}
