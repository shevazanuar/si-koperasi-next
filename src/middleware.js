import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export async function middleware(request) {
  // We must define the same options as in src/lib/session.js
  const SESSION_OPTIONS = {
    password: process.env.SESSION_SECRET,
    cookieName: "si_koperasi_session",
  };

  const response = NextResponse.next();
  const session = await getIronSession(request.cookies, SESSION_OPTIONS);
  const pathname = request.nextUrl.pathname;

  // Protect all dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!session.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const user = session.user;
    const adminOnlyPrefixes = [
      "/dashboard/config",
      "/dashboard/management-menu",
      "/dashboard/log-pengguna",
      "/dashboard/menu",
      "/dashboard/transaksi/pembayaran",
      "/dashboard/transaksi/penarikan",
    ];

    const isAdminOnly = adminOnlyPrefixes.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (isAdminOnly && user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

