"use client";

import { useActionState } from "react";
import { createSimpanan } from "../actions";
import { Wallet, User, Calendar, Save, Loader2 } from "lucide-react";

export default function TambahSimpananForm({ anggota, jenisSimpanan, user }) {
  const [state, formAction, isPending] = useActionState(createSimpanan, null);
  const isMember = user?.role === "anggota";

  return (
    <form action={formAction} className="p-8 lg:p-10 space-y-6">
      
      <div className="space-y-4">
        {/* Anggota Selector */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            {isMember ? 'Identitas Anggota' : 'Pilih Anggota'}
          </label>
          <div className="relative">
            {isMember ? (
              <div className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-2xl font-bold text-sm text-blue-700 flex items-center justify-between">
                <span>{user.name}</span>
                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-md uppercase tracking-widest">Self</span>
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
                          document.getElementById("anggota_id_hidden").value = item.id;
                      }
                  }}
                  required
                />
                <input type="hidden" name="anggota_id" id="anggota_id_hidden" />
                <datalist id="anggota-list">
                  {anggota.map((a) => (
                    <option key={a.id} value={`${a.nik} - ${a.nama}`} />
                  ))}
                </datalist>
              </>
            )}
          </div>
        </div>

        {/* Jenis Simpanan */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-gray-400" />
            Jenis Simpanan
          </label>
          <select
            name="jenis_simpanan_id"
            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-sm"
            required
          >
            <option value="">Pilih Jenis...</option>
            {jenisSimpanan.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nama} (Min. {new Intl.NumberFormat('id-ID').format(j.jumlah)})
              </option>
            ))}
          </select>
        </div>

        {/* Jumlah & Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Jumlah (Rp)</label>
            <input
              name="jumlah"
              type="number"
              placeholder="0"
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-lg"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
               <Calendar className="w-4 h-4 text-gray-400" />
               Tanggal
            </label>
            <input
              name="tgl"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-sm"
              required
            />
          </div>
        </div>
      </div>

      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold animate-pulse">
          {state.error}
        </div>
      )}

      <div className="pt-4">
        <button
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
        >
          {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          Simpan Transaksi
        </button>
      </div>
    </form>
  );
}
