import React from "react";
import Link from "next/link";

export default function CourtsPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Terrains</h2>
          <p className="text-sm text-slate-400">Gérez vos terrains, horaires et disponibilités.</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700 hover:bg-slate-800 transition text-sm">
          + Ajouter un terrain
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-sm font-medium">Aucun terrain pour le moment</div>
          <div className="text-xs text-slate-400 mt-1">Ajoutez votre premier terrain pour activer les réservations.</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-sm font-medium">Prochaine étape</div>
          <div className="text-xs text-slate-400 mt-1">
            On branchera ces écrans à Supabase après le freeze technique.
          </div>
          <Link className="inline-block mt-3 text-xs text-slate-300 underline hover:text-white" href="/club/hangar">
            Retour au dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
