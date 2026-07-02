import prisma from "@/lib/prisma";
import { Plus, Wallet } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function KasPage() {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const kasRaw = await prisma.$queryRawUnsafe(`
    SELECT * FROM kas ORDER BY id DESC
  `);

  const kasList = kasRaw.map(k => ({
    ...k,
    id: typeof k.id === 'bigint' ? Number(k.id) : k.id,
    saldo: typeof k.saldo === 'string' ? parseFloat(k.saldo) : k.saldo,
  }));

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(angka || 0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Kas</h1>
            <p className="text-gray-500 mt-1">Kelola data kas utama dan kecil koperasi</p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
           <Link 
            href="/dashboard/kas/tambah"
            className="bg-gradient-to-r from-[#cd8957] to-[#a05a26] hover:from-[#b07044] hover:to-[#8c4819] text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md shadow-orange-500/20"
           >
             <Plus className="w-5 h-5" />
             Tambah Kas
           </Link>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
                <th className="py-4 px-6">Nomor</th>
                <th className="py-4 px-6">Nama Kas</th>
                <th className="py-4 px-6">Saldo</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {kasList.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="py-4 px-6 font-mono text-xs text-gray-500">{index + 1}</td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{item.nama_kas}</div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-emerald-600">
                    {formatRupiah(item.saldo)}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`badge ${
                      item.status === 'Aktif' || !item.status
                        ? 'badge-success' 
                        : 'badge-danger'
                    }`}>
                      {item.status || "Aktif"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <Link 
                      href={`/dashboard/kas/${item.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 font-bold text-[10px] uppercase bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-all active:scale-95"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              
              {kasList.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-20 text-center flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <Wallet className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">Tidak ada data kas ditemukan.</p>
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
