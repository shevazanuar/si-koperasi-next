"use server";

import prisma from "@/lib/prisma";
import CryptoJS from "crypto-js";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token tidak valid"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
  confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

export async function resetPasswordAction(prevState, formData) {
  const data = Object.fromEntries(formData.entries());
  
  // Validate using Zod
  const validation = resetPasswordSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.issues?.[0]?.message || "Input tidak valid" };
  }

  const { token, newPassword } = validation.data;

  try {
    // Find user by token using raw query
    const dbAnggota = await prisma.$queryRawUnsafe(
      "SELECT id, reset_token_expiration FROM anggota WHERE reset_token = ? LIMIT 1",
      token
    );

    if (!dbAnggota || dbAnggota.length === 0) {
      return { error: "Link reset password tidak valid atau sudah kadaluarsa." };
    }

    const anggota = dbAnggota[0];

    // Check expiration
    if (new Date() > new Date(anggota.reset_token_expiration)) {
      return { error: "Link reset password sudah kadaluarsa. Silakan request link baru." };
    }

    // Hash new password
    const hashedNew = CryptoJS.MD5(newPassword).toString();

    // Update password and clear token
    await prisma.$executeRawUnsafe(
      "UPDATE anggota SET pwd = ?, reset_token = NULL, reset_token_expiration = NULL WHERE id = ?",
      hashedNew,
      anggota.id
    );

    return { success: "Password berhasil direset. Silakan login dengan password baru Anda." };

  } catch (error) {
    console.error("Reset Password Error:", error);
    return { error: "Terjadi kesalahan saat mereset password." };
  }
}
