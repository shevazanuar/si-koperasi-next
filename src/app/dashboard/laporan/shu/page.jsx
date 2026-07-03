"use client";
import { useState, useEffect } from "react";
import { PieChart, Search, Filter } from "lucide-react";

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n || 0);

export default function LaporanSHUPage() {
  const [data, setData] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ tgl1: "", tgl2: "", anggota_id: "" });

  const [summaryData, setSummaryData] = useState({ totalPendapatan: 0, totalBiayaOperasional: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.tgl1) params.set("tgl1", filters.tgl1);
      if (filters.tgl2) params.set("tgl2", filters.tgl2);
      if (filters.anggota_id) params.set("anggota_id", filters.anggota_id);
      const res = await fetch(`/api/laporan/shu?${params}`);
      
      if (!res.ok) {
        throw new Error(`Gagal mengambil data: ${res.status}`);
      }

      const text = await res.text();
      try {
        const json = JSON.parse(text);
        setData(json.data || []);
        setAnggotaList(json.anggotaList || []);
        setSummaryData({
          totalPendapatan: json.totalPendapatan || 0,
          totalBiayaOperasional: json.totalBiayaOperasional || 0
        });
      } catch (e) {
        console.error("Failed to parse JSON, received:", text.substring(0, 100));
        alert("Gagal memuat data dari server (format tidak valid).");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Terjadi kesalahan saat mengambil data laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalJumlah = data.reduce((s, d) => s + (d.jumlah || 0), 0);
  const totalBunga = data.reduce((s, d) => s + (d.bunga || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 rounded-xl text-white shadow-md shadow-orange-500/20"><PieChart className="w-5 h-5" /></div>
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
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none">
              <option value="">Semua Anggota</option>
              {anggotaList.map((a) => <option key={a.id} value={a.id}>{a.nama} ({a.nik})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Tanggal Dari</label>
            <input type="date" value={filters.tgl1} onChange={(e) => setFilters({ ...filters, tgl1: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Tanggal Sampai</label>
            <input type="date" value={filters.tgl2} onChange={(e) => setFilters({ ...filters, tgl2: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none" />
          </div>
        </div>
        <button onClick={fetchData} className="mt-4 btn-primary">
          <Search className="w-4 h-4" /> Tampilkan
        </button>
      </div>

      {/* Summary cards for SHU */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Total Bunga (Referal)</p>
          <p className="text-xl font-black text-gray-800">Rp {fmt(totalBunga)}</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Pendapatan</p>
          <p className="text-xl font-black text-gray-800">Rp {fmt(summaryData.totalPendapatan)}</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-5 border border-orange-200">
          <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Total Biaya Operasional</p>
          <p className="text-xl font-black text-gray-800">Rp {fmt(summaryData.totalBiayaOperasional)}</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Sisa Hasil Usaha (SHU)</p>
          <p className="text-xl font-black text-gray-900">Rp {fmt(summaryData.totalPendapatan - summaryData.totalBiayaOperasional)}</p>
        </div>
      </div>

      {/* Maintenance Message for SHU Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100">
          <PieChart className="w-8 h-8 text-amber-500 opacity-80" />
        </div>
        <h3 className="text-lg font-black text-gray-900 mb-2">Sedang Dalam Perbaikan</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Fitur tabel pembagian Sisa Hasil Usaha (SHU) per anggota saat ini sedang dalam tahap pengembangan dan penyempurnaan sistem.
        </p>
      </div>
    </div>
  );
}
