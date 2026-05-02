import prisma from "@/lib/prisma";
import ReportForm from "../ReportForm";

export default async function LaporanSimpananPage() {
  const [anggotaList, jenisSimpananList] = await Promise.all([
    prisma.anggota.findMany({
      where: { status: "Aktif" },
      select: { id: true, nama: true, nik: true },
      orderBy: { nama: "asc" },
    }),
    prisma.jenis_simpanan.findMany({
      select: { id: true, nama: true },
    }),
  ]);

  return (
    <ReportForm
      title="Laporan Simpanan"
      type="simpanan"
      anggotaList={anggotaList}
      jenisSimpananList={jenisSimpananList}
      showJenisSimpanan={true}
      showPerusahaan={false}
      accentColor="blue"
    />
  );
}
