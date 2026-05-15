import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET,
  cookieName: "si_koperasi_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
    sameSite: "lax",
  },
};

/**
 * Get the current iron-session object
 * @returns {Promise<import("iron-session").IronSession>}
 */
export async function getIronSessionData() {
  const cookieStore = await cookies();
  return getIronSession(cookieStore, SESSION_OPTIONS);
}

/**
 * Get the current user from session
 * @returns {Promise<{id, username, name, role}|null>}
 */
export async function getSession() {
  const session = await getIronSessionData();
  return session?.user ?? null;
}

/**
 * Save user data into signed session cookie
 */
export async function setSession(userData) {
  const session = await getIronSessionData();
  session.user = userData;
  await session.save();
}

/**
 * Destroy session (logout)
 */
export async function destroySession() {
  const session = await getIronSessionData();
  session.destroy();
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin() {
  const user = await getSession();
  return user?.role === "admin";
}

/**
 * Check if the current user is a member (anggota)
 */
export async function isAnggota() {
  const user = await getSession();
  return user?.role === "anggota";
}
