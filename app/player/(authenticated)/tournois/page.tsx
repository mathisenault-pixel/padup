'use client'

import { useState } from 'react'

type Tournoi = {
  id: number
  nom: string
  club: string
  clubAdresse: string
  date: string
  heureDebut: string
  categorie: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Open'
  format: 'Simple élimination' | 'Poules + élimination' | 'Round Robin'
  nombreEquipes: number
  nombreEquipesMax: number
  prixInscription: number
  dotation: string
  statut: 'Ouvert' | 'Complet' | 'En cours' | 'Terminé'
  inscrit: boolean
  image: string
}

export default function TournoisPage() {
  const [selectedFilter, setSelectedFilter] = useState<'tous' | 'ouverts' | 'inscrits'>('ouverts')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTournoi, setSelectedTournoi] = useState<Tournoi | null>(null)

  const [tournois, setTournois] = useState<Tournoi[]>([
    {
      id: 1,
      nom: 'Tournoi Open Janvier 2025',
      club: 'Le Hangar Sport & Co',
      clubAdresse: 'Rochefort-du-Gard',
      date: '2025-01-25',
      heureDebut: '09:00',
      categorie: 'Open',
      format: 'Poules + élimination',
      nombreEquipes: 14,
      nombreEquipesMax: 16,
      prixInscription: 40,
      dotation: '500€ + Trophées',
      statut: 'Ouvert',
      inscrit: false,
      image: '🏆'
    },
    {
      id: 2,
      nom: 'Challenge Intermédiaire',
      club: 'Paul & Louis Sport',
      clubAdresse: 'Le Pontet',
      date: '2025-01-28',
      heureDebut: '10:00',
      categorie: 'Intermédiaire',
      format: 'Simple élimination',
      nombreEquipes: 12,
      nombreEquipesMax: 16,
      prixInscription: 30,
      dotation: '300€ + Trophées',
      statut: 'Ouvert',
      inscrit: true,
      image: '🎯'
    },
    {
      id: 3,
      nom: 'Tournoi Débutants - Initiation',
      club: 'ZE Padel',
      clubAdresse: 'Boulbon',
      date: '2025-02-01',
      heureDebut: '14:00',
      categorie: 'Débutant',
      format: 'Round Robin',
      nombreEquipes: 6,
      nombreEquipesMax: 8,
      prixInscription: 20,
      dotation: 'Médailles + Cadeaux',
      statut: 'Ouvert',
      inscrit: false,
      image: '🌟'
    },
    {
      id: 4,
      nom: 'Masters Padel',
      club: 'QG Padel Club',
      clubAdresse: 'Saint-Laurent-des-Arbres',
      date: '2025-02-05',
      heureDebut: '08:00',
      categorie: 'Avancé',
      format: 'Poules + élimination',
      nombreEquipes: 16,
      nombreEquipesMax: 16,
      prixInscription: 50,
      dotation: '1000€ + Trophées',
      statut: 'Complet',
      inscrit: false,
      image: '💎'
    },
    {
      id: 5,
      nom: 'Open de la Région - Hiver',
      club: 'Le Hangar Sport & Co',
      clubAdresse: 'Rochefort-du-Gard',
      date: '2025-02-08',
      heureDebut: '09:00',
      categorie: 'Open',
      format: 'Poules + élimination',
      nombreEquipes: 18,
      nombreEquipesMax: 24,
      prixInscription: 45,
      dotation: '1500€ + Trophées + Lots',
      statut: 'Ouvert',
      inscrit: true,
      image: '👑'
    },
    {
      id: 6,
      nom: 'Tournoi Friendly Mix',
      club: 'Paul & Louis Sport',
      clubAdresse: 'Le Pontet',
      date: '2025-02-10',
      heureDebut: '11:00',
      categorie: 'Intermédiaire',
      format: 'Round Robin',
      nombreEquipes: 8,
      nombreEquipesMax: 12,
      prixInscription: 25,
      dotation: '200€ + Trophées',
      statut: 'Ouvert',
      inscrit: false,
      image: '🎉'
    },
  ])

  const toggleInscription = (tournoiId: number) => {
    const tournoi = tournois.find(t => t.id === tournoiId)
    if (tournoi) {
      if (tournoi.inscrit) {
        if (confirm(`Êtes-vous sûr de vouloir vous désinscrire du tournoi "${tournoi.nom}" ?\n\n⚠️ Votre place sera libérée pour d'autres joueurs.`)) {
          setTournois(tournois.map(t => 
            t.id === tournoiId ? { ...t, inscrit: false } : t
          ))
          alert('Désinscription confirmée ✓')
        }
      } else {
        setTournois(tournois.map(t => 
          t.id === tournoiId ? { ...t, inscrit: true, nombreEquipes: t.nombreEquipes + 1 } : t
        ))
        alert(`Inscription confirmée au tournoi "${tournoi.nom}" ! 🎾\nVous recevrez un email de confirmation.`)
      }
    }
  }

  const handleVoirDetails = (tournoi: Tournoi) => {
    setSelectedTournoi(tournoi)
    setShowDetailsModal(true)
  }

  const filteredTournois = tournois.filter(tournoi => {
    if (selectedFilter === 'ouverts') return tournoi.statut === 'Ouvert' || tournoi.statut === 'Complet'
    if (selectedFilter === 'inscrits') return tournoi.inscrit
    return true
  })

  const getCategorieColor = (categorie: string) => {
    switch (categorie) {
      case 'Débutant': return 'bg-slate-700'
      case 'Intermédiaire': return 'bg-slate-800'
      case 'Avancé': return 'bg-slate-900'
      case 'Open': return 'bg-slate-950'
      default: return 'bg-slate-700'
    }
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Ouvert': return 'bg-green-100 text-green-800 border-green-200'
      case 'Complet': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'En cours': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Terminé': return 'bg-slate-100 text-slate-800 border-slate-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long'
    }).format(date)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Tournois</h1>
          <p className="text-slate-600 mt-2">
            {tournois.filter(t => t.inscrit).length} inscription{tournois.filter(t => t.inscrit).length > 1 ? 's' : ''} en cours
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center">
          <svg className="w-8 h-8 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <p className="text-3xl font-bold text-slate-900">{tournois.filter(t => t.statut === 'Ouvert').length}</p>
          <p className="text-sm text-slate-600">Ouverts</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center">
          <svg className="w-8 h-8 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-3xl font-bold text-slate-900">{tournois.filter(t => t.inscrit).length}</p>
          <p className="text-sm text-slate-600">Inscrits</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center">
          <svg className="w-8 h-8 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-3xl font-bold text-slate-900">{tournois.length}</p>
          <p className="text-sm text-slate-600">À venir</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center">
          <svg className="w-8 h-8 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-3xl font-bold text-slate-900">
            {tournois.filter(t => t.inscrit).reduce((acc, t) => acc + t.prixInscription, 0)}€
          </p>
          <p className="text-sm text-slate-600">Engagés</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 bg-white rounded-xl p-2 border border-slate-200 shadow-sm">
        <button
          onClick={() => setSelectedFilter('tous')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            selectedFilter === 'tous'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Tous ({tournois.length})
        </button>
        <button
          onClick={() => setSelectedFilter('ouverts')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            selectedFilter === 'ouverts'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Ouverts ({tournois.filter(t => t.statut === 'Ouvert' || t.statut === 'Complet').length})
        </button>
        <button
          onClick={() => setSelectedFilter('inscrits')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            selectedFilter === 'inscrits'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Mes inscriptions ({tournois.filter(t => t.inscrit).length})
        </button>
      </div>

      {/* Tournois Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTournois.map((tournoi) => (
          <div
            key={tournoi.id}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${getCategorieColor(tournoi.categorie)} text-white rounded-xl flex items-center justify-center text-3xl shadow-md`}>
                  {tournoi.image}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{tournoi.nom}</h3>
                  <p className="text-sm text-slate-600">{tournoi.club}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatutColor(tournoi.statut)}`}>
                {tournoi.statut}
              </span>
            </div>

            {/* Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-slate-700">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium capitalize text-sm">{formatDate(tournoi.date)}</span>
                <span className="ml-auto text-slate-900 font-semibold text-sm">{tournoi.heureDebut}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium text-sm">{tournoi.clubAdresse}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1.5 ${getCategorieColor(tournoi.categorie)} text-white rounded-lg font-semibold text-sm shadow-sm`}>
                  {tournoi.categorie}
                </span>
                <span className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg font-medium text-sm border border-slate-200">
                  {tournoi.format}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Équipes</p>
                  <p className="text-lg font-bold text-slate-900">
                    {tournoi.nombreEquipes}/{tournoi.nombreEquipesMax}
                  </p>
                  <div className="mt-2 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-slate-700 to-slate-900 h-2 rounded-full transition-all"
                      style={{ width: `${(tournoi.nombreEquipes / tournoi.nombreEquipesMax) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Inscription</p>
                  <p className="text-lg font-bold text-slate-900">{tournoi.prixInscription}€</p>
                  <p className="text-xs text-slate-500 mt-1">par équipe</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-600 font-semibold mb-1">Dotation</p>
                <p className="text-sm font-bold text-slate-900">{tournoi.dotation}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {tournoi.inscrit ? (
                <>
                  <button
                    onClick={() => toggleInscription(tournoi.id)}
                    className="flex-1 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-all border border-red-200 text-sm"
                  >
                    Se désinscrire
                  </button>
                  <button 
                    onClick={() => handleVoirDetails(tournoi)}
                    className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-all border border-blue-200 text-sm"
                  >
                    Détails
                  </button>
                </>
              ) : (
                <>
                  {tournoi.statut === 'Ouvert' ? (
                    <button
                      onClick={() => toggleInscription(tournoi.id)}
                      className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all shadow-sm text-sm"
                    >
                      S&apos;inscrire
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-400 rounded-lg font-medium cursor-not-allowed text-sm"
                    >
                      Complet
                    </button>
                  )}
                  <button 
                    onClick={() => handleVoirDetails(tournoi)}
                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-medium transition-all border border-slate-200 text-sm"
                  >
                    Voir
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTournois.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <p className="text-xl font-semibold text-slate-700">Aucun tournoi trouvé</p>
          <p className="text-slate-500 mt-2">Modifiez vos filtres pour voir plus de résultats</p>
        </div>
      )}

      {/* Modal Détails Tournoi */}
      {showDetailsModal && selectedTournoi && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${getCategorieColor(selectedTournoi.categorie)} text-white rounded-xl flex items-center justify-center text-4xl shadow-md`}>
                  {selectedTournoi.image}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{selectedTournoi.nom}</h3>
                  <p className="text-slate-600">{selectedTournoi.club}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Statut */}
              <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4 border border-slate-200">
                <span className="font-semibold text-slate-700">Statut</span>
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getStatutColor(selectedTournoi.statut)}`}>
                  {selectedTournoi.statut}
                </span>
              </div>

              {/* Informations principales */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-1">📅 Date</p>
                  <p className="font-bold text-slate-900 capitalize">{formatDate(selectedTournoi.date)}</p>
                  <p className="text-sm text-slate-600 mt-1">Début à {selectedTournoi.heureDebut}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-1">📍 Lieu</p>
                  <p className="font-bold text-slate-900">{selectedTournoi.club}</p>
                  <p className="text-sm text-slate-600 mt-1">{selectedTournoi.clubAdresse}</p>
                </div>
              </div>

              {/* Catégorie et Format */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-2">Catégorie</p>
                  <span className={`px-4 py-2 ${getCategorieColor(selectedTournoi.categorie)} text-white rounded-lg font-bold inline-block shadow-sm`}>
                    {selectedTournoi.categorie}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-2">Format</p>
                  <p className="font-bold text-slate-900">{selectedTournoi.format}</p>
                </div>
              </div>

              {/* Participants et Prix */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-2">Équipes inscrites</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {selectedTournoi.nombreEquipes}/{selectedTournoi.nombreEquipesMax}
                  </p>
                  <div className="mt-3 bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-slate-700 to-slate-900 h-3 rounded-full transition-all"
                      style={{ width: `${(selectedTournoi.nombreEquipes / selectedTournoi.nombreEquipesMax) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-2">Prix d'inscription</p>
                  <p className="text-3xl font-bold text-slate-900">{selectedTournoi.prixInscription}€</p>
                  <p className="text-sm text-slate-600 mt-1">par équipe</p>
                </div>
              </div>

              {/* Dotation */}
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                <p className="text-sm text-amber-800 font-semibold mb-2">🏆 Dotation</p>
                <p className="text-xl font-bold text-amber-900">{selectedTournoi.dotation}</p>
              </div>

              {/* Informations complémentaires */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-600 font-semibold mb-3">ℹ️ Informations pratiques</p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Arrivée recommandée 30 minutes avant le début</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Vestiaires et douches disponibles sur place</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Bar et restauration sur place</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Parking gratuit disponible</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-all"
                >
                  Fermer
                </button>
                {!selectedTournoi.inscrit && selectedTournoi.statut === 'Ouvert' && (
                  <button
                    onClick={() => {
                      toggleInscription(selectedTournoi.id)
                      setShowDetailsModal(false)
                    }}
                    className="flex-1 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all shadow-sm"
                  >
                    S&apos;inscrire maintenant
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
