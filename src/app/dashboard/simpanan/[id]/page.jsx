import prisma from "@/lib/prisma";
import { 
  ArrowLeft, 
  Wallet, 
  Calendar, 
  User, 
  Hash, 
  Clock, 
  Stamp,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function SimpananDetailPage({ params }) {
  const userSession = await getSession();
  if (!userSession) redirect("/login");

  const { id } = await params;
  
  const simpanan = await prisma.simpanan.findUnique({
    where: { id: parseInt(id) },
    select: {
        id: true,
        nomor: true,
        tgl: true,
        anggota_id: true,
        jenis_simpanan_id: true,
        jumlah: true,
        user_id: true,
        insert_date: true,
        entry: true
    }
  });

  if (!simpanan) {
    return notFound();
  }

  // Security Check: Member can only view their own transactions
  if (userSession.role === "anggota" && simpanan.anggota_id !== userSession.id) {
      return notFound();
  }

  const [anggota, jenis, user] = await Promise.all([
    prisma.anggota.findUnique({ where: { id: simpanan.anggota_id } }),
    prisma.jenis_simpanan.findUnique({ where: { id: simpanan.jenis_simpanan_id } }),
    prisma.users.findUnique({ where: { id: simpanan.user_id } })
  ]);

  const details = [
    { label: "Nomor Transaksi", value: simpanan.nomor, icon: Hash },
    { label: "Tanggal Setoran", value: new Date(simpanan.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), icon: Calendar },
    { label: "Sumber Data", value: simpanan.entry === 'G' ? 'Potongan Gaji' : 'Input Manual', icon: Clock },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/simpanan" 
          className="group flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Riwayat
        </Link>
        <span className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
           Detail Transaksi
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info Card */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                           {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(simpanan.jumlah)}
                        </h1>
                        <p className="text-blue-600 font-bold uppercase text-[10px] tracking-widest mt-1">{jenis?.nama}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                   {details.map((item, i) => (
                      <div key={i} className="flex gap-4">
                         <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                            <item.icon className="w-5 h-5 text-gray-400" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                            <p className="text-sm font-bold text-gray-800">{item.value}</p>
                         </div>
                      </div>
                   ))}
                </div>
              </div>
              <div className="absolute right-[-5%] top-[-10%] w-64 h-64 bg-blue-50/50 rounded-full blur-3xl p-0 pointer-events-none"></div>
           </div>

           {/* Audit Section */}
           <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 italic font-black text-gray-300 text-xs">
                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Diinput Oleh</p>
                    <p className="text-xs font-bold text-gray-700">{user?.namalengkap || 'System Administrator'}</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal Input</p>
                 <p className="text-xs font-bold text-gray-700">
                    {simpanan.insert_date ? new Date(simpanan.insert_date).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                 </p>
              </div>
           </div>
        </div>

        {/* Member Profile Sidebar */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-4">
              Konfirmasi Anggota
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
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-2xl transition-all group"
              >
                 <span className="text-xs font-bold">Lihat Profil Lengkap</span>
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>
        </div>
      </div>

    </div>
  );
}
