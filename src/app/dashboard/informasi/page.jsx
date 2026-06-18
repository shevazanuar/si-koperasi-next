"use client";
import { useState, useEffect } from "react";
import { Newspaper, Plus, Pencil, Trash2, Save, X, Calendar } from "lucide-react";
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
    <div className="space-y-6 animate-page-enter">
      {/* Page Header */}
      <div className="card-base page-header-accent p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Newspaper className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Informasi</h1>
            <p className="text-sm text-gray-500">Kelola berita dan pengumuman koperasi</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ judul: "", isi: "" }); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card-base p-6 animate-fade-in">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-emerald-500"></div>
            {editId ? "Edit" : "Tambah"} Informasi
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-modern">Judul *</label>
              <input
                type="text" required value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                className="input-modern"
                placeholder="Judul informasi..."
              />
            </div>
            <div>
              <label className="label-modern">Isi / Konten *</label>
              <textarea
                required rows={5} value={form.isi}
                onChange={(e) => setForm({ ...form, isi: e.target.value })}
                className="input-modern resize-none"
                placeholder="Tulis isi informasi di sini..."
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="btn-primary">
                <Save className="w-4 h-4" /> Simpan
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                className="btn-secondary">
                <X className="w-4 h-4" /> Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content List */}
      <div className="space-y-4">
        {loading ? (
          <div className="card-base p-12 text-center">
            <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin"></div>
              Memuat data...
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="card-base p-16 text-center">
            <Newspaper className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Belum ada informasi.</p>
          </div>
        ) : (
          data.map((item, index) => (
            <div key={item.id} 
              className="card-base p-6 group transition-all duration-200 hover:border-blue-100"
              style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{item.judul}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-4">{item.isi}</p>
                  <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Administrator &middot; {formatDate(item.insert_date)}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={() => handleEdit(item)} className="btn-icon btn-icon-edit" title="Edit informasi">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn-icon btn-icon-delete" title="Hapus informasi">
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
