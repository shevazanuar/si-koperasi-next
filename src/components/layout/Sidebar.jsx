"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  CreditCard, 
  FileText, 
  Landmark
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "anggota"] },
  { name: "Data Anggota", href: "/dashboard/anggota", icon: Users, roles: ["admin"] },
  { name: "Simpanan", href: "/dashboard/simpanan", icon: Wallet, roles: ["admin", "anggota"] },
  { name: "Pinjaman", href: "/dashboard/pinjaman", icon: CreditCard, roles: ["admin", "anggota"] },
  { name: "Laporan", href: "/dashboard/laporan", icon: FileText, roles: ["admin"] },
];

export default function Sidebar({ role = "admin" }) {
  const pathname = usePathname();

  // Filter menu items by role
  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full fixed left-0 top-0 hidden md:flex">
      <div className="p-6 flex items-center gap-3 border-b border-gray-50">
        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
          <Landmark className="w-5 h-5" />
        </div>
        <div className="font-bold text-xl text-gray-800 tracking-tight">Koperasi</div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-2 px-3">
            {role === 'admin' ? 'Menu Utama' : 'Portal Anggota'}
        </div>
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                ? "bg-blue-50 text-blue-700 font-medium" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`} />
              {item.name}
              
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50 m-4 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-500 text-center font-medium">SI Koperasi Next.js <br/>v1.0.0</p>
      </div>
    </aside>
  );
}
