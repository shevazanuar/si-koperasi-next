"use client";

import { useState } from "react";
import { Package, Tag, ShoppingCart, Minus, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { showSuccess, showError } from "@/lib/swal";

export default function KatalogClient({ produk }) {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metodePembayaran, setMetodePembayaran] = useState("Tunai di Kasir");

  const fmt = (n) => new Intl.NumberFormat("id-ID").format(n);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        if (existing.qty >= item.stok) return prev; // Cannot exceed stock
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newQty = p.qty + delta;
          if (newQty < 1 || newQty > p.stok) return p;
          return { ...p, qty: newQty };
        }
        return p;
      })
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const totalBelanja = cart.reduce((acc, item) => acc + Number(item.harga_jual) * item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        items: cart.map(c => ({ id: c.id, qty: c.qty })),
        metode_pembayaran: metodePembayaran === "Potong Saldo Simpanan" ? "Potong Saldo Simpanan" : "Tunai"
      };

      const res = await fetch("/api/anggota/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      await showSuccess("Pesanan Berhasil", "Pesanan Anda berhasil dibuat dan sedang diproses!");
      setCart([]);
      setIsCartOpen(false);
      router.push("/dashboard/riwayat-pembelian");
    } catch (err) {
      showError("Gagal Checkout", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`relative flex gap-6 ${isCartOpen ? "md:pr-[380px]" : ""}`}>
      {/* Product Grid */}
      <div className="flex-1 w-full transition-all duration-300">
        {produk.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <Package className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-800">Tidak ada produk ditemukan</h3>
            <p className="text-gray-500 text-sm mt-1">Coba gunakan kata kunci atau kategori yang berbeda.</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {produk.map((item) => (
              <div key={item.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-all flex flex-col group relative">
                {item.is_featured && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm z-10 uppercase tracking-wider">
                    Unggulan
                  </div>
                )}
                
                <div className="mb-4 h-40 overflow-hidden rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center relative">
                  {item.gambar ? (
                    <img src={item.gambar} alt={item.nama_barang} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <Package className="w-12 h-12 text-gray-300 group-hover:text-blue-300 transition-colors" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {item.kategori?.nama_kategori || "-"}
                    </span>
                    {item.stok > 0 ? (
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">Tersedia</span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">Habis</span>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-gray-900 leading-tight line-clamp-2" title={item.nama_barang}>
                    {item.nama_barang}
                  </h3>
                  
                  <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px]">
                    {item.deskripsi || "Tidak ada deskripsi"}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 tracking-wider">Harga Koperasi</p>
                    <p className="font-black text-blue-600 text-lg">
                      Rp {fmt(Number(item.harga_jual))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 tracking-wider">Sisa Stok</p>
                    <p className="font-bold text-gray-700 text-sm">
                      {item.stok} <span className="text-xs font-normal">{item.satuan || "pcs"}</span>
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => addToCart(item)}
                  disabled={item.stok <= 0}
                  className="mt-4 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 text-sm transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-blue-500/20 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {item.stok > 0 ? "Tambah Keranjang" : "Stok Habis"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating/Sticky Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[380px] bg-white border-l border-gray-100 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h2 className="font-black text-gray-900 text-lg">Keranjang Belanja</h2>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-10">
                <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">Keranjang masih kosong</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  {item.gambar ? (
                    <img src={item.gambar} alt={item.nama_barang} className="w-16 h-16 object-cover rounded-lg" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.nama_barang}</h4>
                    <p className="text-blue-600 font-black text-sm mt-0.5">Rp {fmt(Number(item.harga_jual))}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-2 py-1">
                        <button onClick={() => updateQty(item.id, -1)} className="text-gray-500 hover:text-blue-600">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="text-gray-500 hover:text-blue-600">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
              <div className="mb-4 space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Metode Pembayaran</label>
                  <select 
                    value={metodePembayaran}
                    onChange={(e) => setMetodePembayaran(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Tunai di Kasir">Bayar Tunai di Kasir</option>
                    <option value="Potong Saldo Simpanan">Potong Saldo Simpanan</option>
                  </select>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-gray-500 font-semibold">Total Tagihan</span>
                  <span className="text-xl font-black text-blue-600">Rp {fmt(totalBelanja)}</span>
                </div>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Memproses..." : "Checkout Sekarang"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating button if cart is hidden but has items */}
      {!isCartOpen && cart.length > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all z-40 animate-bounce"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {cart.reduce((a, b) => a + b.qty, 0)}
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
