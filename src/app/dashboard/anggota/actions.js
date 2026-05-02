"use server";

import prisma from "@/lib/prisma";
import CryptoJS from "crypto-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  const rawData = Object.fromEntries(formData.entries());
  
  // Validate using Zod
  const validation = anggotaSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
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

    await prisma.anggota.create({
      data: {
        nik,
        nama,
        noidentitas,
        jk,
        tempat_lahir,
        tgl_lahir: new Date(tgl_lahir),
        alamat,
        hp,
        kota,
        perusahaan,
        unit_seksi,
        jabatan,
        level_anggota_id: level_anggota_id ? parseInt(level_anggota_id) : null,
        gaji: gaji ? parseInt(gaji) : null,
        nama_pasangan,
        jml_anak: jml_anak ? parseInt(jml_anak) : null,
        status: status || "Aktif",
        pwd: CryptoJS.MD5(nik).toString(), // Default password is NIK
        tgl_masuk: tgl_masuk ? new Date(tgl_masuk) : new Date(),
        insert_date: new Date(),
      },
    });
  } catch (e) {
    console.error("Create Anggota Error:", e);
    return { error: "Gagal menyimpan data anggota." };
  }

  revalidatePath("/dashboard/anggota");
  redirect("/dashboard/anggota");
}

export async function updateAnggota(id, prevState, formData) {
  const nik = formData.get("nik");
  const nama = formData.get("nama");
  const noidentitas = formData.get("noidentitas");
  const jk = formData.get("jk");
  const tempat_lahir = formData.get("tempat_lahir");
  const tgl_lahir = formData.get("tgl_lahir");
  const alamat = formData.get("alamat");
  const hp = formData.get("hp");
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
    await prisma.anggota.update({
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
  } catch (e) {
    console.error("Update Anggota Error:", e);
    return { error: "Gagal memperbarui data anggota." };
  }

  revalidatePath("/dashboard/anggota");
  redirect("/dashboard/anggota");
}
