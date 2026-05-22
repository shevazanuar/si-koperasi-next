'use client';

import { useState } from 'react';
import { generateLaporanPendapatan } from './actions';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function LaporanPendapatanPage() {
  const [reportType, setReportType] = useState('bulanan');
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);

    const bulanParam = reportType === 'bulanan' ? bulan : null;
    const result = await generateLaporanPendapatan(tahun, bulanParam);

    if (result.success) {
      setData(result);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const handlePrintPdf = () => {
    if (!data) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('Laporan Pendapatan Koperasi', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Periode: ${data.periode}`, 14, 30);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 36);

    // Tabel
    const tableColumn = ["No", "Jenis Pendapatan", "Nominal"];
    const tableRows = [];

    data.data.forEach((item, index) => {
      const rowData = [
        index + 1,
        item.jenis_pendapatan,
        formatRupiah(item.nominal)
      ];
      tableRows.push(rowData);
    });

    // Total Row
    tableRows.push(["", "TOTAL PENDAPATAN", formatRupiah(data.total)]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 100 },
        2: { cellWidth: 'auto', halign: 'right' }
      },
      didParseCell: function (data) {
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 240];
        }
      }
    });

    const fileName = `Laporan_Pendapatan_${data.periode.replace(/ /g, '_')}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Pendapatan</h1>
        <p className="text-gray-600 mt-1">Hasilkan dan cetak laporan pendapatan berdasarkan periode waktu.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4 items-end">
          
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Laporan</label>
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
            >
              <option value="bulanan">Bulanan</option>
              <option value="tahunan">Tahunan</option>
            </select>
          </div>

          {reportType === 'bulanan' && (
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
              <select 
                value={bulan} 
                onChange={(e) => setBulan(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>
                    {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
            <input 
              type="number" 
              value={tahun} 
              onChange={(e) => setTahun(e.target.value)}
              min="2000" 
              max="2100"
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Memuat...' : 'Tampilkan Data'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {data && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Hasil Laporan</h2>
              <p className="text-sm text-gray-500">Periode: {data.periode}</p>
            </div>
            <button 
              onClick={handlePrintPdf}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Cetak PDF
            </button>
          </div>
          
          <div className="p-6">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700 uppercase">
                <tr>
                  <th className="px-4 py-3 rounded-tl-md">Jenis Pendapatan</th>
                  <th className="px-4 py-3 rounded-tr-md text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.data.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{item.jenis_pendapatan}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatRupiah(item.nominal)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="px-4 py-4 font-bold text-gray-900 text-right">TOTAL KESELURUHAN</td>
                  <td className="px-4 py-4 text-right font-bold text-green-700 text-lg">{formatRupiah(data.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
