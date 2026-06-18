"use client";

import { useState, useEffect } from "react";
import { UserCog, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { showError, showConfirm, showSuccess } from "@/lib/swal";

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
    if (!editId && !form.password) { 
      showError("Gagal", "Password wajib diisi"); 
      return; 
    }
    const res = await fetch("/api/config/pengguna", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    
    if (res.ok) {
      showSuccess("Berhasil", json.message || "Data pengguna telah disimpan.");
    } else {
      showError("Gagal", json.error || "Gagal menyimpan data pengguna.");
    }
    
    setShowForm(false); setEditId(null);
    setForm({ username: "", namalengkap: "", password: "", level_id: "1", blokir: "T" });
    fetchData();
  };

  const handleEdit = (u) => {
    setEditId(u.id);
    setForm({ username: u.username || "", namalengkap: u.namalengkap || "", password: "", level_id: String(u.level_id), blokir: u.blokir || "T" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const yakin = await showConfirm("Konfirmasi Hapus", "Yakin ingin menghapus pengguna ini?", "Ya, Hapus");
    if (!yakin) return;
    
    const res = await fetch(`/api/config/pengguna?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    
    if (res.ok) {
      showSuccess("Terhapus", json.message || "Pengguna telah berhasil dihapus.");
    } else {
      showError("Gagal", json.error || "Gagal menghapus pengguna.");
    }
    
    fetchData();
  };

  const getLevelName = (id) => levels.find((l) => l.id === id)?.level || "-";

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Page Header */}
      <div className="card-base page-header-accent p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <UserCog className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Pengguna</h1>
            <p className="text-sm text-gray-500">Kelola data pengguna sistem</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ username: "", namalengkap: "", password: "", level_id: "1", blokir: "T" }); }}
          className="btn-primary">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {/* Form Tambah/Edit */}
      {showForm && (
        <div className="card-base p-6 animate-fade-in">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-blue-500"></div>
            {editId ? "Edit" : "Tambah"} Pengguna
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-modern">Username *</label>
              <input type="text" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} 
                className="input-modern" placeholder="Masukkan username" />
            </div>
            <div>
              <label className="label-modern">Nama Lengkap</label>
              <input type="text" value={form.namalengkap} onChange={(e) => setForm({ ...form, namalengkap: e.target.value })} 
                className="input-modern" placeholder="Masukkan nama lengkap" />
            </div>
            <div>
              <label className="label-modern">Password {editId ? "(kosongkan jika tidak diubah)" : "*"}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} 
                className="input-modern" placeholder="••••••••" />
            </div>
            <div>
              <label className="label-modern">Level</label>
              <select value={form.level_id} onChange={(e) => setForm({ ...form, level_id: e.target.value })} 
                className="input-modern">
                {levels.map((l) => <option key={l.id} value={l.id}>{l.level}</option>)}
              </select>
            </div>
            <div>
              <label className="label-modern">Status</label>
              <select value={form.blokir} onChange={(e) => setForm({ ...form, blokir: e.target.value })} 
                className="input-modern">
                <option value="T">Aktif (Tidak diblokir)</option>
                <option value="Y">Diblokir</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-2 pt-2">
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

      {/* Table */}
      <div className="card-base overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              Memuat data...
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center">
            <UserCog className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Belum ada data pengguna.</p>
          </div>
        ) : (
          <table className="table-modern">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Nama Lengkap</th>
                <th>Level</th>
                <th>Status</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="text-gray-400 font-mono text-xs">{u.id}</td>
                  <td className="font-semibold text-gray-900">{u.username}</td>
                  <td className="text-gray-600">{u.namalengkap}</td>
                  <td><span className="badge badge-info">{getLevelName(u.level_id)}</span></td>
                  <td>
                    <span className={`badge ${u.blokir === "T" ? "badge-success" : "badge-danger"}`}>
                      {u.blokir === "T" ? "Aktif" : "Diblokir"}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleEdit(u)} className="btn-icon btn-icon-edit" title="Edit pengguna">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="btn-icon btn-icon-delete" title="Hapus pengguna">
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
