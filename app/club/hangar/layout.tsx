import React from "react";
import HangarNav from "@/components/club/hangar/HangarNav";

export const metadata = { title: "Hangar — Club" };

export default function HangarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <header className="relative bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-blue-600 font-bold">Club</div>
              <h1 className="text-3xl font-bold mt-1 text-slate-900">Le Hangar</h1>
              <div className="text-sm text-slate-600 mt-1 font-medium">Dashboard & gestion</div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <span className="text-xs font-bold">LIVE</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <HangarNav />
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 pb-20 pt-8">
        {children}
      </main>
    </div>
  );
}
