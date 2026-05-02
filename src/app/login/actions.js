"use server";

import prisma from "@/lib/prisma";
import CryptoJS from "crypto-js";
import { cookies } from "next/headers";
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

  // Hash password using MD5 to match database
  const hashedPassword = CryptoJS.MD5(password).toString();

  try {
    // 1. Check Users table (Admin/Staff)
    let user = await prisma.users.findFirst({
      where: {
        username: username,
        password: hashedPassword,
        blokir: "T",
      },
    });

    let role = "admin";

    // 2. If not found in users, check Anggota table
    if (!user) {
      user = await prisma.anggota.findFirst({
        where: {
          nik: username,
          pwd: hashedPassword,
          status: "Aktif",
        },
      });
      role = "anggota";
    }

    if (!user) {
      return { error: "Username atau password salah." };
    }

    // Set Session Cookie
    const sessionData = {
      id: user.id,
      username: role === "admin" ? user.username : user.nik,
      name: role === "admin" ? user.namalengkap : user.nama,
      role: role,
    };

    const cookieStore = await cookies();
    cookieStore.set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    // Successful login
  } catch (e) {
    console.error("Login Error:", e);
    return { error: "Terjadi kesalahan pada server." };
  }

  redirect("/dashboard");
}
