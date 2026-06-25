import prisma from "@/lib/prisma";
import { Wallet, Plus, Search } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import TypeFilter from "./TypeFilter";
import LimitFilter from "@/components/dashboard/LimitFilter";

export default async function SimpananPage({ searchParams }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const params = await searchParams;
  const query = params?.q || "";
  const typeFilter = params?.type || "";
  const limit = parseInt(params?.limit) || 25;
  const safeLimit = [25, 50, 100].includes(limit) ? limit : 25;

  // Build WHERE clause with raw SQL
  let where = `WHERE 1=1`;
  const sqlParams = [];

  if (user.role === "anggota") {
    where += ` AND s.anggota_id = ?`;
    sqlParams.push(user.id);
  }

  if (query) {
    where += ` AND (s.nomor LIKE ? OR a.nama LIKE ? OR a.nik LIKE ?)`;
    sqlParams.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }

  if (typeFilter) {
    where += ` AND s.jenis_simpanan_id = ?`;
    sqlParams.push(parseInt(typeFilter));
  }

  // Main SQL query
  const sql = `
    SELECT
      s.id,
      s.nomor,
      CAST(s.tgl AS CHAR) AS tgl,
      CAST(s.tgl_akhir AS CHAR) AS tgl_akhir,
      s.jumlah,
      s.jenis AS jenis_transaksi,
      s.entry,
      a.nik,
      a.nama AS nama_anggota,
      js.nama AS jenis_nama
    FROM simpanan s
    JOIN anggota a ON s.anggota_id = a.id
    LEFT JOIN jenis_simpanan js ON s.jenis_simpanan_id = js.id
    ${where}
    ORDER BY s.tgl DESC
    LIMIT ?
  `;

  sqlParams.push(safeLimit);

  const jenisRaw = await prisma.$queryRawUnsafe("SELECT id, nama FROM jenis_simpanan ORDER BY id ASC");

  const raw = await prisma.$queryRawUnsafe(sql, ...sqlParams);

  const data = raw.map((r, index) => ({
    ...r,
    no: index + 1,
    id: typeof r.id === "bigint" ? Number(r.id) : r.id,
    jumlah: Number(r.jumlah),
  }));

  const jenisTypes = jenisRaw.map((j) => ({
    ...j,
    id: typeof j.id === "bigint" ? Number(j.id) : j.id,
  }));

  const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

  // Summary Query
  let summaryJoinCondition = "";
  const summaryParams = [];
  if (user.role === "anggota") {
    summaryJoinCondition = "AND s.anggota_id = ?";
    summaryParams.push(user.id);
  }

  const summarySql = `
    SELECT 
      js.nama AS jenis_nama,
      COALESCE(SUM(CASE WHEN s.jenis = 'S' THEN s.jumlah ELSE 0 END) - 
      SUM(CASE WHEN s.jenis = 'T' THEN s.jumlah ELSE 0 END), 0) AS total_saldo
    FROM jenis_simpanan js
    LEFT JOIN simpanan s ON s.jenis_simpanan_id = js.id ${summaryJoinCondition}
    GROUP BY js.id, js.nama
  `;
  const summaryRaw = await prisma.$queryRawUnsafe(summarySql, ...summaryParams);

  const summaries = summaryRaw.map((s) => ({
    jenis_nama: s.jenis_nama,
    total_saldo: Number(s.total_saldo),
  }));
  const totalAll = summaries.reduce((acc, curr) => acc + curr.total_saldo, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-gray-900">Data Simpanan Anggota</h1>
          <p className="text-gray-400 text-sm mt-0.5">Kelola dan pantau seluruh transaksi simpanan</p>
        </div>
        <div className="flex items-center gap-2"></div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Keseluruhan */}
        <div className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/30 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-amber-100 text-sm font-medium mb-1">Total Keseluruhan</p>
              <h3 className="text-2xl font-black">Rp {fmt(totalAll)}</h3>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Breakdown */}
        {summaries.map((s, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-amber-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">{s.jenis_nama}</p>
              <h3 className="text-xl font-black text-gray-900">Rp {fmt(s.total_saldo)}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <LimitFilter />
          </div>
          <div className="flex items-center gap-3">
            <TypeFilter types={jenisTypes} />
          </div>
          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{data.length} Record</div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase font-bold tracking-wider border-b border-gray-200">
                <th className="py-3 px-4 text-center">No</th>
                <th className="py-3 px-4">Nomor</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">NIK</th>
                <th className="py-3 px-4">Nama</th>
                <th className="py-3 px-4">Jenis Simpanan</th>
                <th className="py-3 px-4 text-center">Tipe</th>
                <th className="py-3 px-4 text-right">Jumlah</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-amber-50/30 transition-colors group">
                  <td className="py-3 px-4 text-center text-gray-400 font-medium">{item.no}</td>
                  <td className="py-3 px-4 font-mono text-amber-600 font-bold text-xs whitespace-nowrap">{item.nomor || "-"}</td>
                  <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">
                    {item.tgl && !item.tgl.startsWith("0000") ? new Date(item.tgl).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-") : "-"}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-500 text-xs whitespace-nowrap">{item.nik}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800 whitespace-nowrap">{item.nama_anggota}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold whitespace-nowrap">{item.jenis_nama || "-"}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.jenis_transaksi === "S" ? (
                      <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-100 text-[10px] font-bold">Setor</span>
                    ) : item.jenis_transaksi === "T" ? (
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold">Tarik</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold whitespace-nowrap ${item.jenis_transaksi === "T" ? "text-red-600" : "text-gray-800"}`}>
                    {item.jenis_transaksi === "T" ? "- " : ""}
                    {fmt(item.jumlah)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link href={`/dashboard/simpanan/${item.id}`} className="text-amber-600 hover:text-amber-800 font-bold text-[10px] uppercase bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100 transition-all active:scale-95">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}

              {data.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-20 text-center text-gray-400 text-sm">
                    Tidak ada data simpanan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
