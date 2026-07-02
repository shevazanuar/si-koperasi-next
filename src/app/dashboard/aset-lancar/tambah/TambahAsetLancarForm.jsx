"use client";

import { useActionState } from "react";
import { createAsetLancar } from "../actions";
import { BarChart3, Save, Loader2, AlignLeft } from "lucide-react";
import Link from "next/link";
import CurrencyInput from "@/components/ui/CurrencyInput";

export default function TambahAsetLancarForm() {
  const [state, formAction, isPending] = useActionState(createAsetLancar, null);

  return (
    <form action={formAction} className="p-8 lg:p-10 space-y-8">
      
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-50">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Detail Aset Lancar
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Jenis Aset Lancar</label>
            <select name="jenis_aset" required className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium">
                <option value="Piutang Lainnya">Piutang Lainnya</option>
                <option value="Piutang Usaha">Piutang Usaha</option>
                <option value="Piutang Simpanan">Piutang Simpanan</option>
                <option value="Aset Lancar Lain">Aset Lancar Lain</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Nominal</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">Rp</span>
              <CurrencyInput
                name="nominal"
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium font-bold text-emerald-600"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Keterangan Tambahan</label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                name="keterangan"
                rows="3"
                placeholder="Penjelasan detail mengenai aset ini..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium resize-none"
              ></textarea>
            </div>
          </div>

        </div>
      </div>

      <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row items-center justify-end gap-4">
        <Link 
            href="/dashboard/aset-lancar"
            className="w-full md:w-auto text-center px-8 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
        >
            Batalkan
        </Link>
        <button
            disabled={isPending}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Simpan Pencatatan
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
