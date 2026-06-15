import prisma from "@/lib/prisma";
import { Plus, BarChart3 } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AsetLancarPage() {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/dashboard");

  // 1. Hitung Piutang Anggota Dinamis dari Total Pinjaman - Total Bayar
  // Total Pinjaman (Pokok + Bunga yang harus dibayar)
  const pinjamanHeaderRaw = await prisma.$queryRawUnsafe(`
    SELECT SUM(jumlah + (jumlah * bunga / 100)) as total_harus_dibayar 
    FROM pinjaman_header
  `);
  const totalHarusDibayar = pinjamanHeaderRaw[0]?.total_harus_dibayar ? parseFloat(pinjamanHeaderRaw[0].total_harus_dibayar) : 0;

  // Total Bayar (Angsuran + Bunga yang sudah dibayar)
  // tgl_bayar diisi jika sudah bayar
  const pinjamanDetailRaw = await prisma.$queryRawUnsafe(`
    SELECT SUM(jumlah_bayar) as total_telah_dibayar
    FROM pinjaman_detail
    WHERE tgl_bayar IS NOT NULL AND tgl_bayar != ''
  `);
  const totalTelahDibayar = pinjamanDetailRaw[0]?.total_telah_dibayar ? parseFloat(pinjamanDetailRaw[0].total_telah_dibayar) : 0;

  const piutangAnggota = totalHarusDibayar - totalTelahDibayar;

  // 1b. Hitung Piutang Simpanan Wajib Anggota
  const jenisSimpananWajib = await prisma.jenis_simpanan.findFirst({
    where: { nama: { contains: "Wajib" } }
  });

  let piutangSimpananWajib = 0;
  let totalTelahDibayarWajib = 0;
  let totalHarusDibayarWajib = 0;

  if (jenisSimpananWajib && jenisSimpananWajib.jumlah > 0) {
    const expectedWajibRaw = await prisma.$queryRawUnsafe(`
      SELECT SUM(
        GREATEST(0, TIMESTAMPDIFF(MONTH, tgl_masuk, NOW())) * COALESCE(simpanan_wajib_per_bulan, ?)
      ) as total_harus_dibayar 
      FROM anggota 
      WHERE status = 'Aktif' AND tgl_masuk IS NOT NULL
    `, jenisSimpananWajib.jumlah);
    
    totalHarusDibayarWajib = expectedWajibRaw[0]?.total_harus_dibayar ? parseFloat(expectedWajibRaw[0].total_harus_dibayar) : 0;

    const actualWajibRaw = await prisma.$queryRawUnsafe(`
      SELECT SUM(jumlah) as total_telah_dibayar
      FROM simpanan
      WHERE jenis_simpanan_id = ?
    `, jenisSimpananWajib.id);

    totalTelahDibayarWajib = actualWajibRaw[0]?.total_telah_dibayar ? parseFloat(actualWajibRaw[0].total_telah_dibayar) : 0;
    
    piutangSimpananWajib = Math.max(0, totalHarusDibayarWajib - totalTelahDibayarWajib);
  }

  // 2. Ambil aset lancar lainnya
  const asetLancarLainnyaRaw = await prisma.$queryRawUnsafe(`
    SELECT * FROM aset_lancar ORDER BY id DESC
  `);

  const asetLancarLainnya = asetLancarLainnyaRaw.map(a => ({
    ...a,
    id: typeof a.id === 'bigint' ? Number(a.id) : a.id,
    nominal: typeof a.nominal === 'string' ? parseFloat(a.nominal) : a.nominal
  }));

  const totalAsetLancar = piutangAnggota + piutangSimpananWajib + asetLancarLainnya.reduce((acc, curr) => acc + curr.nominal, 0);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(angka || 0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aset Lancar</h1>
            <p className="text-gray-500 mt-1">Ringkasan piutang anggota dan aset lancar lainnya</p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
           <Link 
            href="/dashboard/aset-lancar/tambah"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md shadow-blue-500/20"
           >
             <Plus className="w-5 h-5" />
             Catat Aset Lainnya
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-blue-100 font-medium tracking-wide mb-2">Total Seluruh Aset Lancar</div>
            <div className="text-4xl font-black">{formatRupiah(totalAsetLancar)}</div>
          </div>
          <div className="absolute right-0 top-0 w-64 h-full bg-white/10 flex items-center justify-end pr-8 blur-3xl rounded-full translate-x-20"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Piutang Anggota Dinamis */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">Piutang Pinjaman Anggota</h2>
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <div>
                    <div className="text-sm font-medium text-gray-500">Total Pinjaman & Bunga</div>
                    <div className="text-lg font-bold text-gray-900">{formatRupiah(totalHarusDibayar)}</div>
                </div>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <div>
                    <div className="text-sm font-medium text-gray-500">Total Telah Dibayar</div>
                    <div className="text-lg font-bold text-emerald-600">{formatRupiah(totalTelahDibayar)}</div>
                </div>
            </div>
            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div>
                    <div className="text-sm font-bold text-blue-700">Sisa Piutang Pinjaman</div>
                    <div className="text-2xl font-black text-blue-800">{formatRupiah(piutangAnggota)}</div>
                </div>
            </div>
        </div>

        {/* Piutang Simpanan Anggota */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">Piutang Simpanan Anggota</h2>
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <div>
                    <div className="text-sm font-medium text-gray-500">Estimasi Total Simpanan Wajib</div>
                    <div className="text-lg font-bold text-gray-900">{formatRupiah(totalHarusDibayarWajib)}</div>
                </div>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <div>
                    <div className="text-sm font-medium text-gray-500">Total Telah Disetorkan</div>
                    <div className="text-lg font-bold text-emerald-600">{formatRupiah(totalTelahDibayarWajib)}</div>
                </div>
            </div>
            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div>
                    <div className="text-sm font-bold text-blue-700">Sisa Piutang Simpanan</div>
                    <div className="text-2xl font-black text-blue-800">{formatRupiah(piutangSimpananWajib)}</div>
                </div>
            </div>
        </div>

        {/* Aset Lancar Lainnya */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 p-6 pb-4">Aset Lancar Lainnya</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
                    <th className="py-3 px-6">Jenis Aset</th>
                    <th className="py-3 px-6">Nominal</th>
                    <th className="py-3 px-6 text-right">Keterangan</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {asetLancarLainnya.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="py-4 px-6 font-bold text-gray-900">{item.jenis_aset}</td>
                        <td className="py-4 px-6 font-bold text-emerald-600">{formatRupiah(item.nominal)}</td>
                        <td className="py-4 px-6 text-gray-500 text-right">{item.keterangan || '-'}</td>
                    </tr>
                    ))}
                    {asetLancarLainnya.length === 0 && (
                    <tr>
                        <td colSpan="3" className="py-8 text-center text-gray-500 font-medium">Belum ada aset lancar lainnya.</td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
        </div>
      </div>

    </div>
  );
}
