import prisma from "@/lib/prisma";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import MemberDashboard from "@/components/dashboard/MemberDashboard";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = user.role === "admin";

  // Data Aggregation Logic
  const stats = {
    totalAnggota: 0,
    totalSimpanan: 0,
    totalPinjaman: 0,
    recentActivities: []
  };

  let chartData = [];

  if (isAdmin) {
    // Admin View: Global Data
    const [totalAnggota, totalSimpanan, totalPinjaman, recentSimpanan] = await Promise.all([
      prisma.anggota.count({ where: { status: "Aktif" } }),
      prisma.simpanan.aggregate({ _sum: { jumlah: true } }),
      prisma.pinjaman_header.aggregate({ _sum: { jumlah: true } }),
      prisma.simpanan.findMany({
        take: 5,
        orderBy: { tgl: "desc" },
        select: {
            id: true,
            anggota_id: true,
            jumlah: true,
            tgl: true
        }
      })
    ]);

    stats.totalAnggota = totalAnggota;
    stats.totalSimpanan = totalSimpanan._sum.jumlah || 0;
    stats.totalPinjaman = totalPinjaman._sum.jumlah || 0;
    
    // For recent activities in admin view, we need member names
    const memberIds = [...new Set(recentSimpanan.map(s => s.anggota_id))];
    const members = await prisma.anggota.findMany({
        where: { id: { in: memberIds } },
        select: { id: true, nama: true }
    });
    const memberMap = Object.fromEntries(members.map(m => [m.id, m]));

    stats.recentActivities = recentSimpanan.map(s => ({
      id: s.id,
      title: `Setoran: ${memberMap[s.anggota_id]?.nama || 'Anggota'}`,
      amount: s.jumlah,
      date: s.tgl
    }));

    // Aggregate Chart Data (Last 6 Months Global)
    chartData = await aggregateChartData();
  } else {
    // Member View: Personal Data
    const [totalSimpanan, totalPinjaman, recentSimpanan] = await Promise.all([
      prisma.simpanan.aggregate({ 
        where: { anggota_id: user.id },
        _sum: { jumlah: true } 
      }),
      prisma.pinjaman_header.aggregate({ 
        where: { anggota_id: user.id },
        _sum: { jumlah: true } 
      }),
      prisma.simpanan.findMany({
        where: { anggota_id: user.id },
        take: 5,
        orderBy: { tgl: "desc" },
        select: {
          id: true,
          anggota_id: true,
          jumlah: true,
          tgl: true
        }
      })
    ]);

    stats.totalSimpanan = totalSimpanan._sum.jumlah || 0;
    stats.totalPinjaman = totalPinjaman._sum.jumlah || 0;
    stats.recentActivities = recentSimpanan.map(s => ({
      id: s.id,
      title: "Setoran Tabungan",
      amount: s.jumlah,
      date: s.tgl
    }));

    // Aggregate Chart Data (Last 6 Months Personal)
    chartData = await aggregateChartData(user.id);
  }

  return (
    <>
      {isAdmin ? (
        <AdminDashboard stats={stats} chartData={chartData} />
      ) : (
        <MemberDashboard stats={stats} chartData={chartData} user={user} />
      )}
    </>
  );
}

// Reusable aggregation logic
async function aggregateChartData(anggotaId = null) {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
        label: d.toLocaleDateString('id-ID', { month: 'short' })
      });
    }

    const chartData = await Promise.all(months.map(async (m) => {
      const whereSimpanan = { tgl: { gte: m.start, lte: m.end } };
      const wherePinjaman = { tgl: { gte: m.start, lte: m.end } };
      
      if (anggotaId) {
          whereSimpanan.anggota_id = anggotaId;
          wherePinjaman.anggota_id = anggotaId;
      }

      const [s, p] = await Promise.all([
        prisma.simpanan.aggregate({ where: whereSimpanan, _sum: { jumlah: true } }),
        prisma.pinjaman_header.aggregate({ where: wherePinjaman, _sum: { jumlah: true } })
      ]);
      
      return {
        name: m.label,
        simpanan: s._sum.jumlah || 0,
        pinjaman: p._sum.jumlah || 0
      };
    }));

    return chartData;
}
