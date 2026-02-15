import React from "react";

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <div className="text-xs text-slate-400 mb-2">{label}</div>
      <input
        className="w-full rounded-lg bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
        placeholder={placeholder}
      />
    </label>
  );
}

export default function HangarSettingsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Paramètres</h2>
        <p className="text-sm text-slate-400">Informations du club, préférences et options.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
          <div className="text-sm font-medium">Informations club</div>
          <Field label="Nom du club" placeholder="Ex: Padel Center Paris" />
          <Field label="Adresse" placeholder="Ex: 12 rue ..." />
          <Field label="Téléphone" placeholder="Ex: 06 ..." />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
          <div className="text-sm font-medium">Préférences</div>
          <Field label="Durée d'un créneau" placeholder="1h30 (fixe)" />
          <Field label="Devise" placeholder="EUR" />
          <button className="mt-2 w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700 hover:bg-slate-800 transition text-sm">
            Enregistrer (placeholder)
          </button>
          <div className="text-xs text-slate-500">Le save Supabase sera ajouté plus tard.</div>
        </div>
      </div>
    </section>
  );
}
