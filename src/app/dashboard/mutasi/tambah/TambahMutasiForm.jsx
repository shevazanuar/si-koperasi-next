"use client";

import { useActionState, useState } from "react";
import { createMutasi } from "../actions";
import { ArrowRightLeft, DollarSign, Upload, Save, Loader2, FileText } from "lucide-react";
import Link from "next/link";

export default function TambahMutasiForm({ kasList, bankList }) {
  const [state, formAction, isPending] = useActionState(createMutasi, null);
  const [jenisMutasi, setJenisMutasi] = useState("Kas_ke_Bank");

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(angka || 0);
  };

  return (
    <form action={formAction} className="p-8 lg:p-10 space-y-8">
      
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-50">
          <ArrowRightLeft className="w-5 h-5 text-blue-600" />
          Data Transfer
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Jenis Transfer Mutasi</label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="jenis_mutasi" 
                  value="Kas_ke_Bank" 
                  checked={jenisMutasi === "Kas_ke_Bank"}
                  onChange={() => setJenisMutasi("Kas_ke_Bank")}
                  className="hidden peer" 
                />
                <div className="text-center py-3 rounded-2xl border-2 border-gray-50 bg-gray-50 text-gray-500 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 font-bold transition-all hover:bg-gray-100">
                  Dari Kas ke Bank
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="jenis_mutasi" 
                  value="Bank_ke_Kas" 
                  checked={jenisMutasi === "Bank_ke_Kas"}
                  onChange={() => setJenisMutasi("Bank_ke_Kas")}
                  className="hidden peer" 
                />
                <div className="text-center py-3 rounded-2xl border-2 border-gray-50 bg-gray-50 text-gray-500 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 font-bold transition-all hover:bg-gray-100">
                  Dari Bank ke Kas
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {jenisMutasi === "Kas_ke_Bank" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Dari Kas</label>
                  <select name="dari_kas_id" required className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-sm">
                    <option value="">- Pilih Kas Sumber -</option>
                    {kasList.map(k => (
                      <option key={k.id} value={k.id}>{k.nama_kas} (Saldo: {formatRupiah(k.saldo)})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Ke Rekening Bank</label>
                  <select name="ke_akun_bank_id" required className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-sm">
                    <option value="">- Pilih Bank Tujuan -</option>
                    {bankList.map(b => (
                      <option key={b.id} value={b.id}>{b.nama_bank} - {b.nomor_rekening}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Dari Rekening Bank</label>
                  <select name="dari_akun_bank_id" required className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-sm">
                    <option value="">- Pilih Bank Sumber -</option>
                    {bankList.map(b => (
                      <option key={b.id} value={b.id}>{b.nama_bank} (Saldo: {formatRupiah(b.saldo)})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Ke Kas</label>
                  <select name="ke_kas_id" required className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-sm">
                    <option value="">- Pilih Kas Tujuan -</option>
                    {kasList.map(k => (
                      <option key={k.id} value={k.id}>{k.nama_kas}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Nominal Transfer</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="nominal"
                type="number"
                placeholder="Masukkan nominal"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-emerald-600 font-bold"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-500" /> Upload Bukti Transfer (Wajib)
            </label>
            {/* Note: This is a placeholder for file upload, as server actions for file upload require setup, we use text input for the URL/Filename or a simulated input */}
            <input
              name="bukti_transfer"
              type="text"
              placeholder="Masukkan link/nama file bukti transfer (Simulasi)"
              defaultValue="bukti_tf_123.jpg"
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
              required
            />
            <p className="text-xs text-gray-400 mt-1 ml-1">Untuk simulasi, kolom ini dapat diisi dengan nama file sementara.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Keterangan / Catatan</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                name="keterangan"
                rows="3"
                placeholder="Tambahkan catatan transfer..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium resize-none"
              ></textarea>
            </div>
          </div>

        </div>
      </div>

      <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row items-center justify-end gap-4">
        <Link 
            href="/dashboard/mutasi"
            className="w-full md:w-auto text-center px-8 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
        >
            Batalkan
        </Link>
        <button
            disabled={isPending}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Proses Transfer
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
