"use server";

import prisma from "@/lib/prisma";
import CryptoJS from "crypto-js";
import { getSession } from "@/lib/session";
import { z } from "zod";

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Password lama wajib diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
  confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

export async function changePassword(prevState, formData) {
  const user = await getSession();
  if (!user) return { error: "Anda harus login terlebih dahulu" };

  const rawData = Object.fromEntries(formData.entries());
  
  // 1. Validate using Zod
  const validation = passwordSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMsg = validation.error.issues?.[0]?.message || "Input tidak valid";
    return { error: errorMsg };
  }

  const { oldPassword, newPassword } = validation.data;
  const hashedOld = CryptoJS.MD5(oldPassword).toString();
  const hashedNew = CryptoJS.MD5(newPassword).toString();

  try {
    if (user.role === "admin") {
      // Check old password in users table
      const dbUser = await prisma.users.findUnique({
        where: { id: user.id }
      });

      if (!dbUser || dbUser.password !== hashedOld) {
        return { error: "Password lama salah" };
      }

      // Update password
      await prisma.users.update({
        where: { id: user.id },
        data: { password: hashedNew }
      });
    } else {
      // Check old password in anggota table
      const dbAnggota = await prisma.anggota.findUnique({
        where: { id: user.id }
      });

      if (!dbAnggota || dbAnggota.pwd !== hashedOld) {
        return { error: "Password lama salah" };
      }

      // Update password
      await prisma.anggota.update({
        where: { id: user.id },
        data: { pwd: hashedNew }
      });
    }

    return { success: "Password berhasil diperbarui" };
  } catch (error) {
    console.error("Change Password Error:", error);
    return { error: "Gagal memperbarui password" };
  }
}
