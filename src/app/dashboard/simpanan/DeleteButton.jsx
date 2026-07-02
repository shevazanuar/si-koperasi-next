"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteSimpanan } from "./actions";
import { showConfirm, showSuccess, showError } from "@/lib/swal";

export default function DeleteButton({ id, nomor }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    const isConfirmed = await showConfirm(
      "Hapus Transaksi?",
      `Anda yakin ingin menghapus data simpanan ${nomor}? Aksi ini juga akan mengembalikan saldo kas/bank ke kondisi semula.`,
      "Ya, Hapus",
      "Batal",
      true // isDanger
    );

    if (isConfirmed) {
      startTransition(async () => {
        const result = await deleteSimpanan(id);
        if (result?.error) {
          showError("Gagal Hapus", result.error);
        } else {
          showSuccess("Berhasil", "Data simpanan berhasil dihapus");
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 hover:text-red-800 font-bold text-[10px] uppercase bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100 transition-all active:scale-95 disabled:opacity-50"
      title="Hapus Transaksi"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
