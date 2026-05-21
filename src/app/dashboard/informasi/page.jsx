"use client";
import { useState, useEffect } from "react";
import { Newspaper, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { showConfirm, showSuccess, showError } from "@/lib/swal";

export default function InformasiPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ judul: "", isi: "" });

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/master/informasi");
    const json = await res.json();
    setData(json.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...form, id: editId } : form;
    const res = await fetch("/api/master/informasi", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    
    if (res.ok) {
      showSuccess("Berhasil", json.message || "Data berhasil disimpan");
      setShowForm(false);
      setEditId(null);
      setForm({ judul: "", isi: "" });
      fetchData();
    } else {
      showError("Gagal Menyimpan", json.error || "Gagal menyimpan data");
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({ judul: item.judul || "", isi: item.isi || "" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("Konfirmasi Hapus", "Yakin ingin menghapus informasi ini?");
    if (!confirmed) return;
    
    const res = await fetch(`/api/master/informasi?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    
    if (res.ok) {
      showSuccess("Terhapus", json.message || "Data berhasil dihapus");
      fetchData();
    } else {
      showError("Gagal Hapus", json.error || "Gagal menghapus data");
    }
  };

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2.5 rounded-xl text-white">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Informasi</h1>
            <p className="text-sm text-gray-500">Kelola berita dan pengumuman koperasi</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ judul: "", isi: "" }); }}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition text-sm font-medium shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">{editId ? "Edit" : "Tambah"} Informasi</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Judul *</label>
              <input
                type="text" required value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Judul informasi..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Isi / Konten *</label>
              <textarea
                required rows={5} value={form.isi}
                onChange={(e) => setForm({ ...form, isi: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Tulis isi informasi di sini..."
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 text-sm font-medium">
                <Save className="w-4 h-4" /> Simpan
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-200 text-sm">
                <X className="w-4 h-4" /> Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-100">Memuat...</div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Newspaper className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Belum ada informasi.</p>
          </div>
        ) : (
          data.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 group hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 mb-2">{item.judul}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-4">{item.isi}</p>
                  <p className="text-xs text-gray-400 mt-3">
                    — Administrator &nbsp;|&nbsp; {formatDate(item.insert_date)}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(item)} className="p-2 hover:bg-blue-50 rounded-xl text-blue-600 transition">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
