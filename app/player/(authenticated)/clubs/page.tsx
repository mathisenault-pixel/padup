'use client'

import { useState } from 'react'

type Club = {
  id: number
  nom: string
  adresse: string
  ville: string
  distance: string
  nombreTerrains: number
  interieur: number
  exterieur: number
  note: number
  avis: number
  photo: string
  imageUrl: string
  prixMin: number
  prixMax: number
  horaires: string
  equipements: string[]
  favoris: boolean
}

export default function ClubsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'tous' | 'favoris' | 'proches'>('tous')
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)

  const [clubs, setClubs] = useState<Club[]>([
    {
      id: 1,
      nom: 'Le Hangar Sport & Co',
      adresse: '370 Allées des Issards',
      ville: 'Rochefort-du-Gard (près d\'Avignon)',
      distance: '5 min d\'Avignon',
      nombreTerrains: 8,
      interieur: 8,
      exterieur: 0,
      note: 4.8,
      avis: 245,
      photo: '🏗️',
      imageUrl: '/images/clubs/le-hangar.jpg',
      prixMin: 35,
      prixMax: 55,
      horaires: '9h-00h (9h-20h week-end)',
      equipements: ['Vestiaires', 'Douches', 'Club House', 'Terrasse', 'Pétanque', 'Ping-pong', 'Baby-foot', 'Badminton', 'Foot à 5'],
      favoris: true
    },
    {
      id: 2,
      nom: 'Paul & Louis Sport',
      adresse: '255 Rue des Tonneliers',
      ville: 'Le Pontet (près d\'Avignon)',
      distance: '10 min d\'Avignon',
      nombreTerrains: 8,
      interieur: 4,
      exterieur: 4,
      note: 4.7,
      avis: 189,
      photo: '🎾',
      imageUrl: '/images/clubs/paul-louis.jpg',
      prixMin: 40,
      prixMax: 60,
      horaires: '9h-23h',
      equipements: ['Vestiaires', 'Douches', 'Restaurant Italien', 'Salle Fitness', 'Cours Collectifs', 'Coaching', 'Salle de Réunion'],
      favoris: false
    },
    {
      id: 3,
      nom: 'ZE Padel',
      adresse: 'Z.A du Colombier, Rue des Micocouliers',
      ville: 'Boulbon',
      distance: '20 min d\'Avignon',
      nombreTerrains: 6,
      interieur: 4,
      exterieur: 2,
      note: 4.6,
      avis: 127,
      photo: '⚡',
      imageUrl: '/images/clubs/ze-padel.jpg',
      prixMin: 9,
      prixMax: 13,
      horaires: 'Ouvert toute l\'année',
      equipements: ['Vestiaires PMR', 'Bar', 'Snack', 'TV', 'Coworking', 'Séminaires', 'Cours de padel'],
      favoris: true
    },
    {
      id: 4,
      nom: 'QG Padel Club',
      adresse: '239 Rue des Entrepreneurs',
      ville: 'Saint-Laurent-des-Arbres',
      distance: '15 min d\'Avignon',
      nombreTerrains: 4,
      interieur: 4,
      exterieur: 0,
      note: 4.7,
      avis: 98,
      photo: '🏟️',
      imageUrl: '/images/clubs/qg-padel.jpg',
      prixMin: 12,
      prixMax: 13,
      horaires: '9h-23h',
      equipements: ['Vestiaires', 'Douches', 'Snacking local', 'Retransmission sportive', 'Cours avec pro', 'Application dédiée'],
      favoris: false
    },
  ])

  const toggleFavoris = (clubId: number) => {
    setClubs(clubs.map(club => 
      club.id === clubId ? { ...club, favoris: !club.favoris } : club
    ))
    const club = clubs.find(c => c.id === clubId)
    if (club) {
      alert(club.favoris ? `${club.nom} retiré des favoris` : `${club.nom} ajouté aux favoris ✨`)
    }
  }

  const handleReserver = (club: Club) => {
    setSelectedClub(club)
    setShowReservationModal(true)
  }

  const confirmReservation = () => {
    if (selectedClub) {
      alert(`Réservation confirmée au ${selectedClub.nom} ! 🎾\nVous allez recevoir un email de confirmation.`)
      setShowReservationModal(false)
      setSelectedClub(null)
    }
  }

  const filteredClubs = clubs
    .filter(club => {
      const matchSearch = club.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.ville.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (selectedFilter === 'favoris') return matchSearch && club.favoris
      if (selectedFilter === 'proches') return matchSearch && parseFloat(club.distance) <= 3
      return matchSearch
    })
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Clubs Premium</h1>
          <p className="text-slate-600 mt-2">{filteredClubs.length} établissements disponibles</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un club ou une ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none text-slate-900"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedFilter('tous')}
              className={`px-5 py-3 rounded-lg font-medium transition-all ${
                selectedFilter === 'tous'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedFilter('proches')}
              className={`px-5 py-3 rounded-lg font-medium transition-all ${
                selectedFilter === 'proches'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Proximité
            </button>
            <button
              onClick={() => setSelectedFilter('favoris')}
              className={`px-5 py-3 rounded-lg font-medium transition-all ${
                selectedFilter === 'favoris'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Favoris
            </button>
          </div>
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClubs.map((club) => (
          <div
            key={club.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
          >
            {/* Image Header */}
            <div className="relative h-56 overflow-hidden border-b border-slate-200">
              <img 
                src={club.imageUrl} 
                alt={club.nom}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <button
                onClick={() => toggleFavoris(club.id)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-110"
              >
                <svg 
                  className={`w-5 h-5 ${club.favoris ? 'text-amber-500 fill-current' : 'text-slate-400'}`} 
                  fill={club.favoris ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Title */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{club.nom}</h3>
                  <p className="text-sm text-slate-600">{club.ville}</p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">{club.adresse}</span>
                  <span className="ml-auto text-slate-900 font-semibold text-sm">{club.distance}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold text-slate-900">{club.note}</span>
                    <span className="text-slate-500 text-xs">({club.avis} avis)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="font-medium text-sm">{club.nombreTerrains} terrains</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md font-medium border border-blue-200">
                    {club.interieur} intérieurs
                  </span>
                  <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-md font-medium border border-green-200">
                    {club.exterieur} extérieurs
                  </span>
                  <span className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-md font-medium border border-slate-200">
                    {club.horaires}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {club.equipements.slice(0, 4).map((eq, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 bg-slate-50 text-slate-600 rounded-md font-medium border border-slate-200">
                      {eq}
                    </span>
                  ))}
                  {club.equipements.length > 4 && (
                    <span className="text-xs px-2.5 py-1 bg-slate-50 text-slate-600 rounded-md font-medium border border-slate-200">
                      +{club.equipements.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Price & CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div>
                  <p className="text-xs text-slate-500">À partir de</p>
                  <p className="text-2xl font-bold text-slate-900">{club.prixMin}€<span className="text-sm text-slate-500 font-normal">/heure</span></p>
                </div>
                <button 
                  onClick={() => handleReserver(club)}
                  className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all shadow-sm hover:shadow-md"
                >
                  Réserver
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClubs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl font-semibold text-slate-700">Aucun club trouvé</p>
          <p className="text-slate-500 mt-2">Essayez de modifier vos filtres</p>
        </div>
      )}

      {/* Modal de réservation */}
      {showReservationModal && selectedClub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-slate-900">Réserver un terrain</h3>
              <button 
                onClick={() => setShowReservationModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">Club sélectionné</p>
                <p className="text-lg font-bold text-slate-900">{selectedClub.nom}</p>
                <p className="text-sm text-slate-600">{selectedClub.ville}</p>
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

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">Prix estimé</span>
                  <span className="font-bold text-slate-900">{selectedClub.prixMin}€</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowReservationModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmReservation}
                  className="flex-1 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all shadow-sm"
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
