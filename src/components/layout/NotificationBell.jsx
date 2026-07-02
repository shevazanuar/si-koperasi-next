"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationBell({ role }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    let intervalId;
    
    const fetchAdminData = () => {
      fetch("/api/transaksi/pengajuan-pinjaman/pending-count")
        .then((res) => res.ok ? res.json() : { count: 0 })
        .then((data) => setPendingCount(data.count || 0))
        .catch((err) => console.error(err));
    };

    const fetchAnggotaData = () => {
      fetch("/api/notifikasi/anggota", { cache: "no-store" })
        .then((res) => res.ok ? res.json() : { notifications: [] })
        .then((data) => {
          if (data.notifications) {
            // Filter notifikasi yang sudah dibaca dari localStorage
            const readNotifs = JSON.parse(localStorage.getItem("readNotifs") || "[]");
            const unread = data.notifications.filter(n => !readNotifs.includes(n.id));
            setNotifications(unread);
          } else {
            setNotifications([]);
          }
        })
        .catch((err) => console.error(err));
    };

    const fetchData = () => {
      if (role === "admin") fetchAdminData();
      if (role === "anggota") fetchAnggotaData();
    };

    fetchData();

    // Listen for custom event when approval happens
    window.addEventListener("pinjamanUpdated", fetchData);

    // Fallback polling every 30 seconds
    intervalId = setInterval(fetchData, 30000);

    return () => {
      window.removeEventListener("pinjamanUpdated", fetchData);
      clearInterval(intervalId);
    };
  }, [role]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasNotif = role === "admin" ? pendingCount > 0 : notifications.length > 0;
  const notifCount = role === "admin" ? pendingCount : notifications.length;

  const handleClick = (e) => {
    if (role === "admin") {
      router.push("/dashboard/transaksi/pengajuan-pinjaman");
    } else {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const handleNotifClick = (notif) => {
    // Simpan ID notifikasi ke localStorage sebagai 'sudah dibaca'
    const readNotifs = JSON.parse(localStorage.getItem("readNotifs") || "[]");
    if (!readNotifs.includes(notif.id)) {
      readNotifs.push(notif.id);
      // Agar tidak memenuhi storage, batasi maksimal 50 ID
      if (readNotifs.length > 50) readNotifs.shift();
      localStorage.setItem("readNotifs", JSON.stringify(readNotifs));
    }
    
    // Hapus dari state agar langsung hilang
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    setIsOpen(false);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeBg = (type) => {
    switch(type) {
      case 'success': return "bg-emerald-50/50 hover:bg-emerald-50";
      case 'warning': return "bg-amber-50/50 hover:bg-amber-50";
      case 'error': return "bg-red-50/50 hover:bg-red-50";
      default: return "bg-blue-50/50 hover:bg-blue-50";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleClick}
        className="relative text-gray-400 hover:text-amber-600 transition-colors p-2 rounded-full hover:bg-amber-50"
        title={hasNotif ? `Ada ${notifCount} notifikasi` : "Tidak ada notifikasi baru"}
      >
        <Bell className="w-5 h-5" />
        {hasNotif && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* Dropdown Popover (Hanya untuk Anggota) */}
      {role === "anggota" && isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-black text-gray-900 tracking-tight">Notifikasi</h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">{notifCount} Baru</span>
          </div>
          
          <div className="max-h-[26rem] overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <Bell className="w-10 h-10 mx-auto mb-4 opacity-20" />
                <p className="text-sm font-bold">Semua Aman!</p>
                <p className="text-xs mt-1">Belum ada notifikasi baru untuk Anda.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <Link 
                    href={notif.href} 
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={`p-4 border-b border-gray-50 transition-colors flex gap-4 ${getTypeBg(notif.type)}`}
                  >
                    <div className="mt-0.5 shrink-0 bg-white p-2 rounded-2xl shadow-sm border border-white">
                      {getTypeIcon(notif.type)}
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="text-xs font-black text-gray-900 mb-1 tracking-tight">{notif.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed mb-3 font-medium">{notif.message}</p>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(notif.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 bg-gray-50/80 text-center border-t border-gray-100 backdrop-blur-md">
              <button onClick={() => setIsOpen(false)} className="text-[10px] font-black text-gray-400 hover:text-gray-800 uppercase tracking-widest p-2 transition-colors">Tutup Panel</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
