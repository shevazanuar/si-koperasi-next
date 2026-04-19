import prisma from "@/lib/prisma";
import { CreditCard, Calendar, FileText, ChevronRight, TrendingUp } from "lucide-react";
import ExportControls from "../ExportControls";

export default async function LaporanPinjamanPage({ searchParams }) {
  const params = await searchParams;
  const year = parseInt(params.year) || new Date().getFullYear();
  const month = parseInt(params.month) || new Date().getMonth() + 1;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const [transactions, jenisPinjaman] = await Promise.all([
    prisma.pinjaman_header.findMany({
      where: {
        tgl: {
          gte: startDate,
          lte: endDate
        }
      }
    }),
    prisma.jenis_pinjaman.findMany({
        select: { id: true, nama: true }
    })
  ]);

  const SummaryMap = {};
  jenisPinjaman.forEach(j => {
      SummaryMap[j.id] = { ...j, total: 0, count: 0 };
  });

  transactions.forEach(t => {
      if (SummaryMap[t.jenis_pinjaman_id]) {
          SummaryMap[t.jenis_pinjaman_id].total += t.jumlah;
          SummaryMap[t.jenis_pinjaman_id].count += 1;
      } else {
          // Fallback for unknown type ids
          SummaryMap['unknown'] = SummaryMap['unknown'] || { id: 'unknown', nama: 'Lainnya', total: 0, count: 0 };
          SummaryMap['unknown'].total += t.jumlah;
          SummaryMap['unknown'].count += 1;
      }
  });

  const summary = Object.values(SummaryMap).filter(s => s.count > 0);
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
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Laporan Pinjaman</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm italic">
                <Calendar className="w-4 h-4 text-orange-500" />
                Periode: {months[month-1]} {year}
            </p>
          </div>
          
          <form className="flex flex-wrap gap-3 p-1 bg-gray-50 rounded-2xl border border-gray-100">
            <select 
              name="month" 
              defaultValue={month}
              className="bg-white border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 px-4 py-2"
            >
              {months.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <select 
              name="year" 
              defaultValue={year}
              className="bg-white border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 px-4 py-2"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/20">
              Tampilkan
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table summary */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Recap Pinjaman Keluar
            </h3>
            <ExportControls 
              data={summary} 
              title="Laporan Rekapitulasi Pinjaman" 
              subtitle={`Periode: ${months[month-1]} ${year}`} 
              fileName={`Laporan_Pinjaman_${months[month-1]}_${year}`}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
                   <th className="py-4 px-8">Skema Pinjaman</th>
                   <th className="py-4 px-6 text-center">Jml Pengajuan</th>
                   <th className="py-4 px-8 text-right">Total Pinjaman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {summary.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 px-8 font-bold text-gray-900">{item.nama}</td>
                    <td className="py-5 px-6 text-center">
                       <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-100">
                         {item.count}
                       </span>
                    </td>
                    <td className="py-5 px-8 text-right font-black text-gray-900">
                       {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.total)}
                    </td>
                  </tr>
                ))}
                {summary.length === 0 && (
                   <tr>
                      <td colSpan="3" className="py-12 text-center text-gray-400 font-medium italic">
                         Tidak ada transaksi pinjaman pada periode ini.
                      </td>
                   </tr>
                )}
                <tr className="bg-orange-50/20">
                   <td className="py-6 px-8 font-black text-orange-900 uppercase text-xs tracking-widest">Total Penyaluran</td>
                   <td colSpan="2" className="py-6 px-8 text-right font-black text-2xl text-orange-600">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(grandTotal)}
                   </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                 </div>
                 <div className="font-bold text-gray-800 tracking-tight">Highlight Bulan Ini</div>
              </div>
              <div className="space-y-5">
                 <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-widest">Loan Activity</div>
                    <div className="text-xl font-black text-gray-900">{grandTotal > 0 ? 'High' : 'None'}</div>
                 </div>
                 <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="text-[10px] text-emerald-600 font-black uppercase mb-1 tracking-widest">Growth vs Prev Month</div>
                    <div className="text-xl font-black text-emerald-700">+0.0%</div>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm group cursor-pointer hover:shadow-lg transition-all">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">Butuh Rekap Detail?</p>
              <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-2">Lihat Laporan per Anggota</h4>
              <p className="text-xs text-gray-500 font-medium">Breakdown pinjaman berdasarkan masing-masing anggota koperasi.</p>
           </div>
        </div>
      </div>

    </div>
  );
}
