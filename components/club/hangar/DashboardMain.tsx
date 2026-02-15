"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Booking = {
  id: string
  club_id: string
  court_id: string
  slot_start: string
  slot_end: string
  status: string
  created_at: string
  created_by: string
}

type Court = {
  id: string
  name: string
  is_active?: boolean
}

type Props = {
  clubId: string
  initialBookings: Booking[]
  courts: Court[]
  settings: any
}

function KPI({ title, value, small }: { title: string; value: string | number; small?: string }) {
  return (
    <div className="bg-gradient-to-br from-white to-blue-50/30 border border-blue-100 rounded-xl p-5 min-w-[180px] shadow-sm hover:shadow-md transition-shadow">
      <div className="text-xs text-blue-600 font-semibold uppercase tracking-wide">{title}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
      {small && <div className="text-xs text-slate-600 mt-1">{small}</div>}
    </div>
  )
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function DashboardMain({ clubId, initialBookings, courts, settings }: Props) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  
  // Modal ajout réservation
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState("")
  const [selectedCourt, setSelectedCourt] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedTime, setSelectedTime] = useState("")

  // Calcul KPI
  const confirmed = bookings.filter((b) => b.status === "confirmed").length
  const cancelled = bookings.filter((b) => b.status === "cancelled").length
  
  const priceOffpeak = (settings?.price_offpeak_cents || 4000) / 100
  const revenus = confirmed * priceOffpeak

  // Calcul du taux d'occupation basé sur les heures d'ouverture réelles
  // Compter TOUS les terrains (pas seulement actifs pour le calcul d'occupation)
  const nbTerrains = courts.length > 0 ? courts.length : 1 // Au moins 1 pour éviter division par 0
  const slotMinutes = settings?.slot_minutes || 90
  
  // Calculer le nombre de créneaux par jour par terrain
  // Ex: Si ouvert de 8h à 23h = 15h = 900 min, et créneaux de 90 min = 10 créneaux
  const openHours = settings?.open_hours || { "1": { start: "08:00", end: "23:00" } }
  const firstDay = openHours["1"] || openHours["0"] || { start: "08:00", end: "23:00" }
  const [startH, startM] = firstDay.start.split(":").map(Number)
  const [endH, endM] = firstDay.end.split(":").map(Number)
  const totalMinutesOpen = (endH * 60 + endM) - (startH * 60 + startM)
  const slotsPerCourtPerDay = Math.floor(totalMinutesOpen / slotMinutes)
  
  const totalSlots = nbTerrains * slotsPerCourtPerDay
  const tauxOccupation = totalSlots > 0 ? Math.round((confirmed / totalSlots) * 100) : 0

  const now = new Date()
  const next = bookings.find(
    (b) => b.status === "confirmed" && new Date(b.slot_start) > now
  )

  const courtsMap: Record<string, string> = {}
  courts.forEach((c) => {
    courtsMap[c.id] = c.name
  })

  // Export CSV
  const exportCsv = () => {
    const headers = ["Date", "Heure début", "Heure fin", "Terrain", "Statut"]
    const rows = bookings.map((b) => [
      new Date(b.slot_start).toLocaleDateString("fr-FR"),
      formatTime(b.slot_start),
      formatTime(b.slot_end),
      courtsMap[b.court_id] || "—",
      b.status === "confirmed" ? "Confirmée" : "Annulée",
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `hangar-reservations-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Ajouter une réservation
  const handleAddBooking = async () => {
    if (!selectedCourt || !selectedDate || !selectedTime) {
      setModalError("Tous les champs sont obligatoires")
      return
    }

    setModalLoading(true)
    setModalError("")

    const slotStart = new Date(`${selectedDate}T${selectedTime}`)
    const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60 * 1000)

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setModalError("Vous devez être connecté pour ajouter une réservation")
      setModalLoading(false)
      return
    }

    const { error } = await supabase.from("bookings").insert({
      club_id: clubId,
      court_id: selectedCourt,
      slot_start: slotStart.toISOString(),
      slot_end: slotEnd.toISOString(),
      booking_date: selectedDate,
      status: "confirmed",
      created_by: userData.user.id,
    })

    setModalLoading(false)

    if (error) {
      setModalError(`Erreur: ${error.message}`)
    } else {
      setIsModalOpen(false)
      setModalError("")
      setSelectedCourt("")
      setSelectedTime("")
      // Recharger les bookings
      const { data } = await supabase
        .from("bookings")
        .select('id, club_id, court_id, slot_start, slot_end, status, created_at, created_by')
        .eq("club_id", clubId)
        .gte("slot_start", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .lte("slot_start", new Date(new Date().setHours(23, 59, 59, 999)).toISOString())
        .order("slot_start", { ascending: true })
      if (data) setBookings(data)
    }
  }

  return (
    <section className="space-y-6">
      {/* DEBUG - Calcul taux occupation */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-xs">
        <div className="font-bold text-blue-900 mb-2">📊 Détail calcul taux d'occupation</div>
        <div className="space-y-1 text-blue-800">
          <div><strong>Terrains du Hangar:</strong> {courts.length} terrain(s)</div>
          <div className="ml-4 text-xs">
            {courts.map((c, i) => (
              <div key={c.id}>• {c.name}</div>
            ))}
          </div>
          <div><strong>Utilisés pour calcul:</strong> {nbTerrains} terrain(s)</div>
          <div><strong>Heures d'ouverture:</strong> {firstDay.start} → {firstDay.end} ({Math.floor(totalMinutesOpen / 60)}h{totalMinutesOpen % 60}min)</div>
          <div><strong>Durée créneau:</strong> {slotMinutes} min</div>
          <div><strong>Créneaux par terrain/jour:</strong> {slotsPerCourtPerDay}</div>
          <div><strong>Total créneaux disponibles:</strong> {totalSlots} ({nbTerrains} terrains × {slotsPerCourtPerDay} créneaux)</div>
          <div><strong>Réservations confirmées:</strong> {confirmed}</div>
          <div className="pt-2 border-t border-blue-300 mt-2"><strong>Taux d'occupation:</strong> {confirmed} ÷ {totalSlots} = <span className="text-lg font-bold">{tauxOccupation}%</span></div>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto py-2 pb-4">
        <KPI title="Réservations (confirmées)" value={confirmed} small="Aujourd'hui" />
        <KPI title="Annulations" value={cancelled} small="Aujourd'hui" />
        <KPI title="Revenus" value={`${revenus}€`} small="Aujourd'hui" />
        <KPI title="Taux d'occupation" value={`${tauxOccupation}%`} small="Aujourd'hui" />
        <KPI
          title="Prochaine réservation"
          value={next ? formatTime(next.slot_start) : "—"}
          small="À venir"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Planning du jour</h2>
          <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-full font-medium">
            {bookings.length} réservation{bookings.length > 1 ? 's' : ''}
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-500">
            Aucune réservation aujourd'hui
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b-2 border-slate-200 bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wide">Heure</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wide">Terrain</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wide">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-blue-50/50 transition">
                    <td className="px-4 py-4">
                      <div className="text-slate-900 font-semibold">
                        {formatTime(b.slot_start)}
                      </div>
                      <div className="text-xs text-slate-500">
                        → {formatTime(b.slot_end)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-slate-900 font-medium">
                        {courtsMap[b.court_id] || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div
                        className={`inline-flex text-xs font-semibold px-3 py-1.5 rounded-full ${
                          b.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {b.status === "confirmed" ? "✓ Confirmée" : "✕ Annulée"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-white to-amber-50/30 border border-amber-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <div className="text-sm font-semibold text-slate-900">Alertes</div>
          </div>
          <div className="text-xs text-slate-600 mt-3">Aucune alerte pour le moment</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900 mb-4">Actions rapides</div>
          <div className="space-y-2">
            <button
              onClick={() => alert("Fonctionnalité à venir : bloquer un créneau spécifique")}
              className="w-full py-2.5 rounded-lg bg-slate-100 text-slate-700 text-xs hover:bg-slate-200 transition font-semibold"
            >
              🔒 Bloquer un créneau
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 transition font-semibold shadow-sm"
            >
              + Ajouter une réservation
            </button>
            <button
              onClick={exportCsv}
              className="w-full py-2.5 rounded-lg border-2 border-slate-300 text-slate-700 text-xs hover:bg-slate-50 transition font-semibold"
            >
              📥 Exporter (CSV)
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50/30 border border-blue-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            <div className="text-sm font-semibold text-slate-900">Activité récente</div>
          </div>
          <div className="text-xs text-slate-600 mt-3">En attente d'activité…</div>
        </div>
      </div>

      {/* Modal Ajouter une réservation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-7 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Nouvelle réservation</h3>

            <div className="space-y-5">
              {/* Terrain */}
              <div>
                <label className="block text-sm text-slate-700 font-semibold mb-2">Terrain</label>
                <select
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">Sélectionner un terrain</option>
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm text-slate-700 font-semibold mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              {/* Heure */}
              <div>
                <label className="block text-sm text-slate-700 font-semibold mb-2">Heure de début</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <p className="text-xs text-slate-500 mt-2 bg-slate-50 px-3 py-2 rounded-lg">
                  ⏱️ Durée du créneau : <span className="font-semibold">{slotMinutes} min</span> (automatique)
                </p>
              </div>

              {/* Erreur */}
              {modalError && (
                <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-xl">
                  <p className="text-sm text-rose-700 font-medium">⚠️ {modalError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-2">
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setModalError("")
                  }}
                  disabled={modalLoading}
                  className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition disabled:opacity-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddBooking}
                  disabled={modalLoading}
                  className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-blue-200"
                >
                  {modalLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Ajout...
                    </>
                  ) : (
                    "✓ Ajouter"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
