import prisma from "@/lib/prisma";
import ReportForm from "../ReportForm";

export default async function LaporanTunggakanPage() {
  const anggotaList = await prisma.anggota.findMany({
    where: { status: "Aktif" },
    select: { id: true, nama: true, nik: true, perusahaan: true },
    orderBy: { nama: "asc" },
  });

  const perusahaanSet = new Set(
    anggotaList.map((a) => a.perusahaan).filter(Boolean)
  );
  const perusahaanList = [...perusahaanSet].sort();

  return (
    <ReportForm
      title="Laporan Tunggakan"
      type="tunggakan"
      anggotaList={anggotaList}
      perusahaanList={perusahaanList}
      showDariTanggal={true}
      showSampaiTanggal={false}
      showPerusahaan={true}
      showJenisSimpanan={false}
      tanggalLabel="Tanggal Jatuh Tempo"
      accentColor="red"
    />
  );
}
