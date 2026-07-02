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

import { Filter } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

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

  const options = [
    { value: "", label: "Semua Pinjaman" },
    ...types.map(t => ({ value: t.id.toString(), label: t.nama }))
  ];

  return (
    <div className={`flex items-center p-1 pl-3 bg-white border border-gray-200 rounded-xl transition-all shadow-sm hover:shadow-md hover:border-blue-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
      <div className="flex items-center gap-2 border-r border-gray-100 pr-2">
        <Filter className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Filter</span>
      </div>
      <CustomSelect 
        options={options}
        value={currentType}
        onChange={handleChange}
        placeholder="Semua Pinjaman"
        className="w-44"
      />
    </div>
  );
}

export function StatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get("status") || "";

  const handleChange = (val) => {
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set("status", val);
    } else {
      params.delete("status");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const statuses = [
    { value: "", label: "Semua" },
    { value: "aktif", label: "Aktif" },
    { value: "lunas", label: "Lunas" },
  ];

  return (
    <div className={`flex items-center bg-gray-100/80 p-1 rounded-xl ${isPending ? 'opacity-50' : 'opacity-100'}`}>
      {statuses.map((s) => {
        const isActive = currentStatus === s.value;
        return (
          <button
            key={s.value}
            onClick={() => handleChange(s.value)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              isActive 
                ? "bg-white text-emerald-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            }`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
