"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { User, Lock, Loader2, Landmark, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none select-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-white relative overflow-hidden">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/30 mb-6 group transition-transform hover:scale-110">
              <Landmark className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">SI Koperasi</h1>
            <p className="text-gray-400 text-sm font-medium">Sistem Informasi Koperasi Polines</p>
          </div>

          {/* Form */}
          <form action={formAction} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Username / NIK</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="username"
                    type="text"
                    placeholder="Masukkan Username"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 ml-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                  <Link href="/lupa-password" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-tighter">Lupa Password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="password"
                    type="password"
                    placeholder="Masukkan Password"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 animate-shake">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                {state.error}
              </div>
            )}

            <button
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-4"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} Koperasi Polines
            </p>
          </div>
        </div>

        {/* Outer decorations */}
        <div className="mt-8 flex justify-center gap-6">
          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider">


          </div>
          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider">


          </div>
        </div>
      </div>
    </div>
  );
}
