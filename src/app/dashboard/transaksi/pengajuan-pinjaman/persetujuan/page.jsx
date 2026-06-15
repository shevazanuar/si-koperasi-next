"use client";
import { useState, useEffect } from "react";
import { FileSearch, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { showConfirm, showSuccess, showError } from "@/lib/swal";

export default function PersetujuanPinjamanPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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
    // Only show Open/Pending
    const pendingData = (json.data || []).filter(item => !item.status || item.status === "Open");
    setData(pendingData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatus = async (nomor, status) => {
    const isAcc = status === "Acc";
    const label = isAcc ? "menyetujui" : "menolak";
    const actionTitle = isAcc ? "Setujui Pengajuan?" : "Tolak Pengajuan?";
    const actionText = isAcc 
      ? `Apakah Anda yakin ingin menyetujui pengajuan pinjaman nomor ${nomor}?` 
      : `Apakah Anda yakin ingin menolak pengajuan pinjaman nomor ${nomor}?`;
    
    const confirmed = await showConfirm(actionTitle, actionText, isAcc ? "Ya, Setujui" : "Ya, Tolak");
    if (!confirmed) return;
    try {
      const res = await fetch("/api/transaksi/pengajuan-pinjaman", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomor, status }),
      });
      const json = await res.json();
      if (res.ok) {
        showSuccess("Berhasil", json.message || `Pengajuan pinjaman berhasil di-${label}`);
        window.dispatchEvent(new Event("pinjamanUpdated"));
        fetchData();
      } else {
        showError("Gagal", json.error || json.message || "Gagal memperbarui status pengajuan");
      }
    } catch (err) {
      showError("Kesalahan", "Terjadi kesalahan koneksi server");
    }
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
    </div>
  );
}
