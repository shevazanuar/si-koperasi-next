"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { writeAuditLog, AUDIT_AKSI } from "@/lib/audit-log";

export async function deletePenjualan(id) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    await prisma.$transaction(async (tx) => {
      // Find the penjualan and detail_penjualan
      const penjualan = await tx.penjualan.findUnique({
        where: { id: Number(id) },
        include: { detail: true }
      });

      if (!penjualan) {
        throw new Error("Transaksi tidak ditemukan");
      }

      // Restore stok for each item
      for (const item of penjualan.detail) {
        await tx.master_barang.update({
          where: { id: item.barang_id },
          data: {
            stok: {
              increment: item.qty
            }
          }
        });
      }

      // Delete detail records
      await tx.detail_penjualan.deleteMany({
        where: { penjualan_id: Number(id) }
      });

      // Delete penjualan record
      await tx.penjualan.delete({
        where: { id: Number(id) }
      });

      // Write audit log
      await writeAuditLog({
        userId: user.id,
        username: user.username,
        aksi: AUDIT_AKSI.BATAL_PENJUALAN,
        tabel: "penjualan",
        recordId: Number(id),
        beforeData: penjualan,
      });
    });

    revalidatePath("/dashboard/penjualan");
    redirect("/dashboard/penjualan?success=true&message=Transaksi+penjualan+berhasil+dihapus");
  } catch (err) {
    console.error("deletePenjualan Error:", err);
    throw err;
  }
}
