export default function HangarDashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold">Le Hangar — Dashboard</h1>
        <p className="mt-2 text-slate-400">Si tu vois ça, la route est OK.</p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-slate-400 text-sm">Statut</div>
          <div className="mt-2 text-xl font-semibold">Dashboard prêt</div>
        </div>
      </div>
    </div>
  );
}
