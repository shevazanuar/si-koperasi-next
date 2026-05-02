import { Wallet, CreditCard, ChevronRight, ArrowDownCircle, Receipt, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function LaporanLandingPage() {
  const reportCards = [
    {
      title: "Laporan Simpanan",
      desc: "Data simpanan masuk anggota berdasarkan periode dan jenis simpanan.",
      href: "/dashboard/laporan/simpanan",
      icon: Wallet,
      color: "blue",
    },
    {
      title: "Laporan Penarikan",
      desc: "Data penarikan simpanan anggota berdasarkan periode dan perusahaan.",
      href: "/dashboard/laporan/penarikan",
      icon: ArrowDownCircle,
      color: "emerald",
    },
    {
      title: "Laporan Pinjaman",
      desc: "Data pinjaman yang dikeluarkan beserta informasi bunga dan tenor.",
      href: "/dashboard/laporan/pinjaman",
      icon: CreditCard,
      color: "orange",
    },
    {
      title: "Laporan Pembayaran",
      desc: "Data pembayaran angsuran pinjaman anggota koperasi.",
      href: "/dashboard/laporan/pembayaran",
      icon: Receipt,
      color: "purple",
    },
    {
      title: "Laporan Tunggakan",
      desc: "Data tunggakan pinjaman yang belum dibayar berdasarkan jatuh tempo.",
      href: "/dashboard/laporan/tunggakan",
      icon: AlertTriangle,
      color: "red",
    },
  ];

  // Map dynamic classes
  const colorStyles = {
    blue: {
      iconBg: "bg-blue-50",
      iconText: "text-blue-600",
      statText: "text-blue-600/60",
      hoverBg: "group-hover:bg-blue-600",
      decorBg: "bg-blue-50/50",
    },
    emerald: {
      iconBg: "bg-emerald-50",
      iconText: "text-emerald-600",
      statText: "text-emerald-600/60",
      hoverBg: "group-hover:bg-emerald-600",
      decorBg: "bg-emerald-50/50",
    },
    orange: {
      iconBg: "bg-orange-50",
      iconText: "text-orange-600",
      statText: "text-orange-600/60",
      hoverBg: "group-hover:bg-orange-600",
      decorBg: "bg-orange-50/50",
    },
    purple: {
      iconBg: "bg-purple-50",
      iconText: "text-purple-600",
      statText: "text-purple-600/60",
      hoverBg: "group-hover:bg-purple-600",
      decorBg: "bg-purple-50/50",
    },
    red: {
      iconBg: "bg-red-50",
      iconText: "text-red-600",
      statText: "text-red-600/60",
      hoverBg: "group-hover:bg-red-600",
      decorBg: "bg-red-50/50",
    },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pusat Laporan</h1>
        <p className="text-gray-500 mt-2">Pilih kategori laporan untuk melihat data keuangan koperasi secara detail.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((card) => {
          const styles = colorStyles[card.color];
          return (
            <Link key={card.href} href={card.href} className="group">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 relative overflow-hidden h-full flex flex-col">
                <div className={`w-14 h-14 ${styles.iconBg} ${styles.iconText} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <card.icon className="w-7 h-7" />
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1">{card.desc}</p>
                
                <div className="flex items-center justify-end pt-6 border-t border-gray-50">
                  <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center ${styles.hoverBg} group-hover:text-white transition-all`}>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div className={`absolute -right-8 -top-8 w-32 h-32 ${styles.decorBg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
