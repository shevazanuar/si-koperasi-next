"use client";

import { useState, useEffect } from "react";
import { Building2, Save, CheckCircle } from "lucide-react";

export default function ProfilPage() {
  const [form, setForm] = useState({ koperasi: "", alamat: "", kota: "", hp: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState("");
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    const res = await fetch("/api/config/profil", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const json = await res.json();
    setInfo(json.message || json.error);
    setSaving(false);
    setTimeout(() => setInfo(""), 3000);
  };

  if (loading) return (
    <div className="animate-page-enter space-y-6">
      <div className="card-base page-header-accent p-5">
        <div className="skeleton h-8 w-48 mb-2"></div>
        <div className="skeleton h-4 w-72"></div>
      </div>
      <div className="card-base p-6 space-y-4">
        {[1,2,3,4,5].map(i => (
          <div key={i}>
            <div className="skeleton h-3 w-24 mb-2"></div>
            <div className="skeleton h-10 w-full max-w-xl"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Page Header */}
      <div className="card-base page-header-accent p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Profil Koperasi</h1>
            <p className="text-sm text-gray-500">Kelola informasi profil koperasi</p>
          </div>
        </div>
      </div>

      {/* Success notification */}
      {info && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {info}
        </div>
      )}

      {/* Form */}
      <div className="card-base p-6">
        <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
          {[
            { label: "Nama Koperasi", key: "koperasi", placeholder: "Masukkan nama koperasi" },
            { label: "Alamat", key: "alamat", placeholder: "Masukkan alamat lengkap" },
            { label: "Kota", key: "kota", placeholder: "Masukkan kota dan kode pos" },
            { label: "No. HP / Telepon", key: "hp", placeholder: "Contoh: +628123456789" },
            { label: "Email", key: "email", placeholder: "Contoh: koperasi@email.com" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="label-modern">{label}</label>
              <input 
                type="text" 
                value={form[key] || ""} 
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="input-modern" 
              />
            </div>
          ))}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={saving}
              className="btn-primary"
            >
              <Save className="w-4 h-4" />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
