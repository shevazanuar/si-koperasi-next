"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function addKategori(formData) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    const nama_kategori = formData.get("nama_kategori");
    if (!nama_kategori) throw new Error("Nama kategori harus diisi");

    await prisma.kategori_produk.create({
      data: {
        nama_kategori,
      },
    });

    revalidatePath("/dashboard/master/kategori-produk");
    redirect("/dashboard/master/kategori-produk?success=true&message=Kategori+berhasil+ditambahkan");
  } catch (err) {
    console.error("addKategori Error:", err);
    throw err;
  }
}

export async function updateKategori(id, formData) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    const nama_kategori = formData.get("nama_kategori");
    if (!nama_kategori) throw new Error("Nama kategori harus diisi");

    await prisma.kategori_produk.update({
      where: { id: Number(id) },
      data: {
        nama_kategori,
      },
    });

    revalidatePath("/dashboard/master/kategori-produk");
    redirect("/dashboard/master/kategori-produk?success=true&message=Perubahan+kategori+berhasil+disimpan");
  } catch (err) {
    console.error("updateKategori Error:", err);
    throw err;
  }
}

export async function deleteKategori(id) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    // Check if there are any products under this category
    const countBarang = await prisma.master_barang.count({
      where: { kategori_id: Number(id) }
    });

    if (countBarang > 0) {
      throw new Error("Tidak dapat menghapus kategori ini karena masih memiliki barang/produk yang terdaftar.");
    }

    const kategori = await prisma.kategori_produk.findUnique({
      where: { id: Number(id) }
    });

    if (!kategori) throw new Error("Kategori tidak ditemukan");

    await prisma.kategori_produk.delete({
      where: { id: Number(id) }
    });

    revalidatePath("/dashboard/master/kategori-produk");
    redirect("/dashboard/master/kategori-produk?success=true&message=Kategori+berhasil+dihapus");
  } catch (err) {
    console.error("deleteKategori Error:", err);
    throw err;
  }
}
