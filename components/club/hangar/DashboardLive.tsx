"use client"

import { useEffect, useState } from "react"
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
}

type Court = {
  id: string
  name: string
}

type Props = {
  clubId: string
  initialBookings: Booking[]
  startIso: string
  endIso: string
  courts: Court[]
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

function StatusPill({ status }: { status: string }) {
  const label = status === "confirmed" ? "Confirmée" : "Annulée"
  const cls =
    status === "confirmed"
      ? "border-green-400/30 bg-green-400/10 text-green-200"
      : "border-red-400/30 bg-red-400/10 text-red-200"

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${cls}`}>
      {label}
    </span>
  )
}

type Activity = {
  id: string
  ts: Date
  type: "insert" | "cancel" | "update"
  label: string
}

export default function DashboardLive({ clubId, initialBookings, startIso, endIso, courts }: Props) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [isLive, setIsLive] = useState(false)
  const [activities, setActivities] = useState<Activity[]>([])
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState("")
  
  // Form states
  const [selectedCourt, setSelectedCourt] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<"confirmed" | "cancelled">("confirmed")

  // Nombre de terrains
  const nbTerrains = courts.length

  // Calculer les KPI
  const confirmed = bookings.filter((b) => b.status === "confirmed").length
  const cancelled = bookings.filter((b) => b.status === "cancelled").length
  
  // Revenus (40€ par créneau confirmé)
  const revenus = confirmed * 40
  
  // Taux d'occupation
  // Hypothèse: 15h d'ouverture (8h-23h) / 1.5h par créneau = 10 créneaux par terrain/jour
  const totalSlots = nbTerrains * 10
  const tauxOccupation = totalSlots > 0 ? Math.round((confirmed / totalSlots) * 100) : 0
  
  // Prochaine réservation confirmée (future par rapport à maintenant)
  const now = new Date()
  const next = bookings.find(
    (b) => b.status === "confirmed" && new Date(b.slot_start) > now
  ) ?? null

  // Construire courtsMap
  const courtsMap: Record<string, string> = {}
  courts.forEach((c) => {
    courtsMap[c.id] = c.name
  })

  // Export CSV
  const exportCsv = () => {
    const headers = ["Date", "Heure début", "Heure fin", "Terrain", "Statut", "Créé le"]
    const rows = bookings.map((b) => [
      new Date(b.slot_start).toLocaleDateString("fr-FR"),
      formatTime(b.slot_start),
      formatTime(b.slot_end),
      courtsMap[b.court_id] || "—",
      b.status === "confirmed" ? "Confirmée" : "Annulée",
      new Date(b.created_at).toLocaleString("fr-FR")
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `hangar-bookings-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Ajouter une réservation
  const handleAddBooking = async () => {
    setModalError("")
    
    if (!selectedCourt || !selectedDate || !selectedTime) {
      setModalError("Veuillez remplir tous les champs")
      return
    }

    setModalLoading(true)

    try {
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setModalError("Vous devez être connecté pour ajouter une réservation")
        setModalLoading(false)
        return
      }

      // Construire slot_start (ISO)
      const slotStartDate = new Date(`${selectedDate}T${selectedTime}:00`)
      const slotStartISO = slotStartDate.toISOString()
      
      // Calculer slot_end (+90 minutes)
      const slotEndDate = new Date(slotStartDate.getTime() + 90 * 60 * 1000)
      const slotEndISO = slotEndDate.toISOString()

      // Extraire booking_date (YYYY-MM-DD)
      const bookingDate = selectedDate

      // Insérer dans Supabase
      const { error } = await supabase
        .from("bookings")
        .insert({
          club_id: clubId,
          court_id: selectedCourt,
          slot_start: slotStartISO,
          slot_end: slotEndISO,
          booking_date: bookingDate,
          status: selectedStatus,
          created_by: user.id
        })

      if (error) {
        console.error("[Add Booking] Erreur:", error)
        setModalError(`Erreur: ${error.message}`)
        setModalLoading(false)
        return
      }

      // Succès: fermer la modal
      setIsModalOpen(false)
      setSelectedCourt("")
      setSelectedDate("")
      setSelectedTime("")
      setSelectedStatus("confirmed")
      setModalLoading(false)
    } catch (err: any) {
      console.error("[Add Booking] Erreur inattendue:", err)
      setModalError(`Erreur inattendue: ${err.message}`)
      setModalLoading(false)
    }
  }

  // Calcul des alertes
  const alerts: { type: string; message: string }[] = []

  // 1) Prochaine réservation < 30 min
  if (next) {
    const minutesUntilNext = (new Date(next.slot_start).getTime() - now.getTime()) / (1000 * 60)
    if (minutesUntilNext > 0 && minutesUntilNext <= 30) {
      alerts.push({
        type: "warning",
        message: `Prochaine réservation dans ${Math.round(minutesUntilNext)} min`
      })
    }
  }

  // 2) Annulation récente (< 60 min)
  const recentCancellation = bookings.find((b) => {
    if (b.status !== "cancelled") return false
    const createdAt = new Date(b.created_at)
    const minutesAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60)
    return minutesAgo >= 0 && minutesAgo <= 60
  })
  if (recentCancellation) {
    alerts.push({
      type: "error",
      message: "Annulation récente détectée"
    })
  }

  // 3) Soirée chargée (18h-23h, >= 60% des slots)
  const eveningBookings = bookings.filter((b) => {
    const hour = new Date(b.slot_start).getHours()
    return b.status === "confirmed" && hour >= 18 && hour < 23
  })
  const eveningSlots = nbTerrains * 3 // 18h-23h = 5h / 1.5h ≈ 3 créneaux
  if (eveningSlots > 0 && (eveningBookings.length / eveningSlots) >= 0.6) {
    alerts.push({
      type: "info",
      message: "Soirée chargée prévue (>60% occupation)"
    })
  }

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("hangar-bookings-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `club_id=eq.${clubId}`,
        },
        (payload) => {
          console.log("[Realtime] Event reçu:", payload.eventType, payload)

          // Ajouter l'activité au feed
          const activityTime = formatTime(new Date().toISOString())
          if (payload.eventType === "INSERT") {
            const newActivity: Activity = {
              id: payload.new.id,
              ts: new Date(),
              type: "insert",
              label: `Nouvelle réservation — ${activityTime}`
            }
            setActivities((prev) => [newActivity, ...prev].slice(0, 10))
          } else if (payload.eventType === "UPDATE") {
            const newBooking = payload.new as Booking
            if (newBooking.status === "cancelled") {
              const newActivity: Activity = {
                id: newBooking.id,
                ts: new Date(),
                type: "cancel",
                label: `Annulation — ${activityTime}`
              }
              setActivities((prev) => [newActivity, ...prev].slice(0, 10))
            } else {
              const newActivity: Activity = {
                id: newBooking.id,
                ts: new Date(),
                type: "update",
                label: `Modification — ${activityTime}`
              }
              setActivities((prev) => [newActivity, ...prev].slice(0, 10))
            }
          }

          setBookings((prev) => {
            let updated = [...prev]

            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
              const booking = payload.new as Booking
              // Upsert: retirer l'ancien si existe, puis ajouter
              updated = prev.filter((b) => b.id !== booking.id)
              updated.push(booking)
            } else if (payload.eventType === "DELETE") {
              const deletedId = payload.old.id
              updated = prev.filter((b) => b.id !== deletedId)
            }

            // Filtrer pour garder seulement les bookings dans la plage de temps
            const startDate = new Date(startIso)
            const endDate = new Date(endIso)
            const filtered = updated.filter((b) => {
              const bookingDate = new Date(b.slot_start)
              return bookingDate >= startDate && bookingDate <= endDate
            })

            // Trier par slot_start asc
            return filtered.sort(
              (a, b) => new Date(a.slot_start).getTime() - new Date(b.slot_start).getTime()
            )
          })
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsLive(true)
          console.log("[Realtime] ✅ Subscribed")
        } else {
          setIsLive(false)
        }
      })

    return () => {
      supabase.removeChannel(channel)
      setIsLive(false)
    }
  }, [clubId, startIso, endIso])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Le Hangar <span className="text-slate-400">— Dashboard</span>
            </h1>
            <p className="mt-2 text-slate-400">Aujourd'hui</p>
          </div>

          {/* Live Badge */}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                isLive ? "bg-green-500 animate-pulse" : "bg-slate-500"
              }`}
            />
            <span className="text-sm text-slate-300">{isLive ? "Live" : "Hors ligne"}</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <div className="text-sm text-slate-400">Revenus</div>
            <div className="mt-2 text-2xl font-semibold">{revenus}€</div>
            <div className="mt-1 text-sm text-slate-400">Aujourd'hui</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Taux d'occupation</div>
            <div className="mt-2 text-2xl font-semibold">{tauxOccupation}%</div>
            <div className="mt-1 text-sm text-slate-400">Aujourd'hui</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Prochaine réservation</div>
            <div className="mt-2 text-2xl font-semibold">
              {next ? formatTime(next.slot_start) : "—"}
            </div>
            <div className="mt-1 text-sm text-slate-400">À venir</div>
          </div>
        </div>

        {/* Planning Table */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold">Planning du jour</h2>
            <p className="text-sm text-slate-400 mt-0.5">{bookings.length} réservation(s)</p>
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
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-5 py-4 font-medium">
                      {formatTime(b.slot_start)} → {formatTime(b.slot_end)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={b.status} />
                    </td>
                  </tr>
                ))}

                {bookings.length === 0 && (
                  <tr>
                    <td className="px-5 py-10 text-center text-slate-400" colSpan={2}>
                      Aucune réservation aujourd'hui.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Nouvelle section: 3 cartes en bas */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* A) Alertes */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">Alertes</h3>
            {alerts.length === 0 ? (
              <p className="text-sm text-slate-400">Aucune alerte pour le moment</p>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert, i) => {
                  const iconColor =
                    alert.type === "warning" ? "text-yellow-400" :
                    alert.type === "error" ? "text-red-400" : "text-blue-400"
                  const bgColor =
                    alert.type === "warning" ? "bg-yellow-400/10 border-yellow-400/30" :
                    alert.type === "error" ? "bg-red-400/10 border-red-400/30" : "bg-blue-400/10 border-blue-400/30"
                  
                  return (
                    <div key={i} className={`flex items-start gap-2 p-3 rounded-lg border ${bgColor}`}>
                      <svg className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-sm text-slate-200">{alert.message}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* B) Actions rapides */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">Actions rapides</h3>
            <div className="space-y-2">
              <button
                disabled
                title="Bientôt disponible"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-sm font-medium cursor-not-allowed opacity-50 hover:opacity-60 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Bloquer un créneau
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white text-sm font-medium hover:bg-white/20 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter une réservation
              </button>

              <button
                onClick={exportCsv}
                disabled={bookings.length === 0}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white text-sm font-medium hover:bg-white/20 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Exporter (CSV)
              </button>
            </div>
          </div>

          {/* C) Activité récente (Live) */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Activité récente</h3>
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-slate-500"}`} />
                <span className="text-xs text-slate-400">Live</span>
              </div>
            </div>
            
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400">En attente d'activité...</p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {activities.map((activity) => {
                  const icon =
                    activity.type === "insert" ? "M12 4v16m8-8H4" :
                    activity.type === "cancel" ? "M6 18L18 6M6 6l12 12" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  
                  const colorClass =
                    activity.type === "insert" ? "text-green-400" :
                    activity.type === "cancel" ? "text-red-400" : "text-blue-400"

                  return (
                    <div key={activity.id} className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                      <svg className={`w-4 h-4 ${colorClass} flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                      </svg>
                      <span className="text-xs text-slate-300">{activity.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* Modal Ajouter une réservation */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Ajouter une réservation</h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setModalError("")
                  }}
                  className="text-slate-400 hover:text-white transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Terrain */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Terrain
                  </label>
                  <select
                    value={selectedCourt}
                    onChange={(e) => setSelectedCourt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un terrain</option>
                    {courts.map((court) => (
                      <option key={court.id} value={court.id}>
                        {court.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Heure */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-400 mt-1">Durée automatique: 1h30</p>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Statut
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as "confirmed" | "cancelled")}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="confirmed">Confirmée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>

                {/* Erreur */}
                {modalError && (
                  <div className="p-3 bg-red-400/10 border border-red-400/30 rounded-lg">
                    <p className="text-sm text-red-200">{modalError}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsModalOpen(false)
                      setModalError("")
                    }}
                    disabled={modalLoading}
                    className="flex-1 px-4 py-2 bg-slate-800 border border-white/10 text-white rounded-lg hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddBooking}
                    disabled={modalLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      </div>
    </div>
  )
}
