"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Wallet,
  CreditCard,
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
  Package,
} from "lucide-react";

// dbId = menu.id di tabel `menu` database
// dbId: null = selalu tampil, tidak dikontrol Management Menu
const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "anggota"],
    dbId: null,
  },
  {
    name: "Menu",
    href: "/dashboard/menu",
    icon: ListTree,
    roles: ["admin"],
    dbId: null,
  },
  {
    name: "Management Menu",
    href: "/dashboard/management-menu",
    icon: ShieldCheck,
    roles: ["admin"],
    dbId: null,
  },
  {
    name: "Log Pengguna",
    href: "/dashboard/log-pengguna",
    icon: ScrollText,
    roles: ["admin"],
    dbId: null,
  },
  {
    name: "Config",
    icon: Settings,
    roles: ["admin"],
    dbId: 34,
    children: [
      {
        name: "Jenis Simpanan",
        href: "/dashboard/config/jenis-simpanan",
        icon: Wallet,
        dbId: null,
      },
      {
        name: "Jenis Pinjaman",
        href: "/dashboard/config/jenis-pinjaman",
        icon: CreditCard,
        dbId: null,
      },
      {
        name: "Perusahaan",
        href: "/dashboard/config/perusahaan",
        icon: Building2,
        dbId: null,
      },
      {
        name: "Level Anggota",
        href: "/dashboard/config/level-anggota",
        icon: Users,
        dbId: null,
      },
      {
        name: "Level Simpanan",
        href: "/dashboard/config/level-simpanan",
        icon: Layers,
        dbId: null,
      },
      {
        name: "Level Pengguna",
        href: "/dashboard/config/level-pengguna",
        icon: Layers,
        dbId: null,
      },
      {
        name: "Kategori Pinjaman",
        href: "/dashboard/config/kategori-pinjaman",
        icon: Tag,
        dbId: null,
      },
      {
        name: "Kategori Produk",
        href: "/dashboard/master/kategori-produk",
        icon: Tag,
        dbId: null,
      },
      {
        name: "Kategori Aset Tetap",
        href: "/dashboard/config/kategori-aset-tetap",
        icon: Tag,
        dbId: null,
      },
    ],
  },
  {
    name: "Master",
    icon: Monitor,
    roles: ["admin"],
    dbId: 1,
    children: [
      {
        name: "Profil",
        href: "/dashboard/config/profil",
        icon: Building2,
        dbId: 6,
      },
      {
        name: "Pengguna",
        href: "/dashboard/config/pengguna",
        icon: UserCog,
        dbId: 8,
      },
      { name: "Anggota", href: "/dashboard/anggota", icon: Users, dbId: 11 },
      {
        name: "Informasi",
        href: "/dashboard/informasi",
        icon: Newspaper,
        dbId: 12,
      },
      {
        name: "Barang",
        href: "/dashboard/master/barang",
        icon: Layers,
        dbId: null,
      },
    ],
  },
  {
    name: "Transaksi",
    icon: Receipt,
    roles: ["admin"],
    dbId: 2,
    children: [
      { name: "Simpanan", href: "/dashboard/simpanan", icon: Wallet, dbId: 13 },
      {
        name: "Penarikan",
        href: "/dashboard/transaksi/penarikan",
        icon: ArrowDownCircle,
        dbId: 14,
      },
      {
        name: "Pinjaman",
        href: "/dashboard/pinjaman",
        icon: CreditCard,
        dbId: 15,
      },
      {
        name: "Pembayaran",
        href: "/dashboard/transaksi/pembayaran",
        icon: BadgeCheck,
        dbId: 16,
      },
      {
        name: "Pengajuan Pinjaman",
        href: "/dashboard/transaksi/pengajuan-pinjaman",
        icon: FileSearch,
        dbId: 35,
      },
      {
        name: "Penjualan",
        href: "/dashboard/penjualan",
        icon: Receipt,
        dbId: null,
      },
      {
        name: "Biaya Operasional",
        href: "/dashboard/biaya",
        icon: Wallet,
        dbId: null,
      },
    ],
  },
  {
    name: "Keuangan",
    icon: Landmark,
    roles: ["admin"],
    dbId: null,
    children: [
      {
        name: "Manajemen Kas",
        href: "/dashboard/kas",
        icon: Wallet,
        dbId: null,
      },
      {
        name: "Akun Bank",
        href: "/dashboard/akun-bank",
        icon: CreditCard,
        dbId: null,
      },
      {
        name: "Mutasi Dana",
        href: "/dashboard/mutasi",
        icon: ArrowDownCircle,
        dbId: null,
      },
      {
        name: "Aset Lancar",
        href: "/dashboard/aset-lancar",
        icon: Receipt,
        dbId: null,
      },
      {
        name: "Aset Tetap",
        href: "/dashboard/aset-tetap",
        icon: Package,
        dbId: null,
      },
    ],
  },
  {
    name: "Simpanan Saya",
    href: "/dashboard/simpanan",
    icon: Wallet,
    roles: ["anggota"],
    dbId: null,
  },
  {
    name: "Pinjaman Saya",
    href: "/dashboard/pinjaman",
    icon: CreditCard,
    roles: ["anggota"],
    dbId: null,
  },
  {
    name: "Pengajuan Pinjaman",
    href: "/dashboard/transaksi/pengajuan-pinjaman",
    icon: FileSearch,
    roles: ["anggota"],
    dbId: null,
  },
  {
    name: "Informasi",
    href: "/dashboard/informasi",
    icon: Newspaper,
    roles: ["anggota"],
    dbId: null,
  },
  {
    name: "Profil Saya",
    href: "/dashboard/profile",
    icon: UserCog,
    roles: ["anggota"],
    dbId: null,
  },
  {
    name: "Laporan",
    icon: Printer,
    roles: ["admin"],
    dbId: 3,
    children: [
      {
        name: "Anggota",
        href: "/dashboard/laporan/anggota",
        icon: Users,
        dbId: 17,
      },
      {
        name: "Simpanan",
        href: "/dashboard/laporan/simpanan",
        icon: Wallet,
        dbId: 19,
      },
      {
        name: "Penarikan",
        href: "/dashboard/laporan/penarikan",
        icon: ArrowDownCircle,
        dbId: 20,
      },
      {
        name: "Pinjaman",
        href: "/dashboard/laporan/pinjaman",
        icon: CreditCard,
        dbId: 21,
      },
      {
        name: "Pembayaran",
        href: "/dashboard/laporan/pembayaran",
        icon: BadgeCheck,
        dbId: 22,
      },
      {
        name: "Tunggakan",
        href: "/dashboard/laporan/tunggakan",
        icon: AlertCircle,
        dbId: 23,
      },
      { name: "SHU", href: "/dashboard/laporan/shu", icon: PieChart, dbId: 24 },
      {
        name: "Penjualan",
        href: "/dashboard/laporan/penjualan",
        icon: Receipt,
        dbId: null,
      },
      {
        name: "Pendapatan",
        href: "/dashboard/laporan/pendapatan",
        icon: Landmark,
        dbId: null,
      },
    ],
  },
];

export default function Sidebar({ role = "admin", allowedMenuIds = null }) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});
  const [pendingCount, setPendingCount] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen((prev) => !prev);
    window.addEventListener("toggleMobileSidebar", handleToggle);
    return () => window.removeEventListener("toggleMobileSidebar", handleToggle);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    let intervalId;
    const fetchPendingCount = () => {
      if (role === "admin") {
        fetch("/api/transaksi/pengajuan-pinjaman/pending-count")
          .then((res) => res.json())
          .then((data) => setPendingCount(data.count || 0))
          .catch((err) => console.error(err));
      }
    };

    fetchPendingCount();

    // Listen for custom event when approval happens
    window.addEventListener("pinjamanUpdated", fetchPendingCount);

    // Fallback polling every 30 seconds
    intervalId = setInterval(fetchPendingCount, 30000);

    return () => {
      window.removeEventListener("pinjamanUpdated", fetchPendingCount);
      clearInterval(intervalId);
    };
  }, [role]);

  // Set integer; null = tidak ada pembatasan (Super Admin / belum diset)
  const allowedSet = allowedMenuIds ? new Set(allowedMenuIds) : null;

  const isAllowed = (item) => {
    if (!allowedSet) return true; // tidak ada pembatasan
    if (item.dbId == null) return true; // menu sistem selalu tampil
    return allowedSet.has(item.dbId);
  };

  const filteredItems = menuItems
    .filter((item) => item.roles.includes(role))
    .map((item) => {
      if (!item.children) return item;

      const parentAllowed = isAllowed(item);
      const children = item.children.filter((c) => {
        if (c.dbId == null) return parentAllowed;
        return isAllowed(c);
      });

      return { ...item, children };
    })
    .filter((item) => {
      if (!item.children) return isAllowed(item);
      return isAllowed(item) || item.children.length > 0;
    });

  const toggleMenu = (name) => setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));

  const isChildActive = (children) => children?.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 ${isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside 
        className={`w-64 bg-white/95 backdrop-blur-xl border-r border-gray-100 flex flex-col h-full fixed left-0 top-0 z-40 transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileOpen ? "translate-x-0 shadow-2xl shadow-amber-900/10" : "-translate-x-full"}`}
      >
      <div className="p-6 flex items-center gap-3 border-b border-gray-50">
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 rounded-xl text-white shadow-md shadow-orange-500/20">
          <Landmark className="w-5 h-5" />
        </div>
        <div className="font-bold text-xl text-gray-800 tracking-tight">Koperasi</div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-2 px-3">{role === "admin" ? "Menu Utama" : "Portal Anggota"}</div>

        {filteredItems.map((item) => {
          if (item.children) {
            const childActive = isChildActive(item.children);
            const isOpen = openMenus[item.name] || childActive;
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${childActive ? "bg-amber-50 text-amber-700 font-medium" : "text-gray-500 hover:bg-amber-50 hover:text-amber-700"}`}
                >
                  <item.icon className={`w-5 h-5 ${childActive ? "text-amber-600" : "text-gray-400 group-hover:text-amber-500"}`} />
                  <span className="flex-1 text-left">{item.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${childActive ? "text-amber-500" : "text-gray-400"}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                  <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href || pathname.startsWith(child.href + "/");
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm group ${isActive ? "bg-amber-50 text-amber-700 font-medium" : "text-gray-500 hover:bg-amber-50 hover:text-amber-700"}`}
                        >
                          <child.icon className={`w-4 h-4 ${isActive ? "text-amber-600" : "text-gray-400 group-hover:text-amber-500"}`} />
                          <span className="flex-1">{child.name}</span>

                          {child.name === "Pengajuan Pinjaman" && pendingCount > 0 && role === "admin" && <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50"></span>}

                          {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-600"></div>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive ? "bg-amber-50 text-amber-700 font-medium" : "text-gray-500 hover:bg-amber-50 hover:text-amber-700"}`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-amber-600" : "text-gray-400 group-hover:text-amber-500"}`} />
              {item.name}
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-600"></div>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50 m-4 bg-gradient-to-br from-gray-50 to-amber-50/30 rounded-xl">
        <p className="text-xs text-gray-500 text-center font-medium">Koperasi Polines</p>
      </div>
    </aside>
    </>
  );
}
