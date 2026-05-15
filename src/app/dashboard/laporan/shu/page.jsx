"use client";
import { useState, useEffect } from "react";
import { PieChart, Search, Filter } from "lucide-react";

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n || 0);

export default function LaporanSHUPage() {
  const [data, setData] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ tgl1: "", tgl2: "", anggota_id: "" });

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.tgl1) params.set("tgl1", filters.tgl1);
    if (filters.tgl2) params.set("tgl2", filters.tgl2);
    if (filters.anggota_id) params.set("anggota_id", filters.anggota_id);
    const res = await fetch(`/api/laporan/shu?${params}`);
    const json = await res.json();
    setData(json.data || []);
    setAnggotaList(json.anggotaList || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const totalJumlah = data.reduce((s, d) => s + (d.jumlah || 0), 0);
  const totalBunga = data.reduce((s, d) => s + (d.bunga || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2.5 rounded-xl text-white"><PieChart className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Laporan SHU</h1>
            <p className="text-sm text-gray-500">Sisa Hasil Usaha berdasarkan data pinjaman</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-700">Filter Laporan</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Anggota</label>
            <select value={filters.anggota_id} onChange={(e) => setFilters({ ...filters, anggota_id: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Semua Anggota</option>
              {anggotaList.map((a) => <option key={a.id} value={a.id}>{a.nama} ({a.nik})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Tanggal Dari</label>
            <input type="date" value={filters.tgl1} onChange={(e) => setFilters({ ...filters, tgl1: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Tanggal Sampai</label>
            <input type="date" value={filters.tgl2} onChange={(e) => setFilters({ ...filters, tgl2: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <button onClick={fetchData} className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition text-sm font-medium">
          <Search className="w-4 h-4" /> Tampilkan
        </button>
      </div>

      {/* Summary cards */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Total Pinjaman</p>
            <p className="text-xl font-black text-blue-700">Rp {fmt(totalJumlah)}</p>
          </div>
          <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">Total Bunga (SHU)</p>
            <p className="text-xl font-black text-orange-700">Rp {fmt(totalBunga)}</p>
          </div>
          <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
            <p className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-1">Jumlah Transaksi</p>
            <p className="text-xl font-black text-purple-700">{data.length} Pinjaman</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-xs font-bold text-gray-500 uppercase">
            Data SHU — <span className="text-purple-600">{data.length} record</span>
          </h3>
        </div>
        {loading ? <div className="p-12 text-center text-gray-400">Memuat...</div> : data.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Tidak ada data yang sesuai filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">No</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Nomor</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Anggota</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">JK</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Jenis Pinjaman</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase">Jumlah</th>
                <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase">Bunga</th>
                <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase">Lama</th>
              </tr></thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-purple-50/20">
                    <td className="px-6 py-3 text-gray-400">{idx + 1}</td>
                    <td className="px-6 py-3 font-mono text-xs text-purple-600 font-bold">{row.nomor}</td>
                    <td className="px-6 py-3">
                      <p className="font-bold text-gray-900">{row.nama_anggota}</p>
                      <p className="text-xs text-gray-400">{row.nik}</p>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{row.jk}</td>
                    <td className="px-6 py-3 text-gray-600">{row.nama_pinjaman}</td>
                    <td className="px-6 py-3 text-gray-500">{row.tgl ? new Date(row.tgl).toLocaleDateString("id-ID") : "-"}</td>
                    <td className="px-6 py-3 text-right font-medium text-gray-900">Rp {fmt(row.jumlah)}</td>
                    <td className="px-6 py-3 text-right font-bold text-orange-600">Rp {fmt(row.bunga)}</td>
                    <td className="px-6 py-3 text-center text-gray-600">{row.lama} {row.satuan}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={6} className="px-6 py-3 text-right text-gray-700">TOTAL</td>
                  <td className="px-6 py-3 text-right text-gray-900">Rp {fmt(totalJumlah)}</td>
                  <td className="px-6 py-3 text-right text-orange-700">Rp {fmt(totalBunga)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
