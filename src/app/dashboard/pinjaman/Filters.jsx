"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [value, setValue] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [value, pathname, router, searchParams]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isPending ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`} />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari No. Pinjaman, Nama, atau NIK..."
        className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-transparent rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition-all font-medium"
      />
      {value && (
        <button 
            onClick={() => setValue("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
            <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function TypeFilter({ types }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const currentType = searchParams.get("type") || "";

  const handleChange = (val) => {
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set("type", val);
    } else {
      params.delete("type");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className={`flex items-center gap-2 p-1 bg-gray-50/50 border border-gray-100 rounded-xl transition-all ${isPending ? 'opacity-50' : 'opacity-100'}`}>
      <select
        value={currentType}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-transparent border-none text-[10px] font-black uppercase tracking-wider text-gray-500 focus:ring-0 cursor-pointer pr-8"
      >
        <option value="">Semua Pinjaman</option>
        {types.map((t) => (
          <option key={t.id} value={t.id}>{t.nama}</option>
        ))}
      </select>
    </div>
  );
}
