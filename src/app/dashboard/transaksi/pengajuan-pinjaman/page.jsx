"use client";
import { useState, useEffect } from "react";
import { FileSearch, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { showConfirm, showSuccess, showError } from "@/lib/swal";

export default function PengajuanPinjamanPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    
    // Directly fetch session so we have the value immediately
    const sessionRes = await fetch("/api/auth/session");
    const sessionJson = await sessionRes.json();
    const currentUser = sessionJson.user || null;
    setUser(currentUser);

    const res = await fetch("/api/transaksi/pengajuan-pinjaman");
    const json = await res.json();
    const historyData = (json.data || []).filter(item => {
      if (currentUser?.role === "admin") return item.status === "Acc" || item.status === "Cancel";
      return true; // Anggota melihat semua pengajuannya
    });
    setData(historyData);

    const fetchPendingCount = async () => {
      if (currentUser?.role === "admin") {
        try {
          const countRes = await fetch("/api/transaksi/pengajuan-pinjaman/pending-count");
          const countJson = await countRes.json();
          setPendingCount(countJson.count || 0);
        } catch (err) {}
      }
    };

    await fetchPendingCount();

    setLoading(false);

    // Listen for custom event when approval happens
    const handleUpdate = () => fetchPendingCount();
    window.addEventListener("pinjamanUpdated", handleUpdate);
    
    // Cleanup is tricky in an async fetchData inside a useEffect without a clean return,
    // but we can attach it globally for the lifespan of the component.
    // A better way is to move the event listener to the useEffect.
  };

  useEffect(() => {
    fetchData();

    const handleUpdate = () => {
      fetch("/api/transaksi/pengajuan-pinjaman/pending-count")
        .then(res => res.json())
        .then(data => setPendingCount(data.count || 0))
        .catch(() => {});
    };

    window.addEventListener("pinjamanUpdated", handleUpdate);
    const intervalId = setInterval(handleUpdate, 30000);

    return () => {
      window.removeEventListener("pinjamanUpdated", handleUpdate);
      clearInterval(intervalId);
    };
  }, []);

  const handleStatus = async () => {}; // Moved to persetujuan page

  const statusBadge = (s) => {
    if (s === "Acc") return <span className="badge badge-success"><CheckCircle className="w-3 h-3" /> Disetujui</span>;
    if (s === "Cancel") return <span className="badge badge-danger"><XCircle className="w-3 h-3" /> Ditolak</span>;
    return <span className="badge badge-warning"><Clock className="w-3 h-3" /> Menunggu</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white"><FileSearch className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-black text-gray-900">
              {user?.role === "admin" ? "History Pengajuan Pinjaman" : "Pengajuan Pinjaman Saya"}
            </h1>
            <p className="text-sm text-gray-500">
              {user?.role === "admin" 
                ? "Riwayat seluruh pengajuan pinjaman" 
                : "Pantau status pengajuan pinjaman Anda"}
            </p>
          </div>
        </div>
        {user?.role === "admin" && (
          <Link href="/dashboard/transaksi/pengajuan-pinjaman/persetujuan" className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm relative">
            <Clock className="w-4 h-4" /> Persetujuan Pinjaman
            {pendingCount > 0 && (
               <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-400">Memuat...</div> : data.length === 0 ? (
          <div className="p-12 text-center">
            <FileSearch className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Tidak ada data pengajuan pinjaman.</p>
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
              <tr key={item.nomor} className="border-b border-gray-50 hover:bg-blue-50/20">
                <td className="px-6 py-3 font-mono text-xs text-blue-600 font-bold">{item.nomor}</td>
                <td className="px-6 py-3">
                  <p className="font-bold text-gray-900">{item.nama_anggota}</p>
                  <p className="text-xs text-gray-400">{item.nik}</p>
                </td>
                <td className="px-6 py-3">
                  <p className="text-gray-600 font-semibold">{item.nama_jenis}</p>
                  <p className="text-sm font-black text-blue-700">Rp {new Intl.NumberFormat("id-ID").format(item.jumlah || 0)}</p>
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
