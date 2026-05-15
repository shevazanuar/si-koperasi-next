import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { writeAuditLog, AUDIT_AKSI } from "@/lib/audit-log";
import { z } from "zod";

function clientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

const approveSchema = z.object({
  nomor: z.string().min(1, "Nomor pengajuan wajib diisi"),
  status: z.enum(["Acc", "Cancel"], { errorMap: () => ({ message: "Status harus Acc atau Cancel" }) }),
});

export async function GET(request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Gunakan Prisma ORM (bukan queryRawUnsafe)
    const pengajuanList = await prisma.pengajuan_pinjaman.findMany({
      where: user.role === "anggota" ? { anggota_id: user.id } : {},
      orderBy: { id: "desc" },
    });

    // Enrich dengan nama anggota dan nama jenis
    const anggotaIds = [...new Set(pengajuanList.map((p) => p.anggota_id))];
    const jenisPinjamanIds = [...new Set(pengajuanList.map((p) => p.jenis_pinjaman_id).filter(Boolean))];

    const [anggotaList, jenisList] = await Promise.all([
      prisma.anggota.findMany({ where: { id: { in: anggotaIds } }, select: { id: true, nik: true, nama: true, perusahaan: true, jabatan: true } }),
      prisma.jenis_pinjaman.findMany({ where: { id: { in: jenisPinjamanIds } }, select: { id: true, nama: true } }),
    ]);

    const anggotaMap = Object.fromEntries(anggotaList.map((a) => [a.id, a]));
    const jenisMap = Object.fromEntries(jenisList.map((j) => [j.id, j.nama]));

    const data = pengajuanList.map((p) => ({
      id: typeof p.id === "bigint" ? Number(p.id) : p.id,
      nomor: p.nomor,
      tanggal: p.tanggal ? new Date(p.tanggal).toISOString() : null,
      anggota_id: p.anggota_id,
      status: p.status,
      keperluan: p.keperluan,
      jumlah: p.jumlah,
      lama: p.lama,
      satuan: p.satuan,
      nama_jenis: jenisMap[p.jenis_pinjaman_id] || "Pinjaman Umum",
      nama_anggota: anggotaMap[p.anggota_id]?.nama || "Tidak Ditemukan",
      nik: anggotaMap[p.anggota_id]?.nik || "",
      perusahaan: anggotaMap[p.anggota_id]?.perusahaan || "",
      jabatan: anggotaMap[p.anggota_id]?.jabatan || "",
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Pengajuan GET Error:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin")
      return NextResponse.json({ error: "Unauthorized. Hanya Admin yang dapat memproses pengajuan." }, { status: 403 });

    const body = await request.json();
    const ip = clientIp(request);

    // Validasi Zod
    const parsed = approveSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Input tidak valid" }, { status: 422 });

    const { nomor, status } = parsed.data;

    // Ambil data pengajuan sebelum diubah
    const pengajuan = await prisma.pengajuan_pinjaman.findFirst({ where: { nomor } });
    if (!pengajuan) return NextResponse.json({ error: "Data pengajuan tidak ditemukan" }, { status: 404 });
    if (pengajuan.status !== "Open") return NextResponse.json({ error: "Pengajuan sudah diproses sebelumnya" }, { status: 422 });

    const pengajuanBefore = { ...pengajuan };

    if (status === "Acc") {
      // Validasi pengajuan lengkap
      if (!pengajuan.jumlah || pengajuan.jumlah <= 0) return NextResponse.json({ error: "Jumlah pinjaman tidak valid" }, { status: 422 });
      if (!pengajuan.lama || pengajuan.lama <= 0) return NextResponse.json({ error: "Lama pinjaman tidak valid" }, { status: 422 });

      const year = new Date().getFullYear();
      const prefix = `P${year}`;
      const lastPinjaman = await prisma.pinjaman_header.findFirst({ where: { nomor: { startsWith: prefix } }, orderBy: { nomor: "desc" } });
      const counter = lastPinjaman?.nomor ? parseInt(lastPinjaman.nomor.substring(5)) + 1 : 1;
      const nomorPinjaman = `${prefix}${counter.toString().padStart(6, "0")}`;

      // Atomic: update pengajuan + buat pinjaman_header + buat cicilan + audit
      await prisma.$transaction(async (tx) => {
        // 1. Update status pengajuan
        const updatedPengajuan = await tx.pengajuan_pinjaman.update({
          where: { id: pengajuan.id },
          data: { status: "Acc", update_date: new Date() },
        });

        // 2. Buat pinjaman header
        const newPinjaman = await tx.pinjaman_header.create({
          data: {
            nomor: nomorPinjaman,
            tgl: new Date(),
            anggota_id: pengajuan.anggota_id,
            jenis_pinjaman_id: pengajuan.jenis_pinjaman_id,
            lama: pengajuan.lama || 0,
            satuan: pengajuan.satuan || "Bulan",
            bunga: pengajuan.bunga || 0,
            jumlah: Math.round(pengajuan.jumlah || 0),
            user_id: user.id,
            insert_date: new Date(),
          },
        });

        // 3. Generate jadwal cicilan
        const lama = pengajuan.lama || 1;
        const pokok = Math.round(pengajuan.jumlah || 0);
        const bungaPersen = pengajuan.bunga || 0;
        const angsuranPokok = Math.floor(pokok / lama);
        const angsuranBunga = Math.round((pokok * bungaPersen) / 100);
        const startDate = new Date();
        const details = [];
        for (let i = 1; i <= lama; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(startDate.getMonth() + i);
          details.push({
            pinjaman_id: newPinjaman.id,
            cicilan: i,
            angsuran: i === lama ? pokok - angsuranPokok * (lama - 1) : angsuranPokok,
            bunga: angsuranBunga,
            tgl_jatuh_tempo: dueDate,
            jumlah_bayar: 0,
            insert_user_id: user.id,
            insert_date: new Date(),
          });
        }
        await tx.pinjaman_detail.createMany({ data: details });

        // 4. Audit log
        await tx.$executeRaw`
          INSERT INTO audit_log (user_id, username, aksi, tabel, record_id, before_data, after_data, ip_address, keterangan)
          VALUES (${user.id}, ${user.username}, ${AUDIT_AKSI.APPROVE_PINJAMAN}, 'pengajuan_pinjaman', ${pengajuan.id},
                  ${JSON.stringify(pengajuanBefore)}, ${JSON.stringify({ ...updatedPengajuan, pinjaman_id: newPinjaman.id, pinjaman_nomor: nomorPinjaman })},
                  ${ip}, ${`Approve pengajuan ${nomor} -> pinjaman ${nomorPinjaman}`})
        `;
      });

    } else {
      // status === "Cancel"
      await prisma.$transaction(async (tx) => {
        const updated = await tx.pengajuan_pinjaman.update({
          where: { id: pengajuan.id },
          data: { status: "Cancel", update_date: new Date() },
        });

        await tx.$executeRaw`
          INSERT INTO audit_log (user_id, username, aksi, tabel, record_id, before_data, after_data, ip_address, keterangan)
          VALUES (${user.id}, ${user.username}, ${AUDIT_AKSI.TOLAK_PINJAMAN}, 'pengajuan_pinjaman', ${pengajuan.id},
                  ${JSON.stringify(pengajuanBefore)}, ${JSON.stringify(updated)}, ${ip}, ${`Tolak pengajuan ${nomor}`})
        `;
      });
    }

    return NextResponse.json({ message: status === "Acc" ? "Pengajuan disetujui dan pinjaman telah diterbitkan" : "Pengajuan telah ditolak" });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status: " + error.message }, { status: 500 });
  }
}
