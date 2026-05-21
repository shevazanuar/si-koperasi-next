"use client";

import { Save, X, Plus, Trash2, PackageSearch } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { showError } from "@/lib/swal";

export default function TambahPenjualanPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  
  const [barangList, setBarangList] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);
  
  // Form State
  const [isAnggota, setIsAnggota] = useState(false);
  const [anggotaId, setAnggotaId] = useState("");
  const [namaPembeli, setNamaPembeli] = useState("");
  const [metodePembayaran, setMetodePembayaran] = useState("Tunai");
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    // Fetch barang
    fetch("/api/barang")
      .then(res => res.json())
      .then(data => setBarangList(data))
      .catch(console.error);
      
    // Simulate fetching anggota
    // Or we could create an API for it, but let's just fetch from a new endpoint or pass for now.
    // Ideally we should create /api/anggota/route.js, but let's assume we can fetch it if needed.
    // For now we'll just let them type if it's "Umum".
  }, []);

  const addItem = () => {
    setItems([...items, { barang_id: "", qty: 1 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const totalTagihan = useMemo(() => {
    return items.reduce((sum, item) => {
      const b = barangList.find(b => b.id === Number(item.barang_id));
      if (b) {
        return sum + (Number(b.harga_jual) * Number(item.qty));
      }
      return sum;
    }, 0);
  }, [items, barangList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    try {
      const payload = {
        anggota_id: isAnggota ? Number(anggotaId) : null,
        nama_pembeli: !isAnggota ? namaPembeli : null,
        metode_pembayaran: metodePembayaran,
        items: items.map(i => ({
          barang_id: Number(i.barang_id),
          qty: Number(i.qty)
        }))
      };

      const res = await fetch("/api/penjualan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses transaksi");
      }
      
      router.push("/dashboard/penjualan?success=true&message=Transaksi+penjualan+berhasil+disimpan");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setIsPending(false);
      showError("Gagal Menyimpan", err.message || "Terjadi kesalahan saat memproses transaksi");
    }
  };

  const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20 max-w-4xl mx-auto">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Transaksi Penjualan</h1>
          <p className="text-gray-400 text-sm mt-0.5">Buat transaksi penjualan baru</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Info Pembeli */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 col-span-1">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Info Pembeli</h2>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input 
                    type="checkbox" 
                    checked={isAnggota} 
                    onChange={e => setIsAnggota(e.target.checked)} 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Pembeli adalah Anggota?</span>
                </label>
              </div>

              {isAnggota ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ID Anggota</label>
                  <input
                    type="number"
                    value={anggotaId}
                    onChange={e => setAnggotaId(e.target.value)}
                    required={isAnggota}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="Masukkan ID Anggota"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Pembeli Umum</label>
                  <input
                    type="text"
                    value={namaPembeli}
                    onChange={e => setNamaPembeli(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="Boleh dikosongkan"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Metode Pembayaran</label>
                <select
                  value={metodePembayaran}
                  onChange={e => setMetodePembayaran(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="Tunai">Tunai</option>
                  <option value="Transfer">Transfer</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Potong Gaji">Potong Gaji</option>
                </select>
              </div>
            </div>
          </div>

          {/* Keranjang Belanja */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 col-span-1 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Keranjang Belanja</h2>
              <button
                type="button"
                onClick={addItem}
                className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-3 h-3" /> Tambah Item
              </button>
            </div>

            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
                  <PackageSearch className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Belum ada barang di keranjang</p>
                  <button type="button" onClick={addItem} className="text-blue-600 font-bold text-sm mt-2">Tambah Sekarang</button>
                </div>
              ) : (
                items.map((item, index) => {
                  const selectedBarang = barangList.find(b => b.id === Number(item.barang_id));
                  const hargaSatuan = selectedBarang ? Number(selectedBarang.harga_jual) : 0;
                  const stokLimit = selectedBarang ? selectedBarang.stok : 0;
                  const subtotal = hargaSatuan * item.qty;

                  return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl relative group">
                      <div className="flex-1 space-y-2">
                        <select
                          value={item.barang_id}
                          onChange={e => updateItem(index, "barang_id", e.target.value)}
                          required
                          className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        >
                          <option value="">Pilih Barang...</option>
                          {barangList.map(b => (
                            <option key={b.id} value={b.id} disabled={b.stok <= 0}>
                              {b.kode_barang} - {b.nama_barang} (Stok: {b.stok})
                            </option>
                          ))}
                        </select>
                        
                        {selectedBarang && (
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Harga: Rp {fmt(hargaSatuan)}</span>
                            <span>Subtotal: <strong className="text-blue-600">Rp {fmt(subtotal)}</strong></span>
                          </div>
                        )}
                      </div>
                      
                      <div className="w-24">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={e => updateItem(index, "qty", e.target.value)}
                          min="1"
                          max={stokLimit}
                          required
                          className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-center font-bold"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {items.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">Total Tagihan</span>
                <span className="text-2xl font-black text-blue-600">Rp {fmt(totalTagihan)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end">
          <Link
            href="/dashboard/penjualan"
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Batal
          </Link>
          <button
            type="submit"
            disabled={isPending || items.length === 0}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Memproses..." : "Selesaikan Transaksi"}
          </button>
        </div>
      </form>
    </div>
  );
}
