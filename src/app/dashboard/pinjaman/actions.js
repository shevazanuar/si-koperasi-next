"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function generatePinjamanNomor() {
  const now = new Date();
  const year = now.getFullYear();
  const prefix = `P${year}`;

  const lastTransaction = await prisma.pinjaman_header.findFirst({
    where: {
      nomor: {
        startsWith: prefix,
      },
    },
    orderBy: {
      nomor: "desc",
    },
  });

  let counter = 1;
  if (lastTransaction && lastTransaction.nomor) {
    const lastNum = parseInt(lastTransaction.nomor.substring(5));
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

  if (!anggota_id || !jenis_pinjaman_id || !jumlah || !lama) {
    return { error: "Semua kolom wajib diisi." };
  }

  try {
    const nomor = await generatePinjamanNomor();
    const user = await prisma.users.findFirst({ where: { username: "admin" } });

    await prisma.pinjaman_header.create({
      data: {
        nomor,
        tgl: new Date(tgl),
        anggota_id: parseInt(anggota_id),
        jenis_pinjaman_id: parseInt(jenis_pinjaman_id),
        lama: parseInt(lama),
        jumlah: parseInt(jumlah),
        bunga: parseFloat(bunga || 0),
        user_id: user?.id || 1,
        insert_date: new Date(),
        satuan: "Bulan",
      },
    });
  } catch (e) {
    console.error("Create Pinjaman Error:", e);
    return { error: "Gagal menyimpan transaksi pinjaman." };
  }

  revalidatePath("/dashboard/pinjaman");
  revalidatePath("/dashboard");
  redirect("/dashboard/pinjaman");
}
