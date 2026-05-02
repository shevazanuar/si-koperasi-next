import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // simpanan, penarikan, pinjaman, pembayaran, tunggakan
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const anggotaId = searchParams.get("anggota_id");
  const jenisSimpananId = searchParams.get("jenis_simpanan");
  const perusahaan = searchParams.get("perusahaan");

  try {
    let data = [];

    if (type === "simpanan" || type === "penarikan") {
      const jenis = type === "simpanan" ? "S" : "T";
      let where = `s.jenis = ?`;
      const sqlParams = [jenis];

      if (from && to) {
        where += ` AND s.tgl >= ? AND s.tgl <= ?`;
        sqlParams.push(from, to + " 23:59:59");
      }

      if (anggotaId) {
        where += ` AND s.anggota_id = ?`;
        sqlParams.push(parseInt(anggotaId));
      }

      if (type === "simpanan" && jenisSimpananId) {
        where += ` AND s.jenis_simpanan_id = ?`;
        sqlParams.push(parseInt(jenisSimpananId));
      }

      if (perusahaan) {
        where += ` AND a.perusahaan = ?`;
        sqlParams.push(perusahaan);
      }

      const sql = `
        SELECT 
          s.id, s.nomor, s.tgl, s.jumlah,
          a.nik, a.nama as nama_anggota, a.jk, a.perusahaan,
          js.nama as nama_simpanan
        FROM simpanan s
        JOIN anggota a ON s.anggota_id = a.id
        LEFT JOIN jenis_simpanan js ON s.jenis_simpanan_id = js.id
        WHERE ${where}
        ORDER BY s.nomor ASC
      `;

      const raw = await prisma.$queryRawUnsafe(sql, ...sqlParams);
      data = raw.map(r => ({
        ...r,
        id: typeof r.id === 'bigint' ? Number(r.id) : r.id,
        jumlah: Number(r.jumlah)
      }));

    } else if (type === "pinjaman") {
      let where = `1=1`;
      const sqlParams = [];

      if (from && to) {
        where += ` AND p.tgl >= ? AND p.tgl <= ?`;
        sqlParams.push(from, to + " 23:59:59");
      }

      if (anggotaId) {
        where += ` AND p.anggota_id = ?`;
        sqlParams.push(parseInt(anggotaId));
      }

      if (perusahaan) {
        where += ` AND a.perusahaan = ?`;
        sqlParams.push(perusahaan);
      }

      const sql = `
        SELECT 
          p.id, p.nomor, p.tgl, p.lama, p.satuan, p.bunga, p.jumlah,
          a.nik, a.nama as nama_anggota, a.jk, a.perusahaan,
          jp.nama as nama_pinjaman
        FROM pinjaman_header p
        JOIN anggota a ON p.anggota_id = a.id
        LEFT JOIN jenis_pinjaman jp ON p.jenis_pinjaman_id = jp.id
        WHERE ${where}
        ORDER BY p.nomor DESC
      `;

      const raw = await prisma.$queryRawUnsafe(sql, ...sqlParams);
      data = raw.map(r => ({
        ...r,
        id: typeof r.id === 'bigint' ? Number(r.id) : r.id,
        jumlah: Number(r.jumlah)
      }));

    } else if (type === "pembayaran" || type === "tunggakan") {
      let where = `1=1`;
      const sqlParams = [];

      if (type === "pembayaran") {
        where += ` AND d.jumlah_bayar > 0`;
        if (from && to) {
          where += ` AND d.tgl_bayar >= ? AND d.tgl_bayar <= ?`;
          sqlParams.push(from, to);
        }
      } else {
        // tunggakan
        where += ` AND d.jumlah_bayar = 0`;
        if (from) {
          where += ` AND d.tgl_jatuh_tempo = ?`;
          sqlParams.push(from);
        }
      }

      if (anggotaId) {
        where += ` AND p.anggota_id = ?`;
        sqlParams.push(parseInt(anggotaId));
      }

      if (perusahaan) {
        where += ` AND a.perusahaan = ?`;
        sqlParams.push(perusahaan);
      }

      const sql = `
        SELECT 
          d.id, d.nomor_bayar, d.tgl_bayar, d.tgl_jatuh_tempo, 
          d.cicilan, d.angsuran, d.bunga, d.jumlah_bayar,
          a.nik, a.nama as nama_anggota, a.jk, a.perusahaan,
          jp.nama as nama_pinjaman
        FROM pinjaman_detail d
        JOIN pinjaman_header p ON d.pinjaman_id = p.id
        JOIN anggota a ON p.anggota_id = a.id
        LEFT JOIN jenis_pinjaman jp ON p.jenis_pinjaman_id = jp.id
        WHERE ${where}
        ORDER BY d.nomor_bayar DESC
      `;

      const raw = await prisma.$queryRawUnsafe(sql, ...sqlParams);
      data = raw.map(r => ({
        ...r,
        id: typeof r.id === 'bigint' ? Number(r.id) : r.id,
        angsuran: Number(r.angsuran),
        bunga: Number(r.bunga),
        jumlah_bayar: Number(r.jumlah_bayar)
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
