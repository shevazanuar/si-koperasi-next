import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import ProfileDetails from "./ProfileDetails";

export default async function ProfilePage() {
  const userSession = await getSession();

  if (!userSession) {
    redirect("/login");
  }

  let userData = null;

  if (userSession.role === "admin") {
    const dbUser = await prisma.$queryRawUnsafe(
      "SELECT id, username, namalengkap, level_id FROM users WHERE id = ?",
      userSession.id
    );

    if (dbUser && dbUser.length > 0) {
      userData = {
        ...userSession,
        name: dbUser[0].namalengkap,
        username: dbUser[0].username,
        insert_date: null,
      };
    }
  } else {
    const dbAnggota = await prisma.$queryRawUnsafe(
      "SELECT id, nik, nama, perusahaan, unit_seksi, jabatan, status, tgl_masuk, alamat, insert_date FROM anggota WHERE id = ?",
      userSession.id
    );

    if (dbAnggota && dbAnggota.length > 0) {
      const a = dbAnggota[0];
      userData = {
        ...userSession,
        name: a.nama,
        username: a.nik,
        perusahaan: a.perusahaan,
        unit_seksi: a.unit_seksi,
        jabatan: a.jabatan,
        status: a.status,
        tgl_masuk: a.tgl_masuk,
        alamat: a.alamat,
        insert_date: a.insert_date,
      };
    }
  }

  if (!userData) {
    redirect("/login");
  }

  return <ProfileDetails userData={userData} />;
}
