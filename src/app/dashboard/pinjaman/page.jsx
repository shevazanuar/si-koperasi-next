import prisma from "@/lib/prisma";
import { CreditCard, Plus, Search } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import LimitFilter from "@/components/dashboard/LimitFilter";

export default async function PinjamanPage({ searchParams }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const params = await searchParams;
  const query = params?.q || "";
  const limit = parseInt(params?.limit) || 20;
  const safeLimit = [20, 40, 80, 120].includes(limit) ? limit : 20;

  // Build WHERE clause
  let where = `WHERE 1=1`;
  const sqlParams = [];

  if (user.role === "anggota") {
    where += ` AND ph.anggota_id = ?`;
    sqlParams.push(user.id);
  }

  if (query) {
    where += ` AND (ph.nomor LIKE ? OR a.nama LIKE ? OR a.nik LIKE ?)`;
    sqlParams.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }

  // Main query: JOIN pinjaman_header, anggota, jenis_pinjaman, kategori_pinjaman
  // Calculate jumlah_bayar (total paid), jumlah_cicilan (count paid), sisa (remaining)
  const sql = `
    SELECT
      ph.id,
      ph.nomor,
      ph.tgl,
      ph.lama,
      ph.satuan,
      ph.bunga,
      ph.jumlah,
      a.nik,
      a.nama AS nama_anggota,
      kp.kategpinj_kode AS kategori,
      COALESCE(SUM(pd.jumlah_bayar), 0) AS jumlah_bayar,
      COALESCE(COUNT(CASE WHEN pd.jumlah_bayar > 0 THEN 1 END), 0) AS jumlah_cicilan,
      (ph.jumlah - COALESCE(SUM(pd.jumlah_bayar), 0)) AS sisa
    FROM pinjaman_header ph
    JOIN anggota a ON ph.anggota_id = a.id
    LEFT JOIN kategori_pinjaman kp ON ph.kategpinj_id = kp.kategpinj_id
    LEFT JOIN pinjaman_detail pd ON ph.id = pd.pinjaman_id
    ${where}
    GROUP BY ph.id, ph.nomor, ph.tgl, ph.lama, ph.satuan, ph.bunga, ph.jumlah,
             a.nik, a.nama, kp.kategpinj_kode
    ORDER BY ph.tgl DESC
    LIMIT ?
  `;

  sqlParams.push(safeLimit);

  const raw = await prisma.$queryRawUnsafe(sql, ...sqlParams);

  const data = raw.map((r, index) => ({
    ...r,
    no: index + 1,
    id: typeof r.id === "bigint" ? Number(r.id) : r.id,
    jumlah: typeof r.jumlah === "bigint" ? Number(r.jumlah) : Number(r.jumlah),
    jumlah_bayar: typeof r.jumlah_bayar === "bigint" ? Number(r.jumlah_bayar) : Number(r.jumlah_bayar),
    jumlah_cicilan: typeof r.jumlah_cicilan === "bigint" ? Number(r.jumlah_cicilan) : Number(r.jumlah_cicilan),
    sisa: typeof r.sisa === "bigint" ? Number(r.sisa) : Number(r.sisa),
  }));

  const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-gray-900">Data Pinjaman Anggota</h1>
          <p className="text-gray-400 text-sm mt-0.5">Kelola permohonan dan pemantauan pinjaman</p>
        </div>
        <div className="flex items-center gap-2">

          <Link
            href="/dashboard/pinjaman/tambah"
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
          <div className="flex items-center gap-4">
            <form method="GET" className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Cari nomor / nama / NIK..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all w-72"
              />
            </form>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              {data.length} Record
            </div>
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
                <th className="py-3 px-4 text-center">Kategori</th>
                <th className="py-3 px-4 text-right">Sisa</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="py-3 px-4 text-center text-gray-400 font-medium">{item.no}</td>
                  <td className="py-3 px-4 font-mono text-blue-600 font-bold text-xs whitespace-nowrap">{item.nomor}</td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap text-xs">
                    {new Date(item.tgl).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-")}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-500 text-xs whitespace-nowrap">{item.nik}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800 whitespace-nowrap">{item.nama_anggota}</td>
                  <td className="py-3 px-4 text-center">
                    {item.kategori ? (
                      <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-100 text-[10px] font-bold">
                        {item.kategori}
                      </span>
                    ) : <span className="text-gray-300">-</span>}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold whitespace-nowrap ${item.sisa > 0 ? "text-red-600" : "text-green-600"}`}>
                    {fmt(item.sisa)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/dashboard/pinjaman/${item.id}`}
                        className="text-blue-600 hover:text-blue-800 font-bold text-[10px] uppercase bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 transition-all active:scale-95"
                      >
                        Detail
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {data.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-gray-400 text-sm">
                    Tidak ada data pinjaman ditemukan.
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
