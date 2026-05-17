"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function addKategori(formData) {
  const user = await getSession();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");

  const nama_kategori = formData.get("nama_kategori");
  if (!nama_kategori) throw new Error("Nama kategori harus diisi");

  await prisma.kategori_produk.create({
    data: {
      nama_kategori
    }
  });

  revalidatePath("/dashboard/master/kategori-produk");
  redirect("/dashboard/master/kategori-produk");
}

export async function updateKategori(id, formData) {
  const user = await getSession();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");

  const nama_kategori = formData.get("nama_kategori");
  if (!nama_kategori) throw new Error("Nama kategori harus diisi");

  await prisma.kategori_produk.update({
    where: { id: Number(id) },
    data: {
      nama_kategori
    }
  });

  revalidatePath("/dashboard/master/kategori-produk");
  redirect("/dashboard/master/kategori-produk");
}
