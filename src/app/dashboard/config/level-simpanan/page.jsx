"use client";
import { useState, useEffect } from "react";
import { Layers, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { showConfirm, showSuccess, showError } from "@/lib/swal";

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n || 0);

export default function LevelSimpananPage() {
  const [data, setData] = useState([]);
  const [jenisSimpanan, setJenisSimpanan] = useState([]);
  const [levelAnggota, setLevelAnggota] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ level_anggota_id: "", jenis_simpanan_id: "", jumlah: "" });

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/config/level-simpanan");
    const json = await res.json();
    setData(json.data || []);
    setJenisSimpanan(json.jenisSimpanan || []);
    setLevelAnggota(json.levelAnggota || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...form, id: editId } : form;
    const res = await fetch("/api/config/level-simpanan", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    
    if (res.ok) {
      showSuccess("Berhasil", json.message || "Data berhasil disimpan");
      setShowForm(false); setEditId(null); setForm({ level_anggota_id: "", jenis_simpanan_id: "", jumlah: "" });
      fetchData();
    } else {
      showError("Gagal Menyimpan", json.error || "Gagal menyimpan data");
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({ level_anggota_id: String(item.level_anggota_id || ""), jenis_simpanan_id: String(item.jenis_simpanan_id || ""), jumlah: String(item.jumlah || "") });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("Konfirmasi Hapus", "Yakin ingin menghapus level simpanan ini?");
    if (!confirmed) return;
    
    const res = await fetch(`/api/config/level-simpanan?id=${id}`, { method: "DELETE" });
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
          <div><h1 className="text-xl font-black text-gray-900">Level Simpanan</h1><p className="text-sm text-gray-500">Kelola iuran simpanan per level anggota</p></div>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ level_anggota_id: "", jenis_simpanan_id: "", jumlah: "" }); }} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">{editId ? "Edit" : "Tambah"} Level Simpanan</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Level Anggota *</label>
              <select required value={form.level_anggota_id} onChange={(e) => setForm({ ...form, level_anggota_id: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Pilih Level...</option>
                {levelAnggota.map((l) => <option key={l.id} value={l.id}>{l.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Jenis Simpanan *</label>
              <select required value={form.jenis_simpanan_id} onChange={(e) => setForm({ ...form, jenis_simpanan_id: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Pilih Jenis...</option>
                {jenisSimpanan.map((j) => <option key={j.id} value={j.id}>{j.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Jumlah Iuran (Rp) *</label>
              <input type="number" required min="0" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 text-sm font-medium"><Save className="w-4 h-4" /> Simpan</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm"><X className="w-4 h-4" /> Batal</button>
            </div>
          </form>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-400">Memuat...</div> : (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Level Anggota</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Jenis Simpanan</th>
              <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase">Jumlah Iuran</th>
              <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">Aksi</th>
            </tr></thead>
            <tbody>{data.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">Belum ada data.</td></tr>
              : data.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                  <td className="px-6 py-3 text-gray-500">{item.id}</td>
                  <td className="px-6 py-3 font-bold text-gray-900">{item.nama_level}</td>
                  <td className="px-6 py-3 text-gray-700">{item.nama_jenis}</td>
                  <td className="px-6 py-3 text-right font-medium text-emerald-700">Rp {fmt(item.jumlah)}</td>
                  <td className="px-6 py-3 text-center"><div className="flex justify-center gap-1">
                    <button onClick={() => handleEdit(item)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
