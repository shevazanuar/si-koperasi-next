"use client";

import { Save, X } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { addKategori } from "../actions";
import { useRouter } from "next/navigation";

export default function TambahKategoriPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      const formData = new FormData(e.target);
      await addKategori(formData);
    } catch (err) {
      setError(err.message);
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20 max-w-2xl mx-auto">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Tambah Kategori</h1>
          <p className="text-gray-400 text-sm mt-0.5">Tambah kategori produk baru</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama_kategori"
              required
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="Masukkan nama kategori"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isPending ? "Menyimpan..." : "Simpan Kategori"}
            </button>
            <Link
              href="/dashboard/master/kategori-produk"
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
