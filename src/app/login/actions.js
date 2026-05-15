"use server";

import prisma from "@/lib/prisma";
import { setSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username / NIK wajib diisi"),
  password: z.string().min(4, "Password minimal 4 karakter"),
});

export async function loginAction(prevState, formData) {
  const data = Object.fromEntries(formData.entries());
  
  // Validate using Zod
  const validation = loginSchema.safeParse(data);
  if (!validation.success) {
    const errorMsg = validation.error.issues?.[0]?.message || "Input tidak valid";
    return { error: errorMsg };
  }

  const { username, password } = validation.data;

  try {
    const { verifyLegacyOrBcrypt, shouldRehashPassword, rehashPassword } = await import("@/lib/legacy-password");

    // 1. Check Users table (Admin/Staff)
    let user = await prisma.users.findFirst({
      where: {
        username: username,
        blokir: "T",
      },
    });

    let role = "admin";
    let storedPassword = user?.password;

    // 2. If not found in users, check Anggota table
    if (!user) {
      user = await prisma.anggota.findFirst({
        where: {
          nik: username,
          status: "Aktif",
        },
      });
      role = "anggota";
      storedPassword = user?.pwd;
    }

    if (!user) {
      return { error: "Username atau password salah." };
    }

    const isValid = await verifyLegacyOrBcrypt(password, storedPassword);
    if (!isValid) {
      return { error: "Username atau password salah." };
    }

    // 3. Migrate password if it's still MD5
    const needsRehash = await shouldRehashPassword(storedPassword);
    if (needsRehash) {
      const newHash = await rehashPassword(password);
      if (role === "admin") {
        await prisma.users.update({ where: { id: user.id }, data: { password: newHash } });
      } else {
        await prisma.anggota.update({ where: { id: user.id }, data: { pwd: newHash } });
      }
    }

    // Set signed session via iron-session
    await setSession({
      id: user.id,
      username: role === "admin" ? user.username : user.nik,
      name: role === "admin" ? user.namalengkap : user.nama,
      role: role,
    });

    // Successful login
  } catch (e) {
    console.error("Login Error:", e);
    return { error: "Terjadi kesalahan pada server." };
  }

  redirect("/dashboard");
}
