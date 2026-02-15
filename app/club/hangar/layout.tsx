import React from "react";
import HangarNav from "@/components/club/hangar/HangarNav";

export const metadata = { title: "Hangar — Club" };

export default function HangarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="py-6">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-xl font-semibold">
            Le Hangar — <span className="text-slate-300">Dashboard</span>
          </h1>
        </div>
        <HangarNav />
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        <div className="fixed top-4 left-4 z-50 text-xs">
          <div className="bg-red-600 text-white px-2 py-1 rounded">
            DEBUG DEPLOY OK - 2026-02-15
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
