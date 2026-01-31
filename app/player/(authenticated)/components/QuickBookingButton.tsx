'use client'

import { useState } from 'react'

type QuickSlot = {
  id: number
  clubName: string
  time: string
  court: number
  price: number
  availableIn: string
}

export default function QuickBookingButton() {
  const [showModal, setShowModal] = useState(false)

  // Simuler les créneaux disponibles dans moins de 3h
  const quickSlots: QuickSlot[] = [
    {
      id: 1,
      clubName: 'Le Hangar Sport & Co',
      time: '14:30',
      court: 3,
      price: 12,
      availableIn: '45 min'
    },
    {
      id: 2,
      clubName: 'Paul & Louis Sport',
      time: '15:00',
      court: 5,
      price: 13,
      availableIn: '1h15'
    },
    {
      id: 3,
      clubName: 'ZE Padel',
      time: '16:00',
      court: 2,
      price: 11,
      availableIn: '2h'
    },
    {
      id: 4,
      clubName: 'Le Hangar Sport & Co',
      time: '16:30',
      court: 7,
      price: 12,
      availableIn: '2h30'
    },
  ]

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="group relative px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white text-sm font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Réserver rapidement
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">⚡ Réservation rapide</h2>
                  <p className="text-yellow-100 text-sm">Créneaux disponibles dans moins de 3 heures</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Slots List */}
            <div className="p-8 space-y-4">
              {quickSlots.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun créneau disponible</h3>
                  <p className="text-gray-500">Il n'y a pas de créneaux disponibles dans les 3 prochaines heures</p>
                </div>
              ) : (
                quickSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="group bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-6 hover:border-yellow-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {slot.time.split(':')[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{slot.clubName}</h3>
                            <p className="text-sm text-gray-500">Terrain {slot.court}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-yellow-600 font-semibold">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Dans {slot.availableIn}
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {slot.time} - {parseInt(slot.time.split(':')[0]) + 1}h{slot.time.split(':')[1]}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900 mb-2">{slot.price}€</div>
                        <button className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg group-hover:scale-105">
                          Réserver
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

