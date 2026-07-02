"use client";

import { useEffect, useState } from "react";
import { Activity, LogIn, Database, RefreshCw } from "lucide-react";

export default function RecentActivitiesWidget() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/aktivitas-terbaru");
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // Poll every 5 seconds for real-time feel
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (aksi) => {
    if (aksi === "login") return <LogIn className="w-4 h-4" />;
    if (["insert", "update", "delete"].includes(aksi)) return <Database className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return <p className="text-sm text-gray-400 italic font-medium text-center py-4">Belum ada aktivitas.</p>;
  }

  return (
    <div className="space-y-4">
      {activities.map((act) => (
        <div key={act.id} className="flex gap-3 group cursor-default">
          <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all">
            {getIcon(act.aksi)}
          </div>
          <div className="overflow-hidden w-full flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-gray-900 truncate capitalize">{act.title}</p>
              <p className="text-[10px] text-gray-400 font-medium">
                Oleh: {act.username || "Sistem"} •{" "}
                {new Date(act.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })} {new Date(act.date).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
