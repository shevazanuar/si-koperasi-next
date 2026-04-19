"use client";

import { Download, FileBarChart, FileText } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import { useState } from "react";

export default function ExportControls({ data, title, subtitle, fileName }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportExcel = () => {
    // Flatten data for Excel
    const excelData = data.map(item => ({
      "Kategori / Jenis": item.nama || item.title || '-',
      "Jumlah Transaksi": item.count || 0,
      "Total Nominal": item.total || 0,
      "Keterangan": item.keterangan || '-'
    }));

    // Add Grand Total row
    const grandTotal = data.reduce((sum, item) => sum + (item.total || 0), 0);
    excelData.push({
      "Kategori / Jenis": "GRAND TOTAL",
      "Jumlah Transaksi": data.reduce((sum, item) => sum + (item.count || 0), 0),
      "Total Nominal": grandTotal,
      "Keterangan": ""
    });

    exportToExcel(excelData, `${fileName}-excel`, title);
    setIsOpen(false);
  };

  const handleExportPDF = () => {
    const head = ["Jenis / Kategori", "Jml Transaksi", "Total Nominal"];
    const body = data.map(item => [
      item.nama || item.title,
      item.count.toString(),
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.total)
    ]);

    // Add Grand Total
    const grandTotal = data.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalCount = data.reduce((sum, item) => sum + (item.count || 0), 0);
    body.push(["GRAND TOTAL", totalCount.toString(), new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(grandTotal)]);

    exportToPDF({
      title,
      subtitle,
      head,
      body,
      fileName: `${fileName}-pdf`
    });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-900 border border-gray-800 text-white px-5 py-2.5 rounded-2xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-xl shadow-gray-200/50 active:scale-95"
      >
        <Download className="w-4 h-4" />
        Export Laporan
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
             <button 
               onClick={handleExportExcel}
               className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50 text-emerald-700 rounded-xl transition-colors group"
             >
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <FileBarChart className="w-4 h-4" />
                </div>
                <div>
                   <p className="text-xs font-bold">Export to Excel</p>
                   <p className="text-[10px] text-emerald-600/60 font-medium">Format (.xlsx)</p>
                </div>
             </button>
             <button 
               onClick={handleExportPDF}
               className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-rose-50 text-rose-700 rounded-xl transition-colors group mt-1"
             >
                <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all">
                    <FileText className="w-4 h-4" />
                </div>
                <div>
                   <p className="text-xs font-bold">Export to PDF</p>
                   <p className="text-[10px] text-rose-600/60 font-medium">Format (.pdf)</p>
                </div>
             </button>
          </div>
        </>
      )}
    </div>
  );
}
