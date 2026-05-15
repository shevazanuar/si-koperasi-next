"use server";

import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
import { z } from "zod";
import crypto from "crypto";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export async function forgotPasswordAction(prevState, formData) {
  // Rate limiting
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`forgot:${ip}`);
  if (!rl.success) {
    const menit = Math.ceil(rl.retryAfterMs / 60000);
    return { error: `Terlalu banyak permintaan. Coba lagi dalam ${menit} menit.` };
  }

  const data = Object.fromEntries(formData.entries());
  
  // Honeypot check: If the hidden 'website' field is filled, it's a bot
  if (data.website) {
    console.warn("Honeypot triggered! Bot detected.");
    return { success: "Jika email terdaftar, instruksi reset password telah dikirim." }; // Pretend it worked
  }
  
  const validation = forgotPasswordSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.issues?.[0]?.message || "Input tidak valid" };
  }

  const { email } = validation.data;

  try {
    // Check if email exists using safe Prisma ORM query
    const anggota = await prisma.anggota.findFirst({
      where: { email: email },
      select: { id: true, nama: true },
    });

    if (!anggota) {
      // Return success anyway to prevent email enumeration (security best practice)
      return { success: "Jika email terdaftar, instruksi reset password telah dikirim." };
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1); // Token expires in 1 hour

    // Save token using safe Prisma ORM update
    await prisma.anggota.update({
      where: { id: anggota.id },
      data: {
        reset_token: token,
        reset_token_expiration: expiration,
      },
    });

    // Create reset link
    // Assuming the app runs on localhost:3000 for development. In production, use the real domain.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Configure Nodemailer transporter with explicit Gmail SMTP settings
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Send email via Nodemailer
    await transporter.sendMail({
      from: `"Koperasi Polines" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Reset Password Koperasi Polines",
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #2563eb;">Reset Password</h2>
          <p>Halo <strong>${anggota.nama}</strong>,</p>
          <p>Anda telah meminta untuk mereset password akun Koperasi Anda. Silakan klik tombol di bawah ini untuk melanjutkan:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Ubah Password Saya
            </a>
          </div>
          <p>Atau copy link berikut ke browser Anda:</p>
          <p style="word-break: break-all; color: #6b7280; font-size: 14px;"><a href="${resetLink}">${resetLink}</a></p>
          <p style="color: #ef4444; font-size: 14px;">Link ini hanya berlaku selama 1 jam.</p>
          <hr style="border-color: #f3f4f6; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">Jika Anda tidak merasa meminta reset password, abaikan email ini.</p>
        </div>
      `,
    });

    return { success: "Jika email terdaftar, instruksi reset password telah dikirim." };

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return { error: "Terjadi kesalahan sistem pengiriman email. Silakan coba lagi nanti." };
  }
}
