"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function createAsetTetap(prevState, formData) {
  try {
    const user = await getSession();
    if (!user) return { error: "Unauthorized" };

    const nama_aset = formData.get("nama_aset");
    const kategori_id = parseInt(formData.get("kategori_id"));
    const tanggal_pembelian = formData.get("tanggal_pembelian");
    const nilai_pembelian = parseFloat(formData.get("nilai_pembelian") || "0");
    const nilai_residu = parseFloat(formData.get("nilai_residu") || "0");
    const masa_manfaat_tahun = parseInt(formData.get("masa_manfaat_tahun") || "0");
    const masa_manfaat = masa_manfaat_tahun * 12; // Konversi ke bulan
    const sumber_dana = formData.get("sumber_dana"); // "Kas" or "Bank"

    if (!nama_aset || !kategori_id || !tanggal_pembelian || nilai_pembelian <= 0 || masa_manfaat <= 0) {
      return { error: "Semua kolom wajib diisi dengan benar." };
    }

    await prisma.$transaction(async (tx) => {
      let kas_id = null;
      let akun_bank_id = null;

      // 1. Potong sumber dana
      if (sumber_dana === "Kas") {
        kas_id = parseInt(formData.get("kas_id"));
        if (!kas_id) throw new Error("Kas sumber dana belum dipilih.");
        
        const kas = await tx.kas.findUnique({ where: { id: kas_id } });
        if (!kas || kas.saldo < nilai_pembelian) throw new Error("Saldo Kas tidak mencukupi untuk pembelian aset.");

        await tx.kas.update({
          where: { id: kas_id },
          data: { saldo: { decrement: nilai_pembelian } }
        });
      } else if (sumber_dana === "Bank") {
        akun_bank_id = parseInt(formData.get("akun_bank_id"));
        if (!akun_bank_id) throw new Error("Rekening Bank sumber dana belum dipilih.");
        
        const bank = await tx.akun_bank.findUnique({ where: { id: akun_bank_id } });
        if (!bank || bank.saldo < nilai_pembelian) throw new Error("Saldo Bank tidak mencukupi untuk pembelian aset.");

        await tx.akun_bank.update({
          where: { id: akun_bank_id },
          data: { saldo: { decrement: nilai_pembelian } }
        });
      }

      // 2. Simpan Aset Tetap
      const datePembelian = new Date(tanggal_pembelian);
      const penyusutan_per_bulan = masa_manfaat > 0 ? (nilai_pembelian - nilai_residu) / masa_manfaat : 0;
      
      const newAset = await tx.aset_tetap.create({
        data: {
          nama_aset,
          kategori_id,
          tanggal_pembelian: datePembelian,
          nilai_pembelian,
          nilai_residu,
          penyusutan_per_bulan,
          masa_manfaat,
          sumber_dana,
          kas_id,
          akun_bank_id,
          created_by: user.id
        }
      });

      // 3. Audit Log
      await tx.audit_log.create({
        data: {
          user_id: user.id,
          username: user.username,
          aksi: "CREATE",
          tabel: "aset_tetap",
          record_id: newAset.id,
          after_data: JSON.stringify(newAset),
          keterangan: "Membeli aset tetap: " + nama_aset,
        }
      });
    });

  } catch (error) {
    console.error("Error creating aset:", error);
    return { error: error.message || "Gagal menyimpan data aset tetap." };
  }

  revalidatePath("/dashboard/aset-tetap");
  redirect("/dashboard/aset-tetap");
}
