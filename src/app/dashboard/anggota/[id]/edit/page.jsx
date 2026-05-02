import prisma from "@/lib/prisma";
import EditAnggotaForm from "./EditAnggotaForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditAnggotaPage({ params }) {
  const { id } = await params;
  
  const data = await prisma.anggota.findUnique({
    where: { id: parseInt(id) }
  });

  if (!data) {
    return notFound();
  }

  // Format date to YYYY-MM-DD for input
  const formattedData = {
    ...data,
    tgl_lahir: data.tgl_lahir ? new Date(data.tgl_lahir).toISOString().split('T')[0] : ""
  };

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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Data Anggota</h1>
          <p className="text-gray-500 mt-1">Perbarui informasi profil anggota koperasi.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <EditAnggotaForm data={formattedData} levelList={levelList} perusahaanList={perusahaanList} />
      </div>
    </div>
  );
}
