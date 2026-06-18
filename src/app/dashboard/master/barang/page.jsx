import prisma from "@/lib/prisma";
import { Plus, Search, Package, Pencil } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import LimitFilter from "@/components/dashboard/LimitFilter";
import { deleteBarang } from "./actions";
import DeleteButton from "@/components/dashboard/DeleteButton";

export default async function MasterBarangPage({ searchParams }) {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/login");

  const params = await searchParams;
  const query = params?.q || "";
  const limit = parseInt(params?.limit) || 25;

  const barang = await prisma.master_barang.findMany({
    where: {
      OR: [
        { kode_barang: { contains: query } },
        { nama_barang: { contains: query } },
      ]
    },
    take: limit,
    orderBy: { created_at: "desc" },
    include: {
      kategori: true,
      _count: {
        select: { detail: true }
      }
    }
  });

  const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

  return (
    <div className="space-y-6 animate-page-enter pb-20">
      {/* Page Header */}
      <div className="card-base page-header-accent p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Master Barang</h1>
            <p className="text-sm text-gray-500">Kelola data barang dan stok</p>
          </div>
        </div>
        <Link href="/dashboard/master/barang/tambah" className="btn-primary">
          <Plus className="w-4 h-4" />
          Tambah Barang
        </Link>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/80">
          <div className="flex items-center gap-4">
            <LimitFilter />
          </div>
          <div className="flex items-center gap-4">
            <form method="GET" className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Cari kode/nama..."
                className="search-input"
              />
            </form>
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider whitespace-nowrap">
              {barang.length} Record
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th className="text-center w-16">No</th>
                <th>Kode</th>
                <th>Nama Barang</th>
                <th>Kategori</th>
                <th className="text-right">Stok</th>
                <th className="text-right">Harga Modal</th>
                <th className="text-right">Harga Jual</th>
                <th className="text-center">Status</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {barang.map((item, index) => (
                <tr key={item.id} className="group">
                  <td className="text-center text-gray-400 font-medium">{index + 1}</td>
                  <td className="font-mono text-xs font-semibold text-blue-600 whitespace-nowrap">{item.kode_barang}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Package className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <span className="font-semibold text-gray-800">{item.nama_barang}</span>
                    </div>
                  </td>
                  <td className="text-gray-600">{item.kategori?.nama_kategori || "-"}</td>
                  <td className="text-right">
                    <span className={`badge ${item.stok <= 5 ? "badge-danger" : "badge-success"}`}>
                      {item.stok} {item.satuan}
                    </span>
                  </td>
                  <td className="text-right text-gray-500 font-mono text-xs">{fmt(Number(item.harga_modal))}</td>
                  <td className="text-right text-gray-900 font-semibold font-mono text-xs">{fmt(Number(item.harga_jual))}</td>
                  <td className="text-center">
                    <span className={`badge ${item.status === "Aktif" ? "badge-success" : "badge-danger"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/dashboard/master/barang/edit/${item.id}`}
                        className="btn-icon btn-icon-edit"
                        title="Edit barang"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteButton 
                        id={item.id} 
                        action={deleteBarang} 
                        label="Barang"
                        disabled={item._count.detail > 0}
                        disabledMessage="Tidak dapat menghapus barang ini karena sudah digunakan dalam transaksi penjualan."
                      />
                    </div>
                  </td>
                </tr>
              ))}

              {barang.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Tidak ada data barang ditemukan.</p>
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
