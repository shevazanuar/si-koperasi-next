"use client";
import { useState, useEffect } from "react";
import { Plus, Search, Filter, Pencil, Trash2, FileText, Wallet } from "lucide-react";
import Link from "next/link";
import { showSuccess, showError, showConfirm } from "@/lib/swal";

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n || 0);

export default function BiayaOperasionalPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: "", tgl1: "", tgl2: "" });
  const [totalNominal, setTotalNominal] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.tgl1) params.set("tgl1", filters.tgl1);
    if (filters.tgl2) params.set("tgl2", filters.tgl2);
    
    try {
      const res = await fetch(`/api/biaya-opr?${params}`);
      const json = await res.json();
      setData(json.data || []);
      setTotalNominal(json.totalNominal || 0);
      setCurrentPage(1); // Reset page on fetch
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const isConfirmed = await showConfirm(
      "Hapus Data?",
      "Data biaya operasional ini akan dihapus permanen!"
    );

    if (isConfirmed) {
      try {
        const res = await fetch(`/api/biaya-opr/${id}`, { method: "DELETE" });
        if (res.ok) {
          showSuccess("Terhapus!", "Data biaya berhasil dihapus.");
          fetchData();
        } else {
          showError("Gagal!", "Gagal menghapus data.");
        }
      } catch (error) {
        showError("Error!", "Terjadi kesalahan sistem.");
      }
    }
  };

  // Dashboard Summary calculations
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalBiayaBulanIni = data
    .filter(d => {
      const dDate = new Date(d.tanggal);
      return dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear;
    })
    .reduce((sum, item) => sum + parseFloat(item.nominal), 0);

  const totalBiayaTahunIni = data
    .filter(d => new Date(d.tanggal).getFullYear() === currentYear)
    .reduce((sum, item) => sum + parseFloat(item.nominal), 0);

  const jumlahTransaksi = data.length;

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2.5 rounded-xl text-white">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Biaya Operasional</h1>
            <p className="text-sm text-gray-500">Kelola data pengeluaran operasional koperasi</p>
          </div>
        </div>
        <Link href="/dashboard/biaya/tambah" className="bg-gradient-to-r from-[#cd8957] to-[#a05a26] hover:from-[#b07044] hover:to-[#8c4819] text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Biaya
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
          <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Total Biaya Bulan Ini</p>
          <p className="text-xl font-black text-red-700">Rp {fmt(totalBiayaBulanIni)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">Total Biaya Tahun Ini</p>
          <p className="text-xl font-black text-orange-700">Rp {fmt(totalBiayaTahunIni)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
          <p className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-1">Jumlah Transaksi Filter</p>
          <p className="text-xl font-black text-purple-700">{jumlahTransaksi} Transaksi</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Cari Nama Biaya</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input type="text" placeholder="Masukkan nama biaya..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Dari Tanggal</label>
            <input type="date" value={filters.tgl1} onChange={(e) => setFilters({ ...filters, tgl1: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Sampai Tanggal</label>
            <input type="date" value={filters.tgl2} onChange={(e) => setFilters({ ...filters, tgl2: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={fetchData} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition text-sm font-medium">
            <Filter className="w-4 h-4" /> Terapkan Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Memuat data...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-4">No</th>
                    <th className="px-6 py-4">Kode Biaya</th>
                    <th className="px-6 py-4">Nama Biaya</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4 text-right">Nominal</th>
                    <th className="px-6 py-4">Keterangan</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentItems.length > 0 ? (
                    currentItems.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-red-50/30 transition-colors">
                        <td className="px-6 py-4 text-gray-500">{indexOfFirstItem + idx + 1}</td>
                        <td className="px-6 py-4 font-mono text-xs text-red-600 font-bold">{row.kode_biaya}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">{row.nama_biaya}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(row.tanggal).toLocaleDateString("id-ID")}</td>
                        <td className="px-6 py-4 text-right font-bold text-red-600">Rp {fmt(row.nominal)}</td>
                        <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{row.keterangan || "-"}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/dashboard/biaya/detail/${row.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Detail">
                              <FileText className="w-4 h-4" />
                            </Link>
                            <Link href={`/dashboard/biaya/edit/${row.id}`} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition" title="Edit">
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleDelete(row.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-gray-400">Tidak ada data biaya operasional.</td>
                    </tr>
                  )}
                  {/* Total Row */}
                  {data.length > 0 && (
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <td colSpan="4" className="px-6 py-4 text-right font-black text-gray-900 uppercase">TOTAL SELURUH BIAYA</td>
                      <td className="px-6 py-4 text-right font-black text-red-700 text-lg">Rp {fmt(totalNominal)}</td>
                      <td colSpan="2"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
                <span className="text-sm text-gray-500">
                  Menampilkan {indexOfFirstItem + 1} hingga {Math.min(indexOfLastItem, data.length)} dari {data.length} entri
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition">
                    Sebelumnya
                  </button>
                  <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i} onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition ${currentPage === i + 1 ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition">
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
