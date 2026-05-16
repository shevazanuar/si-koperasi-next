import prisma from "@/lib/prisma";
import { ArrowLeft, Package, Receipt } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function RiwayatPembelianDetailPage({ params }) {
  const user = await getSession();
  if (!user || user.role !== "anggota") redirect("/dashboard");

  const { id } = await params;

  // Ensure member can only view their own transaction
  const pembelian = await prisma.penjualan.findFirst({
    where: { 
      id: Number(id),
      anggota_id: user.id 
    },
    include: {
      detail: {
        include: {
          barang: true
        }
      }
    }
  });

  if (!pembelian) redirect("/dashboard/riwayat-pembelian");

  const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20 max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-gray-900">Detail Pembelian</h1>
          <p className="text-gray-400 text-sm mt-0.5">Informasi rincian transaksi Anda</p>
        </div>
        <div>
          <Link
            href="/dashboard/riwayat-pembelian"
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Info Transaksi */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Informasi Transaksi</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Kode Transaksi</p>
              <p className="font-mono font-bold text-blue-600 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-gray-400" />
                {pembelian.kode_penjualan}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Tanggal & Waktu</p>
              <p className="font-semibold text-gray-800">
                {new Date(pembelian.tanggal_penjualan).toLocaleString("id-ID", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Metode Pembayaran</p>
              <p className="font-semibold text-gray-800 bg-purple-50 text-purple-700 px-3 py-1 rounded-lg inline-block text-sm">
                {pembelian.metode_pembayaran || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <span className={`px-3 py-1 rounded-lg text-sm font-bold inline-block border ${pembelian.status === 'Selesai' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                {pembelian.status}
              </span>
            </div>
          </div>
        </div>

        {/* Ringkasan Biaya */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1 md:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Ringkasan Belanja</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Total Item Dibeli</p>
                <p className="text-3xl font-black text-gray-800">
                  {pembelian.detail.reduce((sum, d) => sum + d.qty, 0)} <span className="text-sm font-normal text-gray-500">pcs</span>
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col justify-center">
                <p className="text-sm text-blue-600 font-semibold mb-1">Total Tagihan</p>
                <p className="text-3xl font-black text-blue-700">Rp {fmt(Number(pembelian.total_harga))}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
            <p className="text-sm text-yellow-800">
              <span className="font-bold">Info:</span> Jika ada kendala dengan pembelian Anda, silakan tunjukkan <strong>Kode Transaksi</strong> ini kepada pengurus Koperasi.
            </p>
          </div>
        </div>
      </div>

      {/* Rincian Item */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Daftar Barang Belanja</h2>
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
              {pembelian.detail.map((item, index) => (
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
