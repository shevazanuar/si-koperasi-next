import prisma from "@/lib/prisma";
import { Plus } from "lucide-react";
import Link from "next/link";
import SearchInput from "./SearchInput";
import LimitFilter from "@/components/dashboard/LimitFilter";
import ImportExcelButton from "@/components/dashboard/ImportExcelButton";

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AnggotaPage({ searchParams }) {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const params = await searchParams;
  const query = params?.q || "";
  const limit = parseInt(params?.limit) || 20;
  
  // Ensure limit is one of the allowed values to prevent unexpected large queries
  const safeLimit = [20, 40, 80, 120].includes(limit) ? limit : 20;

  // Fetch members with JOIN to level_anggota for level name
  const angkotaRaw = await prisma.$queryRawUnsafe(`
    SELECT a.id, a.nik, a.nama, a.perusahaan, a.unit_seksi, a.jabatan, a.status,
           la.nama as level_nama
    FROM anggota a
    LEFT JOIN level_anggota la ON a.level_anggota_id = la.id
    WHERE (
      a.nama LIKE ? OR a.nik LIKE ?
    )
    ORDER BY a.nama ASC
    LIMIT ?
  `, `%${query}%`, `%${query}%`, safeLimit);

  const anggota = angkotaRaw.map(a => ({
    ...a,
    id: typeof a.id === 'bigint' ? Number(a.id) : a.id,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-gray-900">Data Anggota</h1>
          <p className="text-gray-500 mt-1">Kelola data keanggotaan koperasi</p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
           <ImportExcelButton 
            type="anggota" 
            title="Import Data Anggota" 
            apiUrl="/api/import/anggota"
           />
           <Link 
            href="/dashboard/anggota/tambah"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md shadow-blue-500/20"
           >
             <Plus className="w-5 h-5" />
             Tambah Anggota
           </Link>
        </div>
        {/* Background Decoration */}
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-blue-50 to-transparent flex items-center justify-end pr-8">
            <div className="w-32 h-32 bg-blue-100/50 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-gray-50/50 gap-4">
          <div className="flex items-center gap-4">
            <LimitFilter />
          </div>
          <div className="flex items-center gap-4">
            <SearchInput />
            <div className="text-sm text-gray-500 font-medium">
               Menampilkan {anggota.length} Data {query && `untuk "${query}"`}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
                <th className="py-4 px-6">NIK</th>
                <th className="py-4 px-6">Nama Lengkap</th>
                <th className="py-4 px-6">Perusahaan</th>
                <th className="py-4 px-6">Level</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {anggota.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="py-4 px-6 font-mono text-xs text-gray-500">{item.nik || '-'}</td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.nama}</div>
                  </td>
                  <td className="py-4 px-6 text-gray-600 font-medium">{item.perusahaan || '-'}</td>
                  <td className="py-4 px-6">
                    {item.level_nama ? (
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {item.level_nama}
                      </span>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                      item.status === 'Aktif' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {item.status || 'Aktif'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <Link 
                      href={`/dashboard/anggota/${item.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 font-bold text-[10px] uppercase bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-all active:scale-95"
                    >
                      Edit
                    </Link>
                    <Link 
                        href={`/dashboard/anggota/${item.id}`}
                        className="text-gray-500 hover:text-gray-900 font-bold text-[10px] uppercase bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-all active:scale-95"
                    >
                        Detail
                    </Link>
                  </td>
                </tr>
              ))}
              
              {anggota.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-20 text-center flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <Plus className="w-8 h-8 text-gray-300 rotate-45" />
                    </div>
                    <p className="text-gray-500 font-medium">Tidak ada data anggota ditemukan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Skeleton */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold uppercase text-gray-400 bg-gray-50/50 tracking-widest">
          <div>Halaman 1 dari 1</div>
          <div className="flex gap-2">
             <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-30" disabled>Previous</button>
             <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-30" disabled>Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}
