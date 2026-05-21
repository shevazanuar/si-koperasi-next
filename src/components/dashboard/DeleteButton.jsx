"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { showConfirm, showError } from "@/lib/swal";

export default function DeleteButton({ id, action, label = "Data", disabled = false, disabledMessage = "" }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (disabled) {
      if (disabledMessage) {
        showError("Tidak Dapat Menghapus", disabledMessage);
      }
      return;
    }

    const confirmed = await showConfirm(
      "Apakah Anda yakin?",
      `Anda akan menghapus ${label} ini. Tindakan ini tidak dapat dibatalkan.`,
      "Ya, Hapus",
      "Batal"
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await action(id);
      } catch (err) {
        // Next.js uses an error to trigger redirects.
        // We must re-throw it so the router can handle the navigation.
        if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
          throw err;
        }
        
        showError("Gagal Menghapus", err?.message || "Terjadi kesalahan saat menghapus data");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className={`${disabled ? "text-gray-400 bg-gray-50 border-gray-100 hover:text-gray-500" : "text-red-600 hover:text-red-800 bg-red-50 border-red-100"} p-2 rounded-lg border transition-all active:scale-95 disabled:opacity-50 cursor-pointer`}
      title={disabled && disabledMessage ? disabledMessage : `Hapus ${label}`}
    >
      <Trash2 className={`w-4 h-4 ${isPending ? "animate-pulse" : ""}`} />
    </button>
  );
}
