"use client";
import { useState, useEffect } from "react";
import { FileSearch, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { showConfirm, showSuccess, showError } from "@/lib/swal";

export default function PersetujuanPinjamanPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sumberDanaData, setSumberDanaData] = useState({ kas: [], bank: [] });
  const [approveModal, setApproveModal] = useState({ show: false, nomor: null });
  const [sumberDanaType, setSumberDanaType] = useState("Kas");
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const fetchUser = async () => {
    const res = await fetch("/api/auth/session"); 
    const json = await res.json();
    setUser(json.user || null);
  };

  const fetchData = async () => {
    setLoading(true);
    await fetchUser();
    const res = await fetch("/api/transaksi/pengajuan-pinjaman");
    const json = await res.json();
    const pendingData = (json.data || []).filter(item => !item.status || item.status === "Open");
    setData(pendingData);
    
    // Ambil data kas & bank
    const resDana = await fetch("/api/sumber-dana");
    if (resDana.ok) {
      const jsonDana = await resDana.json();
      setSumberDanaData({ kas: jsonDana.kas || [], bank: jsonDana.bank || [] });
    }
    
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const submitStatus = async (nomor, status, extraData = {}) => {
    try {
      const res = await fetch("/api/transaksi/pengajuan-pinjaman", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomor, status, ...extraData }),
      });
      const json = await res.json();
      if (res.ok) {
        showSuccess("Berhasil", json.message || "Pengajuan pinjaman berhasil diproses");
        window.dispatchEvent(new Event("pinjamanUpdated"));
        setApproveModal({ show: false, nomor: null });
        fetchData();
      } else {
        showError("Gagal", json.error || json.message || "Gagal memperbarui status pengajuan");
      }
    } catch (err) {
      showError("Kesalahan", "Terjadi kesalahan koneksi server");
    }
  };

  const handleStatus = async (nomor, status) => {
    if (status === "Acc") {
      setApproveModal({ show: true, nomor });
      setSumberDanaType("Kas");
      setSelectedAccountId("");
      return;
    }

    const confirmed = await showConfirm("Tolak Pengajuan?", `Apakah Anda yakin ingin menolak pengajuan pinjaman nomor ${nomor}?`, "Ya, Tolak");
    if (!confirmed) return;
    submitStatus(nomor, status);
  };

  const statusBadge = (s) => {
    return <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-700"><Clock className="w-3 h-3" /> Menunggu</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2.5 rounded-xl text-white"><Clock className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Persetujuan Pinjaman</h1>
            <p className="text-sm text-gray-500">Review dan approve pengajuan pinjaman anggota</p>
          </div>
        </div>
        <Link href="/dashboard/transaksi/pengajuan-pinjaman" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition">
            <ArrowLeft className="w-4 h-4" /> Kembali ke History
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-400">Memuat...</div> : data.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Tidak ada pengajuan pinjaman yang menunggu persetujuan.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">No. Pengajuan</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Anggota</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Jenis & Jumlah</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Tenor</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Keperluan</th>
              <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              {user?.role === "admin" && (
                <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">Aksi</th>
              )}
            </tr></thead>
            <tbody>{data.map((item) => (
              <tr key={item.nomor} className="border-b border-gray-50 hover:bg-amber-50/20">
                <td className="px-6 py-3 font-mono text-xs text-amber-600 font-bold">{item.nomor}</td>
                <td className="px-6 py-3">
                  <p className="font-bold text-gray-900">{item.nama_anggota}</p>
                  <p className="text-xs text-gray-400">{item.nik}</p>
                 </td>
                 <td className="px-6 py-3">
                  <p className="text-gray-600 font-semibold">{item.nama_jenis}</p>
                  <p className="text-sm font-black text-amber-700">Rp {new Intl.NumberFormat("id-ID").format(item.jumlah || 0)}</p>
                </td>
                <td className="px-6 py-3 text-gray-600">{item.lama} {item.satuan || 'Bulan'}</td>
                <td className="px-6 py-3 text-gray-500 text-xs italic max-w-xs truncate" title={item.keperluan}>
                  {item.keperluan || "-"}
                </td>
                <td className="px-6 py-3 text-center">{statusBadge(item.status)}</td>
                {user?.role === "admin" && (
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <Link href={`/dashboard/transaksi/pengajuan-pinjaman/${item.id}`} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition" title="Detail">
                        <FileSearch className="w-5 h-5" />
                      </Link>
                      <button onClick={() => handleStatus(item.nomor, "Acc")} className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition" title="Setujui">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleStatus(item.nomor, "Cancel")} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition" title="Tolak">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {/* Modal Approve */}
      {approveModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 max-w-md w-full animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-gray-900 mb-2">Pilih Sumber Dana</h2>
            <p className="text-sm text-gray-500 mb-6">Pilih kas atau bank untuk pencairan dana pengajuan pinjaman nomor <span className="font-bold text-gray-700">{approveModal.nomor}</span>.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Tipe Sumber Dana</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setSumberDanaType("Kas"); setSelectedAccountId(""); }} className={`py-2.5 rounded-xl text-sm font-bold transition-all border ${sumberDanaType === "Kas" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Kas</button>
                  <button onClick={() => { setSumberDanaType("Bank"); setSelectedAccountId(""); }} className={`py-2.5 rounded-xl text-sm font-bold transition-all border ${sumberDanaType === "Bank" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Bank</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Pilih {sumberDanaType}
                </label>
                <select 
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">-- Pilih {sumberDanaType} --</option>
                  {sumberDanaType === "Kas" && sumberDanaData.kas.map(k => (
                    <option key={k.id} value={k.id}>{k.nama_kas} (Saldo: Rp {new Intl.NumberFormat("id-ID").format(k.saldo)})</option>
                  ))}
                  {sumberDanaType === "Bank" && sumberDanaData.bank.map(b => (
                    <option key={b.id} value={b.id}>{b.nama_bank} - {b.nomor_rekening} (Saldo: Rp {new Intl.NumberFormat("id-ID").format(b.saldo)})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setApproveModal({ show: false, nomor: null })}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all active:scale-95"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  if (!selectedAccountId) {
                    showError("Perhatian", "Pilih akun sumber dana terlebih dahulu");
                    return;
                  }
                  submitStatus(approveModal.nomor, "Acc", { 
                    sumber_dana: sumberDanaType, 
                    kas_id: sumberDanaType === "Kas" ? parseInt(selectedAccountId) : null,
                    akun_bank_id: sumberDanaType === "Bank" ? parseInt(selectedAccountId) : null
                  });
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Proses Pencairan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
