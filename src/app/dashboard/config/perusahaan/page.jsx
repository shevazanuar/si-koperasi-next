"use client";
import { useState, useEffect } from "react";
import { Building2, Plus, Pencil, Trash2, Save, X } from "lucide-react";

export default function PerusahaanPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nama: "" });
  const [info, setInfo] = useState({ msg: "", type: "success" });

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/config/perusahaan");
    const json = await res.json();
    setData(json.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);
  const showInfo = (msg, type = "success") => { setInfo({ msg, type }); setTimeout(() => setInfo({ msg: "", type: "success" }), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...form, id: editId } : form;
    const res = await fetch("/api/config/perusahaan", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    showInfo(json.message || json.error, res.ok ? "success" : "error");
    setShowForm(false); setEditId(null); setForm({ nama: "" }); fetchData();
  };

  const handleEdit = (item) => { setEditId(item.id); setForm({ nama: item.nama || "" }); setShowForm(true); };

  const handleDelete = async (id) => {
    if (!confirm("Hapus?")) return;
    const res = await fetch(`/api/config/perusahaan?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    showInfo(json.message || json.error, res.ok ? "success" : "error"); fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 p-2.5 rounded-xl text-white"><Building2 className="w-5 h-5" /></div>
          <div><h1 className="text-xl font-black text-gray-900">Perusahaan</h1><p className="text-sm text-gray-500">Kelola data perusahaan / instansi</p></div>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ nama: "" }); }} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>
      {info.msg && <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${info.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>{info.type === "success" ? "✅" : "❌"} {info.msg}</div>}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">{editId ? "Edit" : "Tambah"} Perusahaan</h2>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Perusahaan *</label>
              <input type="text" required value={form.nama} onChange={(e) => setForm({ nama: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 text-sm font-medium"><Save className="w-4 h-4" /> Simpan</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm"><X className="w-4 h-4" /> Batal</button>
          </form>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-400">Memuat...</div> : (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nama Perusahaan</th>
              <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">Aksi</th>
            </tr></thead>
            <tbody>{data.length === 0 ? <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-sm">Belum ada data.</td></tr>
              : data.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                  <td className="px-6 py-3 text-gray-500">{item.id}</td>
                  <td className="px-6 py-3 font-bold text-gray-900">{item.nama}</td>
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
