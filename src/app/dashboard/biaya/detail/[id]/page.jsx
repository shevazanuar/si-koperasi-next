"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit, Calendar, FileText, Hash, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { showError } from "@/lib/swal";

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n || 0);

export default function DetailBiayaPage() {
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/biaya-opr/${id}`);
        const result = await res.json();
        if (res.ok && result.data) {
          setData(result.data);
        } else {
          showError("Error", result.error || "Data tidak ditemukan");
          router.push("/dashboard/biaya");
        }
      } catch (error) {
        console.error(error);
        showError("Error", "Terjadi kesalahan sistem");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, router]);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Memuat detail data...</div>;
  }

  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-gray-900">Detail Biaya Operasional</h1>
          <p className="text-sm text-gray-500">Informasi lengkap tentang transaksi pengeluaran</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/biaya" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <Link href={`/dashboard/biaya/edit/${id}`} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shadow-sm">
            <Edit className="w-4 h-4" /> Edit Data
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50/50 px-6 md:px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nama Biaya</p>
              <h2 className="text-2xl font-black text-gray-900">{data.nama_biaya}</h2>
            </div>
          </div>
          <div className="md:text-right">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Nominal</p>
            <p className="text-3xl font-black text-red-600">Rp {fmt(data.nominal)}</p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Hash className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Kode Biaya</span>
                </div>
                <p className="text-lg font-mono font-semibold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100 inline-block">
                  {data.kode_biaya}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Tanggal Transaksi</span>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(data.tanggal).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Keterangan / Catatan</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 min-h-[100px] border border-gray-100">
                  <p className="text-gray-700 whitespace-pre-wrap">{data.keterangan || <span className="text-gray-400 italic">Tidak ada keterangan tambahan.</span>}</p>
                </div>
              </div>

              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Informasi Sistem</p>
                  <p className="text-xs text-blue-700 mt-1">Data dibuat pada: {new Date(data.created_at).toLocaleString("id-ID")}</p>
                  <p className="text-xs text-blue-700">Terakhir diubah: {data.updated_at ? new Date(data.updated_at).toLocaleString("id-ID") : "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
