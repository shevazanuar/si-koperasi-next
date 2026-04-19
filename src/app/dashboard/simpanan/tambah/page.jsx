import prisma from "@/lib/prisma";
import TambahSimpananForm from "./TambahSimpananForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TambahSimpananPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const [anggota, jenisSimpanan] = await Promise.all([
    prisma.anggota.findMany({
      where: { status: "Aktif" },
      select: { id: true, nama: true, nik: true },
      orderBy: { nama: "asc" }
    }),
    prisma.jenis_simpanan.findMany({
      orderBy: { id: "asc" }
    })
  ]);

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="mb-8">
        <Link 
          href="/dashboard/simpanan" 
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm font-semibold mb-2 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Riwayat Simpanan
        </Link>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Setoran Simpanan</h1>
        <p className="text-gray-500 mt-1">Catat transaksi simpanan baru untuk anggota.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <TambahSimpananForm anggota={anggota} jenisSimpanan={jenisSimpanan} user={user} />
      </div>
    </div>
  );
}
