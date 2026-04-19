"use client";

import { Filter } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

export default function TypeFilter({ types }) {
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
      <div className="pl-2">
        <Filter className="w-3 h-3 text-gray-400" />
      </div>
      <select
        value={currentType}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-transparent border-none text-xs font-bold text-gray-600 focus:ring-0 cursor-pointer pr-8"
      >
        <option value="">Semua Jenis</option>
        {types.map((t) => (
          <option key={t.id} value={t.id}>{t.nama}</option>
        ))}
      </select>
    </div>
  );
}
