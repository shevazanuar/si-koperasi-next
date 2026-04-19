"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function generateSimpananNomor() {
  const now = new Date();
  const year = now.getFullYear();
  const prefix = `S${year}`;

  // Find the latest transaction for this year
  const lastTransaction = await prisma.simpanan.findFirst({
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

  // Format: S2022000001 (S + YYYY + 6 digit counter)
  return `${prefix}${counter.toString().padStart(6, "0")}`;
}

export async function createSimpanan(prevState, formData) {
  const anggota_id = formData.get("anggota_id");
  const jenis_simpanan_id = formData.get("jenis_simpanan_id");
  const jumlah = formData.get("jumlah");
  const tgl = formData.get("tgl") || new Date().toISOString().split("T")[0];

  if (!anggota_id || !jenis_simpanan_id || !jumlah) {
    return { error: "Semua kolom wajib diisi." };
  }

  try {
    const nomor = await generateSimpananNomor();
    const user = await prisma.users.findFirst({ where: { username: "admin" } }); // Mock user ID for now

    await prisma.simpanan.create({
      data: {
        nomor,
        tgl: new Date(tgl),
        tgl_akhir: new Date(tgl), // Mock or handle accordingly
        anggota_id: parseInt(anggota_id),
        jenis_simpanan_id: parseInt(jenis_simpanan_id),
        jumlah: parseInt(jumlah),
        user_id: user?.id || 1,
        insert_date: new Date(),
        entry: "I",
        jenis: "S",
      },
    });
  } catch (e) {
    console.error("Create Simpanan Error:", e);
    return { error: "Gagal menyimpan transaksi simpanan." };
  }

  revalidatePath("/dashboard/simpanan");
  revalidatePath("/dashboard");
  redirect("/dashboard/simpanan");
}
