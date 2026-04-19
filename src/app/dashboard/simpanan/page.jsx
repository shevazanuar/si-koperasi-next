import prisma from "@/lib/prisma";
import { Wallet, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import SearchInput from "./SearchInput";
import TypeFilter from "./TypeFilter";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SimpananPage({ searchParams }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const params = await searchParams;
  const query = params?.q || "";
  const typeFilter = params?.type || "";

  // Prepare database filter
  const whereClause = {
    AND: []
  };

  // If role is anggota, restrict data to their own
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
      whereClause.AND.push({ jenis_simpanan_id: parseInt(typeFilter) });
  }

  // Fetch data
  const [simpananRaw, anggotaRaw, jenisRaw] = await Promise.all([
    prisma.simpanan.findMany({ 
        where: whereClause,
        take: 100, 
        orderBy: { tgl: "desc" },
        select: {
            id: true,
            nomor: true,
            tgl: true,
            anggota_id: true,
            jenis_simpanan_id: true,
            jumlah: true,
            user_id: true,
            entry: true
        }
    }),
    prisma.anggota.findMany({ select: { id: true, nama: true, nik: true } }),
    prisma.jenis_simpanan.findMany()
  ]);

  // Create lookup maps
  const anggotaMap = Object.fromEntries(anggotaRaw.map(a => [a.id, a]));
  const jenisMap = Object.fromEntries(jenisRaw.map(j => [j.id, j]));

  // Merge data
  const data = simpananRaw.map(s => ({
    ...s,
    anggota: anggotaMap[s.anggota_id] || { nama: "Tidak Diketahui" },
    jenis: jenisMap[s.jenis_simpanan_id] || { nama: "Lainnya" }
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Header & Quick stats */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Riwayat Simpanan</h1>
            <p className="text-gray-500 mt-1">Kelola dan pantau seluruh transaksi simpanan anggota.</p>
            
            <div className="flex flex-wrap gap-3 mt-8">
              <Link 
                href="/dashboard/simpanan/tambah"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <Wallet className="w-5 h-5" />
                Setoran Baru
              </Link>
            </div>
          </div>
          {/* Bg Decoration */}
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-blue-50/50 to-transparent"></div>
        </div>

        <div className="xl:w-1/3 grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 relative overflow-hidden group">
            <div className="relative z-10">
               <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <ArrowUpRight className="w-5 h-5" />
               </div>
               <p className="text-emerald-800/60 text-[10px] font-bold uppercase tracking-widest">Total Terkumpul</p>
               <p className="text-emerald-900 text-xl font-black">
                 {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(simpananRaw.reduce((s,i) => s+i.jumlah, 0))}
               </p>
            </div>
          </div>
          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 relative overflow-hidden group">
            <div className="relative z-10">
               <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <Wallet className="w-5 h-5" />
               </div>
               <p className="text-blue-800/60 text-[10px] font-bold uppercase tracking-widest">Jumlah Record</p>
               <p className="text-blue-900 text-2xl font-black">{simpananRaw.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-gray-50/30 gap-4">
            <SearchInput />
            <div className="flex items-center gap-4">
                <TypeFilter types={jenisRaw} />
                <div className="text-xs text-gray-400 font-bold uppercase tracking-tighter">
                    {data.length} Transaksi
                </div>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
                <th className="py-5 px-8">Tanggal</th>
                <th className="py-5 px-6">No. Transaksi</th>
                <th className="py-5 px-6">Anggota</th>
                <th className="py-5 px-6">Jenis Simpanan</th>
                <th className="py-5 px-6">Jumlah</th>
                <th className="py-5 px-8 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="py-5 px-8">
                    <div className="font-bold text-gray-900">
                       {new Date(item.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="font-mono text-[10px] font-bold text-gray-300 group-hover:text-blue-500 transition-colors">{item.nomor}</div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="font-bold text-gray-800">{item.anggota.nama}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{item.anggota.nik}</div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tight border border-blue-100">
                      {item.jenis.nama}
                    </span>
                  </td>
                  <td className="py-5 px-6 font-black text-gray-900">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.jumlah)}
                  </td>
                  <td className="py-5 px-8 text-right">
                    <Link 
                        href={`/dashboard/simpanan/${item.id}`}
                        className="text-blue-600 hover:text-blue-800 font-bold text-[10px] uppercase bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 transition-all opacity-0 group-hover:opacity-100 active:scale-95 shadow-sm"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
              
              {data.length === 0 && (
                <tr>
                   <td colSpan="6" className="py-32 text-center flex flex-col items-center gap-2">
                       <p className="text-gray-400 font-medium italic">Data transaksi tidak ditemukan.</p>
                       {query && <p className="text-xs text-gray-300">Hasil untuk pencarian "{query}"</p>}
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
