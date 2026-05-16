import prisma from "@/lib/prisma";
import { Search, Printer, FileDown, CalendarDays } from "lucide-react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import LimitFilter from "@/components/dashboard/LimitFilter";

export default async function LaporanPenjualanPage({ searchParams }) {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/login");

  const params = await searchParams;
  
  // Filters
  const startDate = params?.start_date || "";
  const endDate = params?.end_date || "";
  const limit = parseInt(params?.limit) || 50;

  // Build where clause
  const where = {};
  
  if (startDate || endDate) {
    where.tanggal_penjualan = {};
    if (startDate) where.tanggal_penjualan.gte = new Date(`${startDate}T00:00:00.000Z`);
    if (endDate) where.tanggal_penjualan.lte = new Date(`${endDate}T23:59:59.999Z`);
  }

  const penjualan = await prisma.penjualan.findMany({
    where,
    take: limit,
    orderBy: { tanggal_penjualan: "desc" },
    include: {
      anggota: { select: { nama: true } },
      detail: true
    }
  });

  // Calculate totals
  const totalTransaksi = penjualan.length;
  const totalPendapatan = penjualan.reduce((sum, p) => sum + Number(p.total_harga), 0);
  const totalModal = penjualan.reduce((sum, p) => sum + Number(p.total_modal), 0);
  const totalLaba = penjualan.reduce((sum, p) => sum + Number(p.total_laba), 0);
  
  const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-gray-900">Laporan Penjualan</h1>
          <p className="text-gray-400 text-sm mt-0.5">Ringkasan pendapatan dari transaksi penjualan</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95 text-sm">
            <FileDown className="w-4 h-4" />
            Export
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 text-sm">
            <Printer className="w-4 h-4" />
            Cetak Laporan
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Transaksi</p>
          <p className="text-2xl font-black text-gray-800">{fmt(totalTransaksi)} <span className="text-sm font-normal text-gray-500">trx</span></p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Omzet</p>
          <p className="text-2xl font-black text-blue-600">Rp {fmt(totalPendapatan)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Modal</p>
          <p className="text-2xl font-black text-gray-600">Rp {fmt(totalModal)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-2xl border border-green-400 shadow-sm shadow-green-500/20 text-white">
          <p className="text-sm font-bold text-green-100 uppercase tracking-widest mb-1">Total Laba Bersih</p>
          <p className="text-2xl font-black">Rp {fmt(totalLaba)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <LimitFilter />
          </div>
          <div className="flex items-center gap-4">
            <form method="GET" className="flex items-center gap-2">
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="start_date"
                  defaultValue={startDate}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="end_date"
                  defaultValue={endDate}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
                />
              </div>
              <button type="submit" className="bg-gray-800 text-white p-2 rounded-xl hover:bg-gray-900 transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase font-bold tracking-wider border-b border-gray-200">
                <th className="py-3 px-4 text-center w-16">No</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kode Transaksi</th>
                <th className="py-3 px-4">Pembeli</th>
                <th className="py-3 px-4 text-center">Metode</th>
                <th className="py-3 px-4 text-right">Omzet</th>
                <th className="py-3 px-4 text-right text-green-600">Laba</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {penjualan.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-400 font-medium">{index + 1}</td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                    {new Date(item.tanggal_penjualan).toLocaleDateString("id-ID", {
                      day: "2-digit", month: "2-digit", year: "numeric"
                    }).replace(/\//g, "-")}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-500 text-xs whitespace-nowrap">{item.kode_penjualan}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    {item.anggota_id ? item.anggota?.nama : (item.nama_pembeli || "Umum")}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-500">
                    {item.metode_pembayaran || "-"}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                    Rp {fmt(Number(item.total_harga))}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-green-600 whitespace-nowrap">
                    Rp {fmt(Number(item.total_laba))}
                  </td>
                </tr>
              ))}

              {penjualan.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-gray-400 text-sm">
                    Tidak ada data laporan ditemukan untuk periode ini.
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
