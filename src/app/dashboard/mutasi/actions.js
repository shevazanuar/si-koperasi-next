"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function createMutasi(prevState, formData) {
  try {
    const user = await getSession();
    if (!user) return { error: "Unauthorized" };

    const jenis_mutasi = formData.get("jenis_mutasi"); // "Kas_ke_Bank" or "Bank_ke_Kas"
    const nominal = parseFloat(formData.get("nominal") || "0");
    const keterangan = formData.get("keterangan") || "";
    // In a real app we'd process the file. For now we assume a string URL or filename is passed after upload.
    // However, since we just have a standard form, we will mock the upload path or expect a base64/URL.
    // For this implementation, we will just store a placeholder or a text input if file upload isn't fully set up in the boilerplate.
    const bukti_transfer = formData.get("bukti_transfer") || "bukti-transfer.png"; 

    if (nominal <= 0) {
      return { error: "Nominal harus lebih dari 0." };
    }

    if (!bukti_transfer) {
      return { error: "Bukti transfer wajib diunggah." };
    }

    // Process Transaction
    await prisma.$transaction(async (tx) => {
      if (jenis_mutasi === "Kas_ke_Bank") {
        const dari_kas_id = parseInt(formData.get("dari_kas_id"));
        const ke_akun_bank_id = parseInt(formData.get("ke_akun_bank_id"));

        if (!dari_kas_id || !ke_akun_bank_id) throw new Error("Pilih Kas dan Bank.");

        const kas = await tx.kas.findUnique({ where: { id: dari_kas_id } });
        if (!kas || kas.saldo < nominal) throw new Error("Saldo Kas tidak mencukupi.");

        // Kurangi Kas
        await tx.kas.update({
          where: { id: dari_kas_id },
          data: { saldo: { decrement: nominal } }
        });

        // Tambah Bank
        await tx.akun_bank.update({
          where: { id: ke_akun_bank_id },
          data: { saldo: { increment: nominal } }
        });

        const mutasi = await tx.mutasi_kas_bank.create({
          data: {
            tanggal: new Date(),
            jenis_mutasi: "Kas_ke_Bank",
            dari_kas_id,
            ke_akun_bank_id,
            nominal,
            bukti_transfer,
            keterangan,
            created_by: user.id
          }
        });

        await tx.audit_log.create({
          data: {
            user_id: user.id,
            username: user.username,
            aksi: "CREATE",
            tabel: "mutasi_kas_bank",
            record_id: mutasi.id,
            after_data: JSON.stringify(mutasi),
            keterangan: "Transfer Kas ke Bank sejumlah " + nominal,
          }
        });

      } else if (jenis_mutasi === "Bank_ke_Kas") {
        const dari_akun_bank_id = parseInt(formData.get("dari_akun_bank_id"));
        const ke_kas_id = parseInt(formData.get("ke_kas_id"));

        if (!dari_akun_bank_id || !ke_kas_id) throw new Error("Pilih Bank dan Kas.");

        const bank = await tx.akun_bank.findUnique({ where: { id: dari_akun_bank_id } });
        if (!bank || bank.saldo < nominal) throw new Error("Saldo Bank tidak mencukupi.");

        // Kurangi Bank
        await tx.akun_bank.update({
          where: { id: dari_akun_bank_id },
          data: { saldo: { decrement: nominal } }
        });

        // Tambah Kas
        await tx.kas.update({
          where: { id: ke_kas_id },
          data: { saldo: { increment: nominal } }
        });

        const mutasi = await tx.mutasi_kas_bank.create({
          data: {
            tanggal: new Date(),
            jenis_mutasi: "Bank_ke_Kas",
            dari_akun_bank_id,
            ke_kas_id,
            nominal,
            bukti_transfer,
            keterangan,
            created_by: user.id
          }
        });

        await tx.audit_log.create({
          data: {
            user_id: user.id,
            username: user.username,
            aksi: "CREATE",
            tabel: "mutasi_kas_bank",
            record_id: mutasi.id,
            after_data: JSON.stringify(mutasi),
            keterangan: "Transfer Bank ke Kas sejumlah " + nominal,
          }
        });
      } else {
        throw new Error("Jenis mutasi tidak valid.");
      }
    });

  } catch (error) {
    console.error("Error creating mutasi:", error);
    return { error: error.message || "Gagal menyimpan mutasi." };
  }

  revalidatePath("/dashboard/mutasi");
  redirect("/dashboard/mutasi");
}
