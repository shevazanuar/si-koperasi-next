"use client";

import { useActionState } from "react";
import { updateAnggota } from "../../actions";
import { User, IdCard, Phone, MapPin, Calendar, Save, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function EditAnggotaForm({ data }) {
  // Bind ID to the update action
  const updateAnggotaWithId = updateAnggota.bind(null, data.id);
  const [state, formAction, isPending] = useActionState(updateAnggotaWithId, null);

  return (
    <form action={formAction} className="p-8 lg:p-12 space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-50">
            <User className="w-5 h-5 text-blue-600" />
            Profil Dasar
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">Nama Lengkap</label>
              <input
                name="nama"
                type="text"
                defaultValue={data.nama}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">NIK</label>
                <input
                  name="nik"
                  type="text"
                  defaultValue={data.nik}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">No Identitas</label>
                <input
                  name="noidentitas"
                  type="text"
                  defaultValue={data.noidentitas}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">Status Anggota</label>
              <select 
                name="status"
                defaultValue={data.status || "Aktif"}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-sm"
              >
                <option value="Aktif">Aktif</option>
                <option value="Keluar">Keluar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-50">
            <IdCard className="w-5 h-5 text-blue-600" />
            Lain-lain
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">Jenis Kelamin</label>
                <select 
                  name="jk"
                  defaultValue={data.jk}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-sm"
                >
                  <option value="L">Laki-Laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">Tgl Lahir</label>
                <input
                  name="tgl_lahir"
                  type="date"
                  defaultValue={data.tgl_lahir}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">Nomor HP</label>
              <input
                name="hp"
                type="tel"
                defaultValue={data.hp}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">Alamat</label>
              <textarea
                name="alamat"
                rows="2"
                defaultValue={data.alamat}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium resize-none"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 italic">
          Anggota ini terdaftar sejak: {new Date(data.tgl_masuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
            <Link 
                href="/dashboard/anggota"
                className="flex-1 md:flex-none text-center px-8 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
            >
                Batalkan
            </Link>
            <button
                disabled={isPending}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Simpan Perubahan
            </button>
        </div>
      </div>

      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold antialiased">
            {state.error}
        </div>
      )}
    </form>
  );
}
