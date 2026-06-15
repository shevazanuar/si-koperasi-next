"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function createKas(prevState, formData) {
  try {
    const user = await getSession();
    if (!user) return { error: "Unauthorized" };

    const nama_kas = formData.get("nama_kas");
    const saldo = parseFloat(formData.get("saldo") || "0");
    const status = formData.get("status") || "Aktif";

    if (!nama_kas) {
      return { error: "Nama kas wajib diisi." };
    }

    const newKas = await prisma.kas.create({
      data: {
        nama_kas,
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
        tabel: "kas",
        record_id: newKas.id,
        after_data: JSON.stringify(newKas),
        keterangan: "Membuat kas baru: " + nama_kas,
      }
    });

  } catch (error) {
    console.error("Error creating kas:", error);
    return { error: "Gagal menyimpan data kas." };
  }

  revalidatePath("/dashboard/kas");
  redirect("/dashboard/kas");
}

export async function updateKas(prevState, formData) {
  try {
    const user = await getSession();
    if (!user) return { error: "Unauthorized" };

    const id = parseInt(formData.get("id"));
    const nama_kas = formData.get("nama_kas");
    const saldo = parseFloat(formData.get("saldo") || "0");
    const status = formData.get("status") || "Aktif";

    if (!id || !nama_kas) {
      return { error: "Data tidak valid." };
    }

    const beforeKas = await prisma.kas.findUnique({ where: { id } });

    const updatedKas = await prisma.kas.update({
      where: { id },
      data: {
        nama_kas,
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
        tabel: "kas",
        record_id: updatedKas.id,
        before_data: JSON.stringify(beforeKas),
        after_data: JSON.stringify(updatedKas),
        keterangan: "Mengupdate kas: " + nama_kas,
      }
    });

  } catch (error) {
    console.error("Error updating kas:", error);
    return { error: "Gagal mengupdate data kas." };
  }

  revalidatePath("/dashboard/kas");
  redirect("/dashboard/kas");
}
