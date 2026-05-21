import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import EditBarangForm from "./EditBarangForm";

export default async function EditBarangPage({ params }) {
  const user = await getSession();
  if (!user || user.role !== "admin") redirect("/login");

  const { id } = await params;
  
  const [barang, kategori] = await Promise.all([
    prisma.master_barang.findUnique({
      where: { id: Number(id) }
    }),
    prisma.kategori_produk.findMany({
      orderBy: { nama_kategori: "asc" }
    })
  ]);

  if (!barang) redirect("/dashboard/master/barang");

  // Serialize Prisma Decimal and Date objects for Client Component compatibility
  const serializedBarang = {
    ...barang,
    harga_modal: barang.harga_modal ? Number(barang.harga_modal) : 0,
    harga_jual: barang.harga_jual ? Number(barang.harga_jual) : 0,
    created_at: barang.created_at ? barang.created_at.toISOString() : null,
    updated_at: barang.updated_at ? barang.updated_at.toISOString() : null,
  };

  // Convert kategori to plain array of objects (if contains dates, serialize them too)
  const serializedKategori = kategori.map(k => ({
    ...k,
    created_at: k.created_at ? k.created_at.toISOString() : null,
    updated_at: k.updated_at ? k.updated_at.toISOString() : null,
  }));

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20 max-w-3xl mx-auto">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Edit Barang</h1>
          <p className="text-gray-400 text-sm mt-0.5">Edit data {barang.kode_barang}</p>
        </div>
      </div>

      <EditBarangForm barang={serializedBarang} kategori={serializedKategori} id={id} />
    </div>
  );
}
