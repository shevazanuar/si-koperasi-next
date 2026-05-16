import { Save, X } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { updateKategori } from "../../actions";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function EditKategoriPage({ params }) {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/login");

  const { id } = await params;
  
  const kategori = await prisma.kategori_produk.findUnique({
    where: { id: Number(id) }
  });

  if (!kategori) redirect("/dashboard/master/kategori-produk");

  const updateWithId = updateKategori.bind(null, id);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20 max-w-2xl mx-auto">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Edit Kategori</h1>
          <p className="text-gray-400 text-sm mt-0.5">Edit kategori produk</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
        <form action={updateWithId} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama_kategori"
              defaultValue={kategori.nama_kategori}
              required
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="Masukkan nama kategori"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
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
