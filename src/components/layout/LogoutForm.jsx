"use client";

import { LogOut } from "lucide-react";
import { showConfirm } from "@/lib/swal";

export default function LogoutForm({ action }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isConfirmed = await showConfirm(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar dari sistem?",
      "Ya, Keluar",
      "Batal",
      true // isDanger
    );
    
    if (isConfirmed) {
      const formData = new FormData(e.target);
      action(formData); // Execute the server action
    }
  };

  return (
    <form action={action} onSubmit={handleSubmit}>
      <button type="submit" className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50">
        <LogOut className="w-5 h-5" />
        <span className="text-sm font-semibold hidden md:block">Keluar</span>
      </button>
    </form>
  );
}
