"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function createBank(prevState, formData) {
  try {
    const user = await getSession();
    if (!user) return { error: "Unauthorized" };

    const nama_bank = formData.get("nama_bank");
    const nomor_rekening = formData.get("nomor_rekening");
    const nama_pemilik = formData.get("nama_pemilik");
    const saldo = parseFloat(formData.get("saldo") || "0");
    const status = formData.get("status") || "Aktif";

    if (!nama_bank || !nomor_rekening || !nama_pemilik) {
      return { error: "Semua kolom bank wajib diisi." };
    }

    const newBank = await prisma.akun_bank.create({
      data: {
        nama_bank,
        nomor_rekening,
        nama_pemilik,
        saldo,
        status,
        created_by: user.id,
      },
    });

    await prisma.audit_log.create({
      data: {
        user_id: user.id,
        username: user.username,
        aksi: "CREATE",
        tabel: "akun_bank",
        record_id: newBank.id,
        after_data: JSON.stringify(newBank),
        keterangan: "Membuat rekening bank baru: " + nama_bank + " (" + nomor_rekening + ")",
      }
    });

  } catch (error) {
    console.error("Error creating bank:", error);
    return { error: "Gagal menyimpan data rekening bank." };
  }

  revalidatePath("/dashboard/akun-bank");
  redirect("/dashboard/akun-bank");
}

export async function updateBank(prevState, formData) {
  try {
    const user = await getSession();
    if (!user) return { error: "Unauthorized" };

    const id = parseInt(formData.get("id"));
    const nama_bank = formData.get("nama_bank");
    const nomor_rekening = formData.get("nomor_rekening");
    const nama_pemilik = formData.get("nama_pemilik");
    const saldo = parseFloat(formData.get("saldo") || "0");
    const status = formData.get("status") || "Aktif";

    if (!id || !nama_bank || !nomor_rekening || !nama_pemilik) {
      return { error: "Data tidak valid atau kolom wajib ada yang kosong." };
    }

    const beforeBank = await prisma.akun_bank.findUnique({ where: { id } });

    const updatedBank = await prisma.akun_bank.update({
      where: { id },
      data: {
        nama_bank,
        nomor_rekening,
        nama_pemilik,
        saldo,
        status,
        updated_by: user.id,
      },
    });

    await prisma.audit_log.create({
      data: {
        user_id: user.id,
        username: user.username,
        aksi: "UPDATE",
        tabel: "akun_bank",
        record_id: updatedBank.id,
        before_data: JSON.stringify(beforeBank),
        after_data: JSON.stringify(updatedBank),
        keterangan: "Mengupdate rekening bank: " + nama_bank,
      }
    });

  } catch (error) {
    console.error("Error updating bank:", error);
    return { error: "Gagal mengupdate data rekening bank." };
  }

  revalidatePath("/dashboard/akun-bank");
  redirect("/dashboard/akun-bank");
}
