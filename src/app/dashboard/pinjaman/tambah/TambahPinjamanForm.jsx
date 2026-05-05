"use client";

import { useActionState, useState } from "react";
import { createPinjaman } from "../actions";
import { CreditCard, User, Calendar, Save, Loader2, Clock, Percent, FileSearch } from "lucide-react";

export default function TambahPinjamanForm({ anggota, jenisPinjaman, user }) {
  const [state, formAction, isPending] = useActionState(createPinjaman, null);
  const [selectedType, setSelectedType] = useState(null);
  const isMember = user?.role === "anggota";

  const handleTypeChange = (e) => {
    const type = jenisPinjaman.find(j => j.id.toString() === e.target.value);
    setSelectedType(type);
  };

  return (
    <form action={formAction} className="p-8 lg:p-10 space-y-6">
      
      <div className="space-y-6">
        {/* Anggota Selector */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            {isMember ? 'Nama Pemohon' : 'Pilih Anggota'}
          </label>
          <div className="relative">
            {isMember ? (
              <div className="w-full px-4 py-3 bg-orange-50/50 border border-orange-100 rounded-2xl font-bold text-sm text-orange-700 flex items-center justify-between">
                <span>{user.name}</span>
                <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded-md uppercase tracking-widest">Self</span>
                <input type="hidden" name="anggota_id" value={user.id} />
              </div>
            ) : (
              <>
                <input
                  list="anggota-list"
                  name="anggota_id_search"
                  placeholder="Cari NIK atau Nama..."
                  autoComplete="off"
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-sm"
                  onChange={(e) => {
                      const val = e.target.value;
                      const item = anggota.find(a => `${a.nik} - ${a.nama}` === val);
                      if (item) {
                          document.getElementById("anggota_id_hidden_p").value = item.id;
                      }
                  }}
                  required
                />
                <input type="hidden" name="anggota_id" id="anggota_id_hidden_p" />
                <datalist id="anggota-list">
                  {anggota.map((a) => (
                    <option key={a.id} value={`${a.nik} - ${a.nama}`} />
                  ))}
                </datalist>
              </>
            )}
          </div>
        </div>

        {/* Jenis Pinjaman */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            Pilih Jenis Pinjaman
          </label>
          <select
            name="jenis_pinjaman_id"
            onChange={handleTypeChange}
            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-sm"
            required
          >
            <option value="">Pilih Skema Pinjaman...</option>
            {jenisPinjaman.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Jumlah Pinjaman (Rp)</label>
            <input
              name="jumlah"
              type="number"
              value={selectedType?.jumlah || ""}
              readOnly={!!selectedType}
              onChange={() => {}} // Controlled but read-only
              placeholder="0"
              className={`w-full px-4 py-3 border border-transparent rounded-2xl transition-all outline-none font-bold text-lg ${selectedType ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'}`}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    Tenor
                </label>
                <div className="relative">
                  <input
                    name="lama"
                    type="number"
                    value={selectedType?.lama || ""}
                    readOnly={!!selectedType}
                    onChange={() => {}}
                    className={`w-full px-4 py-3 border border-transparent rounded-2xl transition-all outline-none font-bold pr-10 ${selectedType ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'}`}
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">Bln</span>
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1">
                    <Percent className="w-3 h-3 text-gray-400" />
                    Bunga
                </label>
                <div className="relative">
                  <input
                    name="bunga"
                    type="number"
                    step="0.1"
                    value={selectedType?.bunga || ""}
                    readOnly={!!selectedType}
                    onChange={() => {}}
                    className={`w-full px-4 py-3 border border-transparent rounded-2xl transition-all outline-none font-bold pr-10 ${selectedType ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'}`}
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">%</span>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
             <Calendar className="w-4 h-4 text-gray-400" />
             Tanggal Pengajuan
          </label>
          <input
            name="tgl"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
             <FileSearch className="w-4 h-4 text-gray-400" />
             Keperluan Pinjaman
          </label>
          <textarea
            name="keperluan"
            placeholder="Contoh: Biaya pendidikan, Renovasi rumah, dll..."
            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-sm min-h-[100px]"
          ></textarea>
        </div>
      </div>

      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
          {state.error}
        </div>
      )}

      <div className="pt-6">
        <button
          disabled={isPending}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
        >
          {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          Kirim Pengajuan Pinjaman
        </button>
      </div>
    </form>
  );
}
