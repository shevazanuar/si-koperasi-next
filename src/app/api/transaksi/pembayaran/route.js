import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let pinjamanWhere = {};
    if (user.role === "anggota") {
      pinjamanWhere = { anggota_id: user.id };
    }

    // Get all relevant pinjaman headers first if we are an anggota
    const myPinjaman = await prisma.pinjaman_header.findMany({
      where: pinjamanWhere,
      select: { id: true }
    });
    const myPinjamanIds = myPinjaman.map(p => p.id);

    // Get paid installments (nomor_bayar is not null/empty)
    const whereClause = { nomor_bayar: { not: null } };
    if (user.role === "anggota") {
      whereClause.pinjaman_id = { in: myPinjamanIds };
    }

    const details = await prisma.pinjaman_detail.findMany({
      where: whereClause,
      orderBy: { nomor_bayar: "desc" },
      take: 200,
    });

    // Enrich with header and anggota data
    const pinjamanIds = [...new Set(details.map((d) => d.pinjaman_id))];
    const headers = await prisma.pinjaman_header.findMany({
      where: { id: { in: pinjamanIds } },
    });
    const anggotaIds = [...new Set(headers.map((h) => h.anggota_id))];
    const anggotaList = await prisma.anggota.findMany({
      where: { id: { in: anggotaIds } },
      select: { id: true, nik: true, nama: true },
    });

    const headerMap = Object.fromEntries(headers.map((h) => [h.id, h]));
    const anggotaMap = Object.fromEntries(anggotaList.map((a) => [a.id, a]));

    const data = details.map((d) => {
      const header = headerMap[d.pinjaman_id] || {};
      const anggota = anggotaMap[header.anggota_id] || {};
      return {
        id: d.id,
        nomor_bayar: d.nomor_bayar,
        tgl_bayar: d.tgl_bayar,
        cicilan: d.cicilan,
        angsuran: d.angsuran,
        bunga: d.bunga,
        jumlah_bayar: d.jumlah_bayar,
        tgl_jatuh_tempo: d.tgl_jatuh_tempo?.toISOString() || null,
        nomor_pinjaman: header.nomor || "-",
        nik: anggota.nik || "-",
        nama: anggota.nama || "-",
      };
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

    if (body.action === "list_pinjaman") {
      // Security Check: Member can only list their own pinjaman
      const targetAnggotaId = parseInt(body.anggota_id);
      if (user.role === "anggota" && targetAnggotaId !== user.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const headers = await prisma.pinjaman_header.findMany({
        where: { anggota_id: targetAnggotaId },
      });
      const headerIds = headers.map((h) => h.id);
      const details = await prisma.pinjaman_detail.findMany({
        where: { pinjaman_id: { in: headerIds }, jumlah_bayar: 0 },
        orderBy: { cicilan: "asc" },
      });
      const headerMap = Object.fromEntries(headers.map((h) => [h.id, h]));
      const data = details.map((d) => ({
        ...d,
        tgl_jatuh_tempo: d.tgl_jatuh_tempo?.toISOString() || null,
        nomor_pinjaman: headerMap[d.pinjaman_id]?.nomor || "-",
      }));
      return NextResponse.json({ data });
    }

    // Admin-only actions below
    if (user.role !== "admin") {
        return NextResponse.json({ error: "Hanya Admin yang dapat melakukan tindakan ini" }, { status: 403 });
    }

    if (body.action === "bayar") {
      // Pay a single cicilan
      const { detail_id, tgl_bayar, jumlah_bayar } = body;

      // Generate nomor_bayar
      const year = new Date().getFullYear();
      const last = await prisma.pinjaman_detail.findFirst({
        where: {
          nomor_bayar: { not: null },
          insert_date: { gte: new Date(`${year}-01-01`) },
        },
        orderBy: { nomor_bayar: "desc" },
      });
      let nomorBayar;
      if (last?.nomor_bayar) {
        const lastNum = parseInt(last.nomor_bayar.slice(5)) + 1;
        nomorBayar = `B${year}${String(lastNum).padStart(6, "0")}`;
      } else {
        nomorBayar = `B${year}000001`;
      }

      await prisma.pinjaman_detail.update({
        where: { id: parseInt(detail_id) },
        data: {
          nomor_bayar: nomorBayar,
          tgl_bayar: tgl_bayar || new Date().toISOString().split("T")[0],
          jumlah_bayar: parseInt(jumlah_bayar),
          update_date: new Date(),
        },
      });
      return NextResponse.json({ message: "Pembayaran berhasil", nomor_bayar: nomorBayar });
    }

    if (body.action === "hapus") {
      // Reset payment (set back to 0)
      await prisma.pinjaman_detail.update({
        where: { id: parseInt(body.id) },
        data: {
          nomor_bayar: null,
          tgl_bayar: null,
          jumlah_bayar: 0,
          update_date: new Date(),
        },
      });
      return NextResponse.json({ message: "Data pembayaran berhasil dihapus" });
    }

    return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Pembayaran POST Error:", error);
    return NextResponse.json({ error: "Gagal memproses data" }, { status: 500 });
  }
}
