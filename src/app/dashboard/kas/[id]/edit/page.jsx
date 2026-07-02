import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EditKasForm from "./EditKasForm";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function EditKasPage(props) {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/dashboard");

  const params = await props.params;
  const { id } = params;

  if (!id) redirect("/dashboard/kas");

  const kas = await prisma.kas.findUnique({
    where: { id: parseInt(id) }
  });

  if (!kas) redirect("/dashboard/kas");

  // Format decimal to number for props
  const serializedKas = {
    ...kas,
    saldo: typeof kas.saldo === 'object' ? parseFloat(kas.saldo.toString()) : kas.saldo
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link 
            href="/dashboard/kas" 
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm font-semibold mb-2 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Daftar Kas
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Kas</h1>
          <p className="text-gray-500 mt-1">Ubah data kas koperasi yang sudah ada.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <EditKasForm kas={serializedKas} />
      </div>
    </div>
  );
}
