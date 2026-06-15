import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import TambahBankForm from "./TambahBankForm";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TambahAkunBankPage() {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/dashboard");

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link 
            href="/dashboard/akun-bank" 
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm font-semibold mb-2 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Daftar Rekening
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tambah Rekening Bank</h1>
          <p className="text-gray-500 mt-1">Lengkapi formulir di bawah untuk menambahkan rekening bank koperasi.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <TambahBankForm />
      </div>
    </div>
  );
}
