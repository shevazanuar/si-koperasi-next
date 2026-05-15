import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request) {
  const user = await getSession();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const aksi = searchParams.get("aksi") ?? null;
  const tabel = searchParams.get("tabel") ?? null;
  const keyword = searchParams.get("keyword") ?? null;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 50;

  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to + " 23:59:59") : null;

  const rows = await prisma.$queryRaw`
    SELECT id, user_id, username, aksi, tabel, record_id, ip_address, keterangan, created_at
    FROM audit_log
    WHERE (${fromDate} IS NULL OR created_at >= ${fromDate})
      AND (${toDate}   IS NULL OR created_at <= ${toDate})
      AND (${aksi}     IS NULL OR aksi = ${aksi})
      AND (${tabel}    IS NULL OR tabel = ${tabel})
      AND (${keyword}  IS NULL OR username LIKE CONCAT('%',${keyword},'%') OR keterangan LIKE CONCAT('%',${keyword},'%'))
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${(page - 1) * limit}
  `;

  const data = rows.map((r) => ({
    ...r,
    id: typeof r.id === "bigint" ? Number(r.id) : r.id,
    user_id: typeof r.user_id === "bigint" ? Number(r.user_id) : r.user_id,
    record_id: typeof r.record_id === "bigint" ? Number(r.record_id) : r.record_id,
  }));

  return NextResponse.json({ data, page, limit });
}
