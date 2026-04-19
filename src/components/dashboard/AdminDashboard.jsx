import { Users, CreditCard, Wallet, TrendingUp, ArrowUpRight } from "lucide-react";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

export default function AdminDashboard({ stats, chartData }) {
  const cards = [
    { 
      title: "Total Anggota Aktif", 
      value: stats.totalAnggota.toString(), 
      icon: Users, 
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    { 
      title: "Total Simpanan", 
      value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.totalSimpanan), 
      icon: Wallet, 
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    { 
      title: "Total Pinjaman Aktif", 
      value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.totalPinjaman), 
      icon: CreditCard, 
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    { 
      title: "Pertumbuhan", 
      value: "+12.5%", 
      icon: TrendingUp, 
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 group hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{card.title}</h3>
            <p className="text-2xl font-black text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
        <div className="lg:col-span-3 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[450px]">
             <DashboardCharts data={chartData} />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest mb-8 flex items-center justify-between border-b border-gray-50 pb-4">
                Aktivitas Terbaru
                <ArrowUpRight className="w-4 h-4 text-gray-300" />
             </h3>
             <div className="space-y-6">
                 {stats.recentActivities.length > 0 ? (
                   stats.recentActivities.map((act) => (
                      <div key={act.id} className="flex gap-4 group cursor-default">
                         <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Wallet className="w-5 h-5" />
                         </div>
                         <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 truncate">{act.title}</p>
                            <p className="text-[10px] text-gray-400 font-medium">
                               {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(act.amount)} • {new Date(act.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </p>
                         </div>
                      </div>
                   ))
                 ) : (
                    <div className="py-20 text-center">
                        <p className="text-sm text-gray-400 italic font-medium">Belum ada aktivitas.</p>
                    </div>
                 )}
             </div>
        </div>
      </div>
    </div>
  );
}
