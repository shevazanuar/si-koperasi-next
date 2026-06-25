"use client";
import { useState, useEffect } from "react";
import { Layers, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { showConfirm, showSuccess, showError } from "@/lib/swal";

export default function KategoriAsetTetapPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nama_kategori: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/config/kategori-aset-tetap");
      const json = await res.json();
      setData(json.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...form, id: editId } : form;
    
    try {
      const res = await fetch("/api/config/kategori-aset-tetap", { 
        method, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(body) 
      });
      const json = await res.json();
      
      if (res.ok) {
        showSuccess("Berhasil", json.message || "Data berhasil disimpan");
        setShowForm(false); 
        setEditId(null); 
        setForm({ nama_kategori: "" });
        fetchData();
      } else {
        showError("Gagal", json.error || "Gagal menyimpan data");
      }
    } catch (e) {
      showError("Gagal", "Terjadi kesalahan server");
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({ nama_kategori: item.nama_kategori || "" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("Konfirmasi Hapus", "Yakin ingin menghapus kategori aset ini?");
    if (!confirmed) return;
    
    try {
      const res = await fetch(`/api/config/kategori-aset-tetap?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      
      if (res.ok) {
        showSuccess("Terhapus", json.message || "Data berhasil dihapus");
        fetchData();
      } else {
        showError("Gagal Hapus", json.error || "Gagal menghapus data. Pastikan kategori tidak digunakan oleh aset.");
      }
    } catch (e) {
      showError("Gagal", "Terjadi kesalahan server");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white"><Layers className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Kategori Aset Tetap</h1>
            <p className="text-sm text-gray-500">Kelola master data kategori aset tetap perusahaan</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ nama_kategori: "" }); }}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition text-sm font-medium shadow-md shadow-indigo-500/20">
          <Plus className="w-4 h-4" /> Tambah Kategori
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <h2 className="font-bold text-gray-900 mb-4">{editId ? "Edit" : "Tambah"} Kategori Aset Tetap</h2>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Kategori *</label>
              <input type="text" required value={form.nama_kategori} onChange={(e) => setForm({ nama_kategori: e.target.value })}
                placeholder="Contoh: Kendaraan Operasional, Elektronik, dll"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white" />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button type="submit" className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 text-sm font-medium transition-all shadow-md shadow-indigo-500/20">
                <Save className="w-4 h-4" /> Simpan
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 md:flex-none bg-gray-100 text-gray-700 px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 text-sm font-medium transition-all">
                <X className="w-4 h-4" /> Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-400">Memuat data kategori...</div> : data.length === 0 ? (
           <div className="p-12 text-center">
             <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
             <p className="text-gray-500 font-medium">Belum ada data kategori aset.</p>
             <p className="text-gray-400 text-sm mt-1">Silakan klik tombol Tambah Kategori di atas.</p>
           </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase w-20">ID</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nama Kategori</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase w-32">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{item.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{item.nama_kategori}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(item)} className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-600 transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-500 transition-colors" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
