"use server";

import prisma from "@/lib/prisma";
import CryptoJS from "crypto-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAnggota(prevState, formData) {
  const nik = formData.get("nik");
  const nama = formData.get("nama");
  const noidentitas = formData.get("noidentitas");
  const jk = formData.get("jk");
  const tempat_lahir = formData.get("tempat_lahir");
  const tgl_lahir = formData.get("tgl_lahir");
  const alamat = formData.get("alamat");
  const hp = formData.get("hp");
  const kota = formData.get("kota");

  if (!nik || !nama || !noidentitas) {
    return { error: "NIK, Nama, dan No Identitas wajib diisi." };
  }

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
        status: "Aktif",
        pwd: CryptoJS.MD5(nik).toString(), // Default password is NIK
        tgl_masuk: new Date(),
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
        status: status || "Aktif",
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
