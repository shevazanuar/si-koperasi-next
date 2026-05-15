"use client";
import { useState, useEffect } from "react";
import { Users, Search, Filter, Download } from "lucide-react";

export default function LaporanAnggotaPage() {
  const [data, setData] = useState([]);
  const [perusahaanList, setPerusahaanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "Aktif",
    perusahaan: "",
    tgl1: "",
    tgl2: "",
  });

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.perusahaan) params.set("perusahaan", filters.perusahaan);
    if (filters.tgl1) params.set("tgl1", filters.tgl1);
    if (filters.tgl2) params.set("tgl2", filters.tgl2);
    const res = await fetch(`/api/laporan/anggota?${params}`);
    const json = await res.json();
    setData(json.data || []);
    setPerusahaanList(json.perusahaanList || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const fmt = (d) => d ? new Date(d).toLocaleDateString("id-ID") : "-";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white"><Users className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Laporan Anggota</h1>
            <p className="text-sm text-gray-500">Data anggota koperasi berdasarkan filter</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-700">Filter Laporan</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
              <option value="">Semua</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Perusahaan</label>
            <select value={filters.perusahaan} onChange={(e) => setFilters({ ...filters, perusahaan: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Semua</option>
              {perusahaanList.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Tgl Masuk (Dari)</label>
            <input type="date" value={filters.tgl1} onChange={(e) => setFilters({ ...filters, tgl1: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Tgl Masuk (Sampai)</label>
            <input type="date" value={filters.tgl2} onChange={(e) => setFilters({ ...filters, tgl2: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <button onClick={fetchData} className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition text-sm font-medium">
          <Search className="w-4 h-4" /> Tampilkan
        </button>
      </div>

      {/* Result */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-500 uppercase">
            Hasil: <span className="text-blue-600">{data.length} anggota</span>
          </h3>
        </div>
        {loading ? <div className="p-12 text-center text-gray-400">Memuat...</div> : data.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Tidak ada data yang sesuai filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">No</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">NIK</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Nama</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">JK</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Jabatan</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Perusahaan</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Tgl Masuk</th>
                <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
              </tr></thead>
              <tbody>{data.map((row, idx) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-blue-50/20">
                  <td className="px-6 py-3 text-gray-400">{idx + 1}</td>
                  <td className="px-6 py-3 font-mono text-xs text-gray-600">{row.nik}</td>
                  <td className="px-6 py-3 font-bold text-gray-900">{row.nama}</td>
                  <td className="px-6 py-3 text-gray-600">{row.jk}</td>
                  <td className="px-6 py-3 text-gray-600">{row.jabatan || "-"}</td>
                  <td className="px-6 py-3 text-gray-600">{row.perusahaan || "-"}</td>
                  <td className="px-6 py-3 text-gray-500">{fmt(row.tgl_masuk)}</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${row.status === "Aktif" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
