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
      <div className="bg-gradient-to-br from-white to-blue-50/30 border border-blue-100 rounded-xl p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Réservations du jour</h2>
        <p className="text-sm text-slate-600 mt-1">
          <span className="font-semibold text-blue-600">{bookings.length}</span> réservation(s) trouvée(s)
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">📅</div>
          <div className="text-sm text-slate-600 font-medium">Aucune réservation aujourd'hui.</div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-blue-50/50 transition"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {formatTime(b.slot_start)} → {formatTime(b.slot_end)}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 font-medium">
                    {courtsMap[b.court_id] || "Terrain inconnu"}
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-4 py-1.5 rounded-full ${
                    b.status === "confirmed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {b.status === "confirmed" ? "✓ Confirmée" : "✕ Annulée"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
