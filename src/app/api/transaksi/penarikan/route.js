import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { writeAuditLog, AUDIT_AKSI } from "@/lib/audit-log";
import { z } from "zod";

// ── Helpers ───────────────────────────────────────────────────────────────────
function clientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

// ── Zod Schemas ───────────────────────────────────────────────────────────────
const penarikanSchema = z.object({
  anggota_id: z.coerce.number().int().positive("Anggota wajib dipilih"),
  jenis_simpanan_id: z.coerce.number().int().positive("Jenis simpanan wajib dipilih"),
  jumlah: z.coerce.number().int().positive("Jumlah penarikan harus lebih dari 0"),
  tgl: z.string().min(1, "Tanggal wajib diisi"),
});

const bayarSchema = z.object({
  detail_id: z.coerce.number().int().positive("Detail ID tidak valid"),
  tgl_bayar: z.string().min(1, "Tanggal bayar wajib diisi"),
  jumlah_bayar: z.coerce.number().int().positive("Jumlah bayar harus lebih dari 0"),
});

// ── GET: Daftar anggota + saldo ───────────────────────────────────────────────
export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let whereClause = { status: "Aktif" };
    if (user.role === "anggota") {
      whereClause = { id: user.id, status: "Aktif" };
    }

    const anggotaList = await prisma.anggota.findMany({
      where: whereClause,
      select: { id: true, nik: true, nama: true, jk: true },
      orderBy: { nama: "asc" },
    });

    const targetIds = anggotaList.map((a) => a.id);

    const simpananAgg = await prisma.simpanan.groupBy({
      by: ["anggota_id", "jenis"],
      where: { anggota_id: { in: targetIds } },
      _sum: { jumlah: true },
    });

    const simpananMap = {};
    const penarikanMap = {};
    simpananAgg.forEach((s) => {
      if (s.jenis === "S") simpananMap[s.anggota_id] = s._sum.jumlah || 0;
      else penarikanMap[s.anggota_id] = s._sum.jumlah || 0;
    });

    const data = anggotaList.map((a) => ({
      ...a,
      jml_simpanan: simpananMap[a.id] || 0,
      jml_penarikan: penarikanMap[a.id] || 0,
      saldo: (simpananMap[a.id] || 0) - (penarikanMap[a.id] || 0),
    }));

    const jenisSimpanan = await prisma.jenis_simpanan.findMany({
      select: { id: true, nama: true },
    });

    return NextResponse.json({ data, jenisSimpanan });
  } catch (error) {
    console.error("Penarikan GET Error:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

// ── POST: Semua aksi penarikan ────────────────────────────────────────────────
export async function POST(request) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const ip = clientIp(request);

    // ── Detail riwayat penarikan anggota (bisa anggota sendiri) ───────────
    if (body.action === "detail") {
      const targetAnggotaId = parseInt(body.anggota_id);
      if (user.role === "anggota" && targetAnggotaId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const details = await prisma.simpanan.findMany({
        where: { anggota_id: targetAnggotaId, jenis: "T" },
        orderBy: { nomor: "desc" },
        take: 30,
      });
      const jenisList = await prisma.jenis_simpanan.findMany({ select: { id: true, nama: true } });
      const jenisMap = Object.fromEntries(jenisList.map((j) => [j.id, j.nama]));
      const data = details.map((d) => ({
        ...d,
        nama_simpanan: jenisMap[d.jenis_simpanan_id] || "",
        tgl: d.tgl.toISOString(),
      }));
      return NextResponse.json({ data });
    }

    // ── Cek saldo anggota ─────────────────────────────────────────────────
    if (body.action === "saldo") {
      const targetAnggotaId = parseInt(body.anggota_id);
      if (user.role === "anggota" && targetAnggotaId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const simpanan = await prisma.simpanan.aggregate({
        where: { anggota_id: targetAnggotaId, jenis_simpanan_id: parseInt(body.jenis_simpanan_id), jenis: "S" },
        _sum: { jumlah: true },
      });
      const penarikan = await prisma.simpanan.aggregate({
        where: { anggota_id: targetAnggotaId, jenis_simpanan_id: parseInt(body.jenis_simpanan_id), jenis: "T" },
        _sum: { jumlah: true },
      });
      const saldo = (simpanan._sum.jumlah || 0) - (penarikan._sum.jumlah || 0);
      return NextResponse.json({ saldo });
    }

    // ── Admin-only dari sini ──────────────────────────────────────────────
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Hanya Admin yang dapat melakukan tindakan ini" }, { status: 403 });
    }

    // ── Simpan penarikan ──────────────────────────────────────────────────
    if (body.action === "simpan") {
      // Validasi Zod
      const parsed = penarikanSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || "Input tidak valid" }, { status: 422 });
      }
      const { anggota_id, jenis_simpanan_id, jumlah, tgl } = parsed.data;

      // Cek saldo cukup
      const simpananAgg = await prisma.simpanan.aggregate({
        where: { anggota_id, jenis_simpanan_id, jenis: "S" },
        _sum: { jumlah: true },
      });
      const penarikanAgg = await prisma.simpanan.aggregate({
        where: { anggota_id, jenis_simpanan_id, jenis: "T" },
        _sum: { jumlah: true },
      });
      const saldo = (simpananAgg._sum.jumlah || 0) - (penarikanAgg._sum.jumlah || 0);

      if (jumlah > saldo) {
        return NextResponse.json({ error: `Saldo tidak mencukupi. Saldo saat ini: Rp ${saldo.toLocaleString("id-ID")}` }, { status: 422 });
      }

      // Generate nomor
      const year = new Date().getFullYear();
      const last = await prisma.simpanan.findFirst({
        where: { jenis: "T", tgl: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) } },
        orderBy: { nomor: "desc" },
      });
      const counter = last?.nomor ? parseInt(last.nomor.substring(5)) + 1 : 1;
      const nomor = `T${year}${counter.toString().padStart(6, "0")}`;

      // Atomic: create + audit
      const data = await prisma.$transaction(async (tx) => {
        const penarikan = await tx.simpanan.create({
          data: {
            nomor,
            tgl: new Date(tgl),
            tgl_akhir: new Date(tgl),
            anggota_id,
            jenis_simpanan_id,
            jumlah,
            jenis: "T",
            user_id: user.id,
            insert_date: new Date(),
          },
        });

        await tx.$executeRaw`
          INSERT INTO audit_log (user_id, username, aksi, tabel, record_id, before_data, after_data, ip_address, keterangan)
          VALUES (${user.id}, ${user.username}, ${AUDIT_AKSI.TAMBAH_PENARIKAN}, 'simpanan', ${penarikan.id},
                  NULL, ${JSON.stringify(penarikan)}, ${ip},
                  ${`Penarikan ${nomor} - anggota_id ${anggota_id} - jumlah ${jumlah}`})
        `;

        return penarikan;
      });

      return NextResponse.json({ message: "Data penarikan berhasil disimpan", data });
    }

    // ── Hapus penarikan ───────────────────────────────────────────────────
    if (body.action === "hapus") {
      const id = parseInt(body.id);
      const before = await prisma.simpanan.findUnique({ where: { id } });
      await prisma.simpanan.delete({ where: { id } });
      await writeAuditLog({ userId: user.id, username: user.username, aksi: AUDIT_AKSI.HAPUS_SIMPANAN, tabel: "simpanan", recordId: id, beforeData: before, ipAddress: ip });
      return NextResponse.json({ message: "Data berhasil dihapus" });
    }

    return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Penarikan POST Error:", error);
    return NextResponse.json({ error: "Gagal memproses data" }, { status: 500 });
  }
}
