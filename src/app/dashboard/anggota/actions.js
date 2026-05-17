"use server";

import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { writeAuditLog, AUDIT_AKSI } from "@/lib/audit-log";
import { headers } from "next/headers";
import { z } from "zod";

const anggotaSchema = z.object({
  nik: z.string().min(1, "NIK wajib diisi"),
  nama: z.string().min(1, "Nama wajib diisi"),
  noidentitas: z.string().min(1, "No Identitas wajib diisi"),
  jk: z.string().optional(),
  tempat_lahir: z.string().optional(),
  tgl_lahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  alamat: z.string().optional(),
  hp: z.string().optional(),
  email: z.string().email("Format email tidak valid").or(z.literal("")).optional(),
  kota: z.string().optional(),
  perusahaan: z.string().optional(),
  unit_seksi: z.string().optional(),
  jabatan: z.string().optional(),
  level_anggota_id: z.string().optional(),
  gaji: z.string().optional(),
  nama_pasangan: z.string().optional(),
  jml_anak: z.string().optional(),
  tgl_masuk: z.string().optional(),
  status: z.string().optional(),
});

export async function createAnggota(prevState, formData) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Akses ditolak. Hanya Admin yang dapat menambah anggota." };
  }
  
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const rawData = Object.fromEntries(formData.entries());
  
  // Validate using Zod
  const validation = anggotaSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMsg = validation.error.issues?.[0]?.message || "Input tidak valid";
    return { error: errorMsg };
  }

  const data = validation.data;
  const nik = data.nik;
  const nama = data.nama;
  const noidentitas = data.noidentitas;
  const jk = data.jk;
  const tempat_lahir = data.tempat_lahir;
  const tgl_lahir = data.tgl_lahir;
  const alamat = data.alamat;
  const hp = data.hp;
  const email = data.email;
  const kota = data.kota;
  const perusahaan = data.perusahaan;
  const unit_seksi = data.unit_seksi;
  const jabatan = data.jabatan;
  const level_anggota_id = data.level_anggota_id;
  const gaji = data.gaji;
  const nama_pasangan = data.nama_pasangan;
  const jml_anak = data.jml_anak;
  const tgl_masuk = data.tgl_masuk;
  const status = data.status;

  try {
    // Check if NIK already exists
    const existing = await prisma.anggota.findFirst({ where: { nik } });
    if (existing) {
      return { error: "NIK sudah terdaftar." };
    }

    const newAnggota = await prisma.anggota.create({
      data: {
        nik,
        nama,
        noidentitas,
        jk,
        tempat_lahir,
        tgl_lahir: new Date(tgl_lahir),
        alamat,
        hp,
        email: email || null,
        kota,
        perusahaan,
        unit_seksi,
        jabatan,
        level_anggota_id: level_anggota_id ? parseInt(level_anggota_id) : null,
        gaji: gaji ? parseInt(gaji) : null,
        nama_pasangan,
        jml_anak: jml_anak ? parseInt(jml_anak) : null,
        status: status || "Aktif",
        pwd: await hashPassword(nik), // Default password is NIK (migrated to bcrypt)
        tgl_masuk: tgl_masuk ? new Date(tgl_masuk) : new Date(),
        insert_date: new Date(),
      },
    });

    await writeAuditLog({
      userId: session.id,
      username: session.username,
      aksi: AUDIT_AKSI.TAMBAH_ANGGOTA,
      tabel: "anggota",
      recordId: newAnggota.id,
      beforeData: null,
      afterData: newAnggota,
      ipAddress: ip,
      keterangan: `Menambah anggota baru NIK ${nik}`,
    });

  } catch (e) {
    console.error("Create Anggota Error:", e);
    return { error: "Gagal menyimpan data anggota." };
  }

  revalidatePath("/dashboard/anggota");
  redirect("/dashboard/anggota");
}

export async function updateAnggota(id, prevState, formData) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Akses ditolak. Hanya Admin yang dapat mengubah data anggota." };
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const nik = formData.get("nik");
  const nama = formData.get("nama");
  const noidentitas = formData.get("noidentitas");
  const jk = formData.get("jk");
  const tempat_lahir = formData.get("tempat_lahir");
  const tgl_lahir = formData.get("tgl_lahir");
  const alamat = formData.get("alamat");
  const hp = formData.get("hp");
  const email = formData.get("email");
  const kota = formData.get("kota");
  const perusahaan = formData.get("perusahaan");
  const unit_seksi = formData.get("unit_seksi");
  const jabatan = formData.get("jabatan");
  const level_anggota_id = formData.get("level_anggota_id");
  const gaji = formData.get("gaji");
  const nama_pasangan = formData.get("nama_pasangan");
  const jml_anak = formData.get("jml_anak");
  const tgl_masuk = formData.get("tgl_masuk");
  const status = formData.get("status");

  try {
    const before = await prisma.anggota.findUnique({ where: { id: parseInt(id) } });

    const updated = await prisma.anggota.update({
      where: { id: parseInt(id) },
      data: {
        nik,
        nama,
        noidentitas,
        jk,
        tempat_lahir,
        tgl_lahir: new Date(tgl_lahir),
        alamat,
        hp,
        email: email || null,
        kota,
        perusahaan,
        unit_seksi,
        jabatan,
        level_anggota_id: level_anggota_id ? parseInt(level_anggota_id) : null,
        gaji: gaji ? parseInt(gaji) : null,
        nama_pasangan,
        jml_anak: jml_anak ? parseInt(jml_anak) : null,
        status: status || "Aktif",
        tgl_masuk: tgl_masuk ? new Date(tgl_masuk) : undefined,
        update_date: new Date(),
      },
    });

    await writeAuditLog({
      userId: session.id,
      username: session.username,
      aksi: AUDIT_AKSI.EDIT_ANGGOTA,
      tabel: "anggota",
      recordId: updated.id,
      beforeData: before,
      afterData: updated,
      ipAddress: ip,
      keterangan: `Mengubah data anggota ID ${id}`,
    });

  } catch (e) {
    console.error("Update Anggota Error:", e);
    return { error: "Gagal memperbarui data anggota." };
  }

  revalidatePath("/dashboard/anggota");
  redirect("/dashboard/anggota");
}
