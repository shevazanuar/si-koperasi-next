"use client";

import { Search, RefreshCw, ChevronDown } from "lucide-react";

export default function ReportFilter({
  type,
  fromDate,
  toDate,
  anggotaId,
  jenisSimpanan,
  perusahaan,
  outputFormat,
  anggotaList = [],
  jenisSimpananList = [],
  perusahaanList = [],
  showDariTanggal = true,
  showSampaiTanggal = true,
  showJenisSimpanan = false,
  showPerusahaan = false,
  tanggalLabel = "Dari Tanggal",
  loading = false,
  onFromDateChange,
  onToDateChange,
  onAnggotaIdChange,
  onJenisSimpananChange,
  onPerusahaanChange,
  onOutputFormatChange,
  onSubmit,
  onRefresh,
}) {
  return (
    <form className="p-6" onSubmit={onSubmit}>
      <div className="space-y-5">
        {showDariTanggal && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="w-40 text-sm font-medium text-gray-600 shrink-0">
              {showSampaiTanggal ? "Dari Tanggal" : tanggalLabel}
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white"
            />
          </div>
        )}

        {showSampaiTanggal && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="w-40 text-sm font-medium text-gray-600 shrink-0">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="w-40 text-sm font-medium text-gray-600 shrink-0">
            Nama Anggota
          </label>
          <div className="relative flex-1 max-w-md">
            <select
              value={anggotaId}
              onChange={(e) => onAnggotaIdChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white appearance-none pr-10"
            >
              <option value="">Semua Data Anggota Aktif...</option>
              {anggotaList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nama} | {a.nik}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {showJenisSimpanan && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="w-40 text-sm font-medium text-gray-600 shrink-0">
              Jenis Simpanan
            </label>
            <div className="relative flex-1 max-w-md">
              <select
                value={jenisSimpanan}
                onChange={(e) => onJenisSimpananChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white appearance-none pr-10"
              >
                <option value="">Semua Data ...</option>
                {jenisSimpananList.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.nama}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {showPerusahaan && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="w-40 text-sm font-medium text-gray-600 shrink-0">
              Perusahaan
            </label>
            <div className="relative flex-1 max-w-md">
              <select
                value={perusahaan}
                onChange={(e) => onPerusahaanChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white appearance-none pr-10"
              >
                <option value="">Semua Data ...</option>
                {perusahaanList.map((p, i) => (
                  <option key={i} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        <hr className="border-gray-200" />

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="w-40 text-sm font-medium text-gray-600 shrink-0">
            Output
          </label>
          <div className="flex flex-col gap-2">
            {["html", "excel"].map((fmt) => (
              <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="output"
                  value={fmt}
                  checked={outputFormat === fmt}
                  onChange={() => onOutputFormatChange(fmt)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 font-medium uppercase">
                  {fmt}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-8 pt-6 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <Search className="w-4 h-4" />
          {loading ? "Memuat..." : "Lihat"}
        </button>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-all shadow-sm active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    </form>
  );
}
