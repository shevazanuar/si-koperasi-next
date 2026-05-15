"use client";
import React, { useState, useEffect } from "react";
import { BadgeCheck, Search, Trash2, Save, X, CreditCard } from "lucide-react";

const fmt = (n) => new Intl.NumberFormat("id-ID").format(n || 0);

export default function PembayaranPage() {
  const [payments, setPayments] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);
  const [selectedAnggota, setSelectedAnggota] = useState(null);
  const [cicilans, setCicilans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/session");
      const json = await res.json();
      if (!json.user || json.user.role !== "admin") {
        window.location.href = "/dashboard";
        return;
      }
      setUser(json.user);
    };
    checkAuth();
  }, []);

  const [info, setInfo] = useState({ msg: "", type: "success" });
  const [payForm, setPayForm] = useState({ detail_id: null, tgl_bayar: new Date().toISOString().split("T")[0], jumlah_bayar: "" });
  const [payingId, setPayingId] = useState(null);

  const showInfo = (msg, type = "success") => { setInfo({ msg, type }); setTimeout(() => setInfo({ msg: "", type: "success" }), 3000); };

  const fetchPayments = async () => {
    setLoading(true);
    const res = await fetch("/api/transaksi/pembayaran");
    const json = await res.json();
    setPayments(json.data || []);
    setLoading(false);
  };

  const fetchAnggota = async () => {
    try {
      const res = await fetch("/api/anggota?status=Aktif");
      if (!res.ok) throw new Error("Gagal mengambil data anggota");
      const json = await res.json();
      setAnggotaList(json.data ?? []);
    } catch (error) {
      console.error("fetchAnggota error:", error);
    }
  };

  useEffect(() => { fetchPayments(); fetchAnggota(); }, []);

  const handleSelectAnggota = async (a) => {
    setSelectedAnggota(a);
    setPayingId(null);
    const res = await fetch("/api/transaksi/pembayaran", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "list_pinjaman", anggota_id: a.id }),
    });
    const json = await res.json();
    setCicilans(json.data || []);
  };

  const handleBayar = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/transaksi/pembayaran", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "bayar", ...payForm }),
    });
    const json = await res.json();
    showInfo(json.message || json.error, res.ok ? "success" : "error");
    setPayingId(null);
    if (selectedAnggota) handleSelectAnggota(selectedAnggota);
    fetchPayments();
  };

  const handleHapus = async (id) => {
    if (!confirm("Reset pembayaran ini?")) return;
    const res = await fetch("/api/transaksi/pembayaran", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "hapus", id }),
    });
    const json = await res.json();
    showInfo(json.message || json.error, res.ok ? "success" : "error");
    fetchPayments();
  };

  const filtered = anggotaList.filter((a) =>
    a.nama.toLowerCase().includes(search.toLowerCase()) || a.nik.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2.5 rounded-xl text-white"><BadgeCheck className="w-5 h-5" /></div>
          <div><h1 className="text-xl font-black text-gray-900">Pembayaran Cicilan</h1><p className="text-sm text-gray-500">Bayar cicilan pinjaman anggota</p></div>
        </div>
      </div>

      {info.msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${info.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {info.type === "success" ? "✅" : "❌"} {info.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Anggota list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Cari nama/NIK..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {filtered.map((a) => (
              <button key={a.id} onClick={() => handleSelectAnggota(a)}
                className={`w-full px-4 py-3 text-left border-b border-gray-50 hover:bg-blue-50/50 transition ${selectedAnggota?.id === a.id ? "bg-blue-50" : ""}`}>
                <p className="text-sm font-bold text-gray-900">{a.nama}</p>
                <p className="text-xs text-gray-500">NIK: {a.nik}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Cicilan detail */}
        <div className="lg:col-span-2 space-y-4">
          {selectedAnggota ? (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900">{selectedAnggota.nama}</h2>
                <p className="text-sm text-gray-500">NIK: {selectedAnggota.nik}</p>
              </div>

              {cicilans.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                  <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Tidak ada cicilan yang belum dibayar.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xs font-bold text-gray-500 uppercase">Cicilan Belum Dibayar</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">No. Pinjaman</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">Cicilan ke</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Jatuh Tempo</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Angsuran</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Bunga</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">Aksi</th>
                    </tr></thead>
                    <tbody>{cicilans.map((c) => (
                      <React.Fragment key={c.id}>
                        <tr className="border-b border-gray-50 hover:bg-blue-50/20">
                          <td className="px-4 py-2.5 font-mono text-xs text-blue-600">{c.nomor_pinjaman}</td>
                          <td className="px-4 py-2.5 text-center font-bold text-gray-700">#{c.cicilan}</td>
                          <td className="px-4 py-2.5 text-gray-600">{c.tgl_jatuh_tempo ? new Date(c.tgl_jatuh_tempo).toLocaleDateString("id-ID") : "-"}</td>
                          <td className="px-4 py-2.5 text-right font-medium text-gray-900">Rp {fmt(c.angsuran)}</td>
                          <td className="px-4 py-2.5 text-right text-orange-600">Rp {fmt(c.bunga)}</td>
                          <td className="px-4 py-2.5 text-center">
                            <button onClick={() => { setPayingId(c.id); setPayForm({ detail_id: c.id, tgl_bayar: new Date().toISOString().split("T")[0], jumlah_bayar: String(c.angsuran + c.bunga) }); }}
                              className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition font-medium">Bayar</button>
                          </td>
                        </tr>
                        {payingId === c.id && (
                          <tr className="bg-emerald-50 border-b border-emerald-100">
                            <td colSpan={6} className="px-4 py-3">
                              <form onSubmit={handleBayar} className="flex gap-3 items-end flex-wrap">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Tanggal Bayar</label>
                                  <input type="date" required value={payForm.tgl_bayar} onChange={(e) => setPayForm({ ...payForm, tgl_bayar: e.target.value })}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Jumlah Bayar (Rp)</label>
                                  <input type="number" required value={payForm.jumlah_bayar} onChange={(e) => setPayForm({ ...payForm, jumlah_bayar: e.target.value })}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700 text-sm font-medium">
                                  <Save className="w-4 h-4" /> Simpan
                                </button>
                                <button type="button" onClick={() => setPayingId(null)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm">
                                  <X className="w-4 h-4" /> Batal
                                </button>
                              </form>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <BadgeCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">Pilih anggota untuk melihat cicilan yang belum dibayar.</p>
            </div>
          )}
        </div>
      </div>

      {/* Riwayat Pembayaran */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-xs font-bold text-gray-500 uppercase">Riwayat Pembayaran</h3>
        </div>
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div> : payments.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Belum ada riwayat pembayaran.</div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">No. Bayar</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Nama Anggota</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">No. Pinjaman</th>
              <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase">Cicilan</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Tgl Bayar</th>
              <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase">Jumlah</th>
              <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase">Aksi</th>
            </tr></thead>
            <tbody>{payments.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-blue-50/20">
                <td className="px-6 py-3 font-mono text-xs text-emerald-600 font-bold">{p.nomor_bayar}</td>
                <td className="px-6 py-3 font-medium text-gray-900">{p.nama}</td>
                <td className="px-6 py-3 font-mono text-xs text-blue-600">{p.nomor_pinjaman}</td>
                <td className="px-6 py-3 text-center text-gray-600">#{p.cicilan}</td>
                <td className="px-6 py-3 text-gray-600">{p.tgl_bayar || "-"}</td>
                <td className="px-6 py-3 text-right font-bold text-gray-900">Rp {fmt(p.jumlah_bayar)}</td>
                <td className="px-6 py-3 text-center">
                  <button onClick={() => handleHapus(p.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
