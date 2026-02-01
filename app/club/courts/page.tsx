'use client'

import { useEffect, useState } from 'react'
import { getClubSession } from '@/lib/clubAuth'
import { getClubById, type Court } from '@/lib/data/clubs'

export default function ClubCourtsPage() {
  const [courts, setCourts] = useState<Court[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const session = getClubSession()
    if (!session) return

    const club = getClubById(session.clubId)
    if (club) {
      setCourts(club.courts)
    }
    setIsLoading(false)
  }, [])

  const handleToggleActive = (courtId: string) => {
    setCourts(prev =>
      prev.map(court =>
        court.id === courtId ? { ...court, isActive: !court.isActive } : court
      )
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terrains</h1>
          <p className="text-gray-600">Gérez les terrains de votre club</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{courts.length}</p>
          <p className="text-sm text-gray-600">Terrains</p>
        </div>
      </div>

      {/* Courts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courts.map((court) => (
          <div
            key={court.id}
            className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all ${
              court.isActive ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{court.name}</h3>
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    court.type === 'indoor'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {court.type === 'indoor' ? 'Couvert' : 'Extérieur'}
                </span>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  court.isActive ? 'bg-green-500' : 'bg-gray-300'
                }`}
              ></div>
            </div>

            {/* Price */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Tarif</p>
              <p className="text-2xl font-bold text-gray-900">
                {court.pricePerHour}€
                <span className="text-base text-gray-500 font-normal"> / heure</span>
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => handleToggleActive(court.id)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                  court.isActive
                    ? 'bg-orange-50 hover:bg-orange-100 text-orange-600'
                    : 'bg-green-50 hover:bg-green-100 text-green-600'
                }`}
              >
                {court.isActive ? 'Désactiver' : 'Activer'}
              </button>
            </div>

            {/* Status badge */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${court.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm font-medium text-gray-600">
                  {court.isActive ? 'Disponible pour réservations' : 'Temporairement fermé'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Note (MVP) */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Mode MVP (front-only)</p>
            <p className="text-sm text-blue-700">
              Les modifications sont locales et temporaires. En production, les données seront sauvegardées dans Supabase.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
