"use client";

import { useActionState } from "react";
import { createBank } from "../actions";
import { Landmark, Hash, User, Save, Loader2, Activity } from "lucide-react";
import Link from "next/link";
import CurrencyInput from "@/components/ui/CurrencyInput";

export default function TambahBankForm() {
  const [state, formAction, isPending] = useActionState(createBank, null);

  return (
    <form action={formAction} className="p-8 lg:p-10 space-y-8">
      
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-50">
          <Landmark className="w-5 h-5 text-blue-600" />
          Detail Rekening Bank
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Nama Bank</label>
            <div className="relative">
              <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="nama_bank"
                type="text"
                onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); }}
                placeholder="Contoh: Bank BCA, Bank Mandiri"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Nomor Rekening</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="nomor_rekening"
                type="text"
                onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }}
                placeholder="Masukkan nomor rekening"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Atas Nama (Nama Pemilik)</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="nama_pemilik"
                type="text"
                onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); }}
                placeholder="Nama pemilik rekening"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Saldo Awal</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">Rp</span>
              <CurrencyInput
                name="saldo"
                placeholder="0"
                defaultValue={0}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-emerald-600 font-bold"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
               <Activity className="w-4 h-4" /> Status Rekening
            </label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="status" value="Aktif" defaultChecked className="hidden peer" />
                <div className="text-center py-3 rounded-2xl border-2 border-gray-50 bg-gray-50 text-gray-500 peer-checked:border-green-500 peer-checked:bg-green-50 peer-checked:text-green-700 font-bold transition-all hover:bg-gray-100">
                  Aktif
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="status" value="Tidak Aktif" className="hidden peer" />
                <div className="text-center py-3 rounded-2xl border-2 border-gray-50 bg-gray-50 text-gray-500 peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-700 font-bold transition-all hover:bg-gray-100">
                  Tidak Aktif
                </div>
              </label>
            </div>
          </div>

        </div>
      </div>

      <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row items-center justify-end gap-4">
        <Link 
            href="/dashboard/akun-bank"
            className="w-full md:w-auto text-center px-8 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
        >
            Batalkan
        </Link>
        <button
            disabled={isPending}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Simpan Rekening
        </button>
      </div>

      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold animate-in bounce-in">
            {state.error}
        </div>
      )}
    </form>
  );
}
