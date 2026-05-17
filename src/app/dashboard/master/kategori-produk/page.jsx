import prisma from "@/lib/prisma";
import { Plus, Search, Tag, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import LimitFilter from "@/components/dashboard/LimitFilter";

export default async function KategoriProdukPage({ searchParams }) {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/login");

  const params = await searchParams;
  const query = params?.q || "";
  const limit = parseInt(params?.limit) || 20;

  const kategori = await prisma.kategori_produk.findMany({
    where: {
      nama_kategori: {
        contains: query,
      },
    },
    take: limit,
    orderBy: { created_at: "desc" },
    include: {
      _count: {
        select: { barang: true }
      }
    }
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-gray-900">Kategori Produk</h1>
          <p className="text-gray-400 text-sm mt-0.5">Kelola kategori barang untuk penjualan</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/master/kategori-produk/tambah"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Kategori
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
                placeholder="Cari kategori..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all w-72"
              />
            </form>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              {kategori.length} Record
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase font-bold tracking-wider border-b border-gray-200">
                <th className="py-3 px-4 text-center w-16">No</th>
                <th className="py-3 px-4">Nama Kategori</th>
                <th className="py-3 px-4 text-center">Jumlah Barang</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {kategori.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="py-3 px-4 text-center text-gray-400 font-medium">{index + 1}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-500" />
                    {item.nama_kategori}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-gray-600">{item._count.barang}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/dashboard/master/kategori-produk/edit/${item.id}`}
                        className="text-orange-600 hover:text-orange-800 bg-orange-50 p-2 rounded-lg border border-orange-100 transition-all active:scale-95"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {kategori.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-gray-400 text-sm">
                    Tidak ada data kategori ditemukan.
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
