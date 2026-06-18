import prisma from "@/lib/prisma";
import { Plus, Users } from "lucide-react";
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
    <div className="space-y-6 animate-page-enter">
      
      {/* Header Area */}
      <div className="card-base page-header-accent p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Data Anggota</h1>
            <p className="text-sm text-gray-500">Kelola data keanggotaan koperasi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <ImportExcelButton 
            type="anggota" 
            title="Import Data Anggota" 
            apiUrl="/api/import/anggota"
           />
           <Link 
            href="/dashboard/anggota/tambah"
            className="btn-primary"
           >
             <Plus className="w-4 h-4" />
             Tambah Anggota
           </Link>
        </div>
      </div>

      {/* Table Area */}
      <div className="card-base overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-gray-50/80 gap-4">
          <div className="flex items-center gap-4">
            <LimitFilter />
          </div>
          <div className="flex items-center gap-4">
            <SearchInput />
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider whitespace-nowrap">
               {anggota.length} Data {query && <span className="normal-case text-gray-500">untuk &quot;{query}&quot;</span>}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>NIK</th>
                <th>Nama Lengkap</th>
                <th>Perusahaan</th>
                <th>Level</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {anggota.map((item) => (
                <tr key={item.id} className="group">
                  <td className="font-mono text-xs text-gray-400">{item.nik || '-'}</td>
                  <td>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{item.nama}</span>
                  </td>
                  <td className="text-gray-600">{item.perusahaan || '-'}</td>
                  <td>
                    {item.level_nama ? (
                      <span className="badge badge-info">{item.level_nama}</span>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td>
                    <span className={`badge ${item.status === 'Aktif' ? 'badge-success' : 'badge-danger'}`}>
                      {item.status || 'Aktif'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Link 
                        href={`/dashboard/anggota/${item.id}/edit`}
                        className="btn-icon btn-icon-edit"
                        title="Edit anggota"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
                      </Link>
                      <Link 
                        href={`/dashboard/anggota/${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-all"
                        title="Lihat detail"
                      >
                        Detail
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              
              {anggota.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Tidak ada data anggota ditemukan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-400 bg-gray-50/50">
          <div>Halaman 1 dari 1</div>
          <div className="flex gap-2">
             <button className="px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-30 transition-colors text-gray-500" disabled>Previous</button>
             <button className="px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-30 transition-colors text-gray-500" disabled>Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}
