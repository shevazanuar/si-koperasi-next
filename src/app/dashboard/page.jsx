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
  };

  let chartData = [];
  let profileInfo = null;
  let informasiList = [];

  if (isAdmin) {
    // Otomatis cek dan simpan laporan pendapatan tahun sebelumnya jika belum ada
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const periodePrevYear = `Tahun ${previousYear}`;
    
    const checkPendapatan = await prisma.pendapatan.findFirst({
      where: { periode: periodePrevYear }
    });

    if (!checkPendapatan) {
      const { simpanPendapatanTahunan } = await import('@/app/dashboard/laporan/pendapatan/actions');
      await simpanPendapatanTahunan(previousYear);
    }

    const [
      totalAnggota,
      countSimpanan,
      countPenarikan,
      countPinjaman,
      recentSimpananRaw,
      profileData,
      informasiData,
    ] = await Promise.all([
      prisma.anggota.count({ where: { status: "Aktif" } }),
      prisma.simpanan.count({ where: { jenis: "S" } }),
      prisma.simpanan.count({ where: { jenis: "T" } }),
      prisma.pinjaman_header.count(),
      prisma.$queryRawUnsafe(`SELECT id, anggota_id, jumlah, CAST(tgl AS CHAR) as tgl FROM simpanan ORDER BY tgl DESC LIMIT 5`),
      prisma.$queryRawUnsafe("SELECT * FROM profile WHERE id = 1 LIMIT 1"),
      prisma.informasi.findMany({
        orderBy: { id: "desc" },
        take: 20,
      }),
    ]);

    const recentSimpanan = recentSimpananRaw.map(r => ({
      id: Number(r.id),
      anggota_id: Number(r.anggota_id),
      jumlah: Number(r.jumlah),
      tgl: r.tgl && !r.tgl.startsWith("0000") ? new Date(r.tgl) : new Date(),
    }));

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
    const [totalSimpanan, totalPinjaman, recentSimpananRaw, pengajuan] = await Promise.all([
      prisma.simpanan.aggregate({
        where: { anggota_id: user.id },
        _sum: { jumlah: true },
      }),
      prisma.pinjaman_header.aggregate({
        where: { anggota_id: user.id },
        _sum: { jumlah: true },
      }),
      prisma.$queryRawUnsafe(`SELECT id, anggota_id, jumlah, CAST(tgl AS CHAR) as tgl FROM simpanan WHERE anggota_id = ? ORDER BY tgl DESC LIMIT 5`, user.id),
      prisma.pengajuan_pinjaman.findFirst({
        where: { anggota_id: user.id },
        orderBy: { tanggal: "desc" },
      })
    ]);

    const recentSimpanan = recentSimpananRaw.map(r => ({
      id: Number(r.id),
      anggota_id: Number(r.anggota_id),
      jumlah: Number(r.jumlah),
      tgl: r.tgl && !r.tgl.startsWith("0000") ? new Date(r.tgl) : new Date(),
    }));

    stats.totalSimpanan = totalSimpanan._sum.jumlah || 0;
    stats.totalPinjaman = totalPinjaman._sum.jumlah || 0;
    stats.pengajuanPinjaman = pengajuan;
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
