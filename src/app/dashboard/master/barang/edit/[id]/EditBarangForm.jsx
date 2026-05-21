"use client";

import { Save, X } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { updateBarang } from "../../actions";
import { showError } from "@/lib/swal";

export default function EditBarangForm({ barang, kategori, id }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Validasi ukuran gambar di sisi klien (maksimal 2MB)
    const gambar = formData.get("gambar");
    if (gambar && gambar.size > 2 * 1024 * 1024) {
      showError("Gagal Menyimpan", "Ukuran gambar terlalu besar. Maksimal 2 MB.");
      return;
    }

    startTransition(async () => {
      try {
        await updateBarang(id, formData);
      } catch (err) {
        // Next.js uses an error to trigger redirects.
        // We must re-throw it so the router can handle the navigation.
        if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
          throw err;
        }

        const errorMsg = err?.message || "Terjadi kesalahan saat menyimpan data";
        showError("Gagal Menyimpan", errorMsg);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Kode Barang</label>
            <input type="text" defaultValue={barang.kode_barang} disabled className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm outline-none font-mono text-gray-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              name="kategori_id"
              defaultValue={barang.kategori_id}
              required
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">-- Pilih Kategori --</option>
              {kategori.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kategori}
                </option>
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
            defaultValue={barang.nama_barang}
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
                defaultValue={Number(barang.harga_modal)}
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
                defaultValue={Number(barang.harga_jual)}
                required
                min="0"
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Stok</label>
            <input
              type="number"
              name="stok"
              defaultValue={barang.stok}
              min="0"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Satuan</label>
            <select
              name="satuan"
              defaultValue={barang.satuan || "pcs"}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            >
              <option value="pcs">pcs</option>
              <option value="dus">dus</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
            <select
              name="status"
              defaultValue={barang.status}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Upload Gambar Produk <span className="text-gray-400 font-normal">(Kosongkan jika tidak ingin mengubah)</span>
            </label>
            {barang.gambar && (
              <div className="mb-2">
                <img src={barang.gambar} alt="Current" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
              </div>
            )}
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
              <input type="checkbox" name="is_featured" value="true" defaultChecked={barang.is_featured} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-semibold text-gray-700">Jadikan Produk Unggulan</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Singkat</label>
          <textarea
            name="deskripsi"
            rows={3}
            defaultValue={barang.deskripsi || ""}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            placeholder="Jelaskan produk ini secara singkat..."
          ></textarea>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button type="submit" disabled={isPending} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <Link href="/dashboard/master/barang" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2">
            <X className="w-4 h-4" />
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
