import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/** Convert raw rows: BigInt → Number untuk serialisasi JSON */
function normalizeRows(rows) {
  return rows.map((r) => {
    const out = {};
    for (const [k, v] of Object.entries(r)) {
      out[k] = typeof v === "bigint" ? Number(v) : v;
    }
    return out;
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const anggotaIdRaw = searchParams.get("anggota_id");
  const jenisSimpananIdRaw = searchParams.get("jenis_simpanan");
  const perusahaan = searchParams.get("perusahaan") ?? null;

  // Parse numeric params safely — null jika tidak ada
  const anggotaId = anggotaIdRaw ? parseInt(anggotaIdRaw) : null;
  const jenisSimpananId = jenisSimpananIdRaw ? parseInt(jenisSimpananIdRaw) : null;

  try {
    let data = [];

    // ── SIMPANAN / PENARIKAN ────────────────────────────────────────────────
    if (type === "simpanan" || type === "penarikan") {
      const jenis = type === "simpanan" ? "S" : "T";
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to + " 23:59:59") : null;

      const raw = await prisma.$queryRaw`
        SELECT
          s.id, s.nomor, s.tgl, s.jumlah,
          a.nik, a.nama AS nama_anggota, a.jk, a.perusahaan,
          js.nama AS nama_simpanan
        FROM simpanan s
        JOIN anggota a ON s.anggota_id = a.id
        LEFT JOIN jenis_simpanan js ON s.jenis_simpanan_id = js.id
        WHERE s.jenis = ${jenis}
          AND (${fromDate}       IS NULL OR s.tgl              >= ${fromDate})
          AND (${toDate}         IS NULL OR s.tgl              <= ${toDate})
          AND (${anggotaId}      IS NULL OR s.anggota_id       = ${anggotaId})
          AND (${jenisSimpananId} IS NULL OR s.jenis_simpanan_id = ${jenisSimpananId})
          AND (${perusahaan}     IS NULL OR a.perusahaan       = ${perusahaan})
        ORDER BY s.nomor ASC
      `;
      data = normalizeRows(raw).map((r) => ({ ...r, jumlah: Number(r.jumlah) }));

    // ── PINJAMAN ────────────────────────────────────────────────────────────
    } else if (type === "pinjaman") {
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to + " 23:59:59") : null;

      const raw = await prisma.$queryRaw`
        SELECT
          p.id, p.nomor, p.tgl, p.lama, p.satuan, p.bunga, p.jumlah,
          a.nik, a.nama AS nama_anggota, a.jk, a.perusahaan,
          jp.nama AS nama_pinjaman
        FROM pinjaman_header p
        JOIN anggota a ON p.anggota_id = a.id
        LEFT JOIN jenis_pinjaman jp ON p.jenis_pinjaman_id = jp.id
        WHERE (${fromDate}   IS NULL OR p.tgl        >= ${fromDate})
          AND (${toDate}     IS NULL OR p.tgl        <= ${toDate})
          AND (${anggotaId}  IS NULL OR p.anggota_id  = ${anggotaId})
          AND (${perusahaan} IS NULL OR a.perusahaan  = ${perusahaan})
        ORDER BY p.nomor DESC
      `;
      data = normalizeRows(raw).map((r) => ({ ...r, jumlah: Number(r.jumlah) }));

    // ── PEMBAYARAN ──────────────────────────────────────────────────────────
    } else if (type === "pembayaran") {
      const fromDate = from ?? null;
      const toDate = to ?? null;

      const raw = await prisma.$queryRaw`
        SELECT
          d.id, d.nomor_bayar, d.tgl_bayar, d.tgl_jatuh_tempo,
          d.cicilan, d.angsuran, d.bunga, d.jumlah_bayar,
          a.nik, a.nama AS nama_anggota, a.jk, a.perusahaan,
          jp.nama AS nama_pinjaman
        FROM pinjaman_detail d
        JOIN pinjaman_header p ON d.pinjaman_id = p.id
        JOIN anggota a ON p.anggota_id = a.id
        LEFT JOIN jenis_pinjaman jp ON p.jenis_pinjaman_id = jp.id
        WHERE d.jumlah_bayar > 0
          AND (${fromDate}   IS NULL OR d.tgl_bayar  >= ${fromDate})
          AND (${toDate}     IS NULL OR d.tgl_bayar  <= ${toDate})
          AND (${anggotaId}  IS NULL OR p.anggota_id  = ${anggotaId})
          AND (${perusahaan} IS NULL OR a.perusahaan  = ${perusahaan})
        ORDER BY d.nomor_bayar DESC
      `;
      data = normalizeRows(raw).map((r) => ({
        ...r,
        angsuran: Number(r.angsuran),
        bunga: Number(r.bunga),
        jumlah_bayar: Number(r.jumlah_bayar),
      }));

    // ── TUNGGAKAN ───────────────────────────────────────────────────────────
    } else if (type === "tunggakan") {
      const tanggalJT = from ?? null;

      const raw = await prisma.$queryRaw`
        SELECT
          d.id, d.nomor_bayar, d.tgl_bayar, d.tgl_jatuh_tempo,
          d.cicilan, d.angsuran, d.bunga, d.jumlah_bayar,
          a.nik, a.nama AS nama_anggota, a.jk, a.perusahaan,
          jp.nama AS nama_pinjaman
        FROM pinjaman_detail d
        JOIN pinjaman_header p ON d.pinjaman_id = p.id
        JOIN anggota a ON p.anggota_id = a.id
        LEFT JOIN jenis_pinjaman jp ON p.jenis_pinjaman_id = jp.id
        WHERE d.jumlah_bayar = 0
          AND (${tanggalJT}  IS NULL OR d.tgl_jatuh_tempo = ${tanggalJT})
          AND (${anggotaId}  IS NULL OR p.anggota_id       = ${anggotaId})
          AND (${perusahaan} IS NULL OR a.perusahaan       = ${perusahaan})
        ORDER BY d.nomor_bayar DESC
      `;
      data = normalizeRows(raw).map((r) => ({
        ...r,
        angsuran: Number(r.angsuran),
        bunga: Number(r.bunga),
        jumlah_bayar: Number(r.jumlah_bayar),
      }));
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Laporan API Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data laporan" },
      { status: 500 }
    );
  }
}
