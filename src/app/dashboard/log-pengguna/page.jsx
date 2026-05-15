"use client";

import { useState, useEffect } from "react";
import { ScrollText, Trash2, AlertTriangle } from "lucide-react";

export default function LogPenggunaPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/log-pengguna");
    const json = await res.json();
    setLogs(json.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id, ip) => {
    if (!confirm("Hapus log ini?")) return;
    const res = await fetch(`/api/log-pengguna?id=${encodeURIComponent(id)}&ip=${encodeURIComponent(ip)}`, { method: "DELETE" });
    const json = await res.json();
    setInfo(json.message);
    fetchData();
    setTimeout(() => setInfo(""), 3000);
  };

  const handleDeleteAll = async () => {
    if (!confirm("Hapus SEMUA log?")) return;
    const res = await fetch("/api/log-pengguna?all=true", { method: "DELETE" });
    const json = await res.json();
    setInfo(json.message);
    fetchData();
    setTimeout(() => setInfo(""), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 p-2.5 rounded-xl text-white"><ScrollText className="w-5 h-5" /></div>
          <div><h1 className="text-xl font-black text-gray-900">Log Pengguna</h1><p className="text-sm text-gray-500">Data sesi pengguna</p></div>
        </div>
        <button onClick={handleDeleteAll} className="bg-red-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-red-700 transition text-sm font-medium">
          <Trash2 className="w-4 h-4" /> Hapus Semua
        </button>
      </div>
      {info && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">✅ {info}</div>}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-400">Memuat...</div> : logs.length === 0 ? (
          <div className="p-12 text-center"><AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-400 text-sm">Tidak ada data.</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">No</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Session ID</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">IP Address</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Waktu</th>
              <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">Aksi</th>
            </tr></thead>
            <tbody>{logs.map((log, idx) => (
              <tr key={`${log.id}-${log.ip_address}`} className="border-b border-gray-50 hover:bg-blue-50/30">
                <td className="px-6 py-3 text-gray-500">{idx + 1}</td>
                <td className="px-6 py-3 font-mono text-xs text-gray-600 max-w-xs truncate">{log.id}</td>
                <td className="px-6 py-3 text-gray-700 font-medium">{log.ip_address}</td>
                <td className="px-6 py-3 text-gray-500">{new Date(log.datetime).toLocaleString("id-ID")}</td>
                <td className="px-6 py-3 text-center"><button onClick={() => handleDelete(log.id, log.ip_address)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
