import prisma from "@/lib/prisma";
import { Plus, Search, Receipt } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import LimitFilter from "@/components/dashboard/LimitFilter";
import { deletePenjualan } from "./actions";
import DeleteButton from "@/components/dashboard/DeleteButton";

export default async function PenjualanPage({ searchParams }) {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/login");

  const params = await searchParams;
  const query = params?.q || "";
  const limit = parseInt(params?.limit) || 20;

  const penjualan = await prisma.penjualan.findMany({
    where: {
      OR: [
        { kode_penjualan: { contains: query } },
        { nama_pembeli: { contains: query } },
        { anggota: { nama: { contains: query } } },
      ]
    },
    take: limit,
    orderBy: { created_at: "desc" },
    include: {
      anggota: { select: { nama: true } },
      detail: true
    }
  });

  const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-gray-900">Penjualan</h1>
          <p className="text-gray-400 text-sm mt-0.5">Kelola transaksi penjualan barang</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/penjualan/tambah"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            Transaksi Baru
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                placeholder="Cari transaksi..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all w-72"
              />
            </form>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              {penjualan.length} Record
            </div>
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
                <th className="py-3 px-4 text-center">Jml Item</th>
                <th className="py-3 px-4 text-right">Total Transaksi</th>
                <th className="py-3 px-4 text-center">Pembayaran</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {penjualan.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="py-3 px-4 text-center text-gray-400 font-medium">{index + 1}</td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                    {new Date(item.tanggal_penjualan).toLocaleDateString("id-ID", {
                      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                    }).replace(/\//g, "-")}
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-600 font-bold text-xs whitespace-nowrap">{item.kode_penjualan}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    {item.anggota_id ? (
                      <span className="text-blue-700">{item.anggota?.nama} (Anggota)</span>
                    ) : (
                      item.nama_pembeli || "Umum"
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600 font-bold">
                    {item.detail.reduce((sum, d) => sum + d.qty, 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 font-black whitespace-nowrap">
                    Rp {fmt(Number(item.total_harga))}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                      {item.metode_pembayaran || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/dashboard/penjualan/detail/${item.id}`}
                        className="text-blue-600 hover:text-blue-800 font-bold text-[10px] uppercase bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 transition-all active:scale-95 flex items-center justify-center h-8"
                      >
                        Detail
                      </Link>
                      <DeleteButton id={item.id} action={deletePenjualan} label="Transaksi" />
                    </div>
                  </td>
                </tr>
              ))}

              {penjualan.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-gray-400 text-sm">
                    Tidak ada data penjualan ditemukan.
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
