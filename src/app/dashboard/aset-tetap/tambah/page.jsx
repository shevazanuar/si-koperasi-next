import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import TambahAsetForm from "./TambahAsetForm";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TambahAsetPage() {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/dashboard");

  // Fetch data for form
  const kategoriRaw = await prisma.$queryRawUnsafe(`SELECT id, nama_kategori FROM kategori_aset_tetap ORDER BY nama_kategori ASC`);
  const kasRaw = await prisma.$queryRawUnsafe(`SELECT id, nama_kas, saldo FROM kas WHERE status = 'Aktif'`);
  const bankRaw = await prisma.$queryRawUnsafe(`SELECT id, nama_bank, nomor_rekening, saldo FROM akun_bank WHERE status = 'Aktif'`);

  const kategoriList = kategoriRaw.map(k => ({ ...k, id: Number(k.id) }));
  const kasList = kasRaw.map(k => ({ ...k, id: Number(k.id), saldo: Number(k.saldo) }));
  const bankList = bankRaw.map(b => ({ ...b, id: Number(b.id), saldo: Number(b.saldo) }));

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link 
            href="/dashboard/aset-tetap" 
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm font-semibold mb-2 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Daftar Aset
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pencatatan Aset Baru</h1>
          <p className="text-gray-500 mt-1">Lengkapi form untuk mencatat pembelian aset tetap baru.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <TambahAsetForm kategoriList={kategoriList} kasList={kasList} bankList={bankList} />
      </div>
    </div>
  );
}
