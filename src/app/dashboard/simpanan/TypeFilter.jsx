"use client";

import { Filter } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import CustomSelect from "@/components/CustomSelect";

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

  const options = [
    { value: "", label: "Semua Jenis" },
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
        placeholder="Semua Jenis"
        className="w-44"
      />
    </div>
  );
}
