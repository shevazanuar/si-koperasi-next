"use client";

import { Menu } from "lucide-react";

export default function MobileMenuButton() {
  return (
    <button
      type="button"
      className="md:hidden text-gray-500 hover:text-amber-700 transition-colors p-2 rounded-lg hover:bg-amber-50 mr-2"
      onClick={() => window.dispatchEvent(new CustomEvent("toggleMobileSidebar"))}
    >
      <Menu className="w-6 h-6" />
    </button>
  );
}
