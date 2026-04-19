import prisma from "@/lib/prisma";
import TambahPinjamanForm from "./TambahPinjamanForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TambahPinjamanPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const [anggota, jenisPinjaman] = await Promise.all([
    prisma.anggota.findMany({
      where: { status: "Aktif" },
      select: { id: true, nama: true, nik: true },
      orderBy: { nama: "asc" }
    }),
    prisma.jenis_pinjaman.findMany({
      select: { id: true, nama: true, lama: true, bunga: true, jumlah: true },
      orderBy: { id: "asc" }
    })
  ]);

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="mb-8">
        <Link 
          href="/dashboard/pinjaman" 
          className="text-orange-600 hover:text-orange-800 flex items-center gap-2 text-sm font-semibold mb-2 group transition-all"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Daftar Pinjaman
        </Link>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Pengajuan Pinjaman</h1>
        <p className="text-gray-500 mt-1">Daftarkan pinjaman baru untuk anggota dengan tenor yang dipilih.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <TambahPinjamanForm anggota={anggota} jenisPinjaman={jenisPinjaman} user={user} />
      </div>
    </div>
  );
}
