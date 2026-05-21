"use client";

import { useState, useEffect } from "react";
import { Layers, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { showConfirm, showSuccess, showError } from "@/lib/swal";

export default function LevelPenggunaPage() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ level: "" });

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/config/level");
    const json = await res.json();
    setLevels(json.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...form, id: editId } : form;
    const res = await fetch("/api/config/level", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    
    if (res.ok) {
      showSuccess("Berhasil", json.message || "Data berhasil disimpan");
      setShowForm(false); setEditId(null); setForm({ level: "" });
      fetchData();
    } else {
      showError("Gagal Menyimpan", json.error || "Gagal menyimpan data");
    }
  };

  const handleEdit = (l) => { 
    setEditId(l.id); 
    setForm({ level: l.level || "" }); 
    setShowForm(true); 
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("Konfirmasi Hapus", "Yakin ingin menghapus level pengguna ini?");
    if (!confirmed) return;
    
    const res = await fetch(`/api/config/level?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    
    if (res.ok) {
      showSuccess("Terhapus", json.message || "Data berhasil dihapus");
      fetchData();
    } else {
      showError("Gagal Hapus", json.error || "Gagal menghapus data");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-violet-600 p-2.5 rounded-xl text-white"><Layers className="w-5 h-5" /></div>
          <div><h1 className="text-xl font-black text-gray-900">Level Pengguna</h1><p className="text-sm text-gray-500">Kelola level akses pengguna</p></div>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ level: "" }); }}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition text-sm font-medium">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">{editId ? "Edit" : "Tambah"} Level</h2>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Level *</label>
              <input type="text" required value={form.level} onChange={(e) => setForm({ level: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 text-sm font-medium"><Save className="w-4 h-4" /> Simpan</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-200 text-sm"><X className="w-4 h-4" /> Batal</button>
          </form>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-400">Memuat...</div> : (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Level</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Akses Menu</th>
              <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">Aksi</th>
            </tr></thead>
            <tbody>{levels.map((l) => (
              <tr key={l.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                <td className="px-6 py-3 text-gray-500">{l.id}</td>
                <td className="px-6 py-3 font-bold text-gray-900">{l.level}</td>
                <td className="px-6 py-3 text-gray-500 text-xs font-mono">{l.akses || "-"}</td>
                <td className="px-6 py-3 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => handleEdit(l)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(l.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
