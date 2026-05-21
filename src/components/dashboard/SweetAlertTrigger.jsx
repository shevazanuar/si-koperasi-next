"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { showSuccess, showError } from "@/lib/swal";

function SweetAlertTriggerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (success) {
      showSuccess("Berhasil", message || "Aksi berhasil dilakukan.");
      
      // Clean up search params from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("success");
      params.delete("message");
      
      const newQuery = params.toString() ? `?${params.toString()}` : "";
      router.replace(`${pathname}${newQuery}`);
    } else if (error) {
      showError("Gagal", message || "Terjadi kesalahan.");
      
      // Clean up search params from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("error");
      params.delete("message");
      
      const newQuery = params.toString() ? `?${params.toString()}` : "";
      router.replace(`${pathname}${newQuery}`);
    }
  }, [searchParams, pathname, router]);

  return null;
}

export default function SweetAlertTrigger() {
  return (
    <Suspense fallback={null}>
      <SweetAlertTriggerContent />
    </Suspense>
  );
}
