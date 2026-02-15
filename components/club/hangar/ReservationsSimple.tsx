"use client"

import { useState, useEffect } from "react"
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
  bookings: Booking[]
  courts: Court[]
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ReservationsSimple({ clubId, bookings: initialBookings, courts }: Props) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [isLive, setIsLive] = useState(false)

  const courtsMap: Record<string, string> = {}
  courts.forEach((c) => {
    courtsMap[c.id] = c.name
  })

  // Realtime subscription
  useEffect(() => {
    console.log('[RESERVATIONS] Setting up Realtime subscription for club:', clubId)
    
    const channel = supabase
      .channel('reservations-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `club_id=eq.${clubId}`,
        },
        (payload) => {
          console.log('[RESERVATIONS] Realtime event:', payload.eventType, payload)
          
          // Filtrer uniquement les bookings d'aujourd'hui
          const now = new Date()
          const start = new Date(now)
          start.setHours(0, 0, 0, 0)
          const end = new Date(now)
          end.setHours(23, 59, 59, 999)
          
          setBookings((prev) => {
            if (payload.eventType === 'INSERT') {
              const newBooking = payload.new as Booking
              const slotDate = new Date(newBooking.slot_start)
              
              // N'ajouter que si c'est aujourd'hui
              if (slotDate >= start && slotDate <= end) {
                const exists = prev.find(b => b.id === newBooking.id)
                if (!exists) {
                  console.log('[RESERVATIONS] Adding booking:', newBooking)
                  return [...prev, newBooking].sort(
                    (a, b) => new Date(a.slot_start).getTime() - new Date(b.slot_start).getTime()
                  )
                }
              }
              return prev
            }
            
            if (payload.eventType === 'UPDATE') {
              return prev.map(b => 
                b.id === (payload.new as Booking).id ? (payload.new as Booking) : b
              )
            }
            
            if (payload.eventType === 'DELETE') {
              return prev.filter(b => b.id !== (payload.old as Booking).id)
            }
            
            return prev
          })
        }
      )
      .subscribe((status) => {
        console.log('[RESERVATIONS] Subscription status:', status)
        setIsLive(status === 'SUBSCRIBED')
      })

    return () => {
      console.log('[RESERVATIONS] Cleaning up subscription')
      supabase.removeChannel(channel)
      setIsLive(false)
    }
  }, [clubId])

  return (
    <section className="space-y-6">
      {/* Badge LIVE */}
      <div className="flex items-center justify-end">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all ${
          isLive 
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-200' 
            : 'bg-slate-200 text-slate-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
          <span className="text-xs font-bold">{isLive ? 'LIVE' : 'CONNEXION...'}</span>
        </div>
      </div>

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
