"use client";

import { Printer } from "lucide-react";

export default function ExportButtons({ onCetak, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onCetak}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white text-sm font-semibold rounded-lg hover:bg-sky-600 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Printer className="w-4 h-4" />
      Cetak
    </button>
  );
}
