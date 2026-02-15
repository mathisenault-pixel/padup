import React from "react";

function KPI({ title, value, small }: { title: string; value: string | number; small?: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 min-w-[180px]">
      <div className="text-xs text-slate-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {small && <div className="text-xs text-slate-500 mt-1">{small}</div>}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="flex gap-4 overflow-x-auto py-2 pb-4">
        <KPI title="Réservations (confirmées)" value="4" small="Aujourd'hui" />
        <KPI title="Annulations" value="0" small="Aujourd'hui" />
        <KPI title="Revenus" value="160€" small="Aujourd'hui" />
        <KPI title="Taux d'occupation" value="5%" small="Aujourd'hui" />
        <KPI title="Prochaine réservation" value="10:30" small="À venir" />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="text-sm font-medium text-slate-300 mb-3">
          Planning du jour <span className="text-slate-500 text-xs">4 réservation(s)</span>
        </div>

        <div className="divide-y divide-slate-800 rounded-md overflow-hidden">
          {["10:30 → 12:00", "12:00 → 13:30", "16:00 → 17:30", "16:30 → 18:00"].map((t, i) => (
            <div
              key={i}
              className="flex justify-between items-center px-4 py-3 bg-slate-950/20 hover:bg-slate-900 transition"
            >
              <div className="text-slate-200">{t}</div>
              <div className="text-xs bg-emerald-800/80 text-emerald-100 px-3 py-1 rounded-full">
                Confirmée
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 min-h-[120px]">
          <div className="text-sm font-medium text-slate-200">Alertes</div>
          <div className="text-xs text-slate-500 mt-2">Aucune alerte pour le moment</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 min-h-[120px]">
          <div className="text-sm font-medium text-slate-200 mb-3">Actions rapides</div>
          <div className="space-y-2">
            <button className="w-full py-2 rounded bg-slate-800/60 text-slate-200 text-xs">Bloquer un créneau</button>
            <button className="w-full py-2 rounded border border-slate-700 text-xs">+ Ajouter une réservation</button>
            <button className="w-full py-2 rounded border border-slate-700 text-xs">Exporter (CSV)</button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 min-h-[120px]">
          <div className="text-sm font-medium text-slate-200">Activité récente</div>
          <div className="text-xs text-slate-500 mt-2">En attente d'activité…</div>
        </div>
      </div>
    </section>
  );
}
