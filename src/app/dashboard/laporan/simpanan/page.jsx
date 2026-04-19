import prisma from "@/lib/prisma";
import { Wallet, Calendar, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import ExportControls from "../ExportControls";

export default async function LaporanSimpananPage({ searchParams }) {
  const params = await searchParams;
  const year = parseInt(params.year) || new Date().getFullYear();
  const month = parseInt(params.month) || new Date().getMonth() + 1;

  // Fetch all transactions for the selected month/year
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const [transactions, jenisSimpanan] = await Promise.all([
    prisma.simpanan.findMany({
      where: {
        tgl: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
          id: true,
          tgl: true,
          jenis_simpanan_id: true,
          jumlah: true
      }
    }),
    prisma.jenis_simpanan.findMany()
  ]);

  // Join data manually
  const jenisMap = Object.fromEntries(jenisSimpanan.map(j => [j.id, j]));

  // Aggregate stats
  const summary = jenisSimpanan.map(j => {
    const items = transactions.filter(t => t.jenis_simpanan_id === j.id);
    const total = items.reduce((sum, t) => sum + t.jumlah, 0);
    const count = items.length;
    return { ...j, total, count };
  });

  const grandTotal = summary.reduce((sum, s) => sum + s.total, 0);

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Header & Filter */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Laporan Simpanan</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm italic">
                <Calendar className="w-4 h-4 text-blue-500" />
                Periode: {months[month-1]} {year}
            </p>
          </div>
          
          <form className="flex flex-wrap gap-3 p-1 bg-gray-50 rounded-2xl border border-gray-100">
            <select 
              name="month" 
              defaultValue={month}
              className="bg-white border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 px-4 py-2"
            >
              {months.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <select 
              name="year" 
              defaultValue={year}
              className="bg-white border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 px-4 py-2"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              Tampilkan
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aggregated Summary Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Rekapitulasi per Jenis
            </h3>
            <ExportControls 
              data={summary} 
              title="Laporan Rekapitulasi Simpanan" 
              subtitle={`Periode: ${months[month-1]} ${year}`} 
              fileName={`Laporan_Simpanan_${months[month-1]}_${year}`}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
                   <th className="py-4 px-8">Jenis Simpanan</th>
                   <th className="py-4 px-6 text-center">Jml Transaksi</th>
                   <th className="py-4 px-8 text-right">Total Setoran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {summary.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 px-8">
                       <div className="font-bold text-gray-900">{item.nama}</div>
                       <div className="text-[10px] text-gray-400">{item.keterangan || '-'}</div>
                    </td>
                    <td className="py-5 px-6 text-center">
                       <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                         {item.count}
                       </span>
                    </td>
                    <td className="py-5 px-8 text-right font-black text-gray-900">
                       {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.total)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50/20">
                   <td className="py-6 px-8 font-black text-blue-900 uppercase text-xs tracking-widest">Grand Total</td>
                   <td colSpan="2" className="py-6 px-8 text-right font-black text-2xl text-blue-600">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(grandTotal)}
                   </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Status Laporan</p>
                <div className="flex items-center gap-2 mb-4">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-emerald-700 font-bold text-sm">Terverifikasi</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Laporan ini dihasilkan secara otomatis berdasarkan data transaksi yang telah masuk di sistem koperasi.
                </p>
              </div>
           </div>

           <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
              <Wallet className="absolute -right-4 -bottom-4 w-32 h-32 opacity-15 group-hover:scale-110 transition-transform duration-700" />
              <p className="text-blue-100/60 text-[10px] font-bold uppercase tracking-widest mb-4">Bandingkan Data</p>
              <h4 className="text-lg font-bold leading-snug mb-6">Lihat laporan periode sebelumnya untuk analisa pertumbuhan.</h4>
              <button className="bg-white/10 hover:bg-white/20 text-white w-full py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-md border border-white/20 active:scale-95">
                 Laporan Tahunan
                 <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

    </div>
  );
}
