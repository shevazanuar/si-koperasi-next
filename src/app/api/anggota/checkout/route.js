import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(request) {
  try {
    const user = await getSession();
    if (!user || user.role !== "anggota") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { items, metode_pembayaran } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
    }

    // Atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      let total_harga = 0;
      let total_modal = 0;
      let detail_data = [];

      for (const item of items) {
        const barang = await tx.master_barang.findUnique({
          where: { id: item.id }
        });

        if (!barang) {
          throw new Error(`Barang dengan ID ${item.id} tidak ditemukan`);
        }
        if (barang.stok < item.qty) {
          throw new Error(`Stok ${barang.nama_barang} tidak mencukupi. Sisa: ${barang.stok}`);
        }

        const subtotal_harga = Number(barang.harga_jual) * item.qty;
        const subtotal_modal = Number(barang.harga_modal) * item.qty;
        const subtotal_laba = subtotal_harga - subtotal_modal;

        total_harga += subtotal_harga;
        total_modal += subtotal_modal;

        detail_data.push({
          barang_id: barang.id,
          qty: item.qty,
          harga_jual: barang.harga_jual,
          harga_modal: barang.harga_modal,
          subtotal_harga,
          subtotal_modal,
          subtotal_laba
        });

        // Kurangi stok
        await tx.master_barang.update({
          where: { id: barang.id },
          data: { stok: barang.stok - item.qty }
        });
      }

      const total_laba = total_harga - total_modal;
      let status_penjualan = "Menunggu Pembayaran";

      if (metode_pembayaran === "Potong Saldo Simpanan") {
        // Cek saldo simpanan anggota
        const simpanan = await tx.simpanan.aggregate({
          where: { anggota_id: user.id },
          _sum: { jumlah: true }
        });
        const penarikan = await tx.penarikan.aggregate({
          where: { anggota_id: user.id },
          _sum: { jumlah: true }
        });

        const totalSimpanan = Number(simpanan._sum.jumlah || 0);
        const totalPenarikan = Number(penarikan._sum.jumlah || 0);
        const saldo = totalSimpanan - totalPenarikan;

        if (saldo < total_harga) {
          throw new Error(`Saldo simpanan tidak mencukupi. Saldo Anda: Rp ${saldo.toLocaleString('id-ID')}`);
        }

        status_penjualan = "Selesai";
      }

      // Generate nomor penjualan
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
      const prefix = `PJL-${dateStr}-`;
      const lastPJL = await tx.penjualan.findFirst({
        where: { kode_penjualan: { startsWith: prefix } },
        orderBy: { kode_penjualan: "desc" }
      });
      const counter = lastPJL ? parseInt(lastPJL.kode_penjualan.slice(-4)) + 1 : 1;
      const kode_penjualan = `${prefix}${counter.toString().padStart(4, "0")}`;

      // Insert Penjualan
      const penjualan = await tx.penjualan.create({
        data: {
          kode_penjualan,
          anggota_id: user.id,
          nama_pembeli: user.nama || user.username,
          user_id: user.id, // User who processes this. For now, it's the member themselves
          total_harga,
          total_modal,
          total_laba,
          metode_pembayaran: metode_pembayaran || "Tunai",
          status: status_penjualan,
          detail: {
            create: detail_data
          }
        }
      });

      // Catat penarikan jika potong saldo
      if (metode_pembayaran === "Potong Saldo Simpanan") {
        // Generate nomor penarikan
        const tglStr = today.toISOString().split("T")[0].replace(/-/g, "");
        const prefixTarik = `TRK-${tglStr}-`;
        const lastTarik = await tx.penarikan.findFirst({
          where: { nomor: { startsWith: prefixTarik } },
          orderBy: { nomor: "desc" }
        });
        const countTarik = lastTarik ? parseInt(lastTarik.nomor.slice(-4)) + 1 : 1;
        const nomor_penarikan = `${prefixTarik}${countTarik.toString().padStart(4, "0")}`;

        await tx.penarikan.create({
          data: {
            nomor: nomor_penarikan,
            tgl: today,
            anggota_id: user.id,
            jumlah: total_harga,
            user_id: user.id, // system / self
            insert_date: today
          }
        });

        // Audit Log for Penarikan
        await tx.$executeRaw`
          INSERT INTO audit_log (user_id, username, aksi, tabel, record_id, before_data, after_data, ip_address, keterangan)
          VALUES (${user.id}, ${user.username}, 'tambah', 'penarikan', 0,
                  '{}', '{}', '127.0.0.1', ${`Potong saldo simpanan untuk pembelian ${kode_penjualan}`})
        `;
      }

      return penjualan;
    });

    return NextResponse.json({ message: "Pesanan berhasil dibuat", data: result });

  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Gagal memproses pesanan" }, { status: 500 });
  }
}
