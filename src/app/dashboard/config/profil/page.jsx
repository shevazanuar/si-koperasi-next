"use client";

import { useState, useEffect } from "react";
import { Building2, Save } from "lucide-react";

export default function ProfilPage() {
  const [form, setForm] = useState({ koperasi: "", alamat: "", kota: "", hp: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/config/profil");
      const json = await res.json();
      if (json.data) setForm(json.data);
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/config/profil", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const json = await res.json();
    setInfo(json.message || json.error);
    setTimeout(() => setInfo(""), 3000);
  };

  if (loading) return <div className="p-12 text-center text-gray-400">Memuat...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
        <div className="bg-teal-600 p-2.5 rounded-xl text-white"><Building2 className="w-5 h-5" /></div>
        <div><h1 className="text-xl font-black text-gray-900">Profil Koperasi</h1><p className="text-sm text-gray-500">Kelola informasi profil koperasi</p></div>
      </div>
      </div>
      {info && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">✅ {info}</div>}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          {[
            { label: "Nama Koperasi", key: "koperasi" },
            { label: "Alamat", key: "alamat" },
            { label: "Kota", key: "kota" },
            { label: "No. HP / Telepon", key: "hp" },
            { label: "Email", key: "email" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
              <input type="text" value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
          ))}
          <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition text-sm font-medium">
            <Save className="w-4 h-4" /> Simpan
          </button>
        </form>
      </div>
    </div>
  );
}
