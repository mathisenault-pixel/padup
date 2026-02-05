'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cancelReservationAction } from './actions'

type Reservation = {
  id: string
  court_id: string
  player_id: string
  date: string
  start_time: string
  end_time: string
  status: string
  payment_status: string
  price: number | null
  created_at: string
  cancelled_at: string | null
  courts: {
    id: string
    name: string
    type: string
    price_per_hour: number | null
    clubs: {
      id: string
      name: string
      city: string | null
    }
  } | null
}

type Props = {
  reservations: Reservation[]
}

export default function ReservationsClient({ reservations }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('upcoming')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  const handleCancelReservation = () => {
    if (!selectedReservation) return

    startTransition(async () => {
      try {
        const result = await cancelReservationAction(selectedReservation.id)

        if (result?.error) {
          alert(result.error)
        }
        setShowCancelModal(false)
        setSelectedReservation(null)
      } catch (err) {
        console.error('Error cancelling reservation:', err)
        alert('Une erreur est survenue')
      }
    })
  }

  // Filtrer les réservations
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filteredReservations = reservations.filter((reservation) => {
    const reservationDate = new Date(reservation.date)
    
    if (filter === 'upcoming') {
      return reservation.status === 'confirmed' && reservationDate >= today
    } else if (filter === 'past') {
      return reservation.status === 'confirmed' && reservationDate < today
    } else if (filter === 'cancelled') {
      return reservation.status === 'cancelled'
    }
    return true // 'all'
  })

  // Statistiques
  const upcomingCount = reservations.filter(r => r.status === 'confirmed' && new Date(r.date) >= today).length
  const pastCount = reservations.filter(r => r.status === 'confirmed' && new Date(r.date) < today).length
  const cancelledCount = reservations.filter(r => r.status === 'cancelled').length

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12 max-w-[1400px]">
        {/* Header Premium */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Mes réservations</h1>
              <p className="text-lg text-gray-600 mt-1">Gérez tous vos terrains réservés</p>
            </div>
          </div>
        </div>

        {/* Statistiques Premium - Layout horizontal optimisé */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            {
              label: 'À venir',
              value: upcomingCount,
              gradient: 'bg-slate-800',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            {
              label: 'Passées',
              value: pastCount,
              gradient: 'from-gray-500 to-gray-600',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            {
              label: 'Annulées',
              value: cancelledCount,
              gradient: 'from-red-500 to-red-600',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )
            },
            {
              label: 'Total',
              value: reservations.length,
              gradient: 'bg-slate-800',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )
            },
          ].map((stat, index) => (
            <div key={index} className="group bg-white rounded-3xl p-6 border-2 border-gray-200 hover:border-slate-300 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-1">{stat.label}</p>
              <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filtres Premium */}
        <div className="mb-10 bg-white rounded-3xl p-3 shadow-lg inline-flex gap-2">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-8 py-4 font-bold text-base rounded-2xl transition-all duration-300 ${
              filter === 'upcoming'
                ? 'text-slate-900 bg-slate-200 border border-slate-300'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            📅 À venir ({upcomingCount})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-8 py-4 font-bold text-base rounded-2xl transition-all duration-300 ${
              filter === 'past'
                ? 'text-slate-900 bg-slate-200 border border-slate-300'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            ✓ Passées ({pastCount})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-8 py-4 font-bold text-base rounded-2xl transition-all duration-300 ${
              filter === 'cancelled'
                ? 'text-slate-900 bg-slate-200 border border-slate-300'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            ✕ Annulées ({cancelledCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-8 py-4 font-bold text-base rounded-2xl transition-all duration-300 ${
              filter === 'all'
                ? 'text-slate-900 bg-slate-200 border border-slate-300'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            📋 Toutes ({reservations.length})
          </button>
        </div>

        {/* Liste des réservations - Layout optimisé */}
        {filteredReservations.length > 0 ? (
          <div className="space-y-6">
            {filteredReservations.map((reservation, index) => {
              const reservationDate = new Date(reservation.date)
              const isPast = reservationDate < today
              const isCancelled = reservation.status === 'cancelled'
              const canCancel = !isPast && !isCancelled

              return (
                <div
                  key={reservation.id}
                  className={`group bg-white rounded-3xl overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    isCancelled
                      ? 'border-red-200 bg-red-50/30'
                      : isPast
                      ? 'border-gray-200'
                      : 'border-gray-200 hover:border-slate-300'
                  }`}
                  style={{animationDelay: `${index * 50}ms`}}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Sidebar colorée avec date */}
                    <div className={`w-full md:w-64 p-8 text-white flex flex-col justify-center items-center ${
                      isCancelled 
                        ? 'bg-gradient-to-br from-red-600 to-red-700' 
                        : isPast
                        ? 'bg-gradient-to-br from-gray-600 to-gray-700'
                        : 'bg-slate-800'
                    }`}>
                      <div className="text-center">
                        <p className="text-6xl font-bold mb-2 drop-shadow-lg">
                          {reservationDate.getDate()}
                        </p>
                        <p className="text-xl font-semibold uppercase tracking-wider opacity-90">
                          {reservationDate.toLocaleDateString('fr-FR', { month: 'short' })}
                        </p>
                        <p className="text-sm opacity-75 mt-1">
                          {reservationDate.toLocaleDateString('fr-FR', { year: 'numeric' })}
                        </p>
                        <div className="mt-6 pt-6 border-t border-white/20">
                          <p className="text-sm opacity-75 mb-1">Créneau</p>
                          <p className="text-2xl font-bold">
                            {reservation.start_time.slice(0, 5)}
                          </p>
                          <p className="text-sm opacity-75">à</p>
                          <p className="text-2xl font-bold">
                            {reservation.end_time.slice(0, 5)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Contenu principal - Espacé et organisé */}
                    <div className="flex-1 p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-2xl font-bold text-gray-900">
                              {reservation.courts?.clubs?.name || 'Club inconnu'}
                            </h3>
                            {isCancelled ? (
                              <span className="px-4 py-1.5 bg-red-100 text-red-700 text-sm rounded-full font-bold">
                                Annulée
                              </span>
                            ) : isPast ? (
                              <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full font-bold">
                                Terminée
                              </span>
                            ) : (
                              <span className="px-4 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-full font-bold">
                                Confirmée
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {reservation.courts?.clubs?.city || 'Ville inconnue'}
                          </p>
                        </div>
                      </div>

                      {/* Informations terrain */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-2xl p-5">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Terrain</p>
                          <p className="font-bold text-gray-900 text-lg">{reservation.courts?.name || 'Non spécifié'}</p>
                          <p className="text-sm text-gray-600 mt-1">{reservation.courts?.type || 'Type inconnu'}</p>
                        </div>

                        <div className="bg-white rounded-2xl p-5">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Durée</p>
                          <p className="font-bold text-gray-900 text-lg">
                            {(() => {
                              const start = reservation.start_time.split(':')
                              const end = reservation.end_time.split(':')
                              const duration = (parseInt(end[0]) * 60 + parseInt(end[1])) - (parseInt(start[0]) * 60 + parseInt(start[1]))
                              return `${Math.floor(duration / 60)}h${duration % 60 > 0 ? duration % 60 : ''}`
                            })()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">de jeu</p>
                        </div>

                        <div className="bg-white rounded-2xl p-5">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Paiement</p>
                          {reservation.payment_status === 'paid_on_site' ? (
                            <>
                              <p className="font-bold text-slate-700 text-lg flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Payé
                              </p>
                              <p className="text-sm text-gray-600 mt-1">Sur place</p>
                            </>
                          ) : (
                            <>
                              <p className="font-bold text-slate-700 text-lg">Sur place</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {reservation.courts?.price_per_hour ? `≈ ${reservation.courts.price_per_hour}€/h` : 'Prix à confirmer'}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action button */}
                      {canCancel && (
                        <button
                          onClick={() => {
                            setSelectedReservation(reservation)
                            setShowCancelModal(true)
                          }}
                          disabled={isPending}
                          className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Annuler la réservation
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-300">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Aucune réservation</h3>
            <p className="text-lg text-gray-600 mb-8">Trouvez un club et réservez votre terrain !</p>
            <button
              type="button"
              onClick={() => router.push('/player/clubs')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Trouver un club
            </button>
          </div>
        )}
      </div>

      {/* Modal Annulation Premium */}
      {showCancelModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowCancelModal(false)}>
          <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Annuler la réservation</h3>
            <p className="text-gray-600 mb-8 text-center text-lg">
              Êtes-vous sûr de vouloir annuler votre réservation au <strong>{selectedReservation.courts?.clubs?.name}</strong> le{' '}
              <strong>{new Date(selectedReservation.date).toLocaleDateString('fr-FR')}</strong> ?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl font-bold transition-all"
              >
                Non, garder
              </button>
              <button
                onClick={handleCancelReservation}
                disabled={isPending}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
              >
                {isPending ? 'Annulation...' : 'Oui, annuler'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
