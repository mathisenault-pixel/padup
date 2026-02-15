import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function formatTime(date: string) {
  const d = new Date(date);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function StatusPill({ status }: { status: string }) {
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

export default async function HangarDashboardPage() {
  // 1️⃣ récupérer le club Hangar
  const { data: club } = await supabase
    .from("clubs")
    .select("id")
    .eq("club_code", "HANGAR1")
    .single();

  if (!club) {
    return <div className="text-white p-8">Club introuvable</div>;
  }

  // 2️⃣ récupérer les bookings du jour (timezone locale)
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, slot_start, slot_end, status, created_at, court_id, club_id")
    .eq("club_id", club.id)
    .gte("slot_start", start.toISOString())
    .lte("slot_start", end.toISOString())
    .order("slot_start", { ascending: true });

  const confirmed =
    bookings?.filter((b) => b.status === "confirmed").length ?? 0;

  const cancelled =
    bookings?.filter((b) => b.status === "cancelled").length ?? 0;

  const next =
    bookings?.find((b) => b.status === "confirmed") ?? null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-6">

        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Le Hangar <span className="text-slate-400">— Dashboard</span>
        </h1>

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
              {next ? `${formatTime(next.slot_start)}` : "—"}
            </div>
            <div className="mt-1 text-sm text-slate-400">À venir</div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold">Planning du jour</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase tracking-wider text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="px-5 py-3">Heure</th>
                  <th className="px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {bookings?.map((b) => (
                  <tr key={b.id} className="border-b border-white/5">
                    <td className="px-5 py-4 font-medium">
                      {formatTime(b.slot_start)} → {formatTime(b.slot_end)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={b.status} />
                    </td>
                  </tr>
                ))}

                {bookings?.length === 0 && (
                  <tr>
                    <td className="px-5 py-10 text-slate-400" colSpan={2}>
                      Aucune réservation aujourd'hui.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DEBUG TEMPORAIRE */}
        <div className="mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
          <div className="text-sm font-semibold text-yellow-200 mb-2">🔍 DEBUG INFO</div>
          <div className="text-xs text-yellow-100/80 space-y-1">
            <div><strong>Club ID:</strong> {club.id}</div>
            <div><strong>Start (ISO):</strong> {start.toISOString()}</div>
            <div><strong>End (ISO):</strong> {end.toISOString()}</div>
            <div><strong>Bookings trouvés:</strong> {bookings?.length ?? 0}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
