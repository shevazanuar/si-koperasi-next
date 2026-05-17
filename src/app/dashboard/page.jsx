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

  const stats = {
    totalAnggota: 0,
    totalSimpanan: 0,
    totalPenarikan: 0,
    totalPinjaman: 0,
    recentActivities: [],
    pengajuanPinjaman: null,
    produkTerbaru: [],
    riwayatPembelian: [],
  };

  let chartData = [];
  let profileInfo = null;
  let informasiList = [];

  if (isAdmin) {
    const [
      totalAnggota,
      countSimpanan,
      countPenarikan,
      countPinjaman,
      recentSimpanan,
      profileData,
      informasiData,
    ] = await Promise.all([
      prisma.anggota.count({ where: { status: "Aktif" } }),
      prisma.simpanan.count({ where: { jenis: "S" } }),
      prisma.simpanan.count({ where: { jenis: "T" } }),
      prisma.pinjaman_header.count(),
      prisma.simpanan.findMany({
        take: 5,
        orderBy: { tgl: "desc" },
        select: { id: true, anggota_id: true, jumlah: true, tgl: true },
      }),
      prisma.$queryRawUnsafe("SELECT * FROM profile WHERE id = 1 LIMIT 1"),
      prisma.informasi.findMany({
        orderBy: { id: "desc" },
        take: 20,
      }),
    ]);

    stats.totalAnggota = totalAnggota;
    stats.totalSimpanan = countSimpanan;
    stats.totalPenarikan = countPenarikan;
    stats.totalPinjaman = countPinjaman;

    const memberIds = [...new Set(recentSimpanan.map((s) => s.anggota_id))];
    const members = await prisma.anggota.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, nama: true },
    });
    const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));

    stats.recentActivities = recentSimpanan.map((s) => ({
      id: s.id,
      title: `Setoran: ${memberMap[s.anggota_id]?.nama || "Anggota"}`,
      amount: s.jumlah,
      date: s.tgl,
    }));

    profileInfo =
      profileData && profileData.length > 0
        ? {
            koperasi: profileData[0].koperasi || "",
            alamat: profileData[0].alamat || "",
            kota: profileData[0].kota || "",
            hp: profileData[0].hp || "",
            email: profileData[0].email || "",
          }
        : null;

    informasiList = informasiData.map((i) => ({
      id: i.id,
      judul: i.judul || "",
      isi: i.isi || "",
      insert_date: i.insert_date ? i.insert_date.toISOString() : null,
    }));

    chartData = await aggregateChartData();
  } else {
    const [totalSimpanan, totalPinjaman, recentSimpanan, pengajuan, produk, pembelian] = await Promise.all([
      prisma.simpanan.aggregate({
        where: { anggota_id: user.id },
        _sum: { jumlah: true },
      }),
      prisma.pinjaman_header.aggregate({
        where: { anggota_id: user.id },
        _sum: { jumlah: true },
      }),
      prisma.simpanan.findMany({
        where: { anggota_id: user.id },
        take: 5,
        orderBy: { tgl: "desc" },
        select: { id: true, anggota_id: true, jumlah: true, tgl: true },
      }),
      prisma.pengajuan_pinjaman.findFirst({
        where: { anggota_id: user.id },
        orderBy: { tanggal: "desc" },
      }),
      prisma.master_barang.findMany({
        where: { status: "Aktif" },
        orderBy: { created_at: "desc" },
        take: 3,
        include: { kategori: true }
      }),
      prisma.penjualan.findMany({
        where: { anggota_id: user.id },
        orderBy: { tanggal_penjualan: "desc" },
        take: 3,
      })
    ]);

    stats.totalSimpanan = totalSimpanan._sum.jumlah || 0;
    stats.totalPinjaman = totalPinjaman._sum.jumlah || 0;
    stats.pengajuanPinjaman = pengajuan;
    stats.produkTerbaru = produk;
    stats.riwayatPembelian = pembelian;
    stats.recentActivities = recentSimpanan.map((s) => ({
      id: s.id,
      title: "Setoran Tabungan",
      amount: s.jumlah,
      date: s.tgl,
    }));

    chartData = await aggregateChartData(user.id);
  }

  return (
    <>
      {isAdmin ? (
        <AdminDashboard
          stats={stats}
          chartData={chartData}
          profileInfo={profileInfo}
          informasiList={informasiList}
        />
      ) : (
        <MemberDashboard stats={stats} chartData={chartData} user={user} />
      )}
    </>
  );
}

async function aggregateChartData(anggotaId = null) {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      start: new Date(d.getFullYear(), d.getMonth(), 1),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
      label: d.toLocaleDateString("id-ID", { month: "short" }),
    });
  }

  const chartData = await Promise.all(
    months.map(async (m) => {
      const whereSimpanan = { tgl: { gte: m.start, lte: m.end } };
      const wherePinjaman = { tgl: { gte: m.start, lte: m.end } };

      if (anggotaId) {
        whereSimpanan.anggota_id = anggotaId;
        wherePinjaman.anggota_id = anggotaId;
      }

      const [s, p] = await Promise.all([
        prisma.simpanan.aggregate({ where: whereSimpanan, _sum: { jumlah: true } }),
        prisma.pinjaman_header.aggregate({ where: wherePinjaman, _sum: { jumlah: true } }),
      ]);

      return {
        name: m.label,
        simpanan: s._sum.jumlah || 0,
        pinjaman: p._sum.jumlah || 0,
      };
    })
  );

  return chartData;
}
