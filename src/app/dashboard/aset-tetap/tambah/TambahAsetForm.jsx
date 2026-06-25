"use client";

import { useActionState, useState, useEffect } from "react";
import { createAsetTetap } from "../actions";
import { MonitorPlay, DollarSign, Save, Loader2, Calendar, CreditCard } from "lucide-react";
import Link from "next/link";
import CurrencyInput from "@/components/ui/CurrencyInput";

export default function TambahAsetForm({ kategoriList, kasList, bankList }) {
  const [state, formAction, isPending] = useActionState(createAsetTetap, null);
  const [sumberDana, setSumberDana] = useState("Kas");
  const [nilaiPembelian, setNilaiPembelian] = useState(0);


  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(angka || 0);
  };

  return (
    <form action={formAction} className="p-8 lg:p-10 space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-50">
            <MonitorPlay className="w-5 h-5 text-blue-600" />
            Informasi Aset
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Nama Aset</label>
              <input
                name="nama_aset"
                type="text"
                placeholder="Contoh: Laptop Asus ROG"
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Kategori Aset</label>
              <select name="kategori_id" required className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-sm">
                <option value="">- Pilih Kategori -</option>
                {kategoriList.map(k => (
                  <option key={k.id} value={k.id}>{k.nama_kategori}</option>
                ))}
              </select>
              {kategoriList.length === 0 && (
                <p className="text-xs text-rose-500 mt-1">Belum ada kategori aset tetap. Tambahkan kategori terlebih dahulu jika perlu.</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" /> Tanggal Pembelian
              </label>
              <input
                name="tanggal_pembelian"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-50">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Nilai Aset
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Nilai Pembelian (Harga Perolehan)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <CurrencyInput
                  name="nilai_pembelian"
                  placeholder="0"
                  value={nilaiPembelian || ""}
                  onChange={(val) => setNilaiPembelian(Number(val))}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-50">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-4">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Sumber Dana Pembelian
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                        <input 
                        type="radio" 
                        name="sumber_dana" 
                        value="Kas" 
                        checked={sumberDana === "Kas"}
                        onChange={() => setSumberDana("Kas")}
                        className="hidden peer" 
                        />
                        <div className="text-center py-3 rounded-2xl border-2 border-gray-50 bg-gray-50 text-gray-500 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 font-bold transition-all hover:bg-gray-100">
                        Dari Kas
                        </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input 
                        type="radio" 
                        name="sumber_dana" 
                        value="Bank" 
                        checked={sumberDana === "Bank"}
                        onChange={() => setSumberDana("Bank")}
                        className="hidden peer" 
                        />
                        <div className="text-center py-3 rounded-2xl border-2 border-gray-50 bg-gray-50 text-gray-500 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 font-bold transition-all hover:bg-gray-100">
                        Dari Bank
                        </div>
                    </label>
                </div>
            </div>
            <div className="space-y-4">
                {sumberDana === "Kas" ? (
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Pilih Kas</label>
                        <select name="kas_id" required={sumberDana === "Kas"} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-sm">
                        <option value="">- Pilih Kas -</option>
                        {kasList.map(k => (
                            <option key={k.id} value={k.id}>{k.nama_kas} (Saldo: {formatRupiah(k.saldo)})</option>
                        ))}
                        </select>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Pilih Rekening Bank</label>
                        <select name="akun_bank_id" required={sumberDana === "Bank"} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-sm">
                        <option value="">- Pilih Bank -</option>
                        {bankList.map(b => (
                            <option key={b.id} value={b.id}>{b.nama_bank} - {b.nomor_rekening} (Saldo: {formatRupiah(b.saldo)})</option>
                        ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row items-center justify-end gap-4">
        <Link 
            href="/dashboard/aset-tetap"
            className="w-full md:w-auto text-center px-8 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
        >
            Batalkan
        </Link>
        <button
            disabled={isPending}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Simpan Aset Baru
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
