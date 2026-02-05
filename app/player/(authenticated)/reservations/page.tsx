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
  clubTelephone?: string
}

type TournamentRegistration = {
  id: number
  type: 'tournament'
  nom: string
  club: string
  clubAdresse: string
  date: string
  heureDebut: string
  categorie: string
  genre: string
  prixInscription: number
  image: string
  inscriptionDate: string
}

type MixedEvent = (EnrichedBooking | TournamentRegistration) & {
  eventType: 'booking' | 'tournament'
  eventDate: Date
}

export default function ReservationsPage() {
  const [bookings, setBookings] = useState<EnrichedBooking[]>([])
  const [tournaments, setTournaments] = useState<TournamentRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<'tous' | 'a-venir' | 'passees' | 'annulees'>('tous')
  const [selectedType, setSelectedType] = useState<'tous' | 'parties' | 'tournois'>('tous')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<EnrichedBooking | null>(null)
  const [clubDetails, setClubDetails] = useState<any>(null)
  const [showTournamentModal, setShowTournamentModal] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState<TournamentRegistration | null>(null)

  useEffect(() => {
    async function loadBookingsAndTournaments() {
      try {
        setLoading(true)
        setError(null)

        // Charger les réservations de terrains
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
                .select('name, city, phone')
                .eq('id', court.club_id)
                .maybeSingle()

              return {
                ...booking,
                clubName: club?.name || 'Club inconnu',
                clubCity: club?.city || '',
                clubImage: getClubImage(court.club_id),
                clubId: court.club_id,
                courtName: court?.name || 'Terrain',
                clubTelephone: club?.phone || ''
              }
            })
          )

          // ✅ Filtrer pour exclure le club démo
          const filteredEnriched = enriched.filter(b => b.clubId !== DEMO_CLUB_ID)

          setBookings(filteredEnriched)
        }

        // Charger les inscriptions aux tournois depuis localStorage
        const storedTournaments = localStorage.getItem('tournamentRegistrations')
        if (storedTournaments) {
          const tournamentsData = JSON.parse(storedTournaments) as TournamentRegistration[]
          setTournaments(tournamentsData)
        }

      } catch (err: any) {
        console.error('[RESERVATIONS ERROR]', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadBookingsAndTournaments()
  }, [])

  // Filtrer les réservations pour exclure les clubs inconnus
  const validBookings = useMemo(() => {
    return bookings.filter(b => b.clubName !== 'Club inconnu')
  }, [bookings])

  // Combiner et filtrer les réservations et tournois
  const filteredEvents = useMemo(() => {
    const now = new Date()

    // Convertir les bookings en MixedEvent
    let bookingEvents: MixedEvent[] = validBookings.map(b => ({
      ...b,
      eventType: 'booking' as const,
      eventDate: new Date(b.slot_start)
    }))

    // Convertir les tournois en MixedEvent
    let tournamentEvents: MixedEvent[] = tournaments.map(t => ({
      ...t,
      eventType: 'tournament' as const,
      eventDate: new Date(t.date)
    }))

    // Filtre par type (parties/tournois)
    let events: MixedEvent[] = []
    if (selectedType === 'parties') {
      events = bookingEvents
    } else if (selectedType === 'tournois') {
      events = tournamentEvents
    } else {
      events = [...bookingEvents, ...tournamentEvents]
    }

    // Filtre par statut
    if (selectedFilter === 'a-venir') {
      events = events.filter(e => {
        if (e.eventType === 'booking') {
          const booking = e as EnrichedBooking & { eventType: 'booking'; eventDate: Date }
          return booking.status === 'confirmed' && e.eventDate > now
        }
        return e.eventDate > now
      })
    } else if (selectedFilter === 'passees') {
      events = events.filter(e => {
        if (e.eventType === 'booking') {
          const booking = e as EnrichedBooking & { eventType: 'booking'; eventDate: Date }
          return booking.status === 'confirmed' && e.eventDate < now
        }
        return e.eventDate < now
      })
    } else if (selectedFilter === 'annulees') {
      events = events.filter(e => {
        if (e.eventType === 'booking') {
          const booking = e as EnrichedBooking & { eventType: 'booking'; eventDate: Date }
          return booking.status === 'cancelled'
        }
        return false
      })
    }

    // Trier par date (du plus récent au moins récent)
    events.sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime())

    return events
  }, [validBookings, tournaments, selectedFilter, selectedType])

  // Ouvrir le modal de détails pour une réservation
  const handleBookingClick = async (booking: EnrichedBooking) => {
    setSelectedBooking(booking)
    setShowDetailsModal(true)
    
    // Charger les détails complets du club
    if (booking.clubId) {
      try {
        const { data: club } = await supabase
          .from('clubs')
          .select('*')
          .eq('id', booking.clubId)
          .maybeSingle()
        
        setClubDetails(club)
      } catch (err) {
        console.error('[CLUB DETAILS ERROR]', err)
      }
    }
  }

  // Ouvrir le modal de détails pour un tournoi
  const handleTournamentClick = (tournament: TournamentRegistration) => {
    setSelectedTournament(tournament)
    setShowTournamentModal(true)
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
        
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Mes réservations</h1>
          <p className="text-gray-600">Vos parties et tournois à venir</p>
        </div>

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
        
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Mes réservations</h1>
          <p className="text-gray-600">Vos parties et tournois à venir</p>
        </div>

        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-red-700 font-semibold">Erreur : {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 md:px-6 lg:px-8 py-4 md:py-8">
      
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Mes réservations</h1>
        <p className="text-gray-600">Vos parties et tournois à venir</p>
      </div>

      {/* Filtres */}
      <div className="mb-6 md:mb-8 bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-6">
        {/* Filtre par type */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Type d'événement</h3>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setSelectedType('tous')}
            className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
              selectedType === 'tous'
                ? 'bg-slate-200 text-slate-900 border border-slate-300'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tout ({validBookings.length + tournaments.length})
          </button>
          <button
            onClick={() => setSelectedType('parties')}
            className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
              selectedType === 'parties'
                ? 'bg-slate-200 text-slate-900 border border-slate-300'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Parties ({validBookings.length})
          </button>
            <button
              onClick={() => setSelectedType('tournois')}
              className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                selectedType === 'tournois'
                  ? 'bg-slate-200 text-slate-900 border border-slate-300'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tournois ({tournaments.length})
            </button>
          </div>
        </div>

        {/* Filtre par statut */}
        <h3 className="text-sm font-bold text-gray-900 mb-3">Filtrer par statut</h3>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setSelectedFilter('tous')}
            className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
              selectedFilter === 'tous'
                ? 'bg-slate-200 text-slate-900 border border-slate-300'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Toutes ({validBookings.length})
          </button>
          <button
            onClick={() => setSelectedFilter('a-venir')}
            className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
              selectedFilter === 'a-venir'
                ? 'bg-slate-200 text-slate-900 border border-slate-300'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            À venir ({validBookings.filter(b => b.status === 'confirmed' && new Date(b.slot_start) > new Date()).length})
          </button>
          <button
            onClick={() => setSelectedFilter('passees')}
            className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
              selectedFilter === 'passees'
                ? 'bg-slate-200 text-slate-900 border border-slate-300'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Passées ({validBookings.filter(b => b.status === 'confirmed' && new Date(b.slot_start) < new Date()).length})
          </button>
          <button
            onClick={() => setSelectedFilter('annulees')}
            className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
              selectedFilter === 'annulees'
                ? 'bg-slate-200 text-slate-900 border border-slate-300'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Annulées ({validBookings.filter(b => b.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* Liste des événements */}
      {filteredEvents.length === 0 ? (
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
            <button className="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all">
              Réserver un terrain
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 mb-16 md:mb-8">
          {filteredEvents.map((event) => {
            // Affichage pour les tournois
            if (event.eventType === 'tournament') {
              const tournament = event as TournamentRegistration & { eventType: 'tournament'; eventDate: Date }
              const isPast = tournament.eventDate < new Date()

              return (
                <div
                  key={`tournament-${tournament.id}`}
                  onClick={() => handleTournamentClick(tournament)}
                  className="group flex flex-col md:flex-row gap-3 md:gap-6 bg-white border-2 border-slate-200 rounded-2xl md:rounded-3xl p-3 md:p-5 hover:shadow-xl transition-all cursor-pointer"
                >
                  {/* Image tournoi */}
                  <div className="w-full md:w-64 h-48 md:h-44 rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0 relative">
                    <img
                      src={tournament.image}
                      alt={tournament.nom}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg">
                      🏆 TOURNOI
                    </div>
                  </div>

                  {/* Infos */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-1 line-clamp-1">
                        {tournament.nom}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{tournament.club} · {tournament.clubAdresse}</p>
                    </div>

                    {/* Date & heure */}
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-semibold text-sm md:text-base">
                        {formatDate(tournament.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-sm md:text-base">
                        Début à {tournament.heureDebut}
                      </span>
                    </div>

                    {/* Infos tournoi */}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                        {tournament.categorie}
                      </span>
                      <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                        {tournament.genre}
                      </span>
                      <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                        {tournament.prixInscription}€/pers
                      </span>
                    </div>

                    {/* Badge statut */}
                    <div>
                      {isPast ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">
                          ⏱️ Passé
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                          ✅ Inscrit
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex md:justify-center md:items-center" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleTournamentClick(tournament)}
                      className="w-full md:w-auto px-5 py-3 md:px-6 md:py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all text-sm md:text-base"
                    >
                      Voir tournoi
                    </button>
                  </div>
                </div>
              )
            }

            // Affichage pour les parties (bookings)
            const booking = event as EnrichedBooking & { eventType: 'booking'; eventDate: Date }
            return (
            <div
              key={booking.id}
              onClick={() => handleBookingClick(booking)}
              className="group flex flex-col md:flex-row gap-3 md:gap-6 bg-white border border-gray-200 rounded-2xl md:rounded-3xl p-3 md:p-5 hover:shadow-xl transition-all cursor-pointer"
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

              {/* Action */}
              <div className="flex md:justify-center md:items-center" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => handleBookingClick(booking)}
                  className="w-full md:w-auto px-5 py-3 md:px-6 md:py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all text-sm md:text-base"
                >
                  Voir partie
                </button>
              </div>
            </div>
            )
          })}
        </div>
      )}

      {/* Modal de détails de la réservation */}
      {showDetailsModal && selectedBooking && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec image */}
            <div className="relative h-48 md:h-64 bg-gray-900">
              <img
                src={selectedBooking.clubImage || '/images/clubs/default.jpg'}
                alt={selectedBooking.clubName}
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              
              {/* Bouton fermer */}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg"
              >
                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Titre et badge */}
              <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-8 md:right-8">
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge booking={selectedBooking} />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-1">{selectedBooking.clubName}</h2>
                <p className="text-white/90 text-lg">{selectedBooking.clubCity}</p>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 md:p-8">
              {/* Informations de la réservation */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Votre réservation</h3>
                <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Date</p>
                      <p className="text-gray-900 font-semibold">{formatDate(selectedBooking.slot_start)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Horaire</p>
                      <p className="text-gray-900 font-semibold">{formatTime(selectedBooking.slot_start)} - {formatTime(selectedBooking.slot_end)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Terrain</p>
                      <p className="text-gray-900 font-semibold">{selectedBooking.courtName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations du club */}
              {clubDetails && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Informations du club</h3>
                  <div className="space-y-4">
                    {clubDetails.address && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Adresse</p>
                          <p className="text-gray-900 font-semibold">{clubDetails.address}</p>
                        </div>
                      </div>
                    )}

                    {clubDetails.phone && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Téléphone</p>
                          <a href={`tel:${clubDetails.phone}`} className="text-slate-700 font-semibold hover:text-slate-900">{clubDetails.phone}</a>
                        </div>
                      </div>
                    )}

                    {clubDetails.email && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                          <a href={`mailto:${clubDetails.email}`} className="text-slate-700 font-semibold hover:text-slate-900">{clubDetails.email}</a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-3">
                {selectedBooking.clubId && (
                  <Link href={`/player/clubs/${selectedBooking.clubId}/reserver`} className="flex-1">
                    <button className="w-full px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all">
                      Réserver à nouveau
                    </button>
                  </Link>
                )}
                {selectedBooking.status === 'confirmed' && new Date(selectedBooking.slot_start) > new Date() && selectedBooking.clubTelephone && (
                  <a href={`tel:${selectedBooking.clubTelephone}`} className="flex-1">
                    <button className="w-full px-6 py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Contacter le club
                    </button>
                  </a>
                )}
              </div>

              {selectedBooking.status === 'confirmed' && new Date(selectedBooking.slot_start) > new Date() && (
                <p className="text-sm text-gray-500 text-center mt-4">
                  Pour annuler cette réservation, veuillez contacter le club
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails du tournoi */}
      {showTournamentModal && selectedTournament && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowTournamentModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec image */}
            <div className="relative h-48 md:h-64 bg-gray-900">
              <img
                src={selectedTournament.image}
                alt={selectedTournament.nom}
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              
              {/* Bouton fermer */}
              <button
                onClick={() => setShowTournamentModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg"
              >
                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Badge tournoi */}
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg">
                🏆 TOURNOI
              </div>

              {/* Titre et badge */}
              <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-8 md:right-8">
                <div className="flex items-center gap-2 mb-2">
                  {new Date(selectedTournament.date) < new Date() ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">
                      ⏱️ Passé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                      ✅ Inscrit
                    </span>
                  )}
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-1">{selectedTournament.nom}</h2>
                <p className="text-white/90 text-lg">{selectedTournament.club} · {selectedTournament.clubAdresse}</p>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 md:p-8">
              {/* Informations du tournoi */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Informations du tournoi</h3>
                <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Date</p>
                      <p className="text-gray-900 font-semibold">{formatDate(selectedTournament.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Heure de début</p>
                      <p className="text-gray-900 font-semibold">{selectedTournament.heureDebut}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Catégorie</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                          {selectedTournament.categorie}
                        </span>
                        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                          {selectedTournament.genre}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Prix d'inscription</p>
                      <p className="text-gray-900 font-semibold">{selectedTournament.prixInscription}€ par personne</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Club organisateur</p>
                      <p className="text-gray-900 font-semibold">{selectedTournament.club}</p>
                      <p className="text-gray-600 text-sm">{selectedTournament.clubAdresse}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Link href={`/player/tournois/${selectedTournament.id}`} className="w-full">
                  <button className="w-full px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all">
                    Voir tous les détails
                  </button>
                </Link>
              </div>

              {new Date(selectedTournament.date) > new Date() && (
                <p className="text-sm text-gray-500 text-center mt-4">
                  Pour vous désinscrire, veuillez contacter le club organisateur
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
