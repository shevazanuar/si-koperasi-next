"use client";

import { useActionState } from "react";
import { changePassword } from "./actions";
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, Loader2, User, Mail, Phone, MapPin, Building2, Calendar, BadgeCheck } from "lucide-react";

export default function ProfileDetails({ userData }) {
  const [state, formAction, isPending] = useActionState(changePassword, null);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Profile Header Card */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/5 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 sm:p-12 text-white relative">
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl group transition-transform hover:scale-105">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-black tracking-tight">{userData.name}</h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider border border-white/20">
                  {userData.role === 'admin' ? 'Administrator' : 'Anggota Koperasi'}
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider border border-emerald-500/20 flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>
          </div>
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
        </div>

        <div className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column: Account Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <User className="w-4 h-4" /> Detail Akun
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username / NIK</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{userData.username}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unit / Perusahaan</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{userData.perusahaan || userData.unit_seksi || 'Koperasi Polines'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bergabung Sejak</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{formatDate(userData.tgl_masuk || userData.insert_date)}</p>
                  </div>
                </div>

                {userData.role === 'anggota' && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alamat</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{userData.alamat || '-'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Change Password */}
          <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
               <Lock className="w-4 h-4" /> Keamanan
            </h3>
            
            <form action={formAction} className="space-y-5">
              {/* Status Messages */}
              {state?.success && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="text-[11px] font-bold">{state.success}</span>
                </div>
              )}

              {state?.error && (
                <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl animate-in shake duration-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="text-[11px] font-bold">{state.error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password Lama</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="oldPassword"
                      type="password"
                      placeholder="Konfirmasi password lama"
                      className="w-full bg-white border border-gray-100 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="newPassword"
                      type="password"
                      placeholder="Minimal 6 karakter"
                      className="w-full bg-white border border-gray-100 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Ulangi Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="confirmPassword"
                      type="password"
                      placeholder="Konfirmasi password baru"
                      className="w-full bg-white border border-gray-100 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-10">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
               <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
               <p className="text-xs font-bold text-gray-900">Privasi Terjamin</p>
               <p className="text-[10px] text-gray-400 font-medium">Data Anda dienkripsi secara aman.</p>
            </div>
         </div>
         <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">
            SI Koperasi Polines System
         </p>
      </div>
    </div>
  );
}
