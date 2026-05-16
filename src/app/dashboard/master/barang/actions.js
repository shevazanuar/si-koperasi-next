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
  const user = await getSession();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");

  const kode_barang = formData.get("kode_barang");
  const nama_barang = formData.get("nama_barang");
  const kategori_id = Number(formData.get("kategori_id"));
  const harga_modal = Number(formData.get("harga_modal"));
  const harga_jual = Number(formData.get("harga_jual"));
  const stok = Number(formData.get("stok")) || 0;
  const satuan = formData.get("satuan");
  const deskripsi = formData.get("deskripsi") || null;
  const is_featured = formData.get("is_featured") === "true";
  const gambarFile = formData.get("gambar");

  if (!kode_barang || !nama_barang || !kategori_id || !harga_modal || !harga_jual) {
    throw new Error("Data tidak lengkap");
  }

  let gambarPath = null;
  if (gambarFile && gambarFile.size > 0) {
    const bytes = await gambarFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(gambarFile.type)) {
      throw new Error("Tipe file gambar tidak diizinkan. Hanya JPG, PNG, WEBP.");
    }
    
    // Buat direktori jika belum ada
    const uploadDir = path.join(process.cwd(), "public/uploads/barang");
    await mkdir(uploadDir, { recursive: true });
    
    // Generate nama file random
    const ext = path.extname(gambarFile.name);
    const fileName = `barang-${Date.now()}-${crypto.randomBytes(3).toString('hex')}${ext}`;
    const filePath = path.join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    gambarPath = `/uploads/barang/${fileName}`;
  }

  const existing = await prisma.master_barang.findUnique({
    where: { kode_barang }
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
      status: "Aktif"
    }
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
  redirect("/dashboard/master/barang");
}

export async function updateBarang(id, formData) {
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
    where: { id: Number(id) }
  });

  if (!barangLama) throw new Error("Barang tidak ditemukan");

  let gambarPath = barangLama.gambar;
  if (gambarFile && gambarFile.size > 0) {
    const bytes = await gambarFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(gambarFile.type)) {
      throw new Error("Tipe file gambar tidak diizinkan. Hanya JPG, PNG, WEBP.");
    }
    
    const uploadDir = path.join(process.cwd(), "public/uploads/barang");
    await mkdir(uploadDir, { recursive: true });
    
    const ext = path.extname(gambarFile.name);
    const fileName = `barang-${Date.now()}-${crypto.randomBytes(3).toString('hex')}${ext}`;
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
      status
    }
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
      keterangan: `Stok diubah dari ${barangLama.stok} ke ${stok}`
    });
  }

  revalidatePath("/dashboard/master/barang");
  redirect("/dashboard/master/barang");
}
