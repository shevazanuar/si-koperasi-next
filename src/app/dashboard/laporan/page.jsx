import { Wallet, CreditCard, ChevronRight, FilePieChart, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function LaporanLandingPage() {
  const reportCards = [
    {
      title: "Rekapitulasi Simpanan",
      desc: "Ringkasan setoran masuk anggota berdasarkan periode bulanan.",
      href: "/dashboard/laporan/simpanan",
      icon: Wallet,
      color: "blue",
      stats: "Aggregated by Type"
    },
    {
      title: "Rekapitulasi Pinjaman",
      desc: "Analisis penyaluran pinjaman dan outstanding dana bergulir.",
      href: "/dashboard/laporan/pinjaman",
      icon: CreditCard,
      color: "orange",
      stats: "Tenor & Interest"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pusat Laporan</h1>
        <p className="text-gray-500 mt-2">Pilih kategori laporan untuk melihat analisis data keuangan koperasi secara mendalam.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map((card) => (
          <Link key={card.href} href={card.href} className="group">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 relative overflow-hidden h-full flex flex-col">
              <div className={`w-14 h-14 bg-${card.color}-50 text-${card.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <card.icon className="w-7 h-7" />
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1">{card.desc}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <span className={`text-[10px] font-black uppercase tracking-widest text-${card.color}-600/60`}>
                    {card.stats}
                </span>
                <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-${card.color}-600 group-hover:text-white transition-all`}>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Decorative shapes */}
              <div className={`absolute -right-8 -top-8 w-32 h-32 bg-${card.color}-50/50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-3xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                 <FilePieChart className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                 <h3 className="font-bold text-lg">Butuh Custom Laporan?</h3>
                 <p className="text-gray-400 text-sm">Hubungi administrator untuk penyesuaian format laporan khusus.</p>
              </div>
           </div>
           <button className="bg-white text-gray-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-colors active:scale-95">
              Hubungi Support
           </button>
        </div>
        {/* Background mesh */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>
      </div>
    </div>
  );
}
