"use client";

import { useActionState, useState } from "react";
import { createKas } from "../actions";
import { Wallet, DollarSign, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function TambahKasForm() {
  const [state, formAction, isPending] = useActionState(createKas, null);
  const [saldo, setSaldo] = useState("");

  const formatRupiah = (value) => {
    const numberString = value.replace(/[^,\d]/g, '').toString();
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
    return rupiah;
  };

  const handleSaldoChange = (e) => {
    setSaldo(formatRupiah(e.target.value));
  };

  return (
    <form action={formAction} className="p-8 lg:p-10 space-y-8">
      
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-50">
          <Wallet className="w-5 h-5 text-blue-600" />
          Detail Kas
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Nama Kas</label>
            <div className="relative">
              <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="nama_kas"
                type="text"
                placeholder="Contoh: Kas Utama"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Saldo Awal</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="0"
                value={saldo}
                onChange={handleSaldoChange}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-emerald-600 font-bold"
                required
              />
              <input type="hidden" name="saldo" value={saldo.replace(/\./g, '')} />
            </div>
          </div>

        </div>
      </div>

      <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row items-center justify-end gap-4">
        <Link 
            href="/dashboard/kas"
            className="w-full md:w-auto text-center px-8 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
        >
            Batalkan
        </Link>
        <button
            disabled={isPending}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Simpan Kas
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
