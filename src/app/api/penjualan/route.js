import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { writeAuditLog, AUDIT_AKSI } from "@/lib/audit-log";
import { z } from "zod";

const penjualanSchema = z.object({
  anggota_id: z.coerce.number().int().positive().optional().nullable(),
  nama_pembeli: z.string().optional().nullable(),
  metode_pembayaran: z.enum(["Tunai", "Transfer", "QRIS", "Potong Gaji"]),
  items: z.array(
    z.object({
      barang_id: z.coerce.number().int().positive(),
      qty: z.coerce.number().int().positive(),
    })
  ).min(1),
});

export async function POST(req) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate input
    const parsed = penjualanSchema.parse(body);
    const { anggota_id, nama_pembeli, metode_pembayaran, items } = parsed;

    // Generate unique code
    const kode_penjualan = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const result = await prisma.$transaction(async (tx) => {
      const barangIds = items.map((item) => item.barang_id);

      const barangList = await tx.master_barang.findMany({
        where: {
          id: { in: barangIds },
          status: "Aktif",
        },
      });

      const barangMap = new Map(barangList.map((barang) => [barang.id, barang]));

      let totalHarga = 0;
      let totalModal = 0;
      let totalLaba = 0;

      const detailData = [];

      for (const item of items) {
        const barang = barangMap.get(item.barang_id);

        if (!barang) {
          throw new Error(`Barang dengan ID ${item.barang_id} tidak ditemukan`);
        }

        if (barang.stok < item.qty) {
          throw new Error(`Stok ${barang.nama_barang} tidak cukup (Sisa: ${barang.stok})`);
        }

        const hargaJual = Number(barang.harga_jual);
        const hargaModal = Number(barang.harga_modal);

        const subtotalHarga = hargaJual * item.qty;
        const subtotalModal = hargaModal * item.qty;
        const subtotalLaba = subtotalHarga - subtotalModal;

        totalHarga += subtotalHarga;
        totalModal += subtotalModal;
        totalLaba += subtotalLaba;

        detailData.push({
          barang_id: item.barang_id,
          qty: item.qty,
          harga_jual: hargaJual,
          harga_modal: hargaModal,
          subtotal_harga: subtotalHarga,
          subtotal_modal: subtotalModal,
          subtotal_laba: subtotalLaba,
        });
      }

      const penjualan = await tx.penjualan.create({
        data: {
          kode_penjualan,
          anggota_id: anggota_id || null,
          nama_pembeli: anggota_id ? null : nama_pembeli,
          user_id: user.id,
          metode_pembayaran,
          total_harga: totalHarga,
          total_modal: totalModal,
          total_laba: totalLaba,
        },
      });

      await tx.detail_penjualan.createMany({
        data: detailData.map((detail) => ({
          ...detail,
          penjualan_id: penjualan.id,
        })),
      });

      // Update stoks
      for (const item of items) {
        await tx.master_barang.update({
          where: { id: item.barang_id },
          data: {
            stok: {
              decrement: item.qty,
            },
          },
        });
      }

      // Record audit log
      await writeAuditLog({
        userId: user.id,
        username: user.username,
        aksi: AUDIT_AKSI.TAMBAH_PENJUALAN,
        tabel: "penjualan",
        recordId: penjualan.id,
        afterData: {
          penjualan,
          detail: detailData,
        },
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      });

      return penjualan;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[POST Penjualan] Error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Data tidak valid", details: error.errors }, { status: 400 });
    }
    
    return NextResponse.json({ error: error.message || "Terjadi kesalahan internal" }, { status: 500 });
  }
}
