'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
import { getClubImage } from '@/lib/clubImages'

// ✅ Force dynamic rendering
export const dynamic = 'force-dynamic'

// ID du club démo à exclure
const DEMO_CLUB_ID = 'ba43c579-e522-4b51-8542-737c2c6452bb'

type Booking = {
  id: string
  court_id: string
  booking_date: string
  slot_id: number
  slot_start: string
  slot_end: string
  status: string
  created_at: string
}

type EnrichedBooking = Booking & {
  clubName?: string
  clubCity?: string
  clubImage?: string
  clubId?: string
  courtName?: string
}

export default function ReservationsPage() {
  const [bookings, setBookings] = useState<EnrichedBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<'tous' | 'a-venir' | 'passees' | 'annulees'>('tous')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<EnrichedBooking | null>(null)

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true)
        setError(null)

        // Charger les réservations
        const { data: bookingsData, error: queryError } = await supabase
          .from('bookings')
          .select('*')
          .order('slot_start', { ascending: false })

        if (queryError) {
          console.error('[RESERVATIONS ERROR]', queryError)
          setError(`${queryError.message}`)
        } else {
          // Enrichir avec les infos club/court
          const enriched = await Promise.all(
            (bookingsData || []).map(async (booking) => {
              // Récupérer le court
              const { data: court } = await supabase
                .from('courts')
                .select('name, club_id')
                .eq('id', booking.court_id)
                .maybeSingle()

              if (!court) return { ...booking }

              // Récupérer le club
              const { data: club } = await supabase
                .from('clubs')
                .select('name, city')
                .eq('id', court.club_id)
                .maybeSingle()

              return {
                ...booking,
                clubName: club?.name || 'Club inconnu',
                clubCity: club?.city || '',
                clubImage: getClubImage(court.club_id),
                clubId: court.club_id,
                courtName: court?.name || 'Terrain'
              }
            })
          )

          // ✅ Filtrer pour exclure le club démo
          const filteredEnriched = enriched.filter(b => b.clubId !== DEMO_CLUB_ID)

          setBookings(filteredEnriched)
        }
      } catch (err: any) {
        console.error('[RESERVATIONS ERROR]', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [])

  // Filtrage des réservations
  const filteredBookings = useMemo(() => {
    let filtered = bookings

    const now = new Date()

    if (selectedFilter === 'a-venir') {
      filtered = filtered.filter(b => 
        b.status === 'confirmed' && new Date(b.slot_start) > now
      )
    } else if (selectedFilter === 'passees') {
      filtered = filtered.filter(b => 
        b.status === 'confirmed' && new Date(b.slot_start) < now
      )
    } else if (selectedFilter === 'annulees') {
      filtered = filtered.filter(b => b.status === 'cancelled')
    }

    return filtered
  }, [bookings, selectedFilter])

  // Annuler une réservation
  const handleCancelClick = (booking: EnrichedBooking) => {
    setBookingToCancel(booking)
    setShowCancelModal(true)
  }

  const confirmCancel = async () => {
    if (!bookingToCancel) return

    setCancellingId(bookingToCancel.id)
    setShowCancelModal(false)

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingToCancel.id)

      if (error) {
        console.error('[CANCEL ERROR]', error)
        alert(`Erreur: ${error.message}`)
      } else {
        setBookings(prev => 
          prev.map(b => 
            b.id === bookingToCancel.id ? { ...b, status: 'cancelled' } : b
          )
        )
      }
    } catch (err: any) {
      console.error('[CANCEL ERROR]', err)
      alert(`Erreur: ${err.message}`)
    } finally {
      setCancellingId(null)
      setBookingToCancel(null)
    }
  }

  // Format de date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Badge de statut
  const StatusBadge = ({ booking }: { booking: EnrichedBooking }) => {
    const now = new Date()
    const slotDate = new Date(booking.slot_start)
    const isPast = slotDate < now

    if (booking.status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
          ❌ Annulée
        </span>
      )
    }

    if (isPast) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">
          ⏱️ Passée
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
        ✅ Confirmée
      </span>
    )
  }

  if (loading) {
    return (
      <div className="px-3 md:px-6 lg:px-8 py-4 md:py-8">
        <div className="grid gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-3xl p-5 animate-pulse">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-64 h-48 md:h-44 bg-gray-200 rounded-2xl" />
                <div className="flex-1 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-3 md:px-6 lg:px-8 py-4 md:py-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-red-700 font-semibold">Erreur : {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 md:px-6 lg:px-8 py-4 md:py-8">
      {/* Filtres */}
      <div className="mb-6 md:mb-8 bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Filtrer par statut</h3>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setSelectedFilter('tous')}
            className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
              selectedFilter === 'tous'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Toutes ({bookings.length})
          </button>
          <button
            onClick={() => setSelectedFilter('a-venir')}
            className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
              selectedFilter === 'a-venir'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            À venir ({bookings.filter(b => b.status === 'confirmed' && new Date(b.slot_start) > new Date()).length})
          </button>
          <button
            onClick={() => setSelectedFilter('passees')}
            className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
              selectedFilter === 'passees'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Passées ({bookings.filter(b => b.status === 'confirmed' && new Date(b.slot_start) < new Date()).length})
          </button>
          <button
            onClick={() => setSelectedFilter('annulees')}
            className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
              selectedFilter === 'annulees'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Annulées ({bookings.filter(b => b.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* Liste des réservations */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 px-6">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">
            Aucune réservation
          </h3>
          <p className="text-gray-600 mb-6">
            {selectedFilter === 'tous' 
              ? "Vous n'avez pas encore de réservation" 
              : `Aucune réservation ${selectedFilter === 'a-venir' ? 'à venir' : selectedFilter === 'passees' ? 'passée' : 'annulée'}`}
          </p>
          <Link href="/player/clubs">
            <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all">
              Réserver un terrain
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 mb-16 md:mb-8">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="group flex flex-col md:flex-row gap-3 md:gap-6 bg-white border border-gray-200 rounded-2xl md:rounded-3xl p-3 md:p-5 hover:shadow-xl transition-all"
            >
              {/* Image club */}
              <div className="w-full md:w-64 h-48 md:h-44 rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0">
                <img
                  src={booking.clubImage || '/images/clubs/default.jpg'}
                  alt={booking.clubName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Infos */}
              <div className="flex-1 flex flex-col gap-3">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-1 line-clamp-1">
                    {booking.clubName}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-1">{booking.clubCity}</p>
                </div>

                {/* Date & heure */}
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold text-sm md:text-base">
                    {formatDate(booking.slot_start)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-sm md:text-base">
                    {formatTime(booking.slot_start)} - {formatTime(booking.slot_end)}
                  </span>
                </div>

                {/* Terrain */}
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>{booking.courtName}</span>
                </div>

                {/* Badge statut */}
                <div>
                  <StatusBadge booking={booking} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-2 md:justify-center">
                {booking.status === 'confirmed' && new Date(booking.slot_start) > new Date() && (
                  <button
                    onClick={() => handleCancelClick(booking)}
                    disabled={cancellingId === booking.id}
                    className="flex-1 md:w-auto px-5 py-3 md:px-6 md:py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    {cancellingId === booking.id ? 'Annulation...' : 'Annuler'}
                  </button>
                )}
                {booking.clubId && (
                  <Link href={`/player/clubs/${booking.clubId}/reserver`} className="flex-1 md:w-auto">
                    <button className="w-full px-5 py-3 md:px-6 md:py-2.5 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-all text-sm md:text-base">
                      Voir le club
                    </button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale de confirmation d'annulation */}
      {showCancelModal && bookingToCancel && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCancelModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                Annuler cette réservation ?
              </h3>
              <p className="text-gray-600 mb-2">
                {bookingToCancel.clubName}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {formatDate(bookingToCancel.slot_start)} à {formatTime(bookingToCancel.slot_start)}
              </p>
              <p className="text-sm text-red-600 font-semibold mb-6">
                Cette action est irréversible
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Retour
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-all"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
