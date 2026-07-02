import prisma from "@/lib/prisma";
import { Plus, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function MutasiPage() {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const mutasiRaw = await prisma.$queryRawUnsafe(`
    SELECT m.*, 
           k_dari.nama_kas as dari_kas_nama,
           k_ke.nama_kas as ke_kas_nama,
           b_dari.nama_bank as dari_bank_nama,
           b_ke.nama_bank as ke_bank_nama
    FROM mutasi_kas_bank m
    LEFT JOIN kas k_dari ON m.dari_kas_id = k_dari.id
    LEFT JOIN kas k_ke ON m.ke_kas_id = k_ke.id
    LEFT JOIN akun_bank b_dari ON m.dari_akun_bank_id = b_dari.id
    LEFT JOIN akun_bank b_ke ON m.ke_akun_bank_id = b_ke.id
    ORDER BY m.tanggal DESC, m.id DESC
  `);

  const mutasiList = mutasiRaw.map(m => ({
    ...m,
    id: typeof m.id === 'bigint' ? Number(m.id) : m.id,
    nominal: typeof m.nominal === 'string' ? parseFloat(m.nominal) : m.nominal,
  }));

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(angka || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit", month: "long", year: "numeric"
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ArrowRightLeft className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mutasi Kas & Bank</h1>
            <p className="text-gray-500 mt-1">Data transfer dana antara Kas dan Rekening Bank</p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
           <Link 
            href="/dashboard/mutasi/tambah"
            className="bg-gradient-to-r from-[#cd8957] to-[#a05a26] hover:from-[#b07044] hover:to-[#8c4819] text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md shadow-orange-500/20"
           >
             <Plus className="w-5 h-5" />
             Transfer Dana
           </Link>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
                <th className="py-4 px-6">Tanggal</th>
                <th className="py-4 px-6">Jenis Mutasi</th>
                <th className="py-4 px-6">Dari</th>
                <th className="py-4 px-6">Ke</th>
                <th className="py-4 px-6">Nominal</th>
                <th className="py-4 px-6">Bukti</th>
                <th className="py-4 px-6">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {mutasiList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                    {formatDate(item.tanggal)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight bg-blue-50 text-blue-700 border border-blue-100">
                      {item.jenis_mutasi.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-700">
                    {item.jenis_mutasi === 'Kas_ke_Bank' ? item.dari_kas_nama : item.dari_bank_nama}
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-700">
                    {item.jenis_mutasi === 'Kas_ke_Bank' ? item.ke_bank_nama : item.ke_kas_nama}
                  </td>
                  <td className="py-4 px-6 font-bold text-emerald-600">
                    {formatRupiah(item.nominal)}
                  </td>
                  <td className="py-4 px-6">
                    {item.bukti_transfer ? (
                      <a 
                        href={item.bukti_transfer} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center text-xs px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold rounded-lg transition-colors border border-blue-100"
                      >
                        Lihat Bukti
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-gray-500 text-xs">
                    {item.keterangan || '-'}
                  </td>
                </tr>
              ))}
              
              {mutasiList.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2 mx-auto">
                        <ArrowRightLeft className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">Belum ada data mutasi transfer.</p>
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
