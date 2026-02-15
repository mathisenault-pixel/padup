"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type UserProfile = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
}

type Booking = {
  id: string
  club_id: string
  court_id: string
  slot_start: string
  slot_end: string
  status: string
  created_at: string
  created_by: string
  profiles: UserProfile[] | UserProfile | null
}

// Helper pour obtenir le profil utilisateur
function getUserProfile(booking: Booking): UserProfile | null {
  if (!booking.profiles) return null
  if (Array.isArray(booking.profiles)) {
    return booking.profiles[0] || null
  }
  return booking.profiles
}

type Court = {
  id: string
  name: string
}

type Props = {
  clubId: string
  initialBookings: Booking[]
  courts: Court[]
  settings: any
}

function KPI({ title, value, small }: { title: string; value: string | number; small?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 min-w-[180px] shadow-sm">
      <div className="text-xs text-gray-600 font-medium">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
      {small && <div className="text-xs text-gray-500 mt-1">{small}</div>}
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

  const nbTerrains = courts.length
  const slotMinutes = settings?.slot_minutes || 90
  const totalSlots = nbTerrains * 10 // Simplifié
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
    const headers = ["Date", "Heure début", "Heure fin", "Terrain", "Client", "Email", "Téléphone", "Statut"]
    const rows = bookings.map((b) => {
      const profile = getUserProfile(b)
      return [
        new Date(b.slot_start).toLocaleDateString("fr-FR"),
        formatTime(b.slot_start),
        formatTime(b.slot_end),
        courtsMap[b.court_id] || "—",
        profile?.full_name || "—",
        profile?.email || "—",
        profile?.phone || "—",
        b.status === "confirmed" ? "Confirmée" : "Annulée",
      ]
    })

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
      // Recharger les bookings avec infos utilisateur
      const { data } = await supabase
        .from("bookings")
        .select(`
          id, 
          club_id, 
          court_id, 
          slot_start, 
          slot_end, 
          status, 
          created_at,
          created_by,
          profiles:created_by (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq("club_id", clubId)
        .gte("slot_start", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
        .lte("slot_start", new Date(new Date().setHours(23, 59, 59, 999)).toISOString())
        .order("slot_start", { ascending: true })
      if (data) setBookings(data as any)
    }
  }

  return (
    <section className="space-y-6">
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

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="text-sm font-medium text-gray-900 mb-3">
          Planning du jour <span className="text-gray-500 text-xs">{bookings.length} réservation(s)</span>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            Aucune réservation aujourd'hui
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase">Heure</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase">Terrain</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => {
                  const profile = getUserProfile(b)
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="text-gray-900 font-medium">
                          {formatTime(b.slot_start)}
                        </div>
                        <div className="text-xs text-gray-500">
                          → {formatTime(b.slot_end)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900">
                          {courtsMap[b.court_id] || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 font-medium">
                          {profile?.full_name || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 text-sm">
                          {profile?.email || "—"}
                        </div>
                        {profile?.phone && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {profile.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={`inline-flex text-xs px-3 py-1 rounded-full ${
                            b.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                        >
                          {b.status === "confirmed" ? "Confirmée" : "Annulée"}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[120px] shadow-sm">
          <div className="text-sm font-medium text-gray-900">Alertes</div>
          <div className="text-xs text-gray-500 mt-2">Aucune alerte pour le moment</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[120px] shadow-sm">
          <div className="text-sm font-medium text-gray-900 mb-3">Actions rapides</div>
          <div className="space-y-2">
            <button
              onClick={() => alert("Fonctionnalité à venir : bloquer un créneau spécifique")}
              className="w-full py-2 rounded bg-gray-100 text-gray-700 text-xs hover:bg-gray-200 transition font-medium"
            >
              Bloquer un créneau
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2 rounded border border-gray-300 text-gray-700 text-xs hover:bg-gray-50 transition font-medium"
            >
              + Ajouter une réservation
            </button>
            <button
              onClick={exportCsv}
              className="w-full py-2 rounded border border-gray-300 text-gray-700 text-xs hover:bg-gray-50 transition font-medium"
            >
              Exporter (CSV)
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[120px] shadow-sm">
          <div className="text-sm font-medium text-gray-900">Activité récente</div>
          <div className="text-xs text-gray-500 mt-2">En attente d'activité…</div>
        </div>
      </div>

      {/* Modal Ajouter une réservation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter une réservation</h3>

            <div className="space-y-4">
              {/* Terrain */}
              <div>
                <label className="block text-xs text-gray-600 font-medium mb-2">Terrain</label>
                <select
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-xs text-gray-600 font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Heure */}
              <div>
                <label className="block text-xs text-gray-600 font-medium mb-2">Heure de début</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Durée du créneau : {slotMinutes} min (automatique)
                </p>
              </div>

              {/* Erreur */}
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{modalError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setModalError("")
                  }}
                  disabled={modalLoading}
                  className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddBooking}
                  disabled={modalLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                >
                  {modalLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Ajout...
                    </>
                  ) : (
                    "Ajouter"
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
