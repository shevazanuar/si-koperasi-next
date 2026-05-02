"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, X, Check, Loader2, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

export default function ImportExcelButton({ 
  type, 
  title = "Import Data", 
  apiUrl,
  onSuccess 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setPreviewData(data.slice(0, 5)); // Show first 5 rows
        setStatus({ type: null, message: "" });
      } catch (error) {
        setStatus({ type: "error", message: "Gagal membaca file Excel. Pastikan format benar." });
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setStatus({ type: "loading", message: "Sedang mengimpor data..." });

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        });

        const result = await response.json();

        if (response.ok) {
          setStatus({ type: "success", message: `Berhasil mengimpor ${result.count || data.length} data.` });
          if (onSuccess) setTimeout(onSuccess, 1500);
          setTimeout(() => setIsOpen(false), 2000);
        } else {
          setStatus({ type: "error", message: result.error || "Gagal mengimpor data." });
        }
        setLoading(false);
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      setStatus({ type: "error", message: "Terjadi kesalahan saat proses impor." });
      setLoading(false);
    }
  };

  const closeModal = () => {
    if (loading) return;
    setIsOpen(false);
    setFile(null);
    setPreviewData([]);
    setStatus({ type: null, message: "" });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-emerald-100 flex items-center gap-2 shadow-sm active:scale-95"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Import Excel
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{title}</h3>
                  <p className="text-xs text-gray-500">Pilih file Excel (.xlsx atau .csv)</p>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8">
              {!file ? (
                <label className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center group hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer">
                  <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileChange} />
                  <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-gray-700 mb-1">Klik untuk pilih file</p>
                  <p className="text-xs text-gray-400">Pastikan format kolom sesuai dengan data {type}</p>
                </label>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                     <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-emerald-900 text-sm">{file.name}</span>
                     </div>
                     <button 
                        onClick={() => { setFile(null); setPreviewData([]); }}
                        className="text-[10px] font-black uppercase text-rose-600 hover:text-rose-700"
                        disabled={loading}
                     >
                        Ganti File
                     </button>
                  </div>

                  {previewData.length > 0 && (
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Preview 5 Data Pertama</p>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                            <table className="w-full text-left text-[10px]">
                                <thead className="bg-gray-100 text-gray-500 font-bold uppercase sticky top-0">
                                    <tr>
                                        {Object.keys(previewData[0]).map(key => (
                                            <th key={key} className="p-2 border-b border-gray-200">{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.map((row, i) => (
                                        <tr key={i} className="bg-white hover:bg-gray-50">
                                            {Object.values(row).map((val, j) => (
                                                <td key={j} className="p-2 border-b border-gray-50 text-gray-600 truncate max-w-[100px]">{String(val)}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                  )}

                  {status.message && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${
                        status.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 
                        status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                        {status.type === 'error' ? <AlertCircle className="w-5 h-5" /> : 
                         status.type === 'success' ? <Check className="w-5 h-5" /> : 
                         <Loader2 className="w-5 h-5 animate-spin" />}
                        <p className="text-xs font-bold">{status.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                <button 
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Batal
                </button>
                <button 
                  onClick={handleImport}
                  disabled={!file || loading}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:shadow-none text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Mulai Impor
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
