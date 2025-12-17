'use client'

import { useState } from 'react'

type Reservation = {
  id: number
  clubNom: string
  clubAdresse: string
  date: string
  heureDebut: string
  heureFin: string
  terrain: string
  prix: number
  statut: 'Confirmée' | 'En attente' | 'Annulée' | 'Terminée'
  participants: string[]
  typeReservation: 'Match' | 'Entraînement' | 'Tournoi'
}

export default function ReservationsPage() {
  const [selectedTab, setSelectedTab] = useState<'prochaines' | 'passees'>('prochaines')
  const [showNewReservation, setShowNewReservation] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [rating, setRating] = useState(0)

  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 1,
      clubNom: 'Le Hangar Sport & Co',
      clubAdresse: 'Rochefort-du-Gard',
      date: '2025-01-22',
      heureDebut: '18:00',
      heureFin: '19:30',
      terrain: 'Terrain 3',
      prix: 45,
      statut: 'Confirmée',
      participants: ['Marie Martin', 'Pierre Durand', 'Sophie Bernard'],
      typeReservation: 'Match'
    },
    {
      id: 2,
      clubNom: 'Paul & Louis Sport',
      clubAdresse: 'Le Pontet',
      date: '2025-01-25',
      heureDebut: '20:00',
      heureFin: '21:30',
      terrain: 'Terrain 5',
      prix: 50,
      statut: 'Confirmée',
      participants: ['Luc Petit', 'Emma Dubois'],
      typeReservation: 'Match'
    },
    {
      id: 3,
      clubNom: 'ZE Padel',
      clubAdresse: 'Boulbon',
      date: '2025-01-28',
      heureDebut: '10:00',
      heureFin: '11:30',
      terrain: 'Terrain 1',
      prix: 35,
      statut: 'En attente',
      participants: ['Thomas Roux'],
      typeReservation: 'Entraînement'
    },
    {
      id: 4,
      clubNom: 'QG Padel Club',
      clubAdresse: 'Saint-Laurent-des-Arbres',
      date: '2025-02-01',
      heureDebut: '14:00',
      heureFin: '18:00',
      terrain: 'Terrains 1-4',
      prix: 120,
      statut: 'Confirmée',
      participants: ['15 joueurs inscrits'],
      typeReservation: 'Tournoi'
    },
    {
      id: 5,
      clubNom: 'Le Hangar Sport & Co',
      clubAdresse: 'Rochefort-du-Gard',
      date: '2025-01-18',
      heureDebut: '19:00',
      heureFin: '20:30',
      terrain: 'Terrain 2',
      prix: 45,
      statut: 'Terminée',
      participants: ['Marie Martin', 'Sophie Bernard', 'Luc Petit'],
      typeReservation: 'Match'
    },
    {
      id: 6,
      clubNom: 'Paul & Louis Sport',
      clubAdresse: 'Le Pontet',
      date: '2025-01-15',
      heureDebut: '16:00',
      heureFin: '17:30',
      terrain: 'Terrain 7',
      prix: 48,
      statut: 'Terminée',
      participants: ['Pierre Durand', 'Emma Dubois'],
      typeReservation: 'Match'
    },
    {
      id: 7,
      clubNom: 'ZE Padel',
      clubAdresse: 'Boulbon',
      date: '2025-01-12',
      heureDebut: '11:00',
      heureFin: '12:30',
      terrain: 'Terrain 4',
      prix: 38,
      statut: 'Annulée',
      participants: ['Thomas Roux', 'Marc Lefebvre'],
      typeReservation: 'Match'
    },
  ])

  const prochaines = reservations.filter(r => 
    r.statut === 'Confirmée' || r.statut === 'En attente'
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const passees = reservations.filter(r => 
    r.statut === 'Terminée' || r.statut === 'Annulée'
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Confirmée': return 'bg-green-100 text-green-800 border-green-200'
      case 'En attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Annulée': return 'bg-red-100 text-red-800 border-red-200'
      case 'Terminée': return 'bg-slate-100 text-slate-800 border-slate-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Match': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
      case 'Entraînement': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
      case 'Tournoi': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
      default: return null
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const currentReservations = selectedTab === 'prochaines' ? prochaines : passees

  const handleItineraire = (reservation: Reservation) => {
    const address = encodeURIComponent(`${reservation.clubNom}, ${reservation.clubAdresse}`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank')
  }

  const handleModifier = (reservation: Reservation) => {
    alert(`Modification de la réservation #${reservation.id}\n${reservation.clubNom}\nFonctionnalité en développement 🛠️`)
  }

  const handleAnnuler = (reservation: Reservation) => {
    if (confirm(`Êtes-vous sûr de vouloir annuler cette réservation au ${reservation.clubNom} ?\n\nDate: ${formatDate(reservation.date)}\nHoraire: ${reservation.heureDebut} - ${reservation.heureFin}\n\n⚠️ Cette action est irréversible.`)) {
      setReservations(reservations.map(r => 
        r.id === reservation.id ? { ...r, statut: 'Annulée' as const } : r
      ))
      alert('Réservation annulée avec succès ✓')
    }
  }

  const handleNoter = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setRating(0)
    setShowRatingModal(true)
  }

  const submitRating = () => {
    if (rating === 0) {
      alert('Veuillez sélectionner une note')
      return
    }
    if (selectedReservation) {
      alert(`Merci pour votre note de ${rating}⭐ pour ${selectedReservation.clubNom} !`)
      setShowRatingModal(false)
      setSelectedReservation(null)
      setRating(0)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Mes Réservations</h1>
          <p className="text-slate-600 mt-2">
            {prochaines.length} réservation{prochaines.length > 1 ? 's' : ''} à venir
          </p>
        </div>
        <button
          onClick={() => setShowNewReservation(true)}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
        >
          Nouvelle réservation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center">
          <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-3xl font-bold text-green-600">{prochaines.filter(r => r.statut === 'Confirmée').length}</p>
          <p className="text-sm text-slate-600">Confirmées</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center">
          <svg className="w-8 h-8 text-yellow-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-3xl font-bold text-yellow-600">{prochaines.filter(r => r.statut === 'En attente').length}</p>
          <p className="text-sm text-slate-600">En attente</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center">
          <svg className="w-8 h-8 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-3xl font-bold text-slate-900">{passees.filter(r => r.statut === 'Terminée').length}</p>
          <p className="text-sm text-slate-600">Jouées</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center">
          <svg className="w-8 h-8 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-3xl font-bold text-slate-900">
            {reservations.filter(r => r.statut !== 'Annulée').reduce((acc, r) => acc + r.prix, 0)}€
          </p>
          <p className="text-sm text-slate-600">Dépensés</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl p-2 border border-slate-200 shadow-sm">
        <button
          onClick={() => setSelectedTab('prochaines')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            selectedTab === 'prochaines'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Prochaines ({prochaines.length})
        </button>
        <button
          onClick={() => setSelectedTab('passees')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            selectedTab === 'passees'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Historique ({passees.length})
        </button>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {currentReservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Info principale */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                    {getTypeIcon(reservation.typeReservation)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{reservation.clubNom}</h3>
                    <p className="text-sm text-slate-600">{reservation.clubAdresse}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatutColor(reservation.statut)}`}>
                    {reservation.statut}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Date</p>
                    <p className="font-semibold text-slate-900">{formatDate(reservation.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Horaire</p>
                    <p className="font-semibold text-slate-900">{reservation.heureDebut} - {reservation.heureFin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Terrain</p>
                    <p className="font-semibold text-slate-900">{reservation.terrain}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Prix</p>
                    <p className="font-bold text-slate-900 text-lg">{reservation.prix}€</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium text-slate-600">Participants:</span>
                  {reservation.participants.map((participant, idx) => (
                    <span key={idx} className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-md font-medium border border-slate-200">
                      {participant}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-2">
                {reservation.statut === 'Confirmée' && (
                  <>
                    <button 
                      onClick={() => handleItineraire(reservation)}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-all border border-blue-200 text-sm"
                    >
                      Itinéraire
                    </button>
                    <button 
                      onClick={() => handleModifier(reservation)}
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-medium transition-all border border-slate-200 text-sm"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleAnnuler(reservation)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-all border border-red-200 text-sm"
                    >
                      Annuler
                    </button>
                  </>
                )}
                {reservation.statut === 'Terminée' && (
                  <button 
                    onClick={() => handleNoter(reservation)}
                    className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-medium transition-all border border-amber-200 text-sm"
                  >
                    Noter
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentReservations.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xl font-semibold text-slate-700">Aucune réservation</p>
          <p className="text-slate-500 mt-2">
            {selectedTab === 'prochaines' ? 'Réservez votre prochain match !' : 'Votre historique est vide'}
          </p>
        </div>
      )}

      {/* Modal de notation */}
      {showRatingModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-slate-900">Noter votre expérience</h3>
              <button 
                onClick={() => setShowRatingModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">Club</p>
                <p className="text-lg font-bold text-slate-900">{selectedReservation.clubNom}</p>
                <p className="text-sm text-slate-600">{formatDate(selectedReservation.date)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Votre note</label>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <svg 
                        className={`w-12 h-12 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center mt-2 text-slate-600">
                    {rating === 1 && 'Décevant'}
                    {rating === 2 && 'Moyen'}
                    {rating === 3 && 'Correct'}
                    {rating === 4 && 'Très bien'}
                    {rating === 5 && 'Excellent !'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Commentaire (optionnel)</label>
                <textarea 
                  placeholder="Partagez votre expérience..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none resize-none text-slate-900"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={submitRating}
                  className="flex-1 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all shadow-sm"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal nouvelle réservation */}
      {showNewReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-slate-900">Nouvelle réservation</h3>
              <button 
                onClick={() => setShowNewReservation(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Club</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none text-slate-900">
                  <option>Le Hangar Sport & Co</option>
                  <option>Paul & Louis Sport</option>
                  <option>ZE Padel</option>
                  <option>QG Padel Club</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Heure</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none text-slate-900">
                  <option>09:00</option>
                  <option>10:30</option>
                  <option>12:00</option>
                  <option>14:00</option>
                  <option>15:30</option>
                  <option>17:00</option>
                  <option>18:30</option>
                  <option>20:00</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Durée</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none text-slate-900">
                  <option>1h30</option>
                  <option>2h00</option>
                  <option>3h00</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowNewReservation(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    alert('Réservation créée avec succès ! 🎾')
                    setShowNewReservation(false)
                  }}
                  className="flex-1 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all shadow-sm"
                >
                  Réserver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
