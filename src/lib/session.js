import { cookies } from "next/headers";

/**
 * Get the current session from cookies
 * @returns {Object|null} Session data { id, username, name, role } or null
 */
export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) return null;

  try {
    return JSON.parse(sessionCookie.value);
  } catch (error) {
    return null;
  }
}

/**
 * Check if the current user is an admin
 * @returns {Boolean}
 */
export async function isAdmin() {
  const session = await getSession();
  return session?.role === "admin";
}

/**
 * Check if the current user is a member (anggota)
 * @returns {Boolean}
 */
export async function isAnggota() {
  const session = await getSession();
  return session?.role === "anggota";
}
