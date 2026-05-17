"use client";

import { useActionState, useEffect, useState } from "react";
import { resetPasswordAction } from "./actions";
import { Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Suspense } from "react";

function ResetPasswordContent() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");

  useEffect(() => {
    setToken(searchParams.get("token") || "");
  }, [searchParams]);

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Token Tidak Valid</h2>
          <p className="text-gray-500 mb-6">Link reset password tidak lengkap atau tidak valid.</p>
          <Link href="/lupa-password" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors">
            Minta Link Baru
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-white relative overflow-hidden">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6">
              <Lock className="text-blue-600 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Buat Password Baru</h1>
            <p className="text-gray-400 text-sm font-medium px-4">
              Silakan masukkan password baru Anda yang kuat dan mudah diingat.
            </p>
          </div>

          {!state?.success ? (
            <form action={formAction} className="space-y-5">
              <input type="hidden" name="token" value={token} />

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Password Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="newPassword"
                      type="password"
                      placeholder="Minimal 6 karakter"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Konfirmasi Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="confirmPassword"
                      type="password"
                      placeholder="Ulangi password baru"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium"
                      required
                    />
                  </div>
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Password Baru"}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6 animate-in slide-in-from-bottom-4">
              <div className="flex flex-col items-center justify-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-700 p-6 rounded-2xl">
                <CheckCircle2 className="w-12 h-12 mb-2" />
                <span className="text-sm font-bold">{state.success}</span>
              </div>
              <Link href="/login" className="inline-block w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                Masuk Sekarang
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
