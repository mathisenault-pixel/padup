import React from "react";
import HangarNav from "@/components/club/hangar/HangarNav";

export const metadata = { title: "Hangar — Club" };

export default function HangarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-slate-100 bg-slate-950">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(56,189,248,0.10),transparent_55%),radial-gradient(900px_circle_at_80%_20%,rgba(99,102,241,0.10),transparent_55%),radial-gradient(900px_circle_at_50%_90%,rgba(16,185,129,0.08),transparent_55%)]" />
      </div>

      <header className="relative pt-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500">Club</div>
              <h1 className="text-2xl font-semibold mt-1">Le Hangar</h1>
              <div className="text-sm text-slate-400 mt-1">Dashboard & gestion</div>
            </div>
            <div className="text-xs px-3 py-1 rounded-full border border-emerald-700/40 bg-emerald-900/20 text-emerald-200">
              ● Live
            </div>
          </div>
        </div>
        <div className="mt-6">
          <HangarNav />
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 pb-20 pt-8">
        {children}
      </main>
    </div>
  );
}
