"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

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

  return (
    <div className={`flex items-center gap-2 text-sm text-gray-500 font-medium ${isPending ? 'opacity-50' : 'opacity-100'}`}>
      <span>Display</span>
      <select
        value={currentLimit}
        onChange={(e) => handleChange(e.target.value)}
        className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700 font-semibold"
      >
        <option value="20">20</option>
        <option value="40">40</option>
        <option value="80">80</option>
        <option value="120">120</option>
      </select>
      <span>records</span>
    </div>
  );
}
