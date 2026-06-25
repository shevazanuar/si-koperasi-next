import { Users, CreditCard, Wallet, ArrowDownCircle, ArrowUpRight, Building2, Newspaper } from "lucide-react";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import ClockWidget from "@/components/dashboard/ClockWidget";

export default function AdminDashboard({ stats, chartData, profileInfo, informasiList }) {
  const cards = [
    {
      title: "Anggota",
      value: `${stats.totalAnggota} Data`,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Simpanan",
      value: `${stats.totalSimpanan} Data`,
      icon: Wallet,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Penarikan",
      value: `${stats.totalPenarikan} Data`,
      icon: ArrowDownCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Pinjaman",
      value: `${stats.totalPinjaman} Data`,
      icon: CreditCard,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-6 text-white shadow-lg shadow-amber-600/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-amber-100 text-sm">
          Selamat Datang di Halaman Administrator, <strong className="text-white">SIKKPRI Polines</strong>, Menu utama ada di sebelah kiri, selamat bekerja.
        </p>
        <div className="shrink-0">
          <ClockWidget />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-gray-100/60 group hover:shadow-xl hover:-translate-y-1 hover:shadow-amber-900/10 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg} ${card.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner`}>
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{card.title}</h3>
              <p className="text-2xl font-black text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Profile Info */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[450px]">
          <DashboardCharts data={chartData} />
        </div>

        {/* Koperasi Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
            <Building2 className="w-4 h-4 text-amber-500" />
            Profil Koperasi
          </h3>
          {profileInfo ? (
            <div className="space-y-3 text-sm">
              <p className="font-bold text-gray-900">{profileInfo.koperasi}</p>
              <p className="text-gray-500 leading-relaxed">{profileInfo.alamat}</p>
              <p className="text-gray-500">{profileInfo.kota}</p>
              {profileInfo.hp && (
                <p className="text-gray-500">
                  <span className="font-medium text-gray-700">Phone:</span>{" "}
                  <a href={`tel:${profileInfo.hp}`} className="text-amber-600 underline">
                    {profileInfo.hp}
                  </a>
                </p>
              )}
              {profileInfo.email && (
                <p className="text-gray-500">
                  <span className="font-medium text-gray-700">Email:</span>{" "}
                  <a href={`mailto:${profileInfo.email}`} className="text-amber-600 underline">
                    {profileInfo.email}
                  </a>
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Profil belum diatur.</p>
          )}

          {/* Recent Activities */}
          <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest mt-8 mb-6 flex items-center justify-between border-b border-gray-50 pb-4">
            Aktivitas Terbaru
            <ArrowUpRight className="w-4 h-4 text-gray-300" />
          </h3>
          <div className="space-y-4">
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((act) => (
                <div key={act.id} className="flex gap-3 group cursor-default">
                  <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-gray-900 truncate">{act.title}</p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(act.amount)}{" "}
                      •{" "}
                      {new Date(act.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic font-medium text-center py-4">Belum ada aktivitas.</p>
            )}
          </div>
        </div>
      </div>

      {/* Informasi Terkini */}
      {informasiList && informasiList.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest">Informasi Terkini</h3>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto space-y-6">
            {informasiList.map((info) => (
              <div key={info.id} className="border-l-4 border-amber-200 pl-4 pb-4">
                <h4 className="text-base font-bold text-gray-900 mb-1">{info.judul}</h4>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{info.isi}</p>
                {info.insert_date && (
                  <p className="text-xs text-gray-400 mt-2">
                    — Administrator{" "}
                    {new Date(info.insert_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
