"use client";
import { useState, useEffect } from "react";
import { CreditCard, Plus, Pencil, Trash2, Save, X } from "lucide-react";

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n || 0);

export default function JenisPinjamanPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nama: "", lama: "", satuan: "Bulan", bunga: "", jumlah: "" });
  const [info, setInfo] = useState({ msg: "", type: "success" });

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/config/jenis-pinjaman");
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
    const res = await fetch("/api/config/jenis-pinjaman", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    showInfo(json.message || json.error, res.ok ? "success" : "error");
    setShowForm(false); setEditId(null); setForm({ nama: "", lama: "", satuan: "Bulan", bunga: "", jumlah: "" });
    fetchData();
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({ nama: item.nama || "", lama: String(item.lama || ""), satuan: item.satuan || "Bulan", bunga: String(item.bunga || ""), jumlah: String(item.jumlah || "") });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus data ini?")) return;
    const res = await fetch(`/api/config/jenis-pinjaman?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    showInfo(json.message || json.error, res.ok ? "success" : "error");
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2.5 rounded-xl text-white"><CreditCard className="w-5 h-5" /></div>
          <div><h1 className="text-xl font-black text-gray-900">Jenis Pinjaman</h1><p className="text-sm text-gray-500">Kelola jenis/produk pinjaman</p></div>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ nama: "", lama: "", satuan: "Bulan", bunga: "", jumlah: "" }); }}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition text-sm font-medium shadow-md shadow-blue-500/20">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {info.msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${info.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {info.type === "success" ? "✅" : "❌"} {info.msg}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">{editId ? "Edit" : "Tambah"} Jenis Pinjaman</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Pinjaman *</label>
              <input type="text" required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Lama *</label>
              <input type="number" required min="0" value={form.lama} onChange={(e) => setForm({ ...form, lama: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Satuan *</label>
              <select value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Minggu">Minggu</option>
                <option value="Bulan">Bulan</option>
                <option value="Tahun">Tahun</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Bunga (%) *</label>
              <input type="number" required min="0" step="0.01" value={form.bunga} onChange={(e) => setForm({ ...form, bunga: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Jumlah Maks (Rp)</label>
              <input type="number" min="0" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 text-sm font-medium"><Save className="w-4 h-4" /> Simpan</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-200 text-sm"><X className="w-4 h-4" /> Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-400">Memuat...</div> : (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nama</th>
              <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">Lama</th>
              <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">Satuan</th>
              <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">Bunga</th>
              <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase">Maks Pinjaman</th>
              <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">Aksi</th>
            </tr></thead>
            <tbody>{data.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                <td className="px-6 py-3 text-gray-500">{item.id}</td>
                <td className="px-6 py-3 font-bold text-gray-900">{item.nama}</td>
                <td className="px-6 py-3 text-center text-gray-700">{item.lama}</td>
                <td className="px-6 py-3 text-center"><span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-lg font-medium">{item.satuan}</span></td>
                <td className="px-6 py-3 text-center font-medium text-orange-600">{item.bunga}%</td>
                <td className="px-6 py-3 text-right text-gray-700">Rp {fmt(item.jumlah)}</td>
                <td className="px-6 py-3 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => handleEdit(item)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
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
