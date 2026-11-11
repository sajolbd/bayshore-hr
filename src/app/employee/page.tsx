"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/employee/dashboard");
  }, [router]);

  return (
    <div className="flex h-96 items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
        <span>Loading Employee Portal...</span>
      </div>
    </div>
  );
}
