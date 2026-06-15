import prisma from "@/lib/prisma";
import { Plus, MonitorPlay } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AsetTetapPage() {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const asetRaw = await prisma.$queryRawUnsafe(`
    SELECT a.*, k.nama_kategori 
    FROM aset_tetap a
    LEFT JOIN kategori_aset_tetap k ON a.kategori_id = k.id
    ORDER BY a.tanggal_pembelian DESC
  `);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const asetList = asetRaw.map(a => {
    const nilai_pembelian = typeof a.nilai_pembelian === 'string' ? parseFloat(a.nilai_pembelian) : a.nilai_pembelian;
    const nilai_residu = typeof a.nilai_residu === 'string' ? parseFloat(a.nilai_residu) : (a.nilai_residu || 0);
    const penyusutanPerBulan = typeof a.penyusutan_per_bulan === 'string' ? parseFloat(a.penyusutan_per_bulan) : (a.penyusutan_per_bulan || 0);
    const masa_manfaat = a.masa_manfaat;
    const tgl_beli = new Date(a.tanggal_pembelian);
    const tgl_henti = a.tanggal_penghentian ? new Date(a.tanggal_penghentian) : null;
    
    let penyusutanFiskal = 0;
    let akumulasiPenyusutan = 0;

    // Kalkulasi bulanan dari tahun beli sampai tahun saat ini
    for (let y = tgl_beli.getFullYear(); y <= currentYear; y++) {
      // Loop Januari (0) sampai Desember (11)
      for (let m = 0; m <= 11; m++) {
        // Abaikan bulan sebelum bulan pembelian pada tahun pertama
        if (y === tgl_beli.getFullYear() && m < tgl_beli.getMonth()) continue;
        
        // Abaikan bulan-bulan setelah bulan saat ini jika kita hanya ingin akumulasi hingga hari ini
        // Namun, jika Excel menghitung FULL 12 bulan di tahun berjalan, kita hitung 12 bulan (asalkan belum bulan depan?
        // Sesuai standar, akumulasi dihitung s.d. bulan berjalan.
        if (y === currentYear && m > currentDate.getMonth()) continue;

        const monthDate = new Date(y, m, 1);

        // Jika aset dihentikan dan bulan ini setelah bulan penghentian, stop penyusutan
        if (tgl_henti) {
           const hentiBulan = new Date(tgl_henti.getFullYear(), tgl_henti.getMonth(), 1);
           if (monthDate > hentiBulan) continue;
        }

        // Umur aset pada bulan ini (dalam bulan)
        const umurBulanKe = (y - tgl_beli.getFullYear()) * 12 + (m - tgl_beli.getMonth()) + 1;

        if (umurBulanKe <= masa_manfaat) {
          akumulasiPenyusutan += penyusutanPerBulan;
          
          if (y === currentYear) {
            penyusutanFiskal += penyusutanPerBulan;
          }
        }
      }
    }

    const nilaiBuku = nilai_pembelian - akumulasiPenyusutan;

    return {
      ...a,
      id: typeof a.id === 'bigint' ? Number(a.id) : a.id,
      nilai_pembelian,
      nilai_residu,
      penyusutanPerBulan,
      penyusutanFiskal,
      akumulasiPenyusutan,
      nilaiBuku: nilaiBuku < 0 ? 0 : nilaiBuku
    };
  });

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(angka || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit", month: "long", year: "numeric"
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <MonitorPlay className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aset Tetap</h1>
            <p className="text-gray-500 mt-1">Manajemen aset dan penyusutan otomatis</p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
           <Link 
            href="/dashboard/aset-tetap/tambah"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md shadow-blue-500/20"
           >
             <Plus className="w-5 h-5" />
             Catat Aset Baru
           </Link>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
                <th className="py-4 px-6">Nama Aset</th>
                <th className="py-4 px-6">Tgl Beli</th>
                <th className="py-4 px-6">Perolehan & Residu</th>
                <th className="py-4 px-6">Penyusutan Bulanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {asetList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{item.nama_aset}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{item.nama_kategori} • Masa: {item.masa_manfaat} bln</div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    <div>{formatDate(item.tanggal_pembelian)}</div>
                    {item.tanggal_penghentian && (
                       <div className="text-[10px] text-rose-500 mt-1 font-bold">Dihentikan: {formatDate(item.tanggal_penghentian)}</div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-gray-800">{formatRupiah(item.nilai_pembelian)}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Residu: {formatRupiah(item.nilai_residu)}</div>
                  </td>
                  <td className="py-4 px-6 font-medium text-rose-600">
                    - {formatRupiah(item.penyusutanPerBulan)}
                  </td>

                </tr>
              ))}
              
              {asetList.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-20 text-center flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <MonitorPlay className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">Belum ada data aset tetap.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
