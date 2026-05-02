import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import TambahAnggotaForm from "./TambahAnggotaForm";
import prisma from "@/lib/prisma";

export default async function TambahAnggotaPage() {
  const levelListRaw = await prisma.$queryRawUnsafe("SELECT id, nama FROM level_anggota ORDER BY id ASC");
  const levelList = levelListRaw.map(l => ({ ...l, id: typeof l.id === 'bigint' ? Number(l.id) : l.id }));
  const perusahaanListRaw = await prisma.$queryRawUnsafe("SELECT id, nama FROM perusahaan ORDER BY nama ASC");
  const perusahaanList = perusahaanListRaw.map(p => ({ ...p, id: typeof p.id === 'bigint' ? Number(p.id) : p.id }));

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link 
            href="/dashboard/anggota" 
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm font-semibold mb-2 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Daftar
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pendaftaran Anggota Baru</h1>
          <p className="text-gray-500 mt-1">Lengkapi formulir di bawah untuk menambahkan anggota koperasi baru.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <TambahAnggotaForm levelList={levelList} perusahaanList={perusahaanList} />
      </div>
    </div>
  );
}
