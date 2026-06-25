"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { showConfirm, showSuccess, showError } from "@/lib/swal";
import { useRouter } from "next/navigation";

export default function ActionButtons({ nomor }) {
  const router = useRouter();
  const [sumberDanaData, setSumberDanaData] = useState({ kas: [], bank: [] });
  const [approveModal, setApproveModal] = useState(false);
  const [sumberDanaType, setSumberDanaType] = useState("Kas");
  const [selectedAccountId, setSelectedAccountId] = useState("");

  useEffect(() => {
    // Ambil data kas & bank saat komponen di-mount
    const fetchSumberDana = async () => {
      try {
        const resDana = await fetch("/api/sumber-dana");
        if (resDana.ok) {
          const jsonDana = await resDana.json();
          setSumberDanaData({ kas: jsonDana.kas || [], bank: jsonDana.bank || [] });
        }
      } catch (error) {
        console.error("Gagal memuat sumber dana", error);
      }
    };
    fetchSumberDana();
  }, []);

  const submitStatus = async (status, extraData = {}) => {
    try {
      const res = await fetch("/api/transaksi/pengajuan-pinjaman", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomor, status, ...extraData }),
      });
      const json = await res.json();
      if (res.ok) {
        showSuccess("Berhasil", json.message || "Pengajuan pinjaman berhasil diproses");
        window.dispatchEvent(new Event("pinjamanUpdated"));
        setApproveModal(false);
        router.push("/dashboard/transaksi/pengajuan-pinjaman");
        router.refresh();
      } else {
        showError("Gagal", json.error || json.message || "Gagal memperbarui status pengajuan");
      }
    } catch (err) {
      showError("Kesalahan", "Terjadi kesalahan koneksi server");
    }
  };

  const handleStatus = async (status) => {
    if (status === "Acc") {
      setApproveModal(true);
      setSumberDanaType("Kas");
      setSelectedAccountId("");
      return;
    }

    const confirmed = await showConfirm("Tolak Pengajuan?", `Apakah Anda yakin ingin menolak pengajuan pinjaman nomor ${nomor}?`, "Ya, Tolak");
    if (!confirmed) return;
    submitStatus(status);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => handleStatus("Acc")}
          className="bg-white text-blue-600 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-colors"
        >
          Setujui
        </button>
        <button 
          onClick={() => handleStatus("Cancel")}
          className="bg-blue-700 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-colors"
        >
          Tolak
        </button>
      </div>

      {/* Modal Approve */}
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 max-w-md w-full animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-gray-900 mb-2">Pilih Sumber Dana</h2>
            <p className="text-sm text-gray-500 mb-6">Pilih kas atau bank untuk pencairan dana pengajuan pinjaman nomor <span className="font-bold text-gray-700">{nomor}</span>.</p>
            
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
                onClick={() => setApproveModal(false)}
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
                  submitStatus("Acc", { 
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
    </>
  );
}
