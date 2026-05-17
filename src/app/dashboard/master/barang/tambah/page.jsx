"use client";

import { Save, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { addBarang } from "../actions";
import { useRouter } from "next/navigation";

export default function TambahBarangPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const [kategori, setKategori] = useState([]);

  useEffect(() => {
    fetch("/api/kategori-produk")
      .then(res => res.json())
      .then(data => setKategori(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      const formData = new FormData(e.target);
      await addBarang(formData);
    } catch (err) {
      setError(err.message);
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20 max-w-3xl mx-auto">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Tambah Barang</h1>
          <p className="text-gray-400 text-sm mt-0.5">Tambah data barang baru</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Kode Barang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="kode_barang"
                required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono"
                placeholder="Contoh: BRG001"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                name="kategori_id"
                required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">-- Pilih Kategori --</option>
                {kategori.map(k => (
                  <option key={k.id} value={k.id}>{k.nama_kategori}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nama Barang <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama_barang"
              required
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="Masukkan nama barang"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Harga Modal <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">Rp</span>
                <input
                  type="number"
                  name="harga_modal"
                  required
                  min="0"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Harga Jual <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">Rp</span>
                <input
                  type="number"
                  name="harga_jual"
                  required
                  min="0"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Stok Awal
              </label>
              <input
                type="number"
                name="stok"
                defaultValue={0}
                min="0"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Satuan
              </label>
              <input
                type="text"
                name="satuan"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Upload Gambar Produk
              </label>
              <input
                type="file"
                name="gambar"
                accept="image/jpeg, image/png, image/webp"
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-[10px] text-gray-500 mt-1">Format: JPG, PNG, WEBP. Maks 2MB.</p>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input 
                  type="checkbox" 
                  name="is_featured"
                  value="true"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-700">Jadikan Produk Unggulan</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              name="deskripsi"
              rows={3}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="Jelaskan produk ini secara singkat..."
            ></textarea>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isPending ? "Menyimpan..." : "Simpan Barang"}
            </button>
            <Link
              href="/dashboard/master/barang"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
