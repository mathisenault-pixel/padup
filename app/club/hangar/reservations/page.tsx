import React from "react";

export default function HangarReservationsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Réservations</h2>
        <p className="text-sm text-slate-400">Consultez, filtrez et gérez les réservations du club.</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="text-sm font-medium">Liste des réservations</div>
        <div className="text-xs text-slate-400 mt-1">Écran en place. Branchage données après freeze.</div>

        <div className="mt-4 divide-y divide-slate-800 rounded-lg overflow-hidden">
          {["10:30 → 12:00", "12:00 → 13:30", "16:00 → 17:30"].map((t, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-950/20 hover:bg-slate-900 transition">
              <div className="text-sm text-slate-200">{t}</div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-800/70 text-emerald-100 border border-emerald-700/40">
                Confirmée
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
