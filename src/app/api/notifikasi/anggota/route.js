import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    console.log("Session in notifikasi:", session);
    
    if (!session || session.role !== "anggota") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Dapatkan data anggota berdasarkan id (karena session.id untuk anggota adalah anggota.id)
    const anggotaData = await prisma.anggota.findFirst({
      where: { id: session.id },
      select: { id: true, simpanan_wajib_per_bulan: true }
    });
    
    console.log("Anggota Data:", anggotaData);

    if (!anggotaData) {
      return NextResponse.json({ notifications: [] });
    }

    const anggotaId = anggotaData.id;
    const notifications = [];

    // --- 0. Informasi Terbaru ---
    const recentInformasi = await prisma.informasi.findMany({
      orderBy: { id: 'desc' },
      take: 2
    });

    for (const info of recentInformasi) {
      notifications.push({
        id: `info-${info.id}`,
        type: 'info',
        title: 'Informasi Terbaru',
        message: info.judul || 'Ada informasi baru dari Koperasi.',
        date: info.update_date || info.insert_date || new Date(),
        href: `/dashboard/informasi`
      });
    }

    // --- 1. Update Pengajuan Pinjaman ---
    const recentPengajuan = await prisma.pengajuan_pinjaman.findMany({
      where: {
        anggota_id: anggotaId,
        status: { in: ['Acc', 'Cancel'] }
      },
      orderBy: { update_date: 'desc' },
      take: 3
    });

    for (const p of recentPengajuan) {
      notifications.push({
        id: `pengajuan-${p.id}`,
        type: p.status === 'Acc' ? 'success' : 'error',
        title: 'Status Pengajuan Pinjaman',
        message: `Pengajuan pinjaman Anda nomor ${p.nomor} telah ${p.status === 'Acc' ? 'Disetujui' : 'Ditolak'}.`,
        date: p.update_date || p.insert_date || new Date(),
        href: `/dashboard/transaksi/pengajuan-pinjaman/${p.id}`
      });
    }

    // --- 2. Tagihan Cicilan (Jatuh Tempo) ---
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    // Dapatkan pinjaman_header milik anggota
    const activePinjaman = await prisma.pinjaman_header.findMany({
      where: { anggota_id: anggotaId },
      select: { id: true, nomor: true }
    });

    if (activePinjaman.length > 0) {
      const pinjamanIds = activePinjaman.map(p => p.id);

      // Cari cicilan yang belum dibayar dan sudah dekat jatuh tempo
      const tagihan = await prisma.pinjaman_detail.findMany({
        where: {
          pinjaman_id: { in: pinjamanIds },
          tgl_bayar: { equals: "" }, // Kosong berarti belum dibayar
          tgl_jatuh_tempo: { lte: nextWeek }
        },
        orderBy: { tgl_jatuh_tempo: 'asc' },
        take: 3
      });

      for (const t of tagihan) {
        const isOverdue = new Date(t.tgl_jatuh_tempo) < today;
        const pinjamanData = activePinjaman.find(p => p.id === t.pinjaman_id);
        notifications.push({
          id: `tagihan-${t.id}`,
          type: isOverdue ? 'error' : 'warning',
          title: 'Tagihan Cicilan',
          message: `Cicilan ke-${t.cicilan} pinjaman ${pinjamanData?.nomor || ''} sebesar Rp ${new Intl.NumberFormat('id-ID').format(t.jumlah_bayar)} ${isOverdue ? 'telah jatuh tempo' : 'akan segera jatuh tempo'}.`,
          date: t.tgl_jatuh_tempo || new Date(),
          href: `/dashboard/pinjaman`
        });
      }
    }

    // --- 3. Simpanan Wajib ---
    const currentMonth = today.getMonth() + 1; // 1 - 12
    const currentYear = today.getFullYear();

    const jenisWajib = await prisma.jenis_simpanan.findFirst({
      where: { nama: { contains: "Wajib" } }
    });

    if (jenisWajib && anggotaData.simpanan_wajib_per_bulan > 0) {
      // Cari apakah sudah bayar bulan ini
      // MySQL month() / year() function is tricky in Prisma, so we filter by date range
      const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
      const lastDayOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

      const simpananBulanIni = await prisma.simpanan.findFirst({
        where: {
          anggota_id: anggotaId,
          jenis_simpanan_id: jenisWajib.id,
          tgl: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth
          }
        }
      });

      if (!simpananBulanIni) {
        // Belum bayar bulan ini
        notifications.push({
          id: `simpanan-wajib-${currentMonth}-${currentYear}`,
          type: 'warning',
          title: 'Simpanan Wajib',
          message: `Anda belum menyetorkan Simpanan Wajib sebesar Rp ${new Intl.NumberFormat('id-ID').format(anggotaData.simpanan_wajib_per_bulan)} untuk bulan ini.`,
          date: today,
          href: `/dashboard/simpanan`
        });
      }
    }

    // Urutkan berdasarkan tanggal terbaru
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log("Total notifications:", notifications.length);
    return NextResponse.json(
      { notifications },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
