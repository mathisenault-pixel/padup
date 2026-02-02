'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import SmartSearchBar from '../components/SmartSearchBar'
import { debug } from '@/lib/debug'
import { useUserLocation } from '@/hooks/useUserLocation'
import { haversineKm, formatDistance, estimateMinutes, formatTravelTime } from '@/lib/geoUtils'

type Tournoi = {
  id: number
  nom: string
  club: string
  clubAdresse: string
  date: string
  heureDebut: string
  categorie: 'P25' | 'P100' | 'P250' | 'P500' | 'P1000' | 'P1500' | 'P2000'
  genre: 'Hommes' | 'Femmes' | 'Mixte'
  format: string
  nombreEquipes: number
  nombreEquipesMax: number
  prixInscription: number
  dotation: string
  statut: 'Ouvert' | 'Complet' | 'En cours' | 'Terminé'
  inscrit: boolean
  image: string
  lat: number
  lng: number
  distanceKm?: number
  distanceMinutes?: number
}

/**
 * Coordonnées GPS des clubs (pour calculer les distances des tournois)
 */
const CLUB_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Le Hangar Sport & Co': { lat: 43.9781, lng: 4.6911 }, // Rochefort-du-Gard
  'Paul & Louis Sport': { lat: 43.9608, lng: 4.8583 }, // Le Pontet
  'ZE Padel': { lat: 43.8519, lng: 4.7111 }, // Boulbon
  'QG Padel Club': { lat: 44.0528, lng: 4.6981 }, // Saint-Laurent-des-Arbres
}

export default function TournoisPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'tous' | 'ouverts' | 'inscrits'>('ouverts')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'date' | 'distance'>('date')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTournoi, setSelectedTournoi] = useState<Tournoi | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [tournoiToConfirm, setTournoiToConfirm] = useState<Tournoi | null>(null)

  // Géolocalisation
  const { coords: userCoords, status: locationStatus, error: locationError, requestLocation } = useUserLocation()

  const [tournois, setTournois] = useState<Tournoi[]>([
    {
      id: 1,
      nom: 'Tournoi P1000 Hommes',
      club: 'Le Hangar Sport & Co',
      clubAdresse: 'Rochefort-du-Gard',
      date: '2026-01-25',
      heureDebut: '09:00',
      categorie: 'P1000',
      genre: 'Hommes',
      format: 'Format B1',
      nombreEquipes: 14,
      nombreEquipesMax: 16,
      prixInscription: 20,
      dotation: '500€ + Trophées',
      statut: 'Ouvert',
      inscrit: false,
      image: '/images/clubs/le-hangar.jpg',
      lat: 43.9781,
      lng: 4.6911
    },
    {
      id: 2,
      nom: 'Tournoi P500 Femmes',
      club: 'Paul & Louis Sport',
      clubAdresse: 'Le Pontet',
      date: '2026-01-28',
      heureDebut: '10:00',
      categorie: 'P500',
      genre: 'Femmes',
      format: 'Format C2',
      nombreEquipes: 12,
      nombreEquipesMax: 16,
      prixInscription: 15,
      dotation: '300€ + Trophées',
      statut: 'Ouvert',
      inscrit: true,
      image: '/images/clubs/paul-louis.jpg',
      lat: 43.9608,
      lng: 4.8583
    },
    {
      id: 3,
      nom: 'Tournoi P100 Mixte',
      club: 'ZE Padel',
      clubAdresse: 'Boulbon',
      date: '2026-02-01',
      heureDebut: '14:00',
      categorie: 'P100',
      genre: 'Mixte',
      format: 'Format D2',
      nombreEquipes: 6,
      nombreEquipesMax: 8,
      prixInscription: 20,
      dotation: 'Médailles + Cadeaux',
      statut: 'Ouvert',
      inscrit: false,
      image: '/images/clubs/ze-padel.jpg',
      lat: 43.8519,
      lng: 4.7111
    },
    {
      id: 4,
      nom: 'Tournoi P2000 Hommes',
      club: 'QG Padel Club',
      clubAdresse: 'Saint-Laurent-des-Arbres',
      date: '2026-02-05',
      heureDebut: '08:00',
      categorie: 'P2000',
      genre: 'Hommes',
      format: 'Format A1',
      nombreEquipes: 16,
      nombreEquipesMax: 16,
      prixInscription: 20,
      dotation: '1000€ + Trophées',
      statut: 'Complet',
      inscrit: false,
      image: '/images/clubs/qg-padel.jpg',
      lat: 44.0528,
      lng: 4.6981
    },
    {
      id: 5,
      nom: 'Tournoi P250 Femmes',
      club: 'Le Hangar Sport & Co',
      clubAdresse: 'Rochefort-du-Gard',
      date: '2026-02-08',
      heureDebut: '14:00',
      categorie: 'P250',
      genre: 'Femmes',
      format: 'Format D1',
      nombreEquipes: 10,
      nombreEquipesMax: 12,
      prixInscription: 15,
      dotation: '200€ + Trophées',
      statut: 'Ouvert',
      inscrit: false,
      image: '/images/clubs/le-hangar.jpg',
      lat: 43.9781,
      lng: 4.6911
    },
  ])

  // Calculer les distances si géolocalisation active
  const tournoisWithDistance = useMemo(() => {
    if (!userCoords) return tournois

    return tournois.map(tournoi => {
      const distanceKm = haversineKm(
        userCoords.lat,
        userCoords.lng,
        tournoi.lat,
        tournoi.lng
      )
      const distanceMinutes = estimateMinutes(distanceKm)

      return {
        ...tournoi,
        distanceKm,
        distanceMinutes
      }
    })
  }, [tournois, userCoords])

  const handleInscrire = (tournoi: Tournoi) => {
    setTournoiToConfirm(tournoi)
    setShowConfirmModal(true)
  }

  const confirmInscription = () => {
    if (tournoiToConfirm) {
      setTournois(tournois.map(t => 
        t.id === tournoiToConfirm.id 
          ? { ...t, inscrit: true, nombreEquipes: t.nombreEquipes + 1 } 
          : t
      ))
      setSuccessMessage(`Inscription confirmée au ${tournoiToConfirm.nom} !`)
      setShowConfirmModal(false)
      setShowSuccessModal(true)
      setTournoiToConfirm(null)
    }
  }

  const handleDesinscrire = (tournoi: Tournoi) => {
    setTournoiToConfirm(tournoi)
    setShowConfirmModal(true)
  }

  const confirmDesinscription = () => {
    if (tournoiToConfirm) {
      setTournois(tournois.map(t => 
        t.id === tournoiToConfirm.id 
          ? { ...t, inscrit: false, nombreEquipes: t.nombreEquipes - 1 } 
          : t
      ))
      setSuccessMessage(`Désinscription confirmée du ${tournoiToConfirm.nom}`)
      setShowConfirmModal(false)
      setShowSuccessModal(true)
      setTournoiToConfirm(null)
    }
  }

  const toggleCategorie = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  // Mémoïser les compteurs (évite recalcul)
  const inscritsCount = useMemo(() => tournois.filter(t => t.inscrit).length, [tournois])
  const ouvertsCount = useMemo(() => tournois.filter(t => t.statut === 'Ouvert').length, [tournois])

  // Mémoïser le filtrage et le tri (évite recalcul inutile)
  const filteredTournois = useMemo(() => {
    let result = tournoisWithDistance.filter(t => {
      // Recherche
      const clubName = t.club.toLowerCase()
      const tournoiName = t.nom.toLowerCase()
      const searchLower = searchTerm.toLowerCase()
      const matchSearch = clubName.includes(searchLower) || tournoiName.includes(searchLower)
      
      if (searchTerm && !matchSearch) return false

      // Filtre statut
      let matchesStatut = true
      if (selectedFilter === 'ouverts') matchesStatut = t.statut === 'Ouvert'
      if (selectedFilter === 'inscrits') matchesStatut = t.inscrit

      // Filtre catégorie (multi-sélection)
      const matchesCategorie = selectedCategories.length === 0 || selectedCategories.includes(t.categorie)

      // Filtre genre (multi-sélection)
      const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(t.genre)

      return matchesStatut && matchesCategorie && matchesGenre
    })

    // Tri
    if (sortBy === 'distance' && userCoords) {
      result = result.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999))
    } else if (sortBy === 'date') {
      result = result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }

    return result
  }, [tournoisWithDistance, searchTerm, selectedFilter, selectedCategories, selectedGenres, sortBy, userCoords])

  return (
    <div className="min-h-screen bg-white">
      <div className="px-3 md:px-6 lg:px-8 py-4 md:py-8">
        

        {/* Barre de recherche + Filtres */}
        <div className="mb-6 md:mb-8 bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-6 border border-gray-200">
          {/* Recherche */}
          <div className="mb-3 md:mb-4">
            <SmartSearchBar
              placeholder="Rechercher un tournoi ou un club..."
              onSearch={(query) => setSearchTerm(query)}
              suggestions={[
                'Le Hangar Sport & Co',
                'Paul & Louis Sport',
                'ZE Padel',
                'QG Padel Club',
                'Tournoi P1000',
                'Tournoi P500',
                'Tournois hommes',
                'Tournois femmes',
                'Tournois mixtes'
              ]}
              storageKey="search-history-tournois"
              compact={false}
            />
          </div>

          {/* Géolocalisation */}
          <div className="mb-3 md:mb-4">
            {locationStatus === 'idle' && (
              <button
                onClick={requestLocation}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Activer la localisation
              </button>
            )}

            {locationStatus === 'loading' && (
              <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                <p className="text-sm font-medium text-blue-800">
                  Localisation en cours...
                </p>
              </div>
            )}
            
            {locationStatus === 'ready' && userCoords && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-green-800">
                  📍 Localisation active • Les distances sont calculées en temps réel
                </p>
              </div>
            )}

            {locationStatus === 'error' && (
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      Localisation refusée ou indisponible
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {locationError?.code === 1 && 'Permission refusée. Activez la localisation dans les paramètres de votre navigateur.'}
                      {locationError?.code === 2 && 'Position indisponible. Vérifiez votre connexion GPS.'}
                      {locationError?.code === 3 && 'Délai expiré. Réessayez.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={requestLocation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>

          {/* Filtres Tri */}
          <div className="mb-3 md:mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2">Trier par :</span>
            <div className="flex items-center gap-2 flex-wrap mt-2 overflow-x-auto pb-1 -mx-1 px-1">
              <button
                onClick={() => setSortBy('distance')}
                className={`group flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                  sortBy === 'distance'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Autour de moi
              </button>
              <button
                onClick={() => setSortBy('date')}
                className={`group flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                  sortBy === 'date'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date
              </button>
            </div>
          </div>

          {/* Filtres Statut */}
          <div className="mb-3 md:mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2">Statut :</span>
            <div className="flex items-center gap-2 flex-wrap mt-2 overflow-x-auto pb-1 -mx-1 px-1">
              <button
                onClick={() => setSelectedFilter('ouverts')}
                className={`group flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedFilter === 'ouverts'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ouverts ({ouvertsCount})
              </button>
              <button
                onClick={() => setSelectedFilter('inscrits')}
                className={`group flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedFilter === 'inscrits'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Mes inscriptions ({inscritsCount})
              </button>
              <button
                onClick={() => setSelectedFilter('tous')}
                className={`group flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedFilter === 'tous'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Tous ({tournois.length})
              </button>
            </div>
          </div>

          {/* Filtres Niveau */}
          <div className="mb-3 md:mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2">Niveau :</span>
            <div className="flex items-center gap-2 flex-wrap mt-2 overflow-x-auto pb-1 -mx-1 px-1">
              <button
                onClick={() => setSelectedCategories([])}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategories.length === 0
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Tous
              </button>
              {['P100', 'P250', 'P500', 'P1000', 'P2000'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategorie(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedCategories.includes(cat)
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Filtres Genre */}
          <div className="mb-0">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2">Genre :</span>
            <div className="flex items-center gap-2 flex-wrap mt-2 overflow-x-auto pb-1 -mx-1 px-1">
              <button
                onClick={() => setSelectedGenres([])}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedGenres.length === 0
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Tous
              </button>
              {['Hommes', 'Femmes', 'Mixte'].map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedGenres.includes(genre)
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Liste des tournois */}
        {filteredTournois.length > 0 ? (
          <div className="space-y-3 md:space-y-4 mb-16 md:mb-8">
            {filteredTournois.map((tournoi) => {
              const dateObj = new Date(tournoi.date)
              const isComplet = tournoi.statut === 'Complet'
              const placesRestantes = tournoi.nombreEquipesMax - tournoi.nombreEquipes
              const pourcentageRempli = (tournoi.nombreEquipes / tournoi.nombreEquipesMax) * 100

              return (
                <div
                  key={tournoi.id}
                  onClick={() => {
                    debug.log('🔘 [CLICK] Tournoi clicked:', tournoi.id, tournoi.nom, Date.now())
                    debug.time('tournoi-modal')
                    setSelectedTournoi(tournoi)
                    setShowDetailsModal(true)
                  }}
                  className={`group flex flex-col md:flex-row gap-3 md:gap-6 bg-white border-2 rounded-xl p-3 md:p-5 transition-all cursor-pointer ${
                    tournoi.inscrit
                      ? 'border-blue-200 bg-blue-50'
                      : isComplet
                      ? 'border-gray-200 opacity-60'
                      : 'border-gray-200 hover:border-blue-500 hover:shadow-lg'
                  }`}
                >
                  {/* Image - Full width mobile, fixed width desktop */}
                  <div className="relative w-full md:w-48 h-40 md:h-36 flex-shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={tournoi.image}
                      alt={tournoi.nom}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {tournoi.inscrit && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                        Inscrit
                      </div>
                    )}
                    {isComplet && !tournoi.inscrit && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded">
                        Complet
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-1 bg-white text-gray-900 text-xs font-bold rounded">
                        {tournoi.categorie}
                      </span>
                    </div>
                  </div>

                  {/* Contenu - Structure verticale claire */}
                  <div className="flex-1 flex flex-col gap-3">
                    {/* Nom + Prix */}
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
                        {tournoi.nom}
                      </h3>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl md:text-2xl font-bold text-gray-900">{tournoi.prixInscription}€</p>
                        <p className="text-xs text-gray-500">par personne</p>
                      </div>
                    </div>

                    {/* Club + Ville */}
                    <p className="text-sm md:text-base text-gray-600 flex items-center gap-1.5 -mt-1">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="line-clamp-1">{tournoi.club} · {tournoi.clubAdresse}</span>
                    </p>

                    {/* Distance (si géolocalisation active) */}
                    {tournoi.distanceKm !== undefined && (
                      <div className="flex items-center gap-2 -mt-1">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span>{formatDistance(tournoi.distanceKm)}</span>
                        </div>
                        {tournoi.distanceMinutes !== undefined && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formatTravelTime(tournoi.distanceMinutes)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Date + Heure + Genre */}
                    <div className="flex items-center gap-3 md:gap-6 flex-wrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">
                          {dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {tournoi.heureDebut}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm font-medium">{tournoi.genre}</span>
                      </div>
                    </div>

                    {/* Barre de remplissage */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500 font-medium">
                            {tournoi.nombreEquipes}/{tournoi.nombreEquipesMax} équipes
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {placesRestantes} {placesRestantes > 1 ? 'places' : 'place'}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ width: `${pourcentageRempli}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* CTA - Pleine largeur sur mobile */}
                    {tournoi.statut === 'Ouvert' && (
                      <div className="mt-auto pt-3 md:pt-4 border-t border-gray-100">
                        {tournoi.inscrit ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDesinscrire(tournoi)
                            }}
                            className="w-full md:w-auto px-5 py-3 md:py-2 bg-gray-900 hover:bg-gray-800 text-white text-base md:text-sm font-semibold rounded-lg transition-colors"
                          >
                            Se désinscrire
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleInscrire(tournoi)
                            }}
                            className="w-full md:w-auto px-5 py-3 md:py-2 bg-blue-600 hover:bg-blue-700 text-white text-base md:text-sm font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
                          >
                            S'inscrire
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun tournoi trouvé</h3>
            <p className="text-gray-600 mb-6">Essayez de modifier votre recherche ou vos filtres</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedFilter('ouverts')
                setSelectedCategories([])
                setSelectedGenres([])
              }}
              className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* Modal Détails */}
      {showDetailsModal && selectedTournoi && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-48 overflow-hidden rounded-t-2xl">
              <img 
                src={selectedTournoi.image} 
                alt={selectedTournoi.nom}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg flex items-center justify-center transition-all"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-4 left-6 text-white">
                <h2 className="text-2xl font-bold mb-1">{selectedTournoi.nom}</h2>
                <p className="text-white/90">{selectedTournoi.club}</p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Date', value: new Date(selectedTournoi.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) },
                  { label: 'Heure', value: selectedTournoi.heureDebut },
                  { label: 'Niveau', value: selectedTournoi.categorie },
                  { label: 'Genre', value: selectedTournoi.genre },
                  { label: 'Format', value: selectedTournoi.format },
                  { label: 'Inscription', value: `${selectedTournoi.prixInscription}€ par personne` },
                  { label: 'Dotation', value: selectedTournoi.dotation },
                  { label: 'Places', value: `${selectedTournoi.nombreEquipes}/${selectedTournoi.nombreEquipesMax}` },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{item.label}</p>
                    <p className="font-bold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation */}
      {showConfirmModal && tournoiToConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              {tournoiToConfirm.inscrit ? 'Confirmer la désinscription' : 'Confirmer l\'inscription'}
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              {tournoiToConfirm.inscrit 
                ? `Êtes-vous sûr de vouloir vous désinscrire du tournoi "${tournoiToConfirm.nom}" ?`
                : `Confirmer votre inscription au tournoi "${tournoiToConfirm.nom}" pour ${tournoiToConfirm.prixInscription}€ par personne ?`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={tournoiToConfirm.inscrit ? confirmDesinscription : confirmInscription}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  tournoiToConfirm.inscrit
                    ? 'bg-gray-900 hover:bg-gray-800 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Succès */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSuccessModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Succès !</h3>
            <p className="text-gray-600 mb-6">{successMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
