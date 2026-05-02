"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "./actions";
import { Mail, Loader2, Landmark, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, null);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-white relative overflow-hidden">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6 group transition-transform hover:scale-110">
              <Mail className="text-blue-600 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Lupa Password?</h1>
            <p className="text-gray-400 text-sm font-medium px-4">
              Masukkan email yang terdaftar pada akun Koperasi Anda untuk menerima link reset password.
            </p>
          </div>

          {/* Form */}
          {!state?.success ? (
            <form action={formAction} className="space-y-5">
              {/* Honeypot field (hidden from users) */}
              <div className="hidden" aria-hidden="true">
                <input
                  name="website"
                  type="text"
                  tabIndex="-1"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Terdaftar</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {state?.error && (
                <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
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
                  "Kirim Link Reset"
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6 animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <span className="text-sm font-bold text-left">{state.success}</span>
              </div>
              <p className="text-sm text-gray-500">
                Silakan cek kotak masuk atau folder spam di email Anda. Link ini hanya berlaku selama 1 jam.
              </p>
            </div>
          )}

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
