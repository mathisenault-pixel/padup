type Booking = {
  id: string;
  start: string; // "10:00"
  end: string;   // "11:30"
  customer: string;
  status: "confirmed" | "cancelled";
};

const mockBookings: Booking[] = [
  { id: "1", start: "09:00", end: "10:30", customer: "Mathis", status: "confirmed" },
  { id: "2", start: "11:00", end: "12:30", customer: "Romain", status: "confirmed" },
  { id: "3", start: "14:00", end: "15:30", customer: "Sarah", status: "cancelled" },
  { id: "4", start: "18:00", end: "19:30", customer: "Lucas", status: "confirmed" },
];

function StatusPill({ status }: { status: Booking["status"] }) {
  const label = status === "confirmed" ? "Confirmée" : "Annulée";
  const cls =
    status === "confirmed"
      ? "border-green-400/30 bg-green-400/10 text-green-200"
      : "border-red-400/30 bg-red-400/10 text-red-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${cls}`}>
      {label}
    </span>
  );
}

export default function HangarDashboardPage() {
  const confirmed = mockBookings.filter((b) => b.status === "confirmed").length;
  const cancelled = mockBookings.filter((b) => b.status === "cancelled").length;
  const next = mockBookings.find((b) => b.status === "confirmed") ?? null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Le Hangar <span className="text-slate-400">— Dashboard</span>
            </h1>
            <p className="mt-2 text-slate-400">Aujourd'hui</p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-500" />
            <span className="text-sm text-slate-300">Mock</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Réservations (confirmées)</div>
            <div className="mt-2 text-2xl font-semibold">{confirmed}</div>
            <div className="mt-1 text-sm text-slate-400">Aujourd'hui</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Annulations</div>
            <div className="mt-2 text-2xl font-semibold">{cancelled}</div>
            <div className="mt-1 text-sm text-slate-400">Aujourd'hui</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Prochaine réservation</div>
            <div className="mt-2 text-2xl font-semibold">
              {next ? `${next.start} — ${next.customer}` : "—"}
            </div>
            <div className="mt-1 text-sm text-slate-400">À venir</div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-semibold">Planning du jour</h2>
              <p className="text-sm text-slate-400">Affichage de test (mock).</p>
            </div>
            <div className="text-sm text-slate-400">{mockBookings.length} entrée(s)</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase tracking-wider text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="px-5 py-3">Heure</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {mockBookings.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-5 py-4">
                      <div className="font-medium">{b.start} → {b.end}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{b.customer}</div>
                      <div className="text-slate-400 text-xs">Terrain 1</div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
