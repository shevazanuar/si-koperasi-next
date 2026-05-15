"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Wallet,
  CreditCard,
  FileText,
  Landmark,
  ListTree,
  ShieldCheck,
  ScrollText,
  Settings,
  Building2,
  UserCog,
  Layers,
  ArrowDownCircle,
  ChevronDown,
  Receipt,
  Tag,
  Monitor,
  Newspaper,
  BadgeCheck,
  FileSearch,
  Printer,
  AlertCircle,
  PieChart,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "anggota"] },
  { name: "Menu", href: "/dashboard/menu", icon: ListTree, roles: ["admin"] },
  { name: "Management Menu", href: "/dashboard/management-menu", icon: ShieldCheck, roles: ["admin"] },
  { name: "Log Pengguna", href: "/dashboard/log-pengguna", icon: ScrollText, roles: ["admin"] },
  {
    name: "Config",
    icon: Settings,
    roles: ["admin"],
    children: [
      { name: "Jenis Simpanan", href: "/dashboard/config/jenis-simpanan", icon: Wallet },
      { name: "Jenis Pinjaman", href: "/dashboard/config/jenis-pinjaman", icon: CreditCard },
      { name: "Perusahaan", href: "/dashboard/config/perusahaan", icon: Building2 },
      { name: "Level Anggota", href: "/dashboard/config/level-anggota", icon: Users },
      { name: "Level Simpanan", href: "/dashboard/config/level-simpanan", icon: Layers },
      { name: "Level Pengguna", href: "/dashboard/config/level-pengguna", icon: Layers },
      { name: "Kategori Pinjaman", href: "/dashboard/config/kategori-pinjaman", icon: Tag },
    ],
  },
  {
    name: "Master",
    icon: Monitor,
    roles: ["admin"],
    children: [
      { name: "Profil", href: "/dashboard/config/profil", icon: Building2 },
      { name: "Pengguna", href: "/dashboard/config/pengguna", icon: UserCog },
      { name: "Anggota", href: "/dashboard/anggota", icon: Users },
      { name: "Informasi", href: "/dashboard/informasi", icon: Newspaper },
    ],
  },
  {
    name: "Transaksi",
    icon: Receipt,
    roles: ["admin"],
    children: [
      { name: "Simpanan", href: "/dashboard/simpanan", icon: Wallet },
      { name: "Penarikan", href: "/dashboard/transaksi/penarikan", icon: ArrowDownCircle },
      { name: "Pinjaman", href: "/dashboard/pinjaman", icon: CreditCard },
      { name: "Pembayaran", href: "/dashboard/transaksi/pembayaran", icon: BadgeCheck },
      { name: "Pengajuan Pinjaman", href: "/dashboard/transaksi/pengajuan-pinjaman", icon: FileSearch },
    ],
  },
  { name: "Simpanan", href: "/dashboard/simpanan", icon: Wallet, roles: ["anggota"] },
  { name: "Pinjaman", href: "/dashboard/pinjaman", icon: CreditCard, roles: ["anggota"] },
  {
    name: "Laporan",
    icon: Printer,
    roles: ["admin"],
    children: [
      { name: "Anggota", href: "/dashboard/laporan/anggota", icon: Users },
      { name: "Simpanan", href: "/dashboard/laporan/simpanan", icon: Wallet },
      { name: "Penarikan", href: "/dashboard/laporan/penarikan", icon: ArrowDownCircle },
      { name: "Pinjaman", href: "/dashboard/laporan/pinjaman", icon: CreditCard },
      { name: "Pembayaran", href: "/dashboard/laporan/pembayaran", icon: BadgeCheck },
      { name: "Tunggakan", href: "/dashboard/laporan/tunggakan", icon: AlertCircle },
      { name: "SHU", href: "/dashboard/laporan/shu", icon: PieChart },
    ],
  },
];

export default function Sidebar({ role = "admin" }) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});

  const filteredItems = menuItems.filter((item) => item.roles.includes(role));

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isChildActive = (children) => {
    return children?.some(
      (child) => pathname === child.href || pathname.startsWith(child.href + "/")
    );
  };

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
          {role === "admin" ? "Menu Utama" : "Portal Anggota"}
        </div>
        {filteredItems.map((item) => {
          // Dropdown menu
          if (item.children) {
            const childActive = isChildActive(item.children);
            const isOpen = openMenus[item.name] || childActive;

            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${childActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${childActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                      }`}
                  />
                  <span className="flex-1 text-left">{item.name}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                      } ${childActive ? "text-blue-500" : "text-gray-400"}`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1">
                    {item.children.map((child) => {
                      const isActive =
                        pathname === child.href || pathname.startsWith(child.href + "/");
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm group ${isActive
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                          <child.icon
                            className={`w-4 h-4 ${isActive
                                ? "text-blue-600"
                                : "text-gray-400 group-hover:text-gray-600"
                              }`}
                          />
                          {child.name}
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          // Regular menu item
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <item.icon
                className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                  }`}
              />
              {item.name}
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50 m-4 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-500 text-center font-medium">
          Koperasi Polines <br />

        </p>
      </div>
    </aside>
  );
}
