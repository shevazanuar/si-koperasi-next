import { NextResponse } from 'next/server';
import { simpanPendapatanTahunan } from '@/app/dashboard/laporan/pendapatan/actions';

export async function GET(request) {
  // Disarankan untuk menambahkan Authentication Token (misal di headers/query params) 
  // agar API ini tidak bisa ditembak sembarangan
  
  const { searchParams } = new URL(request.url);
  const auth = searchParams.get('auth');
  
  // Contoh validasi sederhana
  // if (auth !== process.env.CRON_SECRET) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const today = new Date();
  const year = today.getFullYear();
  
  // Simpan data pendapatan tahunan untuk tahun ini
  const result = await simpanPendapatanTahunan(year);

  if (result.success) {
    return NextResponse.json({ message: 'Laporan pendapatan tahunan berhasil di-generate dan disimpan.' });
  } else {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
}
