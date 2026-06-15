"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { showSuccess, showError, showAlert } from "@/lib/swal";
import CurrencyInput from "@/components/ui/CurrencyInput";

export default function EditBiayaPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    kode_biaya: "",
    nama_biaya: "",
    nominal: "",
    tanggal: "",
    keterangan: "",
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/biaya-opr/${id}`);
        const result = await res.json();
        if (res.ok && result.data) {
          const d = result.data;
          setFormData({
            kode_biaya: d.kode_biaya,
            nama_biaya: d.nama_biaya,
            nominal: d.nominal,
            tanggal: new Date(d.tanggal).toISOString().slice(0, 10),
            keterangan: d.keterangan || "",
          });
        } else {
          showError("Error", result.error || "Data tidak ditemukan");
          router.push("/dashboard/biaya");
        }
      } catch (error) {
        console.error(error);
        showError("Error", "Terjadi kesalahan sistem");
      } finally {
        setInitialLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.kode_biaya || !formData.nama_biaya || !formData.nominal || !formData.tanggal) {
      showAlert("Peringatan", "Harap isi semua kolom yang wajib!", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/biaya-opr/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          nominal: parseFloat(formData.nominal),
        }),
      });

      const result = await res.json();
      if (res.ok) {
        showSuccess("Berhasil", "Data biaya operasional berhasil diubah.");
        router.push("/dashboard/biaya");
      } else {
        showError("Gagal", result.error || "Gagal mengubah data.");
      }
    } catch (error) {
      showError("Error", "Terjadi kesalahan pada sistem.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Memuat data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-gray-900">Edit Biaya Operasional</h1>
          <p className="text-sm text-gray-500">Ubah rincian pengeluaran operasional</p>
        </div>
        <Link href="/dashboard/biaya" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition">
          <ArrowLeft className="w-4 h-4" /> Batal
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Kode Biaya <span className="text-red-500">*</span></label>
              <input type="text" name="kode_biaya" value={formData.kode_biaya} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50" readOnly title="Kode biaya tidak disarankan diubah" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Transaksi <span className="text-red-500">*</span></label>
              <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Nama Biaya <span className="text-red-500">*</span></label>
              <input type="text" name="nama_biaya" value={formData.nama_biaya} onChange={handleChange} required placeholder="Contoh: Pembayaran Listrik Bulan Ini"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Nominal (Rp) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500 font-bold">Rp</span>
                <CurrencyInput value={formData.nominal} onChange={(val) => setFormData({ ...formData, nominal: val })} required placeholder="0"
                  className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Keterangan Tambahan</label>
              <textarea name="keterangan" value={formData.keterangan} onChange={handleChange} rows="4" placeholder="Opsional..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-70 shadow-sm">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
