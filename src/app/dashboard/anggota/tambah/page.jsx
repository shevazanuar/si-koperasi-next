"use client";

import { useActionState } from "react";
import { createAnggota } from "../actions";
import { User, IdCard, Phone, MapPin, Calendar, ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function TambahAnggotaPage() {
  const [state, formAction, isPending] = useActionState(createAnggota, null);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link 
            href="/dashboard/anggota" 
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm font-semibold mb-2 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Daftar
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pendaftaran Anggota Baru</h1>
          <p className="text-gray-500 mt-1">Lengkapi formulir di bawah untuk menambahkan anggota koperasi baru.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <form action={formAction} className="p-8 lg:p-12 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-50">
                <User className="w-5 h-5 text-blue-600" />
                Informasi Pribadi
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="nama"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">NIK</label>
                    <div className="relative">
                      <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="nik"
                        type="text"
                        placeholder="NIK"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">No Identitas</label>
                    <input
                      name="noidentitas"
                      type="text"
                      placeholder="KTP/Lainnya"
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Jenis Kelamin</label>
                  <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="jk" value="L" defaultChecked className="hidden peer" />
                      <div className="text-center py-3 rounded-2xl border-2 border-gray-50 bg-gray-50 text-gray-500 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 font-bold transition-all hover:bg-gray-100">
                        Laki-Laki
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="jk" value="P" className="hidden peer" />
                      <div className="text-center py-3 rounded-2xl border-2 border-gray-50 bg-gray-50 text-gray-500 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 font-bold transition-all hover:bg-gray-100">
                        Perempuan
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Birth & Contact Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-50">
                <Calendar className="w-5 h-5 text-blue-600" />
                Kelahiran & Kontak
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Tempat Lahir</label>
                    <input
                      name="tempat_lahir"
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Tanggal Lahir</label>
                    <input
                      name="tgl_lahir"
                      type="date"
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Nomor HP</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="hp"
                      type="tel"
                      placeholder="08..."
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Alamat Lengkap</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <textarea
                      name="alamat"
                      rows="3"
                      placeholder="Masukkan alamat domisili"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-gray-400 max-w-sm italic">
                * Password default untuk anggota baru adalah NIK mereka masing-masing.
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
                    Simpan Anggota
                </button>
            </div>
          </div>

          {state?.error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold animate-in bounce-in">
                {state.error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
