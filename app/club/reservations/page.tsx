'use client'

import { useEffect, useState } from 'react'
import { getClubSession } from '@/lib/clubAuth'
import { useReservationsStore, type Reservation, type BlockedSlot } from '@/store/reservationsStore'

export default function ClubReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [activeTab, setActiveTab] = useState<'reservations' | 'blocks'>('reservations')

  const {
    getReservationsByClub,
    getBlockedSlotsByClub,
    cancelReservation,
    unblockSlot,
  } = useReservationsStore()

  useEffect(() => {
    const session = getClubSession()
    if (!session) return

    loadData(session.clubId)
  }, [])

  const loadData = (clubId: string) => {
    const res = getReservationsByClub(clubId)
    const blocks = getBlockedSlotsByClub(clubId)
    setReservations(res)
    setBlockedSlots(blocks)
  }

  const handleCancelReservation = (reservationId: string) => {
    if (!confirm('Voulez-vous vraiment annuler cette réservation ?')) return

    cancelReservation(reservationId)
    const session = getClubSession()
    if (session) {
      loadData(session.clubId)
    }
  }

  const handleUnblock = (blockId: string) => {
    if (!confirm('Voulez-vous vraiment débloquer ce créneau ?')) return

    unblockSlot(blockId)
    const session = getClubSession()
    if (session) {
      loadData(session.clubId)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5) // HH:mm
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Réservations</h1>
        <p className="text-gray-600">Gérez les réservations et blocages de créneaux</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('reservations')}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'reservations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Réservations ({reservations.filter(r => r.status === 'confirmed').length})
        </button>
        <button
          onClick={() => setActiveTab('blocks')}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'blocks'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Créneaux bloqués ({blockedSlots.length})
        </button>
      </div>

      {/* Réservations Tab */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          {reservations.filter(r => r.status === 'confirmed').length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune réservation</h3>
              <p className="text-gray-600">Les réservations apparaîtront ici</p>
            </div>
          ) : (
            reservations
              .filter(r => r.status === 'confirmed')
              .map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{reservation.playerName}</h3>
                          <p className="text-sm text-gray-600">{reservation.playerEmail}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">Date</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(reservation.date)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">Horaire</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">Créneau</p>
                          <p className="text-sm font-medium text-gray-900">{reservation.slotId}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Confirmée
                        </span>
                        <span className="text-xs text-gray-500">
                          Court: {reservation.courtId.split('-').pop()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCancelReservation(reservation.id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Annuler
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* Blocked Slots Tab */}
      {activeTab === 'blocks' && (
        <div className="space-y-4">
          {blockedSlots.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun créneau bloqué</h3>
              <p className="text-gray-600">Vous pouvez bloquer des créneaux pour maintenance ou événements</p>
            </div>
          ) : (
            blockedSlots.map((block) => (
              <div
                key={block.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-orange-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{block.reason}</h3>
                        <p className="text-sm text-gray-600">Créneau bloqué</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Date</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(block.date)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Horaire</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatTime(block.startTime)} - {formatTime(block.endTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Créneau</p>
                        <p className="text-sm font-medium text-gray-900">{block.slotId}</p>
                      </div>
                    </div>

                    <span className="text-xs text-gray-500">
                      Court: {block.courtId.split('-').pop()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleUnblock(block.id)}
                    className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 font-medium rounded-lg transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Débloquer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Synchronisation en temps réel</p>
            <p className="text-sm text-blue-700">
              Les annulations sont instantanées. Les créneaux annulés redeviennent immédiatement disponibles côté joueur.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
