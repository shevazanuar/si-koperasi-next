"use client";
import { useState, useEffect } from "react";
import { ArrowDownCircle, Search, Trash2, Save, X } from "lucide-react";
import { showConfirm, showSuccess, showError } from "@/lib/swal";

export default function PenarikanPage() {
  const [anggotaList, setAnggotaList] = useState([]);
  const [jenisSimpanan, setJenisSimpanan] = useState([]);
  const [selectedAnggota, setSelectedAnggota] = useState(null);
  const [details, setDetails] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saldo, setSaldo] = useState(0);
  const [form, setForm] = useState({ tgl: new Date().toISOString().split("T")[0], jenis_simpanan_id: "", jumlah: "" });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fmt = (n) => new Intl.NumberFormat("id-ID").format(n || 0);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/transaksi/penarikan");
    const json = await res.json();
    setAnggotaList(json.data || []);
    setJenisSimpanan(json.jenisSimpanan || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSelectAnggota = async (a) => {
    setSelectedAnggota(a);
    setShowForm(false);
    const res = await fetch("/api/transaksi/penarikan", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "detail", anggota_id: a.id }),
    });
    const json = await res.json();
    setDetails(json.data || []);
  };

  const handleCheckSaldo = async (jenisId) => {
    if (!selectedAnggota || !jenisId) return;
    const res = await fetch("/api/transaksi/penarikan", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "saldo", anggota_id: selectedAnggota.id, jenis_simpanan_id: jenisId }),
    });
    const json = await res.json();
    setSaldo(json.saldo || 0);
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!selectedAnggota) return;
    try {
      const res = await fetch("/api/transaksi/penarikan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simpan", anggota_id: selectedAnggota.id, ...form }),
      });
      const json = await res.json();
      if (res.ok) {
        showSuccess("Berhasil", json.message || "Transaksi penarikan berhasil disimpan");
        setShowForm(false);
        setForm({ tgl: new Date().toISOString().split("T")[0], jenis_simpanan_id: "", jumlah: "" });
        handleSelectAnggota(selectedAnggota);
        fetchData();
      } else {
        showError("Gagal", json.error || json.message || "Gagal memproses penarikan");
      }
    } catch (err) {
      showError("Kesalahan", "Terjadi kesalahan koneksi server");
    }
  };

  const handleHapus = async (id) => {
    const confirmed = await showConfirm("Hapus Penarikan?", "Apakah Anda yakin ingin menghapus data penarikan ini? Saldo anggota akan dikembalikan.");
    if (!confirmed) return;
    try {
      const res = await fetch("/api/transaksi/penarikan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hapus", id }),
      });
      const json = await res.json();
      if (res.ok) {
        showSuccess("Berhasil", json.message || "Data penarikan berhasil dihapus");
        if (selectedAnggota) handleSelectAnggota(selectedAnggota);
        fetchData();
      } else {
        showError("Gagal", json.error || json.message || "Gagal menghapus penarikan");
      }
    } catch (err) {
      showError("Kesalahan", "Terjadi kesalahan koneksi server");
    }
  };

  const filtered = anggotaList.filter((a) =>
    a.nama.toLowerCase().includes(search.toLowerCase()) || a.nik.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2.5 rounded-xl text-white"><ArrowDownCircle className="w-5 h-5" /></div>
          <div><h1 className="text-xl font-black text-gray-900">Penarikan Dana</h1><p className="text-sm text-gray-500">Kelola penarikan simpanan anggota</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daftar Anggota */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Cari nama/NIK..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {loading ? <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div> : filtered.map((a) => (
              <button key={a.id} onClick={() => handleSelectAnggota(a)}
                className={`w-full px-4 py-3 text-left border-b border-gray-50 hover:bg-blue-50/50 transition ${selectedAnggota?.id === a.id ? "bg-blue-50" : ""}`}>
                <p className="text-sm font-bold text-gray-900">{a.nama}</p>
                <p className="text-xs text-gray-500">NIK: {a.nik} | Saldo: Rp {fmt(a.saldo)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Penarikan */}
        <div className="lg:col-span-2 space-y-4">
          {selectedAnggota ? (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="font-bold text-gray-900">{selectedAnggota.nama}</h2>
                    <p className="text-sm text-gray-500">NIK: {selectedAnggota.nik} | JK: {selectedAnggota.jk}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Saldo Efektif</p>
                    <p className="text-xl font-black text-emerald-600">Rp {fmt(selectedAnggota.saldo)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 rounded-xl p-3"><p className="text-xs text-gray-500">Simpanan</p><p className="font-bold text-blue-700">Rp {fmt(selectedAnggota.jml_simpanan)}</p></div>
                  <div className="bg-pink-50 rounded-xl p-3"><p className="text-xs text-gray-500">Penarikan</p><p className="font-bold text-pink-700">Rp {fmt(selectedAnggota.jml_penarikan)}</p></div>
                  <div className="bg-emerald-50 rounded-xl p-3"><p className="text-xs text-gray-500">Saldo</p><p className="font-bold text-emerald-700">Rp {fmt(selectedAnggota.saldo)}</p></div>
                </div>
                <button onClick={() => setShowForm(true)} className="mt-4 bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition text-sm font-medium w-full justify-center">
                  + Tambah Penarikan
                </button>
              </div>

              {showForm && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Form Penarikan</h3>
                  <form onSubmit={handleSimpan} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-semibold text-gray-500 mb-1">Tanggal</label>
                        <input type="date" required value={form.tgl} onChange={(e) => setForm({ ...form, tgl: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-xs font-semibold text-gray-500 mb-1">Jenis Simpanan</label>
                        <select required value={form.jenis_simpanan_id} onChange={(e) => { setForm({ ...form, jenis_simpanan_id: e.target.value }); handleCheckSaldo(e.target.value); }}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Pilih...</option>
                          {jenisSimpanan.map((j) => <option key={j.id} value={j.id}>{j.nama}</option>)}
                        </select></div>
                    </div>
                    {form.jenis_simpanan_id && <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-xl text-sm text-yellow-700">Saldo jenis ini: <strong>Rp {fmt(saldo)}</strong></div>}
                    <div><label className="block text-xs font-semibold text-gray-500 mb-1">Jumlah Penarikan (Rp)</label>
                      <input type="number" required min="1" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="flex gap-2">
                      <button type="submit" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 text-sm font-medium"><Save className="w-4 h-4" /> Simpan</button>
                      <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm"><X className="w-4 h-4" /> Batal</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50"><h3 className="text-xs font-bold text-gray-500 uppercase">Riwayat Penarikan</h3></div>
                {details.length === 0 ? <div className="p-8 text-center text-gray-400 text-sm">Belum ada penarikan.</div> : (
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">No</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Nomor</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Jenis</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Jumlah</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">Aksi</th>
                    </tr></thead>
                    <tbody>{details.map((d, i) => (
                      <tr key={d.id} className="border-b border-gray-50 hover:bg-blue-50/30">
                        <td className="px-4 py-2.5 text-gray-500">{i + 1}</td>
                        <td className="px-4 py-2.5 font-mono text-blue-600 font-medium text-xs">{d.nomor}</td>
                        <td className="px-4 py-2.5 text-gray-600">{new Date(d.tgl).toLocaleDateString("id-ID")}</td>
                        <td className="px-4 py-2.5 text-gray-600">{d.nama_simpanan}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-gray-900">Rp {fmt(d.jumlah)}</td>
                        <td className="px-4 py-2.5 text-center"><button onClick={() => handleHapus(d.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <ArrowDownCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">Pilih anggota untuk melihat detail dan membuat penarikan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
