"use client"

type Booking = {
  id: string
  club_id: string
  court_id: string
  slot_start: string
  slot_end: string
  status: string
  created_at: string
}

type Court = {
  id: string
  name: string
}

type Props = {
  bookings: Booking[]
  courts: Court[]
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ReservationsSimple({ bookings, courts }: Props) {
  const courtsMap: Record<string, string> = {}
  courts.forEach((c) => {
    courtsMap[c.id] = c.name
  })

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Réservations du jour</h2>
        <p className="text-sm text-slate-400">
          {bookings.length} réservation(s) trouvée(s)
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center">
          <div className="text-sm text-slate-400">Aucune réservation aujourd'hui.</div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="divide-y divide-slate-800 rounded-lg overflow-hidden">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-4 py-3 bg-slate-950/20 hover:bg-slate-900 transition"
              >
                <div>
                  <div className="text-sm text-slate-200">
                    {formatTime(b.slot_start)} → {formatTime(b.slot_end)}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {courtsMap[b.court_id] || "Terrain inconnu"}
                  </div>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    b.status === "confirmed"
                      ? "bg-emerald-800/70 text-emerald-100 border border-emerald-700/40"
                      : "bg-red-800/70 text-red-100 border border-red-700/40"
                  }`}
                >
                  {b.status === "confirmed" ? "Confirmée" : "Annulée"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
