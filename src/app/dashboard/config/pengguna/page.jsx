"use client";

import { useState, useEffect } from "react";
import { UserCog, Plus, Pencil, Trash2, Save, X } from "lucide-react";

export default function PenggunaPage() {
  const [users, setUsers] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ username: "", namalengkap: "", password: "", level_id: "1", blokir: "T" });
  const [info, setInfo] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/config/pengguna");
    const json = await res.json();
    setUsers(json.data || []);
    setLevels(json.levels || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...form, id: editId } : form;
    if (!editId && !form.password) { alert("Password wajib diisi"); return; }
    const res = await fetch("/api/config/pengguna", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    setInfo(json.message || json.error);
    setShowForm(false); setEditId(null);
    setForm({ username: "", namalengkap: "", password: "", level_id: "1", blokir: "T" });
    fetchData();
    setTimeout(() => setInfo(""), 3000);
  };

  const handleEdit = (u) => {
    setEditId(u.id);
    setForm({ username: u.username || "", namalengkap: u.namalengkap || "", password: "", level_id: String(u.level_id), blokir: u.blokir || "T" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus pengguna ini?")) return;
    const res = await fetch(`/api/config/pengguna?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    setInfo(json.message || json.error);
    fetchData();
    setTimeout(() => setInfo(""), 3000);
  };

  const getLevelName = (id) => levels.find((l) => l.id === id)?.level || "-";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white"><UserCog className="w-5 h-5" /></div>
          <div><h1 className="text-xl font-black text-gray-900">Pengguna</h1><p className="text-sm text-gray-500">Kelola data pengguna sistem</p></div>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ username: "", namalengkap: "", password: "", level_id: "1", blokir: "T" }); }}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition text-sm font-medium">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>
      {info && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">✅ {info}</div>}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">{editId ? "Edit" : "Tambah"} Pengguna</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Username *</label>
              <input type="text" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Nama Lengkap</label>
              <input type="text" value={form.namalengkap} onChange={(e) => setForm({ ...form, namalengkap: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Password {editId ? "(kosongkan jika tidak diubah)" : "*"}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Level</label>
              <select value={form.level_id} onChange={(e) => setForm({ ...form, level_id: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                {levels.map((l) => <option key={l.id} value={l.id}>{l.level}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
              <select value={form.blokir} onChange={(e) => setForm({ ...form, blokir: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="T">Aktif (Tidak diblokir)</option><option value="Y">Diblokir</option></select></div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition text-sm font-medium"><Save className="w-4 h-4" /> Simpan</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-200 transition text-sm"><X className="w-4 h-4" /> Batal</button>
            </div>
          </form>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-400">Memuat...</div> : (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Username</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nama Lengkap</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Level</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">Aksi</th>
            </tr></thead>
            <tbody>{users.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                <td className="px-6 py-3 text-gray-500">{u.id}</td>
                <td className="px-6 py-3 font-bold text-gray-900">{u.username}</td>
                <td className="px-6 py-3 text-gray-700">{u.namalengkap}</td>
                <td className="px-6 py-3"><span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-lg font-medium">{getLevelName(u.level_id)}</span></td>
                <td className="px-6 py-3"><span className={`text-xs px-2 py-1 rounded-lg font-medium ${u.blokir === "T" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{u.blokir === "T" ? "Aktif" : "Diblokir"}</span></td>
                <td className="px-6 py-3 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => handleEdit(u)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
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
