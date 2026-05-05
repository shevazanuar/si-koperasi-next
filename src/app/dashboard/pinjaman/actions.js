"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function generatePengajuanNomor() {
  const now = new Date();
  const year = now.getFullYear();
  const prefix = `PP${year}`; // PP for Pengajuan Pinjaman

  const lastEntry = await prisma.pengajuan_pinjaman.findFirst({
    where: { nomor: { startsWith: prefix } },
    orderBy: { nomor: "desc" },
  });

  let counter = 1;
  if (lastEntry && lastEntry.nomor) {
    const lastNum = parseInt(lastEntry.nomor.substring(6));
    counter = lastNum + 1;
  }

  return `${prefix}${counter.toString().padStart(6, "0")}`;
}

export async function createPinjaman(prevState, formData) {
  const anggota_id = formData.get("anggota_id");
  const jenis_pinjaman_id = formData.get("jenis_pinjaman_id");
  const jumlah = formData.get("jumlah");
  const lama = formData.get("lama");
  const bunga = formData.get("bunga");
  const tgl = formData.get("tgl") || new Date().toISOString().split("T")[0];
  const keperluan = formData.get("keperluan") || "";

  if (!anggota_id || !jenis_pinjaman_id || !jumlah || !lama) {
    return { error: "Semua kolom wajib diisi." };
  }

  try {
    const nomor = await generatePengajuanNomor();
    const user = await prisma.users.findFirst({ where: { username: "admin" } });

    await prisma.pengajuan_pinjaman.create({
      data: {
        nomor,
        tanggal: new Date(tgl),
        anggota_id: parseInt(anggota_id),
        jenis_pinjaman_id: parseInt(jenis_pinjaman_id),
        lama: parseInt(lama),
        jumlah: parseFloat(jumlah),
        bunga: parseFloat(bunga || 0),
        status: "Open",
        keperluan: keperluan,
        user_id: user?.id || 1,
        insert_date: new Date(),
        satuan: "Bulan",
      },
    });
  } catch (e) {
    console.error("Create Pengajuan Error:", e);
    return { error: "Gagal mengirim pengajuan pinjaman." };
  }

  revalidatePath("/dashboard/transaksi/pengajuan-pinjaman");
  revalidatePath("/dashboard/pinjaman");
  redirect("/dashboard/transaksi/pengajuan-pinjaman");
}
