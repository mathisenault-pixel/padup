'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

type Booking = {
  id: string
  club_id: string
  court_id: string
  slot_start: string
  slot_end: string
  status: string
  created_at: string
}

type CourtsMap = Record<string, string>

type Props = {
  clubId: string
  initialBookings: Booking[]
  courtsMap: CourtsMap
}

type ViewMode = 'today' | 'upcoming'

function formatTime(date: string) {
  const d = new Date(date)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function StatusPill({ status }: { status: string }) {
  const label = status === 'confirmed' ? 'Confirmée' : 'Annulée'

  const cls =
    status === 'confirmed'
      ? 'border-green-400/30 bg-green-400/10 text-green-200'
      : 'border-red-400/30 bg-red-400/10 text-red-200'

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${cls}`}>
      {label}
    </span>
  )
}

export default function DashboardClient({ clubId, initialBookings, courtsMap }: Props) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [mode, setMode] = useState<ViewMode>('today')
  const [isLoading, setIsLoading] = useState(false)

  // Calculer les KPI
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length
  const cancelled = bookings.filter((b) => b.status === 'cancelled').length
  const next = bookings.find((b) => b.status === 'confirmed') ?? null

  // Fetch bookings selon le mode
  const fetchBookings = async (newMode: ViewMode) => {
    setIsLoading(true)
    try {
      const now = new Date()
      let start: Date, end: Date

      if (newMode === 'today') {
        // Aujourd'hui: 00:00 -> 23:59
        start = new Date(now)
        start.setHours(0, 0, 0, 0)
        end = new Date(now)
        end.setHours(23, 59, 59, 999)
      } else {
        // À venir: maintenant -> +7 jours
        start = new Date(now)
        end = new Date(now)
        end.setDate(end.getDate() + 7)
        end.setHours(23, 59, 59, 999)
      }

      const { data } = await supabaseBrowser
        .from('bookings')
        .select('id, club_id, court_id, slot_start, slot_end, status, created_at')
        .eq('club_id', clubId)
        .gte('slot_start', start.toISOString())
        .lte('slot_start', end.toISOString())
        .order('slot_start', { ascending: true })

      setBookings(data || [])
    } catch (error) {
      console.error('[Dashboard] Erreur fetch bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Changer de mode
  const handleModeChange = (newMode: ViewMode) => {
    setMode(newMode)
    fetchBookings(newMode)
  }

  // Realtime subscription
  useEffect(() => {
    const channel = supabaseBrowser
      .channel('hangar-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `club_id=eq.${clubId}`,
        },
        (payload) => {
          console.log('[Realtime] Changement détecté:', payload)

          if (payload.eventType === 'INSERT') {
            const newBooking = payload.new as Booking
            // Vérifier si le booking correspond au filtre actuel
            const bookingDate = new Date(newBooking.slot_start)
            const shouldInclude = isBookingInCurrentView(bookingDate, mode)

            if (shouldInclude) {
              setBookings((prev) => {
                // Éviter les doublons
                if (prev.find((b) => b.id === newBooking.id)) return prev
                return [...prev, newBooking].sort(
                  (a, b) => new Date(a.slot_start).getTime() - new Date(b.slot_start).getTime()
                )
              })
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedBooking = payload.new as Booking
            setBookings((prev) =>
              prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id
            setBookings((prev) => prev.filter((b) => b.id !== deletedId))
          }
        }
      )
      .subscribe()

    return () => {
      supabaseBrowser.removeChannel(channel)
    }
  }, [clubId, mode])

  // Helper: vérifier si un booking correspond au mode actuel
  const isBookingInCurrentView = (bookingDate: Date, viewMode: ViewMode): boolean => {
    const now = new Date()

    if (viewMode === 'today') {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      const end = new Date(now)
      end.setHours(23, 59, 59, 999)
      return bookingDate >= start && bookingDate <= end
    } else {
      const start = new Date(now)
      const end = new Date(now)
      end.setDate(end.getDate() + 7)
      return bookingDate >= start && bookingDate <= end
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Le Hangar <span className="text-slate-400">— Dashboard</span>
            </h1>
            <p className="mt-2 text-slate-400">
              {mode === 'today' ? "Aujourd'hui" : '7 prochains jours'}
            </p>
          </div>

          {/* Toggle View */}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => handleModeChange('today')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                mode === 'today'
                  ? 'bg-white text-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => handleModeChange('upcoming')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                mode === 'upcoming'
                  ? 'bg-white text-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              À venir (7j)
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Réservations (confirmées)</div>
            <div className="mt-2 text-2xl font-semibold">{confirmed}</div>
            <div className="mt-1 text-sm text-slate-400">
              {mode === 'today' ? "Aujourd'hui" : '7 prochains jours'}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Annulations</div>
            <div className="mt-2 text-2xl font-semibold">{cancelled}</div>
            <div className="mt-1 text-sm text-slate-400">
              {mode === 'today' ? "Aujourd'hui" : '7 prochains jours'}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Prochaine réservation</div>
            <div className="mt-2 text-2xl font-semibold">
              {next ? `${formatTime(next.slot_start)}` : '—'}
            </div>
            <div className="mt-1 text-sm text-slate-400">À venir</div>
          </div>
        </div>

        {/* Planning Table */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Planning</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {isLoading ? 'Chargement...' : `${bookings.length} réservation(s)`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-slate-400">Live</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase tracking-wider text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="px-5 py-3">Heure</th>
                  <th className="px-5 py-3">Terrain</th>
                  <th className="px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-5 py-4 font-medium">
                      {formatTime(b.slot_start)} → {formatTime(b.slot_end)}
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {courtsMap[b.court_id] || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={b.status} />
                    </td>
                  </tr>
                ))}

                {bookings.length === 0 && !isLoading && (
                  <tr>
                    <td className="px-5 py-10 text-center text-slate-400" colSpan={3}>
                      {mode === 'today'
                        ? "Aucune réservation aujourd'hui"
                        : 'Aucune réservation à venir'}
                    </td>
                  </tr>
                )}

                {isLoading && (
                  <tr>
                    <td className="px-5 py-10 text-center text-slate-400" colSpan={3}>
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
                        Chargement...
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
