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
  const limit = parseInt(params?.limit) || 20;
  const safeLimit = [20, 40, 80, 120].includes(limit) ? limit : 20;

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
      s.tgl,
      s.tgl_akhir,
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

  const jenisRaw = await prisma.$queryRawUnsafe(
    "SELECT id, nama FROM jenis_simpanan ORDER BY id ASC"
  );

  const raw = await prisma.$queryRawUnsafe(sql, ...sqlParams);

  const data = raw.map((r, index) => ({
    ...r,
    no: index + 1,
    id: typeof r.id === "bigint" ? Number(r.id) : r.id,
    jumlah: Number(r.jumlah),
  }));

  const jenisTypes = jenisRaw.map(j => ({
    ...j,
    id: typeof j.id === "bigint" ? Number(j.id) : j.id,
  }));

  const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-gray-900">Data Simpanan Anggota</h1>
          <p className="text-gray-400 text-sm mt-0.5">Kelola dan pantau seluruh transaksi simpanan</p>
        </div>
        <div className="flex items-center gap-2">

          <Link
            href="/dashboard/simpanan/tambah"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <LimitFilter />
          </div>
          <div className="flex items-center gap-3">
            <form method="GET" className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Cari nomor / nama / NIK..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all w-72"
              />
              {typeFilter && <input type="hidden" name="type" value={typeFilter} />}
            </form>

            <TypeFilter types={jenisTypes} />
          </div>
          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            {data.length} Record
          </div>
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
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="py-3 px-4 text-center text-gray-400 font-medium">{item.no}</td>
                  <td className="py-3 px-4 font-mono text-blue-600 font-bold text-xs whitespace-nowrap">{item.nomor || "-"}</td>
                  <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">
                    {new Date(item.tgl).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-")}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-500 text-xs whitespace-nowrap">{item.nik}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800 whitespace-nowrap">{item.nama_anggota}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold whitespace-nowrap">
                      {item.jenis_nama || "-"}
                    </span>
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
                    {item.jenis_transaksi === "T" ? "- " : ""}{fmt(item.jumlah)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/dashboard/simpanan/${item.id}`}
                      className="text-blue-600 hover:text-blue-800 font-bold text-[10px] uppercase bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 transition-all active:scale-95"
                    >
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
