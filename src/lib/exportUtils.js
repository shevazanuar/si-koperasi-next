import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to Excel (.xlsx)
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Desired file name
 * @param {String} sheetName - Name of the worksheet
 */
export const exportToExcel = (data, fileName = 'laporan-koperasi', sheetName = 'Laporan') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

/**
 * Export data to PDF
 * @param {Object} options - Configuration options
 * @param {String} options.title - Document title
 * @param {String} options.subtitle - Document subtitle (e.g., period)
 * @param {Array} options.head - Array of table headers
 * @param {Array} options.body - Array of table rows
 * @param {String} options.fileName - Desired file name
 */
export const exportToPDF = ({ title, subtitle, head, body, fileName = 'laporan-koperasi' }) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Title
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 14, 22);

  // Subtitle / Period
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(subtitle, 14, 30);

  // Decorative blue line
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(14, 34, 196, 34);

  // Generate Table using the functional syntax
  autoTable(doc, {
    startY: 40,
    head: [head],
    body: body,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
        // Footer (Page number)
        const str = `Halaman ${doc.internal.getNumberOfPages()}`;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(str, 196, doc.internal.pageSize.height - 10, { align: 'right' });
    }
  });

  doc.save(`${fileName}.pdf`);
};
