import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { writeAuditLog, AUDIT_AKSI } from "@/lib/audit-log";
import { z } from "zod";

function clientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

const bayarSchema = z.object({
  detail_id: z.coerce.number().int().positive(),
  tgl_bayar: z.string().min(1),
  jumlah_bayar: z.coerce.number().int().positive("Jumlah bayar harus lebih dari 0"),
});

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let pinjamanWhere = {};
    if (user.role === "anggota") pinjamanWhere = { anggota_id: user.id };

    const myPinjaman = await prisma.pinjaman_header.findMany({ where: pinjamanWhere, select: { id: true } });
    const myPinjamanIds = myPinjaman.map((p) => p.id);
    const whereClause = { nomor_bayar: { not: null } };
    if (user.role === "anggota") whereClause.pinjaman_id = { in: myPinjamanIds };

    const details = await prisma.pinjaman_detail.findMany({ where: whereClause, orderBy: { nomor_bayar: "desc" }, take: 200 });
    const pinjamanIds = [...new Set(details.map((d) => d.pinjaman_id))];
    const headersList = await prisma.pinjaman_header.findMany({ where: { id: { in: pinjamanIds } } });
    const anggotaIds = [...new Set(headersList.map((h) => h.anggota_id))];
    const anggotaList = await prisma.anggota.findMany({ where: { id: { in: anggotaIds } }, select: { id: true, nik: true, nama: true } });
    const headerMap = Object.fromEntries(headersList.map((h) => [h.id, h]));
    const anggotaMap = Object.fromEntries(anggotaList.map((a) => [a.id, a]));

    const data = details.map((d) => {
      const header = headerMap[d.pinjaman_id] || {};
      const anggota = anggotaMap[header.anggota_id] || {};
      return { id: d.id, nomor_bayar: d.nomor_bayar, tgl_bayar: d.tgl_bayar, cicilan: d.cicilan, angsuran: d.angsuran, bunga: d.bunga, jumlah_bayar: d.jumlah_bayar, tgl_jatuh_tempo: d.tgl_jatuh_tempo?.toISOString() || null, nomor_pinjaman: header.nomor || "-", nik: anggota.nik || "-", nama: anggota.nama || "-" };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Pembayaran GET Error:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const ip = clientIp(request);

    if (body.action === "list_pinjaman") {
      const targetAnggotaId = parseInt(body.anggota_id);
      if (user.role === "anggota" && targetAnggotaId !== user.id)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      const hdrs = await prisma.pinjaman_header.findMany({ where: { anggota_id: targetAnggotaId } });
      const headerIds = hdrs.map((h) => h.id);
      const details = await prisma.pinjaman_detail.findMany({ where: { pinjaman_id: { in: headerIds }, jumlah_bayar: 0 }, orderBy: { cicilan: "asc" } });
      const headerMap = Object.fromEntries(hdrs.map((h) => [h.id, h]));
      const data = details.map((d) => ({ ...d, tgl_jatuh_tempo: d.tgl_jatuh_tempo?.toISOString() || null, nomor_pinjaman: headerMap[d.pinjaman_id]?.nomor || "-" }));
      return NextResponse.json({ data });
    }

    if (user.role !== "admin")
      return NextResponse.json({ error: "Hanya Admin yang dapat melakukan tindakan ini" }, { status: 403 });

    if (body.action === "bayar") {
      const parsed = bayarSchema.safeParse(body);
      if (!parsed.success)
        return NextResponse.json({ error: parsed.error.issues[0]?.message || "Input tidak valid" }, { status: 422 });
      const { detail_id, tgl_bayar, jumlah_bayar } = parsed.data;

      const cicilanBefore = await prisma.pinjaman_detail.findUnique({ where: { id: detail_id } });
      if (!cicilanBefore) return NextResponse.json({ error: "Data cicilan tidak ditemukan" }, { status: 404 });
      if (cicilanBefore.jumlah_bayar > 0) return NextResponse.json({ error: "Cicilan ini sudah pernah dibayar" }, { status: 422 });

      const tagihan = cicilanBefore.angsuran + cicilanBefore.bunga;
      if (jumlah_bayar > tagihan)
        return NextResponse.json({ error: `Jumlah bayar melebihi tagihan (Rp ${tagihan.toLocaleString("id-ID")})` }, { status: 422 });

      const year = new Date().getFullYear();
      const last = await prisma.pinjaman_detail.findFirst({ where: { nomor_bayar: { not: null }, insert_date: { gte: new Date(`${year}-01-01`) } }, orderBy: { nomor_bayar: "desc" } });
      const nomorBayar = last?.nomor_bayar ? `B${year}${String(parseInt(last.nomor_bayar.slice(5)) + 1).padStart(6, "0")}` : `B${year}000001`;

      await prisma.$transaction(async (tx) => {
        const updated = await tx.pinjaman_detail.update({
          where: { id: detail_id },
          data: { nomor_bayar: nomorBayar, tgl_bayar: tgl_bayar || new Date().toISOString().split("T")[0], jumlah_bayar, update_date: new Date() },
        });
        await tx.$executeRaw`
          INSERT INTO audit_log (user_id, username, aksi, tabel, record_id, before_data, after_data, ip_address, keterangan)
          VALUES (${user.id}, ${user.username}, ${AUDIT_AKSI.BAYAR_CICILAN}, 'pinjaman_detail', ${detail_id},
                  ${JSON.stringify(cicilanBefore)}, ${JSON.stringify(updated)}, ${ip}, ${`Bayar cicilan ${nomorBayar}`})
        `;
      });

      return NextResponse.json({ message: "Pembayaran berhasil", nomor_bayar: nomorBayar });
    }

    if (body.action === "hapus") {
      const id = parseInt(body.id);
      const before = await prisma.pinjaman_detail.findUnique({ where: { id } });
      await prisma.pinjaman_detail.update({ where: { id }, data: { nomor_bayar: null, tgl_bayar: null, jumlah_bayar: 0, update_date: new Date() } });
      await writeAuditLog({ userId: user.id, username: user.username, aksi: "HAPUS_PEMBAYARAN", tabel: "pinjaman_detail", recordId: id, beforeData: before, afterData: null, ipAddress: ip });
      return NextResponse.json({ message: "Data pembayaran berhasil dihapus" });
    }

    return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Pembayaran POST Error:", error);
    return NextResponse.json({ error: "Gagal memproses data" }, { status: 500 });
  }
}
