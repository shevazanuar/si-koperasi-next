import prisma from "@/lib/prisma";
import { Package, Search } from "lucide-react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import KatalogClient from "@/components/dashboard/KatalogClient";

export default async function KatalogProdukPage({ searchParams }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const params = await searchParams;
  const query = params?.q || "";
  const kategori_id = params?.kategori || "";

  // Build where clause
  const where = {
    status: "Aktif",
    OR: [
      { nama_barang: { contains: query } },
      { kode_barang: { contains: query } }
    ]
  };

  if (kategori_id) {
    where.kategori_id = Number(kategori_id);
  }

  // Fetch data
  const [produk, kategori] = await Promise.all([
    prisma.master_barang.findMany({
      where,
      orderBy: { nama_barang: "asc" },
      include: {
        kategori: true
      }
    }),
    prisma.kategori_produk.findMany({
      orderBy: { nama_kategori: "asc" }
    })
  ]);

  const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Katalog Produk</h1>
          <p className="text-gray-400 text-sm mt-0.5">Lihat barang yang tersedia di koperasi</p>
        </div>
        
        <form method="GET" className="flex items-center gap-2 w-full md:w-auto">
          <select
            name="kategori"
            defaultValue={kategori_id}
            className="p-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50 max-w-[150px]"
          >
            <option value="">Semua Kategori</option>
            {kategori.map(k => (
              <option key={k.id} value={k.id}>{k.nama_kategori}</option>
            ))}
          </select>
          
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Cari produk..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50"
            />
          </div>
          
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      {produk.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <Package className="w-12 h-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-800">Tidak ada produk ditemukan</h3>
          <p className="text-gray-500 text-sm mt-1">Coba gunakan kata kunci atau kategori yang berbeda.</p>
        </div>
      ) : (
        <KatalogClient produk={produk} />
      )}
    </div>
  );
}
