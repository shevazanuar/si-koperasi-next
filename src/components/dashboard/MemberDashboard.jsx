import { Wallet, CreditCard, PieChart, Activity, ChevronRight, LayoutDashboard, Package, Receipt, FileSearch, Tag } from "lucide-react";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import Link from "next/link";

export default function MemberDashboard({ stats, chartData, user }) {
  const cards = [
    {
      title: "Tabungan Saya",
      value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.totalSimpanan),
      icon: Wallet,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Sisa Pinjaman Saya",
      value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.totalPinjaman),
      icon: CreditCard,
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    {
      title: "Total Transaksi",
      value: `${stats.recentActivities.length} Record`,
      icon: Activity,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Status Pengajuan",
      value: stats.pengajuanPinjaman ? stats.pengajuanPinjaman.status : "Tidak Ada",
      icon: FileSearch,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">

      {/* Welcome Message */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Halo, {user.name}! </h1>
          <p className="text-gray-500 mt-1 font-medium">Selamat datang di portal informasi Koperasi Anda.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/dashboard/simpanan"
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            Cek Tabungan
          </Link>
        </div>
        <div className="absolute right-[-2%] top-[-20%] w-64 h-64 bg-blue-50/50 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* Personal Growth Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Pertumbuhan Tabungan</h3>
              <p className="text-xs text-gray-400 mt-1">Akumulasi tabungan Anda 6 bulan terakhir.</p>
            </div>
            <div className="bg-gray-50 px-3 py-1 rounded-lg text-[10px] font-black text-blue-600 uppercase">Live Data</div>
          </div>
          <div className="h-[400px]">
            <DashboardCharts data={chartData} />
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-full">
            <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest mb-8 border-b border-gray-50 pb-4">
              Transaksi Terakhir Saya
            </h3>
            <div className="space-y-6">
              {stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((act) => (
                  <div key={act.id} className="flex gap-4 group cursor-default">
                    <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Activity className="w-5 h-5" />
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
                <div className="py-20 text-center flex flex-col items-center gap-2">
                  <LayoutDashboard className="w-12 h-12 text-gray-100" />
                  <p className="text-sm text-gray-400 italic font-medium">Belum ada transaksi.</p>
                </div>
              )}
            </div>

            {stats.recentActivities.length > 0 && (
              <Link
                href="/dashboard/simpanan"
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all mt-8 group"
              >
                <span className="text-xs font-bold text-gray-600">Semua Riwayat</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Produk & Pembelian */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Produk Terbaru */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Produk Koperasi Terbaru</h3>
              <p className="text-xs text-gray-400 mt-1">Cek barang terbaru yang tersedia</p>
            </div>
            <Link href="/dashboard/katalog" className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
              Lihat Katalog
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats.produkTerbaru?.length > 0 ? (
              stats.produkTerbaru.map((produk) => (
                <div key={produk.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-400">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{produk.nama_barang}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{produk.kategori?.nama_kategori || "Umum"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-blue-600 text-sm">Rp {fmt(Number(produk.harga_jual))}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">{produk.stok} {produk.satuan}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-gray-400 text-sm">Belum ada produk.</div>
            )}
          </div>
        </div>

        {/* Riwayat Pembelian Terakhir */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Riwayat Pembelian</h3>
              <p className="text-xs text-gray-400 mt-1">Transaksi belanja Anda</p>
            </div>
            <Link href="/dashboard/riwayat-pembelian" className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
              Semua Riwayat
            </Link>
          </div>

          <div className="space-y-4">
            {stats.riwayatPembelian?.length > 0 ? (
              stats.riwayatPembelian.map((pembelian) => (
                <div key={pembelian.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-400">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{pembelian.kode_penjualan}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(pembelian.tanggal_penjualan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-black text-gray-900 text-sm">Rp {fmt(Number(pembelian.total_harga))}</p>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-green-50 text-green-600 border border-green-100">
                      {pembelian.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-gray-400 text-sm">Belum ada riwayat pembelian.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
