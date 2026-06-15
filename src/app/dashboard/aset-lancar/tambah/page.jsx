import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import TambahAsetLancarForm from "./TambahAsetLancarForm";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TambahAsetLancarPage() {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/dashboard");

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link 
            href="/dashboard/aset-lancar" 
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm font-semibold mb-2 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Ringkasan Aset
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Catat Aset Lancar Lainnya</h1>
          <p className="text-gray-500 mt-1">Gunakan form ini untuk mencatat Piutang Lainnya atau Piutang Usaha (selain Piutang Anggota).</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <TambahAsetLancarForm />
      </div>
    </div>
  );
}
