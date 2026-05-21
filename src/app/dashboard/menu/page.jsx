"use client";

import { useState, useEffect, Fragment } from "react";
import { ListTree, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { showConfirm, showSuccess, showError } from "@/lib/swal";

export default function MenuPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ kode: "", nama: "", url: "", icon: "", class: "", root: "0" });

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/menu");
    const json = await res.json();
    setMenus(json.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...form, id: editId } : form;
    try {
      const res = await fetch("/api/menu", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (res.ok) {
        showSuccess("Berhasil", json.message || "Menu berhasil disimpan");
        setShowForm(false);
        setEditId(null);
        setForm({ kode: "", nama: "", url: "", icon: "", class: "", root: "0" });
        fetchData();
      } else {
        showError("Gagal", json.message || json.error || "Gagal menyimpan menu");
      }
    } catch (err) {
      showError("Kesalahan", "Terjadi kesalahan koneksi server");
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({ kode: item.kode?.toString() || "", nama: item.nama || "", url: item.url || "", icon: item.icon || "", class: item.class || "", root: item.root?.toString() || "0" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("Hapus Menu?", "Apakah Anda yakin ingin menghapus menu ini?");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/menu?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok) {
        showSuccess("Berhasil", json.message || "Menu berhasil dihapus");
        fetchData();
      } else {
        showError("Gagal", json.message || json.error || "Gagal menghapus menu");
      }
    } catch (err) {
      showError("Kesalahan", "Terjadi kesalahan koneksi server");
    }
  };

  const rootMenus = menus.filter((m) => m.root === 0);
  const getChildren = (kode) => menus.filter((m) => m.root === kode);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md shadow-blue-500/20">
            <ListTree className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Menu</h1>
            <p className="text-sm text-gray-500">Kelola data menu aplikasi</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ kode: "", nama: "", url: "", icon: "", class: "", root: "0" }); }}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition font-medium text-sm shadow-md shadow-blue-500/20">
          <Plus className="w-4 h-4" /> Tambah Menu
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">{editId ? "Edit" : "Tambah"} Menu</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Kode</label>
              <input type="text" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Auto-generate jika kosong" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nama *</label>
              <input type="text" required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">URL</label>
              <input type="text" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Icon</label>
              <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Class</label>
              <input type="text" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Root (Parent Kode, 0=root)</label>
              <input type="number" value={form.root} onChange={(e) => setForm({ ...form, root: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition text-sm font-medium">
                <Save className="w-4 h-4" /> Simpan
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-200 transition text-sm font-medium">
                <X className="w-4 h-4" /> Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Memuat data...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">ID</th>
                <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Kode</th>
                <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Nama</th>
                <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">URL</th>
                <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Icon</th>
                <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Root</th>
                <th className="text-center px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rootMenus.map((m) => (
                <Fragment key={m.id}>
                  <tr className="border-b border-gray-50 hover:bg-blue-50/30 transition">
                    <td className="px-6 py-3 text-gray-600">{m.id}</td>
                    <td className="px-6 py-3 font-mono text-blue-600 font-bold">{m.kode}</td>
                    <td className="px-6 py-3 font-bold text-gray-900">{m.nama}</td>
                    <td className="px-6 py-3 text-gray-500">{m.url}</td>
                    <td className="px-6 py-3 text-gray-500">{m.icon}</td>
                    <td className="px-6 py-3 text-gray-500">{m.root}</td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleEdit(m)} className="p-2 hover:bg-blue-50 rounded-lg transition text-blue-600"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(m.id)} className="p-2 hover:bg-red-50 rounded-lg transition text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                  {getChildren(m.kode).map((child) => (
                    <tr key={child.id} className="border-b border-gray-50 hover:bg-blue-50/20 transition bg-gray-50/50">
                      <td className="px-6 py-3 text-gray-500 pl-10">{child.id}</td>
                      <td className="px-6 py-3 font-mono text-gray-500">&nbsp;&nbsp;└ {child.kode}</td>
                      <td className="px-6 py-3 text-gray-700">{child.nama}</td>
                      <td className="px-6 py-3 text-gray-500">{child.url}</td>
                      <td className="px-6 py-3 text-gray-500">{child.icon}</td>
                      <td className="px-6 py-3 text-gray-500">{child.root}</td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => handleEdit(child)} className="p-2 hover:bg-blue-50 rounded-lg transition text-blue-600"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(child.id)} className="p-2 hover:bg-red-50 rounded-lg transition text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
