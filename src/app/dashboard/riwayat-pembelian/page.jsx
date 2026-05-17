import prisma from "@/lib/prisma";
import { Receipt, Search } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import LimitFilter from "@/components/dashboard/LimitFilter";

export default async function RiwayatPembelianPage({ searchParams }) {
  const user = await getSession();
  if (!user || user.role !== "anggota") redirect("/dashboard");

  const params = await searchParams;
  const query = params?.q || "";
  const limit = parseInt(params?.limit) || 20;

  const pembelian = await prisma.penjualan.findMany({
    where: {
      anggota_id: user.id, // Only show their own transactions
      kode_penjualan: { contains: query }
    },
    take: limit,
    orderBy: { tanggal_penjualan: "desc" },
    include: {
      detail: true
    }
  });

  const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Riwayat Pembelian</h1>
          <p className="text-gray-400 text-sm mt-0.5">Daftar transaksi belanja di koperasi</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <LimitFilter />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <form method="GET" className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Cari kode transaksi..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
              />
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
                <th className="py-3 px-4 text-center">Jml Item</th>
                <th className="py-3 px-4 text-right">Total Tagihan</th>
                <th className="py-3 px-4 text-center">Metode</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pembelian.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="py-4 px-4 text-center text-gray-400 font-medium">{index + 1}</td>
                  <td className="py-4 px-4 text-gray-600 whitespace-nowrap">
                    {new Date(item.tanggal_penjualan).toLocaleDateString("id-ID", {
                      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                    }).replace(/\//g, "-")}
                  </td>
                  <td className="py-4 px-4 font-mono text-blue-600 font-bold text-xs whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-gray-400" />
                      {item.kode_penjualan}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600 font-bold">
                    {item.detail.reduce((sum, d) => sum + d.qty, 0)} <span className="font-normal text-xs text-gray-400">pcs</span>
                  </td>
                  <td className="py-4 px-4 text-right text-gray-900 font-black whitespace-nowrap">
                    Rp {fmt(Number(item.total_harga))}
                  </td>
                  <td className="py-4 px-4 text-center text-xs font-semibold text-gray-600">
                    {item.metode_pembayaran || "Tunai"}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${item.status === 'Selesai' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/dashboard/riwayat-pembelian/${item.id}`}
                        className="text-blue-600 hover:text-blue-800 font-bold text-[10px] uppercase bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-all active:scale-95"
                      >
                        Detail
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {pembelian.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-gray-400 text-sm">
                    Belum ada riwayat pembelian.
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
