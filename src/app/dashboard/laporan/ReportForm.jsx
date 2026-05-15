"use client";

import { useState, useRef } from "react";
import {
  Search,
  RefreshCw,
  Printer,
  FileText,
  ChevronDown,
} from "lucide-react";
import { exportToExcel } from "@/lib/exportUtils";

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
  const [outputFormat, setOutputFormat] = useState("html");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const tableRef = useRef(null);

  const columns = COLUMN_DEFS[type] || [];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ type });
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      if (anggotaId) params.set("anggota_id", anggotaId);
      if (jenisSimpanan) params.set("jenis_simpanan", jenisSimpanan);
      if (perusahaan) params.set("perusahaan", perusahaan);

      const res = await fetch(`/api/laporan?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Gagal memuat data");
      setData(json.data);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLihat = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleRefresh = (e) => {
    e.preventDefault();
    setFromDate("");
    setToDate("");
    setAnggotaId("");
    setJenisSimpanan("");
    setPerusahaan("");
    setOutputFormat("html");
    setData(null);
    setError(null);
  };

  const handleCetak = (e) => {
    e.preventDefault();
    if (!data || data.length === 0) return;

    if (outputFormat === "excel") {
      const excelData = data.map((row, idx) => {
        const obj = { No: idx + 1 };
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
    } else {
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
              th { background: #B47B5A; color: white; padding: 8px 6px; text-align: center; border: 1px solid #9C6141; }
              td { padding: 6px; border: 1px solid #ddd; }
              tr:nth-child(even) { background: #f8f9fa; }
              tr:hover { background: #e3e8f0; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .total-row { font-weight: bold; background: #FDF3E7 !important; }
              @media print { body { margin: 10px; } }
            </style>
          </head>
          <body>
            <h2>${title}</h2>
            <div class="subtitle">
              ${fromDate ? `Dari: ${formatDate(fromDate)}` : ""}
              ${toDate ? ` s/d ${formatDate(toDate)}` : ""}
            </div>
            ${tableRef.current.outerHTML}
            <script>window.print();<\/script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const colorMap = {
    blue: {
      headerBg: "bg-blue-50",
      headerBorder: "border-blue-200",
      headerText: "text-blue-700",
      lightBg: "bg-blue-50",
    },
    orange: {
      headerBg: "bg-orange-50",
      headerBorder: "border-orange-200",
      headerText: "text-orange-700",
      lightBg: "bg-orange-50",
    },
    green: {
      headerBg: "bg-emerald-50",
      headerBorder: "border-emerald-200",
      headerText: "text-emerald-700",
      lightBg: "bg-emerald-50",
    },
    red: {
      headerBg: "bg-red-50",
      headerBorder: "border-red-200",
      headerText: "text-red-700",
      lightBg: "bg-red-50",
    },
    purple: {
      headerBg: "bg-purple-50",
      headerBorder: "border-purple-200",
      headerText: "text-purple-700",
      lightBg: "bg-purple-50",
    },
  };

  const colors = colorMap[accentColor] || colorMap.blue;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Report Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div
          className={`px-6 py-4 ${colors.headerBg} border-b ${colors.headerBorder}`}
        >
          <h1
            className={`text-lg font-semibold ${colors.headerText} flex items-center gap-2`}
          >
            <FileText className="w-5 h-5" />
            {title}
          </h1>
        </div>

        {/* Form Body */}
        <form className="p-6" onSubmit={handleLihat}>
          <div className="space-y-5">
            {/* Dari Tanggal */}
            {showDariTanggal && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="w-40 text-sm font-medium text-gray-600 shrink-0">
                  {showSampaiTanggal ? "Dari Tanggal" : tanggalLabel}
                </label>
                <div className="relative flex-1 max-w-xs">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white"
                  />
                </div>
              </div>
            )}

            {/* Sampai Tanggal */}
            {showSampaiTanggal && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="w-40 text-sm font-medium text-gray-600 shrink-0">
                  Sampai Tanggal
                </label>
                <div className="relative flex-1 max-w-xs">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-white"
                  />
                </div>
              </div>
            )}

            {/* Nama Anggota */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="w-40 text-sm font-medium text-gray-600 shrink-0">
                Nama Anggota
              </label>
              <div className="relative flex-1 max-w-md">
                <select
                  value={anggotaId}
                  onChange={(e) => setAnggotaId(e.target.value)}
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

            {/* Jenis Simpanan (only for simpanan) */}
            {showJenisSimpanan && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="w-40 text-sm font-medium text-gray-600 shrink-0">
                  Jenis Simpanan
                </label>
                <div className="relative flex-1 max-w-md">
                  <select
                    value={jenisSimpanan}
                    onChange={(e) => setJenisSimpanan(e.target.value)}
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

            {/* Perusahaan */}
            {showPerusahaan && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="w-40 text-sm font-medium text-gray-600 shrink-0">
                  Perusahaan
                </label>
                <div className="relative flex-1 max-w-md">
                  <select
                    value={perusahaan}
                    onChange={(e) => setPerusahaan(e.target.value)}
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

            {/* Divider */}
            <hr className="border-gray-200" />

            {/* Output Format */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="w-40 text-sm font-medium text-gray-600 shrink-0">
                Output
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="output"
                    value="html"
                    checked={outputFormat === "html"}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    HTML
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="output"
                    value="excel"
                    checked={outputFormat === "excel"}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    EXCEL
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-all shadow-sm active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleCetak}
              disabled={!data || data.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white text-sm font-semibold rounded-lg hover:bg-sky-600 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              Cetak
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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div
            className={`px-6 py-4 ${colors.headerBg} border-b ${colors.headerBorder}`}
          >
            <h3
              className={`font-semibold ${colors.headerText} flex items-center gap-2 text-sm`}
            >
              Data Detail
              <span className="text-xs font-normal text-gray-500">
                ({data.length} data)
              </span>
            </h3>
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
                {data.length === 0 ? (
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
                    {data.map((row, idx) => (
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
                              ? idx + 1
                              : formatValue(row[col.key], col.formatType, row)}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Total Row */}
                    <tr
                      className={`${colors.lightBg} font-bold border-t-2 border-gray-200`}
                    >
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
                          const total = calculateTotal(data, col);
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
        </div>
      )}
    </div>
  );
}
