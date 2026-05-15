"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";

const AKSI_OPTS = ["LOGIN_SUCCESS", "LOGIN_FAILED", "TAMBAH_SIMPANAN", "TAMBAH_PENARIKAN", "HAPUS_SIMPANAN", "BAYAR_CICILAN", "HAPUS_PEMBAYARAN", "APPROVE_PINJAMAN", "TOLAK_PINJAMAN", "TAMBAH_PINJAMAN", "RESET_PASSWORD", "CHANGE_PASSWORD"];

const BADGE = {
  LOGIN_SUCCESS:  "bg-emerald-100 text-emerald-700",
  LOGIN_FAILED:   "bg-red-100 text-red-700",
  APPROVE_PINJAMAN: "bg-blue-100 text-blue-700",
  TOLAK_PINJAMAN: "bg-orange-100 text-orange-700",
  BAYAR_CICILAN:  "bg-purple-100 text-purple-700",
  TAMBAH_SIMPANAN:"bg-teal-100 text-teal-700",
  TAMBAH_PENARIKAN:"bg-yellow-100 text-yellow-700",
};

function fmtDt(s) {
  if (!s) return "-";
  return new Date(s).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });
}

export default function AuditLogPage() {
  const [rows, setRows]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage]   = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState({ from: "", to: "", aksi: "", tabel: "", keyword: "" });

  const fetchLogs = useCallback(async (f = filter, p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p });
    if (f.from) params.set("from", f.from);
    if (f.to) params.set("to", f.to);
    if (f.aksi) params.set("aksi", f.aksi);
    if (f.tabel) params.set("tabel", f.tabel);
    if (f.keyword) params.set("keyword", f.keyword);
    const res = await fetch(`/api/audit-log?${params}`);
    const json = await res.json();
    setRows(json.data || []);
    setHasMore((json.data || []).length === 50);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchLogs(); }, []);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchLogs(filter, 1); };
  const handleReset = () => { const f = { from:"",to:"",aksi:"",tabel:"",keyword:"" }; setFilter(f); setPage(1); fetchLogs(f, 1); };
  const goPage = (p) => { setPage(p); fetchLogs(filter, p); };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
        <Shield className="w-5 h-5 text-indigo-600" />
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Audit Log</h1>
          <p className="text-xs text-gray-500">Jejak seluruh aktivitas penting sistem</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <form onSubmit={handleSearch} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input type="date" placeholder="Dari Tanggal" value={filter.from} onChange={e => setFilter(f=>({...f,from:e.target.value}))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none" />
          <input type="date" placeholder="Sampai Tanggal" value={filter.to} onChange={e => setFilter(f=>({...f,to:e.target.value}))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none" />
          <select value={filter.aksi} onChange={e => setFilter(f=>({...f,aksi:e.target.value}))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none bg-white">
            <option value="">Semua Aksi</option>
            {AKSI_OPTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <input placeholder="Cari username / keterangan..." value={filter.keyword} onChange={e => setFilter(f=>({...f,keyword:e.target.value}))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none" />
          <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-all">
              <Search className="w-4 h-4" /> Cari
            </button>
            <button type="button" onClick={handleReset} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-all">
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Waktu","User","Aksi","Tabel","Record ID","IP Address","Keterangan"].map(h => (
                  <th key={h} className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">Memuat...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400 italic">Tidak ada data</td></tr>
              ) : rows.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{fmtDt(r.created_at)}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{r.username || "-"}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${BADGE[r.aksi] || "bg-gray-100 text-gray-700"}`}>{r.aksi}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{r.tabel || "-"}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{r.record_id ?? "-"}</td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-xs">{r.ip_address || "-"}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate" title={r.keterangan}>{r.keterangan || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">Halaman {page} · {rows.length} data</span>
          <div className="flex gap-2">
            <button onClick={() => goPage(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => goPage(page + 1)} disabled={!hasMore} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
