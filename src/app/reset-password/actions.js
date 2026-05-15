"use server";

import prisma from "@/lib/prisma";
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
    // Find user by token using safe Prisma ORM
    const anggota = await prisma.anggota.findFirst({
      where: { reset_token: token },
      select: { id: true, reset_token_expiration: true },
    });

    if (!anggota) {
      return { error: "Link reset password tidak valid atau sudah kadaluarsa." };
    }

    // Check expiration
    if (new Date() > new Date(anggota.reset_token_expiration)) {
      return { error: "Link reset password sudah kadaluarsa. Silakan request link baru." };
    }

    // Hash new password
    const { hashPassword } = await import("@/lib/password");
    const hashedNew = await hashPassword(newPassword);

    // Update password and clear token using safe Prisma ORM
    await prisma.anggota.update({
      where: { id: anggota.id },
      data: {
        pwd: hashedNew,
        reset_token: null,
        reset_token_expiration: null,
      },
    });

    return { success: "Password berhasil direset. Silakan login dengan password baru Anda." };

  } catch (error) {
    console.error("Reset Password Error:", error);
    return { error: "Terjadi kesalahan saat mereset password." };
  }
}
