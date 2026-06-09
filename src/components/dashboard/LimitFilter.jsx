"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Layers } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

export default function LimitFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const currentLimit = searchParams.get("limit") || "20";

  const handleChange = (val) => {
    const params = new URLSearchParams(searchParams);
    if (val && val !== "20") {
      params.set("limit", val);
    } else {
      params.delete("limit");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const options = [
    { value: "20", label: "20 Data" },
    { value: "40", label: "40 Data" },
    { value: "80", label: "80 Data" },
    { value: "120", label: "120 Data" },
  ];

  return (
    <div className={`flex items-center p-1 pl-3 bg-white border border-gray-200 rounded-xl transition-all shadow-sm hover:shadow-md hover:border-blue-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
      <div className="flex items-center gap-2 border-r border-gray-100 pr-2">
        <Layers className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tampilkan</span>
      </div>
      <CustomSelect 
        options={options}
        value={currentLimit}
        onChange={handleChange}
        className="w-28"
      />
    </div>
  );
}
