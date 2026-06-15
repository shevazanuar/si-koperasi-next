"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function createAsetLancar(prevState, formData) {
  try {
    const user = await getSession();
    if (!user) return { error: "Unauthorized" };

    const jenis_aset = formData.get("jenis_aset");
    const keterangan = formData.get("keterangan") || "";
    const nominal = parseFloat(formData.get("nominal") || "0");

    if (!jenis_aset || nominal <= 0) {
      return { error: "Jenis aset dan nominal wajib diisi." };
    }

    const newAset = await prisma.aset_lancar.create({
      data: {
        jenis_aset,
        keterangan,
        nominal,
        created_by: user.id
      }
    });

    await prisma.audit_log.create({
      data: {
        user_id: user.id,
        username: user.username,
        aksi: "CREATE",
        tabel: "aset_lancar",
        record_id: newAset.id,
        after_data: JSON.stringify(newAset),
        keterangan: "Mencatat aset lancar baru (" + jenis_aset + "): " + nominal,
      }
    });

  } catch (error) {
    console.error("Error creating aset lancar:", error);
    return { error: "Gagal menyimpan data aset lancar." };
  }

  revalidatePath("/dashboard/aset-lancar");
  redirect("/dashboard/aset-lancar");
}
