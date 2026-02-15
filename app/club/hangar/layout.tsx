import React from "react";
import HangarNav from "@/components/club/hangar/HangarNav";

export const metadata = { title: "Hangar — Club" };

export default function HangarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-gray-900 bg-gray-50">
      <header className="relative pt-8 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-500 font-medium">Club</div>
              <h1 className="text-2xl font-semibold mt-1 text-gray-900">Le Hangar</h1>
              <div className="text-sm text-gray-600 mt-1">Dashboard & gestion</div>
            </div>
            <div className="text-xs px-3 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 font-medium">
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
