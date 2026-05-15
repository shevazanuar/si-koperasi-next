import { NextResponse } from "next/server";

export function middleware(request) {
  const session = request.cookies.get("si_koperasi_session")?.value;
  const pathname = request.nextUrl.pathname;

  // Protect all dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role-based: block anggota from admin-only pages
    try {
      const user = JSON.parse(session);
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
    } catch {
      // Invalid session cookie – clear it and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
