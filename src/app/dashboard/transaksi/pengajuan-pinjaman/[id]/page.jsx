import prisma from "@/lib/prisma";
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  User, 
  Hash, 
  Clock, 
  Percent,
  Timer,
  CreditCard,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function PengajuanDetailPage({ params }) {
  const userSession = await getSession();
  if (!userSession) redirect("/login");

  const { id } = await params;
  
  const pengajuanId = parseInt(id);
  if (isNaN(pengajuanId)) return notFound();

  const pengajuan = await prisma.pengajuan_pinjaman.findUnique({
    where: { id: pengajuanId },
    select: {
      id: true,
      nomor: true,
      tanggal: true,
      anggota_id: true,
      jenis_pinjaman_id: true,
      lama: true,
      satuan: true,
      bunga: true,
      jumlah: true,
      status: true,
      keperluan: true
    }
  });

  if (!pengajuan) {
    return notFound();
  }

  // Security Check: Member can only view their own pengajuan
  if (userSession.role === "anggota" && pengajuan.anggota_id !== userSession.id) {
      return notFound();
  }

  const [anggota, jenis] = await Promise.all([
    prisma.anggota.findUnique({ 
      where: { id: pengajuan.anggota_id },
      select: { id: true, nama: true, nik: true, unit_seksi: true, jabatan: true }
    }),
    prisma.jenis_pinjaman.findUnique({ 
      where: { id: pengajuan.jenis_pinjaman_id },
      select: { nama: true }
    })
  ]);

  const statusColors = {
    Open: "bg-amber-50 text-amber-700 border-amber-100",
    Acc: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Cancel: "bg-red-50 text-red-700 border-red-100",
  };

  const stats = [
    { label: "Jumlah Diajukan", value: pengajuan.jumlah, icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Bunga", value: `${pengajuan.bunga}%`, icon: Percent, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Tenor", value: `${pengajuan.lama} ${pengajuan.satuan || 'Bulan'}`, icon: Timer, color: "text-emerald-600", bg: "bg-emerald-50" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/transaksi/pengajuan-pinjaman" 
          className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar
        </Link>
        <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${statusColors[pengajuan.status || 'Open']}`}>
           {pengajuan.status === 'Acc' ? <CheckCircle className="w-3 h-3" /> : pengajuan.status === 'Cancel' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
           {pengajuan.status || 'Menunggu'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <FileText className="w-7 h-7" />
                 </div>
                 <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Detail Pengajuan</h1>
                    <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">{pengajuan.nomor}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Jenis Pinjaman</p>
                    <p className="font-bold text-gray-800">{jenis?.nama || 'Pinjaman Umum'}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal Pengajuan</p>
                    <p className="font-bold text-gray-800">{new Date(pengajuan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                 </div>
                 <div className="md:col-span-2 space-y-1 pt-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                       <Info className="w-3 h-3" /> Keperluan Pinjaman
                    </p>
                    <div className="bg-gray-50 p-4 rounded-2xl text-sm text-gray-600 leading-relaxed italic">
                       "{pengajuan.keperluan || 'Tidak ada keterangan keperluan.'}"
                    </div>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-4">
              {stats.map((s, i) => (
                 <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                    <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-4`}>
                       <s.icon className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{s.label}</p>
                    <p className="text-sm font-black text-gray-900">
                       {typeof s.value === 'number' ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(s.value) : s.value}
                    </p>
                 </div>
              ))}
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-4">
                 Data Pemohon
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
              <div className="space-y-3 pt-2">
                 <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Unit/Seksi</span>
                    <span className="font-bold text-gray-700">{anggota?.unit_seksi || '-'}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Jabatan</span>
                    <span className="font-bold text-gray-700">{anggota?.jabatan || '-'}</span>
                 </div>
              </div>
              <Link 
                 href={`/dashboard/anggota/${anggota?.id}`}
                 className="block w-full text-center py-3 bg-gray-50 hover:bg-blue-50 text-blue-600 rounded-2xl text-xs font-bold transition-colors"
              >
                 Lihat Profil Lengkap
              </Link>
           </div>

           {pengajuan.status === 'Open' && userSession.role === 'admin' && (
              <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl shadow-blue-500/20">
                 <h4 className="font-bold text-sm mb-4 text-center uppercase tracking-widest">Tindakan Cepat</h4>
                 <div className="grid grid-cols-2 gap-3">
                    <button className="bg-white text-blue-600 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-colors">
                       Setujui
                    </button>
                    <button className="bg-blue-700 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-colors">
                       Tolak
                    </button>
                 </div>
                 <p className="text-[10px] text-blue-200 mt-4 text-center italic">Anda juga dapat melakukan tindakan ini dari halaman utama daftar pengajuan.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
