"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    router.replace(token ? "/dashboard" : "/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 text-center">
      <div>
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-600 text-2xl font-bold text-white shadow-lg shadow-emerald-600/20">
          K
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">
          Kisan Mithra
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Opening your smart farming app...</h1>
        <p className="mt-2 text-sm text-slate-500">Please wait a moment.</p>
      </div>
    </main>
  );
}
