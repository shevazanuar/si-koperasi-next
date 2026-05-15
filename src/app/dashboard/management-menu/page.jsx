"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Save, ChevronRight } from "lucide-react";

export default function ManagementMenuPage() {
  const [levels, setLevels] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [checkedMenus, setCheckedMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/management-menu");
    const json = await res.json();
    setLevels(json.levels || []);
    setMenus(json.menus || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSelectLevel = (level) => {
    setSelectedLevel(level);
    const aksesArr = level.akses ? level.akses.split(",").map((s) => parseInt(s.trim())).filter(Boolean) : [];
    setCheckedMenus(aksesArr);
  };

  const toggleMenu = (menuId) => {
    setCheckedMenus((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  const handleSave = async () => {
    if (!selectedLevel) return;
    const res = await fetch("/api/management-menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level_id: selectedLevel.id, akses: checkedMenus }),
    });
    const json = await res.json();
    setInfo(json.message || json.error);
    fetchData();
    setTimeout(() => setInfo(""), 3000);
  };

  const rootMenus = menus.filter((m) => m.root === 0);
  const getChildren = (kode) => menus.filter((m) => m.root === kode);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2.5 rounded-xl text-white shadow-md shadow-purple-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Management Menu</h1>
            <p className="text-sm text-gray-500">Atur akses menu berdasarkan level pengguna</p>
          </div>
        </div>
      </div>

      {info && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">✅ {info}</div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-100">Memuat data...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Level List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Level Pengguna</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {levels.map((level) => (
                <button key={level.id} onClick={() => handleSelectLevel(level)}
                  className={`w-full px-6 py-4 text-left flex items-center justify-between transition group ${
                    selectedLevel?.id === level.id
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}>
                  <div>
                    <p className="font-bold text-sm">{level.level}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {level.akses ? level.akses.split(",").length : 0} menu
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${selectedLevel?.id === level.id ? "text-blue-500" : "text-gray-300"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Menu Checklist */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {selectedLevel ? `Akses Menu: ${selectedLevel.level}` : "Pilih Level"}
              </h3>
              {selectedLevel && (
                <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition text-sm font-medium shadow-md shadow-blue-500/20">
                  <Save className="w-4 h-4" /> Simpan
                </button>
              )}
            </div>

            {selectedLevel ? (
              <div className="p-6 space-y-2">
                {rootMenus.map((m) => (
                  <div key={m.id}>
                    <label className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition cursor-pointer">
                      <input type="checkbox" checked={checkedMenus.includes(m.id)}
                        onChange={() => toggleMenu(m.id)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="font-bold text-sm text-gray-900">{m.nama}</span>
                      <span className="text-xs text-gray-400 font-mono">({m.kode})</span>
                    </label>
                    {getChildren(m.kode).map((child) => (
                      <label key={child.id} className="flex items-center gap-3 px-4 py-2.5 ml-8 rounded-xl hover:bg-gray-50 transition cursor-pointer">
                        <input type="checkbox" checked={checkedMenus.includes(child.id)}
                          onChange={() => toggleMenu(child.id)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">{child.nama}</span>
                        <span className="text-xs text-gray-400 font-mono">({child.kode})</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400 text-sm">
                Pilih level di sebelah kiri untuk mengatur akses menu.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
