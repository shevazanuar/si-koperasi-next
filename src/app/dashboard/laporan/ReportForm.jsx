"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Printer,
  FileText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Wallet,
  CreditCard,
  ArrowDownCircle,
  Receipt,
  AlertTriangle,
  Layers,
  Filter,
} from "lucide-react";
import { exportToExcel } from "@/lib/exportUtils";
import CustomSelect from "@/components/CustomSelect";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);

const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(value || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  if (typeof dateStr === "string" && dateStr.trim() === "") return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatGender = (val) => (val === "L" ? "Laki-laki" : "Perempuan");

// Column definitions per report type (defined here to avoid passing functions from server to client)
const COLUMN_DEFS = {
  simpanan: [
    { key: "no", label: "No", align: "center" },
    { key: "nomor", label: "Nomor", align: "center" },
    { key: "tgl", label: "Tanggal", align: "center", formatType: "date" },
    { key: "nik", label: "NIK", align: "center" },
    { key: "nama_anggota", label: "Nama", bold: true },
    { key: "jk", label: "Kelamin", align: "center", formatType: "gender" },
    { key: "perusahaan", label: "Perusahaan" },
    { key: "nama_simpanan", label: "Jenis", align: "center" },
    {
      key: "jumlah",
      label: "Jumlah",
      align: "right",
      bold: true,
      formatType: "currency",
      totalKey: "jumlah",
    },
  ],
  penarikan: [
    { key: "no", label: "No", align: "center" },
    { key: "nomor", label: "Nomor", align: "center" },
    { key: "tgl", label: "Tanggal", align: "center", formatType: "date" },
    { key: "nik", label: "NIK", align: "center" },
    { key: "nama_anggota", label: "Nama", bold: true },
    { key: "jk", label: "Kelamin", align: "center", formatType: "gender" },
    { key: "nama_simpanan", label: "Jenis", align: "center" },
    {
      key: "jumlah",
      label: "Jumlah",
      align: "right",
      bold: true,
      formatType: "currency",
      totalKey: "jumlah",
    },
  ],
  pinjaman: [
    { key: "no", label: "No", align: "center" },
    { key: "nomor", label: "Nomor", align: "center" },
    { key: "tgl", label: "Tanggal", align: "center", formatType: "date" },
    { key: "nik", label: "NIK", align: "center" },
    { key: "nama_anggota", label: "Nama", bold: true },
    { key: "jk", label: "Kelamin", align: "center", formatType: "gender" },
    { key: "nama_pinjaman", label: "Jenis", align: "center" },
    { key: "lama", label: "Lama", align: "center" },
    { key: "satuan", label: "Satuan", align: "center" },
    {
      key: "bunga",
      label: "Bunga",
      align: "center",
      formatType: "percent",
    },
    {
      key: "jumlah",
      label: "Jumlah",
      align: "right",
      bold: true,
      formatType: "currency",
      totalKey: "jumlah",
    },
  ],
  pembayaran: [
    { key: "no", label: "No", align: "center" },
    { key: "nomor_bayar", label: "Nomor", align: "center" },
    {
      key: "tgl_bayar",
      label: "Tanggal",
      align: "center",
      formatType: "date",
    },
    { key: "nik", label: "NIK", align: "center" },
    { key: "nama_anggota", label: "Nama", bold: true },
    { key: "jk", label: "Kelamin", align: "center", formatType: "gender" },
    { key: "nama_pinjaman", label: "Jenis", align: "center" },
    { key: "cicilan", label: "Cicilan", align: "center" },
    {
      key: "pokok_bunga",
      label: "Pokok+Bunga",
      align: "right",
      formatType: "pokok_bunga",
    },
    {
      key: "jumlah_bayar",
      label: "Jumlah",
      align: "right",
      bold: true,
      formatType: "currency",
      totalKey: "jumlah_bayar",
    },
  ],
  tunggakan: [
    { key: "no", label: "No", align: "center" },
    { key: "nomor_bayar", label: "Nomor", align: "center" },
    {
      key: "tgl_jatuh_tempo",
      label: "Tanggal JT",
      align: "center",
      formatType: "date",
    },
    { key: "nik", label: "NIK", align: "center" },
    { key: "nama_anggota", label: "Nama", bold: true },
    { key: "jk", label: "Kelamin", align: "center", formatType: "gender" },
    { key: "nama_pinjaman", label: "Jenis", align: "center" },
    { key: "cicilan", label: "Cicilan", align: "center" },
    {
      key: "pokok_bunga",
      label: "Pokok+Bunga",
      align: "right",
      bold: true,
      formatType: "pokok_bunga",
      totalKey: "pokok_bunga",
      totalCalcType: "pokok_bunga",
    },
  ],
};

function formatValue(val, formatType, row) {
  switch (formatType) {
    case "date":
      return formatDate(val);
    case "currency":
      return formatCurrency(val);
    case "number":
      return formatNumber(val);
    case "gender":
      return formatGender(val);
    case "percent":
      return val != null ? `${val} %` : "-";
    case "pokok_bunga":
      return formatCurrency((row?.angsuran || 0) + (row?.bunga || 0));
    default:
      return val ?? "-";
  }
}

function calculateTotal(data, col) {
  if (!col.totalKey) return 0;
  if (col.totalCalcType === "pokok_bunga") {
    return data.reduce(
      (sum, row) => sum + (row.angsuran || 0) + (row.bunga || 0),
      0
    );
  }
  return data.reduce((sum, row) => sum + (row[col.totalKey] || 0), 0);
}

const LIMIT_OPTIONS = [25, 50, 100];

const printHexMap = {
  blue: { bg: "#2563eb", border: "#1d4ed8" },
  green: { bg: "#059669", border: "#047857" },
  orange: { bg: "#ea580c", border: "#c2410c" },
  purple: { bg: "#9333ea", border: "#7e22ce" },
  red: { bg: "#dc2626", border: "#b91c1c" },
};

const dynamicColorMap = {
  blue: {
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
    bg: "bg-blue-600",
    hoverBg: "hover:bg-blue-700",
    ring: "focus:ring-blue-500/20",
    badgeText: "text-blue-700",
    headerBg: "bg-blue-50",
    headerBorder: "border-blue-200",
    headerText: "text-blue-700",
    lightBg: "bg-blue-50",
  },
  green: {
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    bg: "bg-emerald-600",
    hoverBg: "hover:bg-emerald-700",
    ring: "focus:ring-emerald-500/20",
    badgeText: "text-emerald-700",
    headerBg: "bg-emerald-50",
    headerBorder: "border-emerald-200",
    headerText: "text-emerald-700",
    lightBg: "bg-emerald-50",
  },
  orange: {
    iconBg: "bg-orange-50",
    iconText: "text-orange-600",
    bg: "bg-orange-600",
    hoverBg: "hover:bg-orange-700",
    ring: "focus:ring-orange-500/20",
    badgeText: "text-orange-700",
    headerBg: "bg-orange-50",
    headerBorder: "border-orange-200",
    headerText: "text-orange-700",
    lightBg: "bg-orange-50",
  },
  red: {
    iconBg: "bg-red-50",
    iconText: "text-red-600",
    bg: "bg-red-600",
    hoverBg: "hover:bg-red-700",
    ring: "focus:ring-red-500/20",
    badgeText: "text-red-700",
    headerBg: "bg-red-50",
    headerBorder: "border-red-200",
    headerText: "text-red-700",
    lightBg: "bg-red-50",
  },
  purple: {
    iconBg: "bg-purple-50",
    iconText: "text-purple-600",
    bg: "bg-purple-600",
    hoverBg: "hover:bg-purple-700",
    ring: "focus:ring-purple-500/20",
    badgeText: "text-purple-700",
    headerBg: "bg-purple-50",
    headerBorder: "border-purple-200",
    headerText: "text-purple-700",
    lightBg: "bg-purple-50",
  },
};

const dynamicIconMap = {
  simpanan: Wallet,
  penarikan: ArrowDownCircle,
  pinjaman: CreditCard,
  pembayaran: Receipt,
  tunggakan: AlertTriangle,
};

export default function ReportForm({
  title,
  type,
  anggotaList = [],
  jenisSimpananList = [],
  perusahaanList = [],
  showDariTanggal = true,
  showSampaiTanggal = true,
  showJenisSimpanan = false,
  showPerusahaan = false,
  tanggalLabel = "Dari Tanggal",
  accentColor = "blue",
}) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [anggotaId, setAnggotaId] = useState("");
  const [jenisSimpanan, setJenisSimpanan] = useState("");
  const [perusahaan, setPerusahaan] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const tableRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [pagination, setPagination] = useState(null);
  const [q, setQ] = useState("");

  const limitOptions = LIMIT_OPTIONS.map(opt => ({ value: String(opt), label: `${opt} Data` }));

  const filteredData = data
    ? data.filter((row) => {
        if (!q) return true;
        const query = q.toLowerCase();
        return (
          (row.nomor && row.nomor.toLowerCase().includes(query)) ||
          (row.nomor_bayar && row.nomor_bayar.toLowerCase().includes(query)) ||
          (row.nama_anggota && row.nama_anggota.toLowerCase().includes(query)) ||
          (row.nik && row.nik.toLowerCase().includes(query))
        );
      })
    : [];

  const handleJenisSimpananChange = (val) => {
    setJenisSimpanan(val);
    fetchData(1, perPage, val);
  };

  const columns = COLUMN_DEFS[type] || [];

  useEffect(() => {
    fetchData(1, perPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async (page = currentPage, limit = perPage, overrideJenisSimpanan = jenisSimpanan) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ type });
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      if (anggotaId) params.set("anggota_id", anggotaId);
      
      const jsVal = overrideJenisSimpanan;
      if (jsVal) params.set("jenis_simpanan", jsVal);
      if (perusahaan) params.set("perusahaan", perusahaan);
      params.set("page", page.toString());
      params.set("limit", limit.toString());

      const res = await fetch(`/api/laporan?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Gagal memuat data");
      setData(json.data);
      setPagination(json.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
      setData(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLihat = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData(1, perPage);
  };

  const handleRefresh = (e) => {
    e.preventDefault();
    setFromDate("");
    setToDate("");
    setAnggotaId("");
    setJenisSimpanan("");
    setPerusahaan("");
    setData(null);
    setError(null);
    setPagination(null);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) return;
    fetchData(newPage, perPage);
  };

  const handlePerPageChange = (newLimit) => {
    setPerPage(newLimit);
    setCurrentPage(1);
    fetchData(1, newLimit);
  };

  const handleCetakExcel = (e) => {
    e.preventDefault();
    if (!data || data.length === 0) return;

    const startNo = pagination ? (pagination.page - 1) * pagination.limit : 0;

    const excelData = data.map((row, idx) => {
      const obj = { No: startNo + idx + 1 };
      columns.forEach((col) => {
        if (col.key === "no") return;
        obj[col.label] = formatValue(row[col.key], col.formatType, row);
      });
      return obj;
    });

    // Add total row
    const totalRow = { No: "" };
    let firstDataCol = true;
    columns.forEach((col) => {
      if (col.key === "no") return;
      if (firstDataCol) {
        totalRow[col.label] = "TOTAL";
        firstDataCol = false;
      } else if (col.totalKey) {
        totalRow[col.label] = formatValue(
          calculateTotal(data, col),
          "currency"
        );
      } else {
        totalRow[col.label] = "";
      }
    });
    excelData.push(totalRow);

    exportToExcel(excelData, `${title.replace(/\s/g, "_")}`, title);
  };

  const handleCetakPDF = (e) => {
    e.preventDefault();
    if (!data || data.length === 0) return;

    // HTML - print table
    if (tableRef.current) {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h2 { margin-bottom: 5px; color: #333; }
            .subtitle { color: #666; font-size: 14px; margin-bottom: 15px; }
            table { border-collapse: collapse; width: 100%; font-size: 12px; }
            th { background: ${printHexMap[accentColor]?.bg || "#2563eb"}; color: white; padding: 8px 6px; text-align: center; border: 1px solid ${printHexMap[accentColor]?.border || "#1d4ed8"}; }
            td { padding: 6px; border: 1px solid #ddd; }
            tr:nth-child(even) { background: #f8f9fa; }
            tr:hover { background: #e3e8f0; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .total-row { font-weight: bold; background: ${accentColor === "green" ? "#ecfdf5" : accentColor === "orange" ? "#fff7ed" : accentColor === "purple" ? "#faf5ff" : accentColor === "red" ? "#fef2f2" : "#eff6ff"} !important; }
            @media print { body { margin: 10px; } }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <div class="subtitle">
            ${fromDate ? `Dari: ${formatDate(fromDate)}` : ""}
            ${toDate ? ` s/d ${formatDate(toDate)}` : ""}
            ${pagination ? ` | Halaman ${pagination.page} dari ${pagination.totalPages} (${pagination.totalCount} data)` : ""}
          </div>
          ${tableRef.current.outerHTML}
          <script>window.print();<\/script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const theme = dynamicColorMap[accentColor] || dynamicColorMap.blue;
  const colors = theme;
  const IconComponent = dynamicIconMap[type] || FileText;

  const historyTitleMap = {
    simpanan: "History Laporan Simpanan Terbaru",
    penarikan: "History Laporan Penarikan Terbaru",
    pinjaman: "History Laporan Pinjaman Terbaru",
    pembayaran: "History Laporan Pembayaran Terbaru",
    tunggakan: "History Laporan Tunggakan Terbaru",
  };

  const historyTitle = historyTitleMap[type] || "History Laporan Terbaru";

  // Calculate row number offset for pagination
  const rowOffset = pagination ? (pagination.page - 1) * pagination.limit : 0;

  // Generate page numbers for pagination display
  const getPageNumbers = () => {
    if (!pagination) return [];
    const { page, totalPages } = pagination;
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`${theme.iconBg} p-2.5 rounded-xl ${theme.iconText}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">Laporan keuangan koperasi berdasarkan periode dan filter</p>
          </div>
        </div>
      </div>

      {/* Report Form Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Form Body */}
        <form className="p-6 sm:p-8" onSubmit={handleLihat}>
          <div className="grid gap-5 xl:grid-cols-4">
            {/* Dari Tanggal */}
            {showDariTanggal && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  {showSampaiTanggal ? "Dari Tanggal" : tanggalLabel}
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-300 bg-white"
                />
              </div>
            )}

            {/* Sampai Tanggal */}
            {showSampaiTanggal && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-300 bg-white"
                />
              </div>
            )}

            {/* Nama Anggota */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Nama Anggota</label>
              <div className="relative">
                <select
                  value={anggotaId}
                  onChange={(e) => setAnggotaId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-300 bg-white appearance-none pr-10"
                >
                  <option value="">Semua Data Anggota Aktif...</option>
                  {anggotaList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nama} | {a.nik}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Jenis Simpanan (only for simpanan) */}
            {showJenisSimpanan && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">Jenis Simpanan</label>
                <div className="relative">
                  <select
                    value={jenisSimpanan}
                    onChange={(e) => setJenisSimpanan(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-300 bg-white appearance-none pr-10"
                  >
                    <option value="">Semua Data ...</option>
                    {jenisSimpananList.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.nama}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Perusahaan */}
            {showPerusahaan && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">Perusahaan</label>
                <div className="relative">
                  <select
                    value={perusahaan}
                    onChange={(e) => setPerusahaan(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-300 bg-white appearance-none pr-10"
                  >
                    <option value="">Semua Data ...</option>
                    {perusahaanList.map((p, i) => (
                      <option key={i} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}


          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 ${theme.bg} ${theme.hoverBg} focus:outline-none focus:ring-2 ${theme.ring}`}
            >
              <Search className="w-4 h-4" />
              {loading ? "Memuat..." : "LIHAT"}
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-500 text-white text-sm font-semibold rounded-xl hover:bg-slate-600 transition-all shadow-sm active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              REFRESH
            </button>

            <button
              type="button"
              onClick={handleCetakExcel}
              disabled={!data || data.length === 0}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              CETAK EXCEL
            </button>

            <button
              type="button"
              onClick={handleCetakPDF}
              disabled={!data || data.length === 0}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              CETAK PDF
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Data Table */}
      {data && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 rounded-t-2xl">
            <div className="flex items-center gap-4">
              <div className="flex items-center p-1 pl-3 bg-white border border-gray-200 rounded-xl transition-all shadow-sm hover:shadow-md hover:border-blue-200">
                <div className="flex items-center gap-2 border-r border-gray-100 pr-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tampilkan</span>
                </div>
                <CustomSelect 
                  options={limitOptions}
                  value={String(perPage)}
                  onChange={(val) => handlePerPageChange(parseInt(val))}
                  className="w-28"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 sm:justify-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nomor / nama / NIK..."
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all w-72 bg-white"
                />
              </div>

              {showJenisSimpanan && (
                <div className="flex items-center p-1 pl-3 bg-white border border-gray-200 rounded-xl transition-all shadow-sm hover:shadow-md hover:border-blue-200">
                  <div className="flex items-center gap-2 border-r border-gray-100 pr-2">
                    <Filter className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Filter</span>
                  </div>
                  <CustomSelect 
                    options={[
                      { value: "", label: "Semua Jenis" },
                      ...jenisSimpananList.map(j => ({ value: String(j.id), label: j.nama }))
                    ]}
                    value={jenisSimpanan}
                    onChange={handleJenisSimpananChange}
                    placeholder="Semua Jenis"
                    className="w-44"
                  />
                </div>
              )}
            </div>

            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              {filteredData.length} Record
            </div>
          </div>

          <div className="overflow-x-auto">
            <table ref={tableRef} className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500 ${
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                          ? "text-center"
                          : "text-left"
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="py-12 text-center text-gray-400 italic"
                    >
                      Tidak ada data untuk filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredData.map((row, idx) => (
                      <tr
                        key={row.id || idx}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            className={`py-3 px-4 ${
                              col.align === "right"
                                  ? "text-right"
                                  : col.align === "center"
                                  ? "text-center"
                                  : ""
                            } ${
                              col.bold
                                ? "font-semibold text-gray-900"
                                : "text-gray-700"
                            }`}
                          >
                            {col.key === "no"
                              ? rowOffset + idx + 1
                              : formatValue(row[col.key], col.formatType, row)}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Total Row */}
                          <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                      {columns.map((col, colIdx) => {
                        if (col.key === "no") {
                          return (
                            <td
                              key={col.key}
                              className="py-3 px-4 text-center"
                            ></td>
                          );
                        }
                        if (colIdx === 1) {
                          return (
                            <td
                              key={col.key}
                              className="py-3 px-4 text-center font-bold text-gray-800 uppercase text-xs tracking-wider"
                            >
                              TOTAL
                            </td>
                          );
                        }
                        if (col.totalKey) {
                          const total = calculateTotal(filteredData, col);
                          return (
                            <td
                              key={col.key}
                              className="py-3 px-4 text-right font-bold text-gray-900"
                            >
                              {formatCurrency(total)}
                            </td>
                          );
                        }
                        return (
                          <td key={col.key} className="py-3 px-4"></td>
                        );
                      })}
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Info */}
              <div className="text-xs text-gray-500">
                Menampilkan{" "}
                <span className="font-semibold text-gray-700">
                  {formatNumber(rowOffset + 1)}
                </span>
                {" - "}
                <span className="font-semibold text-gray-700">
                  {formatNumber(Math.min(rowOffset + pagination.limit, pagination.totalCount))}
                </span>
                {" dari "}
                <span className="font-semibold text-gray-700">
                  {formatNumber(pagination.totalCount)}
                </span>
                {" data"}
              </div>

              {/* Page buttons */}
              <div className="flex items-center gap-1">
                {/* First */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1 || loading}
                  className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Halaman pertama"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                {/* Prev */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Halaman sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {getPageNumbers()[0] > 1 && (
                  <span className="px-1 text-gray-400 text-xs">...</span>
                )}
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`min-w-[36px] h-9 rounded-xl text-sm font-semibold transition-all ${
                      pageNum === currentPage
                        ? `text-white shadow-md ${theme.bg}`
                        : "text-gray-600 hover:bg-gray-100"
                    } disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                ))}
                {getPageNumbers()[getPageNumbers().length - 1] < pagination.totalPages && (
                  <span className="px-1 text-gray-400 text-xs">...</span>
                )}

                {/* Next */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages || loading}
                  className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Halaman berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {/* Last */}
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={currentPage === pagination.totalPages || loading}
                  className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Halaman terakhir"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
