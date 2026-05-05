import prisma from "@/lib/prisma";
import { 
  ArrowLeft, 
  CreditCard, 
  Calendar, 
  User, 
  Hash, 
  Clock, 
  Percent,
  Timer,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function PinjamanDetailPage({ params }) {
  const userSession = await getSession();
  if (!userSession) redirect("/login");

  const { id } = await params;
  
  const pinjamanId = parseInt(id);
  if (isNaN(pinjamanId)) return notFound();

  const pinjaman = await prisma.pinjaman_header.findUnique({
    where: { id: pinjamanId },
    select: {
      id: true,
      nomor: true,
      tgl: true,
      anggota_id: true,
      jenis_pinjaman_id: true,
      lama: true,
      satuan: true,
      bunga: true,
      jumlah: true
    }
  });

  if (!pinjaman) {
    return notFound();
  }

  // Security Check: Member can only view their own transactions
  if (userSession.role === "anggota" && pinjaman.anggota_id !== userSession.id) {
      return notFound();
  }

  const [anggota, jenis, installments] = await Promise.all([
    prisma.anggota.findUnique({ 
      where: { id: pinjaman.anggota_id },
      select: { id: true, nama: true, nik: true }
    }),
    prisma.jenis_pinjaman.findUnique({ 
      where: { id: pinjaman.jenis_pinjaman_id || 0 },
      select: { id: true, nama: true }
    }),
    prisma.pinjaman_detail.findMany({ 
      where: { pinjaman_id: pinjaman.id },
      orderBy: { cicilan: 'asc' },
      select: {
        id: true,
        cicilan: true,
        angsuran: true,
        bunga: true,
        tgl_jatuh_tempo: true,
        tgl_bayar: true,
        jumlah_bayar: true
      }
    })
  ]);

  const totalBayar = installments.reduce((acc, curr) => acc + (curr.jumlah_bayar || 0), 0);

  const stats = [
    { label: "Pokok Pinjaman", value: pinjaman.jumlah, icon: CreditCard, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Bunga Pinjaman", value: `${pinjaman.bunga}%`, icon: Percent, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Tenor / Jangka", value: `${pinjaman.lama} ${pinjaman.satuan}`, icon: Timer, color: "text-emerald-600", bg: "bg-emerald-50" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/pinjaman" 
          className="group flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar
        </Link>
        <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100 rounded-full flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Pinjaman Aktif
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                           {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pinjaman.jumlah)}
                        </h1>
                        <p className="text-orange-600 font-bold uppercase text-[10px] tracking-widest mt-1">{jenis?.nama || 'Pinjaman Umum'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                            <Hash className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nomor Kontrak</p>
                            <p className="text-sm font-bold text-gray-800 uppercase">{pinjaman.nomor}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal Pencairan</p>
                            <p className="text-sm font-bold text-gray-800">
                                {new Date(pinjaman.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>
              </div>
              {/* Background gradient */}
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-orange-50/50 rounded-full blur-3xl p-0 pointer-events-none"></div>
           </div>

           {/* Stats Breakdown */}
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-sm font-black text-gray-900 leading-tight">
                            {typeof stat.value === 'number' 
                                ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stat.value)
                                : stat.value
                            }
                        </p>
                    </div>
                </div>
              ))}
           </div>
        </div>

        {/* Member Sidebar */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-4">
              Penerima Pinjaman
           </h3>
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black">
                 {anggota?.nama?.charAt(0)}
              </div>
              <div>
                 <p className="font-bold text-gray-900 leading-tight">{anggota?.nama}</p>
                 <p className="text-[10px] text-gray-400 font-medium">NIK: {anggota?.nik}</p>
              </div>
           </div>
           
           <div className="pt-4 space-y-4">
              <Link 
                href={`/dashboard/anggota/${anggota?.id}`}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-orange-50 hover:text-orange-700 rounded-2xl transition-all group"
              >
                 <span className="text-xs font-bold">Lihat Profil Lengkap</span>
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>

           <div className="mt-8 p-6 bg-gray-900 rounded-3xl text-white relative overflow-hidden group">
               <div className="relative z-10">
                  <h4 className="font-bold text-sm mb-1">Status Pinjaman</h4>
                  <p className="text-gray-400 text-[10px] leading-relaxed mb-6 italic">Informasi ringkasan pembayaran pinjaman.</p>
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                     <span>Total Bayar</span>
                     <span className="text-emerald-400">Rp {new Intl.NumberFormat('id-ID').format(totalBayar)}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-6">
                     <div 
                        className="bg-emerald-500 h-full transition-all duration-1000" 
                        style={{ width: `${Math.min(100, (totalBayar / (pinjaman.jumlah || 1)) * 100)}%` }}
                     ></div>
                  </div>
                  <button className="w-full bg-white text-gray-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">
                     Unduh Laporan
                  </button>
               </div>
               <Clock className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            </div>
        </div>
      </div>

      {/* Installment Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
         <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div>
               <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Jadwal Angsuran</h3>
               <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Rincian rencana dan riwayat pembayaran</p>
            </div>
            <div className="flex items-center gap-2">
               <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-full border border-blue-100">
                  {installments.length} Cicilan
               </span>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                     <th className="px-6 py-4">Cicilan</th>
                     <th className="px-6 py-4">Jatuh Tempo</th>
                     <th className="px-6 py-4 text-right">Pokok</th>
                     <th className="px-6 py-4 text-right">Bunga</th>
                     <th className="px-6 py-4 text-right">Total Tagihan</th>
                     <th className="px-6 py-4 text-center">Status</th>
                     <th className="px-6 py-4">Tgl Bayar</th>
                     <th className="px-6 py-4 text-right">Jml Bayar</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {installments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">
                        Belum ada jadwal angsuran untuk pinjaman ini.
                      </td>
                    </tr>
                  ) : (
                    installments.map((inst) => {
                      const isPaid = inst.jumlah_bayar > 0;
                      const totalTagihan = inst.angsuran + inst.bunga;
                      return (
                          <tr key={inst.id} className={`hover:bg-gray-50/50 transition-colors ${isPaid ? 'bg-emerald-50/10' : ''}`}>
                            <td className="px-6 py-4">
                                <span className="font-black text-gray-900">#{inst.cicilan}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                                {inst.tgl_jatuh_tempo ? new Date(inst.tgl_jatuh_tempo).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-gray-700">
                                {new Intl.NumberFormat('id-ID').format(inst.angsuran)}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-orange-600">
                                {new Intl.NumberFormat('id-ID').format(inst.bunga)}
                            </td>
                            <td className="px-6 py-4 text-right font-black text-gray-900">
                                {new Intl.NumberFormat('id-ID').format(totalTagihan)}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {isPaid ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                                      Lunas
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black uppercase">
                                      Belum
                                  </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-xs font-medium italic">
                                {inst.tgl_bayar || '-'}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                {inst.jumlah_bayar > 0 ? new Intl.NumberFormat('id-ID').format(inst.jumlah_bayar) : '-'}
                            </td>
                          </tr>
                      );
                    })
                  )}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}
