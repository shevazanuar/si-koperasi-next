"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { writeAuditLog, AUDIT_AKSI } from "@/lib/audit-log";
import { headers } from "next/headers";
import { z } from "zod";

// ── Zod schema validasi backend ───────────────────────────────────────────────
const simpananSchema = z.object({
  anggota_id: z.coerce.number().int().positive("Anggota wajib dipilih"),
  jenis_simpanan_id: z.coerce.number().int().positive("Jenis simpanan wajib dipilih"),
  jumlah: z.coerce.number().int().positive("Jumlah harus lebih dari 0"),
  tgl: z.string().min(1, "Tanggal wajib diisi"),
});

async function generateSimpananNomor() {
  const year = new Date().getFullYear();
  const prefix = `S${year}`;
  const last = await prisma.simpanan.findFirst({
    where: { nomor: { startsWith: prefix } },
    orderBy: { nomor: "desc" },
  });
  const counter = last?.nomor ? parseInt(last.nomor.substring(5)) + 1 : 1;
  return `${prefix}${counter.toString().padStart(6, "0")}`;
}

export async function createSimpanan(prevState, formData) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Akses ditolak. Hanya Admin yang dapat menambah simpanan." };
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // ── Validasi Zod ─────────────────────────────────────────────────────────
  const raw = {
    anggota_id: formData.get("anggota_id"),
    jenis_simpanan_id: formData.get("jenis_simpanan_id"),
    jumlah: formData.get("jumlah"),
    tgl: formData.get("tgl") || new Date().toISOString().split("T")[0],
  };

  const parsed = simpananSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Input tidak valid";
    return { error: msg };
  }

  const { anggota_id, jenis_simpanan_id, jumlah, tgl } = parsed.data;

  try {
    const nomor = await generateSimpananNomor();

    // ── Prisma transaction: atomic create + audit ─────────────────────────
    await prisma.$transaction(async (tx) => {
      const created = await tx.simpanan.create({
        data: {
          nomor,
          tgl: new Date(tgl),
          tgl_akhir: new Date(tgl),
          anggota_id,
          jenis_simpanan_id,
          jumlah,
          user_id: session.id,
          insert_date: new Date(),
          entry: "I",
          jenis: "S",
        },
      });

      await tx.$executeRaw`
        INSERT INTO audit_log (user_id, username, aksi, tabel, record_id, before_data, after_data, ip_address, keterangan)
        VALUES (${session.id}, ${session.username}, ${AUDIT_AKSI.TAMBAH_SIMPANAN}, 'simpanan', ${created.id},
                NULL, ${JSON.stringify(created)}, ${ip}, ${`Tambah simpanan ${nomor} untuk anggota ID ${anggota_id}`})
      `;

      return created;
    });
  } catch (e) {
    console.error("Create Simpanan Error:", e);
    return { error: "Gagal menyimpan transaksi simpanan." };
  }

  revalidatePath("/dashboard/simpanan");
  revalidatePath("/dashboard");
  redirect("/dashboard/simpanan");
}
