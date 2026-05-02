"use client";
import { useState, useEffect } from "react";
import { FileSearch, CheckCircle, XCircle, Clock } from "lucide-react";

export default function PengajuanPinjamanPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState({ msg: "", type: "success" });

  const showInfo = (msg, type = "success") => { setInfo({ msg, type }); setTimeout(() => setInfo({ msg: "", type: "success" }), 3000); };

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/transaksi/pengajuan-pinjaman");
    const json = await res.json();
    setData(json.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatus = async (nomor, status) => {
    const label = status === "Acc" ? "menyetujui" : "menolak";
    if (!confirm(`Yakin ingin ${label} pengajuan ini?`)) return;
    const res = await fetch("/api/transaksi/pengajuan-pinjaman", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomor, status }),
    });
    const json = await res.json();
    showInfo(json.message || json.error, res.ok ? "success" : "error");
    fetchData();
  };

  const statusBadge = (s) => {
    if (s === "Acc") return <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700"><CheckCircle className="w-3 h-3" /> Disetujui</span>;
    if (s === "Cancel") return <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-red-50 text-red-700"><XCircle className="w-3 h-3" /> Ditolak</span>;
    return <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-700"><Clock className="w-3 h-3" /> Menunggu</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2.5 rounded-xl text-white"><FileSearch className="w-5 h-5" /></div>
        <div><h1 className="text-xl font-black text-gray-900">Pengajuan Pinjaman</h1><p className="text-sm text-gray-500">Review dan approve pengajuan pinjaman anggota</p></div>
      </div>

      {info.msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${info.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {info.type === "success" ? "✅" : "❌"} {info.msg}
        </div>
      )}

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
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Perusahaan</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Jenis Pinjaman</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Tanggal</th>
              <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">Aksi</th>
            </tr></thead>
            <tbody>{data.map((item) => (
              <tr key={item.nomor} className="border-b border-gray-50 hover:bg-blue-50/20">
                <td className="px-6 py-3 font-mono text-xs text-blue-600 font-bold">{item.nomor}</td>
                <td className="px-6 py-3">
                  <p className="font-bold text-gray-900">{item.nama_anggota}</p>
                  <p className="text-xs text-gray-400">{item.nik}</p>
                </td>
                <td className="px-6 py-3 text-gray-600">{item.perusahaan || "-"}</td>
                <td className="px-6 py-3 text-gray-600">{item.nama_jenis}</td>
                <td className="px-6 py-3 text-gray-500">{item.tanggal ? new Date(item.tanggal).toLocaleDateString("id-ID") : "-"}</td>
                <td className="px-6 py-3 text-center">{statusBadge(item.status)}</td>
                <td className="px-6 py-3 text-center">
                  {(!item.status || item.status === "Open") ? (
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleStatus(item.nomor, "Acc")} className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition" title="Setujui">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleStatus(item.nomor, "Cancel")} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition" title="Tolak">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Selesai</span>
                  )}
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
