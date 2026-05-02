import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch all anggota with simpanan/penarikan aggregates
    const anggotaList = await prisma.anggota.findMany({
      where: { status: "Aktif" },
      select: { id: true, nik: true, nama: true, jk: true },
      orderBy: { nama: "asc" },
    });

    // Aggregate simpanan and penarikan per anggota
    const simpananAgg = await prisma.simpanan.groupBy({
      by: ["anggota_id", "jenis"],
      _sum: { jumlah: true },
    });

    const simpananMap = {};
    const penarikanMap = {};
    simpananAgg.forEach((s) => {
      if (s.jenis === "S") {
        simpananMap[s.anggota_id] = s._sum.jumlah || 0;
      } else {
        penarikanMap[s.anggota_id] = s._sum.jumlah || 0;
      }
    });

    const data = anggotaList.map((a) => ({
      ...a,
      jml_simpanan: simpananMap[a.id] || 0,
      jml_penarikan: penarikanMap[a.id] || 0,
      saldo: (simpananMap[a.id] || 0) - (penarikanMap[a.id] || 0),
    }));

    // Fetch jenis simpanan for the form
    const jenisSimpanan = await prisma.jenis_simpanan.findMany({
      select: { id: true, nama: true },
    });

    return NextResponse.json({ data, jenisSimpanan });
  } catch (error) {
    console.error("Penarikan GET Error:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.action === "detail") {
      // Get detail penarikan per anggota
      const details = await prisma.simpanan.findMany({
        where: { anggota_id: parseInt(body.anggota_id), jenis: "T" },
        orderBy: { nomor: "desc" },
        take: 30,
      });

      const jenisList = await prisma.jenis_simpanan.findMany({
        select: { id: true, nama: true },
      });
      const jenisMap = Object.fromEntries(jenisList.map((j) => [j.id, j.nama]));

      const data = details.map((d) => ({
        ...d,
        nama_simpanan: jenisMap[d.jenis_simpanan_id] || "",
        tgl: d.tgl.toISOString(),
      }));

      return NextResponse.json({ data });
    }

    if (body.action === "saldo") {
      // Get saldo for specific jenis simpanan
      const simpanan = await prisma.simpanan.aggregate({
        where: { anggota_id: parseInt(body.anggota_id), jenis_simpanan_id: parseInt(body.jenis_simpanan_id), jenis: "S" },
        _sum: { jumlah: true },
      });
      const penarikan = await prisma.simpanan.aggregate({
        where: { anggota_id: parseInt(body.anggota_id), jenis_simpanan_id: parseInt(body.jenis_simpanan_id), jenis: "T" },
        _sum: { jumlah: true },
      });
      const saldo = (simpanan._sum.jumlah || 0) - (penarikan._sum.jumlah || 0);
      return NextResponse.json({ saldo });
    }

    if (body.action === "simpan") {
      // Auto-generate nomor
      const year = new Date().getFullYear();
      const last = await prisma.simpanan.findFirst({
        where: {
          jenis: "T",
          tgl: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) },
        },
        orderBy: { nomor: "desc" },
      });

      let nomor;
      if (last && last.nomor) {
        const lastNum = parseInt(last.nomor.substring(5)) + 1;
        nomor = `T${year}${String(lastNum).padStart(6, "0")}`;
      } else {
        nomor = `T${year}000001`;
      }

      const data = await prisma.simpanan.create({
        data: {
          nomor,
          tgl: new Date(body.tgl),
          tgl_akhir: new Date(body.tgl),
          anggota_id: parseInt(body.anggota_id),
          jenis_simpanan_id: parseInt(body.jenis_simpanan_id),
          jumlah: parseInt(body.jumlah),
          jenis: "T",
          user_id: 1,
          insert_date: new Date(),
        },
      });

      return NextResponse.json({ message: "Data penarikan berhasil disimpan", data });
    }

    if (body.action === "hapus") {
      await prisma.simpanan.delete({ where: { id: parseInt(body.id) } });
      return NextResponse.json({ message: "Data berhasil dihapus" });
    }

    return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Penarikan POST Error:", error);
    return NextResponse.json({ error: "Gagal memproses data" }, { status: 500 });
  }
}
