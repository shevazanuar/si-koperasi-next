"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { writeAuditLog, AUDIT_AKSI } from "@/lib/audit-log";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function addBarang(formData) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const raw_kode_barang = formData.get("kode_barang");
    const nama_barang = formData.get("nama_barang");
    const kategori_id = Number(formData.get("kategori_id"));
    const harga_modal = Number(formData.get("harga_modal"));
    const harga_jual = Number(formData.get("harga_jual"));
    const stok = Number(formData.get("stok")) || 0;
    const satuan = formData.get("satuan");
    const deskripsi = formData.get("deskripsi") || null;
    const is_featured = formData.get("is_featured") === "true";
    const gambarFile = formData.get("gambar");

    if (!nama_barang || !kategori_id || !harga_modal || !harga_jual) {
      throw new Error("Data tidak lengkap");
    }

    let kode_barang = raw_kode_barang ? raw_kode_barang.trim() : "";
    if (!kode_barang) {
      let isUnique = false;
      let count = await prisma.master_barang.count();
      while (!isUnique) {
        count++;
        const candidate = `BRG-${String(count).padStart(4, "0")}`;
        const check = await prisma.master_barang.findUnique({
          where: { kode_barang: candidate },
        });
        if (!check) {
          kode_barang = candidate;
          isUnique = true;
        }
      }
    }

    let gambarPath = null;
    if (gambarFile && gambarFile.size > 0) {
      const bytes = await gambarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Validasi tipe file
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(gambarFile.type)) {
        throw new Error("Tipe file gambar tidak diizinkan. Hanya JPG, PNG, WEBP.");
      }

      // Validasi ukuran file (maksimal 2MB)
      if (gambarFile.size > 2 * 1024 * 1024) {
        throw new Error("Ukuran gambar terlalu besar. Maksimal ukuran gambar yang diizinkan adalah 2 MB.");
      }

      // Buat direktori jika belum ada
      const uploadDir = path.join(process.cwd(), "public/uploads/barang");
      await mkdir(uploadDir, { recursive: true });

      // Generate nama file random
      const ext = path.extname(gambarFile.name);
      const fileName = `barang-${Date.now()}-${crypto.randomBytes(3).toString("hex")}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      gambarPath = `/uploads/barang/${fileName}`;
    }

    const existing = await prisma.master_barang.findUnique({
      where: { kode_barang },
    });

    if (existing) {
      throw new Error("Kode barang sudah terdaftar");
    }

    const barang = await prisma.master_barang.create({
      data: {
        kode_barang,
        nama_barang,
        kategori_id,
        stok,
        harga_modal,
        harga_jual,
        satuan,
        deskripsi,
        gambar: gambarPath,
        is_featured,
        status: "Aktif",
      },
    });

    await writeAuditLog({
      userId: user.id,
      username: user.username,
      aksi: AUDIT_AKSI.TAMBAH_BARANG,
      tabel: "master_barang",
      recordId: barang.id,
      afterData: barang,
    });

    revalidatePath("/dashboard/master/barang");
    redirect("/dashboard/master/barang?success=true&message=Barang+berhasil+ditambahkan");
  } catch (err) {
    console.error("addBarang Error:", err);
    throw err;
  }
}

export async function updateBarang(id, formData) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    const nama_barang = formData.get("nama_barang");
    const kategori_id = Number(formData.get("kategori_id"));
    const harga_modal = Number(formData.get("harga_modal"));
    const harga_jual = Number(formData.get("harga_jual"));
    const stok = Number(formData.get("stok")) || 0;
    const satuan = formData.get("satuan");
    const status = formData.get("status");
    const deskripsi = formData.get("deskripsi") || null;
    const is_featured = formData.get("is_featured") === "true";
    const gambarFile = formData.get("gambar");

    if (!nama_barang || !kategori_id || !harga_modal || !harga_jual) {
      throw new Error("Data tidak lengkap");
    }

    const barangLama = await prisma.master_barang.findUnique({
      where: { id: Number(id) },
    });

    if (!barangLama) throw new Error("Barang tidak ditemukan");

    let gambarPath = barangLama.gambar;
    if (gambarFile && gambarFile.size > 0) {
      const bytes = await gambarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(gambarFile.type)) {
        throw new Error("Tipe file gambar tidak diizinkan. Hanya JPG, PNG, WEBP.");
      }

      // Validasi ukuran file (maksimal 2MB)
      if (gambarFile.size > 2 * 1024 * 1024) {
        throw new Error("Ukuran gambar terlalu besar. Maksimal ukuran gambar yang diizinkan adalah 2 MB.");
      }

      const uploadDir = path.join(process.cwd(), "public/uploads/barang");
      await mkdir(uploadDir, { recursive: true });

      const ext = path.extname(gambarFile.name);
      const fileName = `barang-${Date.now()}-${crypto.randomBytes(3).toString("hex")}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      gambarPath = `/uploads/barang/${fileName}`;
    }

    const barangBaru = await prisma.master_barang.update({
      where: { id: Number(id) },
      data: {
        nama_barang,
        kategori_id,
        stok,
        harga_modal,
        harga_jual,
        satuan,
        deskripsi,
        gambar: gambarPath,
        is_featured,
        status,
      },
    });

    await writeAuditLog({
      userId: user.id,
      username: user.username,
      aksi: AUDIT_AKSI.EDIT_BARANG,
      tabel: "master_barang",
      recordId: barangBaru.id,
      beforeData: barangLama,
      afterData: barangBaru,
    });

    if (barangLama.stok !== stok) {
      await writeAuditLog({
        userId: user.id,
        username: user.username,
        aksi: AUDIT_AKSI.UPDATE_STOK_BARANG,
        tabel: "master_barang",
        recordId: barangBaru.id,
        keterangan: `Stok diubah dari ${barangLama.stok} ke ${stok}`,
      });
    }

    revalidatePath("/dashboard/master/barang");
    redirect("/dashboard/master/barang?success=true&message=Perubahan+barang+berhasil+disimpan");
  } catch (err) {
    console.error("updateBarang Error:", err);
    throw err;
  }
}

export async function deleteBarang(id) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    // Check if the product has already been used in sales transaction details
    const countDetail = await prisma.detail_penjualan.count({
      where: { barang_id: Number(id) }
    });

    if (countDetail > 0) {
      throw new Error("Tidak dapat menghapus produk ini karena sudah digunakan dalam transaksi penjualan.");
    }

    const barang = await prisma.master_barang.findUnique({
      where: { id: Number(id) }
    });

    if (!barang) throw new Error("Barang tidak ditemukan");

    await prisma.master_barang.delete({
      where: { id: Number(id) }
    });

    await writeAuditLog({
      userId: user.id,
      username: user.username,
      aksi: AUDIT_AKSI.HAPUS_BARANG,
      tabel: "master_barang",
      recordId: Number(id),
      beforeData: barang,
    });

    revalidatePath("/dashboard/master/barang");
    redirect("/dashboard/master/barang?success=true&message=Barang+berhasil+dihapus");
  } catch (err) {
    console.error("deleteBarang Error:", err);
    throw err;
  }
}
