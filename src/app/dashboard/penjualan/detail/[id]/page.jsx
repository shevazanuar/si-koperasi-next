import prisma from "@/lib/prisma";
import { ArrowLeft, Printer, Package } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function PenjualanDetailPage({ params }) {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/login");

  const { id } = await params;

  const penjualan = await prisma.penjualan.findUnique({
    where: { id: Number(id) },
    include: {
      anggota: true,
      detail: {
        include: {
          barang: true
        }
      }
    }
  });

  if (!penjualan) redirect("/dashboard/penjualan");

  const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20 max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-gray-900">Detail Penjualan</h1>
          <p className="text-gray-400 text-sm mt-0.5">Informasi lengkap transaksi {penjualan.kode_penjualan}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/penjualan"
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95 text-sm"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Info Transaksi */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Informasi Transaksi</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Kode Penjualan</p>
              <p className="font-mono font-bold text-blue-600">{penjualan.kode_penjualan}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Tanggal</p>
              <p className="font-semibold text-gray-800">
                {new Date(penjualan.tanggal_penjualan).toLocaleString("id-ID", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Pembeli</p>
              <p className="font-semibold text-gray-800">
                {penjualan.anggota_id ? (
                  <span>{penjualan.anggota?.nama} <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full ml-1">Anggota</span></span>
                ) : (
                  penjualan.nama_pembeli || "Umum"
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Metode Pembayaran</p>
              <p className="font-semibold text-gray-800 bg-purple-50 text-purple-700 px-3 py-1 rounded-lg inline-block text-sm">
                {penjualan.metode_pembayaran || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Ringkasan Biaya */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1 md:col-span-2">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Ringkasan Biaya</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Total Item</p>
              <p className="text-2xl font-black text-gray-800">
                {penjualan.detail.reduce((sum, d) => sum + d.qty, 0)} <span className="text-sm font-normal text-gray-500">pcs</span>
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Total Modal</p>
              <p className="text-xl font-bold text-gray-600">Rp {fmt(Number(penjualan.total_modal))}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <p className="text-xs text-green-600 mb-1 font-semibold">Total Laba</p>
              <p className="text-xl font-black text-green-700">Rp {fmt(Number(penjualan.total_laba))}</p>
            </div>
          </div>

          <div className="mt-4 bg-blue-50 p-5 rounded-xl border border-blue-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-semibold">Total Tagihan Pembeli</p>
            </div>
            <p className="text-3xl font-black text-blue-700">Rp {fmt(Number(penjualan.total_harga))}</p>
          </div>
        </div>
      </div>

      {/* Rincian Item */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Rincian Barang</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase font-bold tracking-wider border-b border-gray-200">
                <th className="py-3 px-4 text-center w-16">No</th>
                <th className="py-3 px-4">Nama Barang</th>
                <th className="py-3 px-4 text-center">Harga Satuan</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {penjualan.detail.map((item, index) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-4 px-4 text-center text-gray-400 font-medium">{index + 1}</td>
                  <td className="py-4 px-4 font-semibold text-gray-800">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      {item.barang?.nama_barang}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">Rp {fmt(Number(item.harga_jual))}</td>
                  <td className="py-4 px-4 text-center font-bold">{item.qty}</td>
                  <td className="py-4 px-4 text-right text-gray-900 font-black">
                    Rp {fmt(Number(item.subtotal_harga))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
