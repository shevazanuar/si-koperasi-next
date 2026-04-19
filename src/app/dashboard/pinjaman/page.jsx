import prisma from "@/lib/prisma";
import { CreditCard, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { SearchInput, TypeFilter } from "./Filters";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function PinjamanPage({ searchParams }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const params = await searchParams;
  const query = params?.q || "";
  const typeFilter = params?.type || "";

  // Filter Logic
  const whereClause = { AND: [] };

  // Role-based filtering
  if (user.role === "anggota") {
      whereClause.AND.push({ anggota_id: user.id });
  }

  if (query) {
      whereClause.AND.push({
          OR: [
              { nomor: { contains: query } },
              { anggota_id: { in: (await prisma.anggota.findMany({ 
                  where: { OR: [{ nama: { contains: query } }, { nik: { contains: query } }] },
                  select: { id: true }
                })).map(a => a.id) } 
              }
          ]
      });
  }

  if (typeFilter) {
      whereClause.AND.push({ jenis_pinjaman_id: parseInt(typeFilter) });
  }

  const [pinjamanRaw, anggotaRaw, jenisRaw] = await Promise.all([
    prisma.pinjaman_header.findMany({ 
        where: whereClause,
        take: 100, 
        orderBy: { tgl: "desc" } 
    }),
    prisma.anggota.findMany({ select: { id: true, nama: true, nik: true } }),
    prisma.jenis_pinjaman.findMany({ select: { id: true, nama: true } })
  ]);

  const anggotaMap = Object.fromEntries(anggotaRaw.map(a => [a.id, a]));
  const jenisMap = Object.fromEntries(jenisRaw.map(j => [j.id, j]));

  const data = pinjamanRaw.map(p => ({
    ...p,
    anggota: anggotaMap[p.anggota_id] || { nama: "Tidak Diketahui" },
    jenis: jenisMap[p.jenis_pinjaman_id] || { nama: "Pinjaman Umum" }
  }));

  const totalPinjaman = pinjamanRaw.reduce((sum, p) => sum + p.jumlah, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Data Pinjaman</h1>
            <p className="text-gray-500 mt-1">Kelola permohonan dan pemantauan dana bergulir.</p>
            
            <div className="mt-8 flex gap-3">
              <Link 
                href="/dashboard/pinjaman/tambah"
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95"
              >
                <CreditCard className="w-5 h-5" />
                Ajukan Pinjaman
              </Link>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-50 rounded-full blur-3xl group-hover:bg-orange-100 transition-colors duration-700"></div>
        </div>

        <div className="lg:w-80 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-4">
             <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5" />
             </div>
             <div className="font-bold text-gray-800 uppercase text-xs tracking-widest">Ringkasan Filter</div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Outstanding (Filtered)</p>
              <p className="text-2xl font-black text-gray-900 leading-tight">
                 {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalPinjaman)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-gray-50/50 gap-4">
            <SearchInput />
            <div className="flex items-center gap-4">
               <TypeFilter types={jenisRaw} />
               <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  {data.length} Rekod
               </div>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/30 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
                <th className="py-5 px-8">No. Pinjaman</th>
                <th className="py-5 px-6">Penerima</th>
                <th className="py-5 px-6">Detail Pinjaman</th>
                <th className="py-5 px-6">Status</th>
                <th className="py-5 px-6 text-right">Jumlah</th>
                <th className="py-5 px-8 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-5 px-8">
                     <div className="font-mono text-[10px] font-bold text-gray-300 group-hover:text-orange-500 transition-colors">{item.nomor}</div>
                     <div className="text-[10px] text-gray-400 font-medium">
                        {new Date(item.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                     </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="font-bold text-gray-900 transition-colors">{item.anggota.nama}</div>
                    <div className="text-[10px] text-gray-400 font-medium tracking-tighter">{item.anggota.nik}</div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="text-xs font-bold text-gray-700">{item.jenis.nama}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 uppercase font-medium">{item.lama} {item.satuan} • {item.bunga}% Bunga</div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg w-fit border border-orange-100">
                       <CheckCircle2 className="w-3 h-3" />
                       <span className="text-[10px] font-black uppercase tracking-tight">Aktif</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right font-black text-gray-900">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.jumlah)}
                  </td>
                  <td className="py-5 px-8 text-right">
                    <Link 
                        href={`/dashboard/pinjaman/${item.id}`}
                        className="text-orange-600 hover:text-orange-800 font-black text-[10px] uppercase bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 transition-all opacity-0 group-hover:opacity-100 active:scale-95 shadow-sm inline-block"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {data.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <AlertCircle className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-gray-400 font-medium italic">Data pinjaman tidak ditemukan.</p>
          </div>
        )}
      </div>

    </div>
  );
}
