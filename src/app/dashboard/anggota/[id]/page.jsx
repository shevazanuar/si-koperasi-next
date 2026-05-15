import prisma from "@/lib/prisma";
import { 
  User, 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Building2, 
  Briefcase, 
  Calendar, 
  CreditCard, 
  Wallet,
  IdCard,
  Mail,
  Scale
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AnggotaDetailPage({ params }) {
  const { id } = await params;
  
  const anggota = await prisma.anggota.findUnique({
    where: { id: parseInt(id) }
  });

  if (!anggota) {
      return notFound();
  }

  // Calculate Total Simpanan
  const simpananData = await prisma.simpanan.groupBy({
    by: ['jenis'],
    where: { anggota_id: parseInt(id) },
    _sum: { jumlah: true }
  });

  let totalSimpanan = 0;
  simpananData.forEach(s => {
    if (s.jenis === 'S') totalSimpanan += s._sum.jumlah || 0;
    if (s.jenis === 'T') totalSimpanan -= s._sum.jumlah || 0;
  });

  // Calculate Pinjaman Aktif (Sisa = Pokok - Jumlah Bayar)
  const pinjamanHeaders = await prisma.pinjaman_header.findMany({
    where: { anggota_id: parseInt(id) },
    select: { id: true, jumlah: true }
  });
  
  let totalPinjamanAktif = 0;
  if (pinjamanHeaders.length > 0) {
    const pinjamanIds = pinjamanHeaders.map(ph => ph.id);
    const pinjamanDetails = await prisma.pinjaman_detail.aggregate({
      where: { pinjaman_id: { in: pinjamanIds } },
      _sum: { jumlah_bayar: true }
    });
    
    const totalPinjaman = pinjamanHeaders.reduce((sum, ph) => sum + ph.jumlah, 0);
    const totalBayar = pinjamanDetails._sum.jumlah_bayar || 0;
    totalPinjamanAktif = Math.max(0, totalPinjaman - totalBayar);
  }

  const fmt = (n) => `Rp ${new Intl.NumberFormat("id-ID").format(n || 0)}`;

  const statCards = [
    { label: "Total Simpanan", value: fmt(totalSimpanan), icon: Wallet, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pinjaman Aktif", value: fmt(totalPinjamanAktif), icon: CreditCard, color: "text-orange-600", bg: "bg-orange-50" }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header & Back Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link 
            href="/dashboard/anggota" 
            className="group flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Daftar
          </Link>
          <div className="flex items-center gap-6">
             <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 text-4xl font-black">
                {anggota.nama.charAt(0)}
             </div>
             <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{anggota.nama}</h1>
                <div className="flex items-center gap-3 mt-2">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                        NIK: {anggota.nik}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        anggota.status === 'Aktif' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                        {anggota.status}
                    </span>
                </div>
             </div>
          </div>
        </div>
        
        <div className="flex gap-3">
           <Link 
            href={`/dashboard/anggota/${id}/edit`}
            className="px-6 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
           >
             Edit Profil
           </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 group hover:shadow-md transition-shadow">
             <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-7 h-7" />
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-xl font-black text-gray-900">{stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Detailed Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Information Section */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-4">
                 <User className="w-5 h-5 text-blue-600" />
                 Informasi Pribadi
              </h3>
              
              <div className="space-y-4">
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                        <IdCard className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No. Identitas</p>
                        <p className="text-sm font-bold text-gray-800">{anggota.noidentitas || '-'}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alamat Domisili</p>
                        <p className="text-sm font-bold text-gray-800 leading-relaxed">{anggota.alamat || '-'}</p>
                        <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-tighter">{anggota.kota}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kontak HP</p>
                        <p className="text-sm font-bold text-gray-800">{anggota.hp || '-'}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                        <p className="text-sm font-bold text-gray-800 text-blue-600 underline-offset-4 hover:underline cursor-pointer">{anggota.email || '-'}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Employment Section */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-4">
                 <Building2 className="w-5 h-5 text-blue-600" />
                 Pekerjaan & Keanggotaan
              </h3>
              
              <div className="space-y-4">
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instansi / Unit</p>
                        <p className="text-sm font-bold text-gray-800">{anggota.perusahaan || '-'} / {anggota.unit_seksi || '-'}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Jabatan</p>
                        <p className="text-sm font-bold text-gray-800">{anggota.jabatan || '-'}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal Bergabung</p>
                        <p className="text-sm font-bold text-gray-800">
                           {anggota.tgl_masuk ? new Date(anggota.tgl_masuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                        </p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-blue-600 p-8 rounded-3xl text-white relative overflow-hidden group">
              <div className="relative z-10">
                 <h4 className="font-bold text-xl mb-2">Histori Transaksi</h4>
                 <p className="text-blue-100/60 text-sm leading-relaxed mb-6">Akses riwayat tabungan dan angsuran pinjaman anggota ini secara detail.</p>
                 <div className="flex gap-4">
                    <button className="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-50 transition-all active:scale-95 shadow-lg shadow-blue-900/20">
                        Lihat Tabungan
                    </button>
                    <button className="bg-blue-500/50 border border-blue-400/30 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-500 transition-all active:scale-95">
                        Lihat Pinjaman
                    </button>
                 </div>
              </div>
              <Wallet className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
           </div>
        </div>

      </div>

    </div>
  );
}
