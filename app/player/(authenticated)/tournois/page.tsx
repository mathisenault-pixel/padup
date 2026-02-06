'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import Link from 'next/link'
import SmartSearchBar from '../components/SmartSearchBar'
import FiltersDrawer from '../components/FiltersDrawer'
import ActiveFiltersChips from '../components/ActiveFiltersChips'
import PageHeader from '../components/PageHeader'
import TournoiCard from '../components/TournoiCard'
import { debug } from '@/lib/debug'
import { useUserLocation } from '@/hooks/useUserLocation'
import { haversineKm, formatDistance, estimateMinutes, formatTravelTime } from '@/lib/geoUtils'
import { getCitySuggestions, getCityCoordinates } from '@/lib/cities'

type Tournoi = {
  id: number
  nom: string
  club: string
  clubAdresse: string
  clubDescription?: string
  clubTelephone?: string
  clubEmail?: string
  description?: string
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
  const [cityClubFilter, setCityClubFilter] = useState<string>('')
  const [radiusKm, setRadiusKm] = useState<number>(50)
  const [sortBy, setSortBy] = useState<'date'>('date')
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false)
  
  // États pour le header de recherche
  const [headerSearchTerm, setHeaderSearchTerm] = useState('')
  const [headerCitySearch, setHeaderCitySearch] = useState('')

  // Géolocalisation
  const { coords: userCoords, status: locationStatus, error: locationError, requestLocation } = useUserLocation()

  // Charger les inscriptions depuis localStorage
  useEffect(() => {
    const storedRegistrations = localStorage.getItem('tournamentRegistrations')
    if (storedRegistrations) {
      const registrations = JSON.parse(storedRegistrations)
      const registeredIds = registrations.map((r: any) => r.id)
      
      // Mettre à jour les tournois avec l'état inscrit
      setTournois(prevTournois => 
        prevTournois.map(t => ({
          ...t,
          inscrit: registeredIds.includes(t.id)
        }))
      )
    }
  }, [])

  const [tournois, setTournois] = useState<Tournoi[]>([
    {
      id: 1,
      nom: 'Tournoi P1000 Hommes',
      club: 'Le Hangar Sport & Co',
      clubAdresse: 'Rochefort-du-Gard',
      clubDescription: 'Club premium avec 6 terrains couverts et éclairés, bar restaurant, pro shop et parking gratuit.',
      clubTelephone: '04 66 57 12 34',
      clubEmail: 'contact@lehangar-padel.fr',
      description: 'Grand tournoi P1000 hommes avec dotation de 500€. Format B1, inscription par équipe de 2. Ambiance conviviale et compétitive garantie !',
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
      clubDescription: 'Complexe sportif moderne avec 4 terrains indoor et outdoor, vestiaires, espace détente et boutique.',
      clubTelephone: '04 90 32 45 67',
      clubEmail: 'info@paullouis-sport.fr',
      description: 'Tournoi P500 féminin dans une ambiance chaleureuse. Format C2, dotation de 300€ et nombreux lots à gagner.',
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
      clubDescription: 'Club familial avec 3 terrains panoramiques, ambiance conviviale et petite restauration sur place.',
      clubTelephone: '04 90 95 78 90',
      clubEmail: 'contact@zepadel.fr',
      description: 'Tournoi P100 mixte idéal pour débuter en compétition. Ambiance familiale et décontractée avec de nombreux lots.',
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
      clubDescription: 'Club haut de gamme avec 5 terrains premium, coaching professionnel, salle de sport et restaurant gastronomique.',
      clubTelephone: '04 66 50 23 45',
      clubEmail: 'info@qgpadel.com',
      description: 'Tournoi P2000 de haut niveau avec dotation de 1000€. Format A1, réservé aux meilleurs joueurs de la région.',
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
      clubDescription: 'Club premium avec 6 terrains couverts et éclairés, bar restaurant, pro shop et parking gratuit.',
      clubTelephone: '04 66 57 12 34',
      clubEmail: 'contact@lehangar-padel.fr',
      description: 'Tournoi P250 féminin dans un cadre exceptionnel. Format D1 accessible à tous les niveaux.',
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

  // Trouver les coordonnées de référence pour le filtre "Autour de"
  const referenceCoords = useMemo(() => {
    if (!cityClubFilter) return null
    
    // 1. D'abord chercher dans la base de villes
    const cityCoords = getCityCoordinates(cityClubFilter)
    if (cityCoords) {
      return cityCoords
    }
    
    // 2. Sinon, chercher un tournoi correspondant au filtre (ville ou club)
    const matchingTournoi = tournois.find(t => 
      t.clubAdresse.toLowerCase().includes(cityClubFilter.toLowerCase()) ||
      t.club.toLowerCase().includes(cityClubFilter.toLowerCase())
    )
    
    if (matchingTournoi && matchingTournoi.lat && matchingTournoi.lng) {
      return { lat: matchingTournoi.lat, lng: matchingTournoi.lng }
    }
    
    return null
  }, [cityClubFilter, tournois])

  // Suggestions pour l'autocomplete
  const tournoiNameSuggestions = useMemo(() => {
    return tournois.map(t => t.nom).sort()
  }, [tournois])

  const citySuggestions = useMemo(() => {
    const cities = [...new Set(tournois.map(t => {
      // Extraire la ville depuis clubAdresse
      const parts = t.clubAdresse.split(',')
      return parts[parts.length - 1]?.trim() || ''
    }).filter(Boolean))]
    return [...getCitySuggestions(), ...cities].sort()
  }, [tournois])

  // Calculer le nombre de filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedFilter !== 'ouverts') count++
    count += selectedCategories.length
    count += selectedGenres.length
    if (cityClubFilter) count++
    return count
  }, [selectedFilter, selectedCategories, selectedGenres, cityClubFilter])

  // Mémoïser le filtrage et le tri (évite recalcul inutile)
  const filteredTournois = useMemo(() => {
    let result = tournoisWithDistance.filter(t => {
      // Recherche principale
      const clubName = t.club.toLowerCase()
      const tournoiName = t.nom.toLowerCase()
      const searchLower = searchTerm.toLowerCase()
      const matchSearch = clubName.includes(searchLower) || tournoiName.includes(searchLower)
      
      if (searchTerm && !matchSearch) return false

      // Filtre "Autour de" avec rayon
      let matchesCityClubRadius = true
      if (cityClubFilter && referenceCoords && t.lat && t.lng) {
        const distanceKm = haversineKm(
          referenceCoords.lat,
          referenceCoords.lng,
          t.lat,
          t.lng
        )
        matchesCityClubRadius = distanceKm <= radiusKm
      }

      // Filtre statut
      let matchesStatut = true
      if (selectedFilter === 'ouverts') matchesStatut = t.statut === 'Ouvert'
      if (selectedFilter === 'inscrits') matchesStatut = t.inscrit

      // Filtre catégorie (multi-sélection)
      const matchesCategorie = selectedCategories.length === 0 || selectedCategories.includes(t.categorie)

      // Filtre genre (multi-sélection)
      const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(t.genre)

      return matchesCityClubRadius && matchesStatut && matchesCategorie && matchesGenre
    })

    // Tri : Si géolocalisation active, trier par distance, sinon par date
    if (userCoords) {
      result = result.sort((a, b) => {
        if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm
        }
        return 0
      })
    } else {
      result = result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }

    return result
  }, [tournoisWithDistance, searchTerm, selectedFilter, selectedCategories, selectedGenres, sortBy, userCoords, cityClubFilter, referenceCoords, radiusKm])

  return (
    <div className="min-h-screen bg-white">
      <div className="px-3 md:px-6 lg:px-8 py-4 md:py-8">
        
        {/* Header */}
        <PageHeader
          title="Tournois"
          subtitle="Découvrez et participez aux tournois de padel"
          leftField={{
            label: "Que cherchez-vous ?",
            placeholder: "Nom du tournoi",
            value: headerSearchTerm,
            onChange: setHeaderSearchTerm,
            suggestions: tournoiNameSuggestions
          }}
          rightField={{
            label: "Où",
            placeholder: "Ville",
            value: headerCitySearch,
            onChange: setHeaderCitySearch,
            suggestions: citySuggestions
          }}
          buttonLabel="Rechercher"
          onSearch={() => {
            setSearchTerm(headerSearchTerm)
            setCityClubFilter(headerCitySearch)
          }}
          onFiltersClick={() => setIsFiltersDrawerOpen(true)}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Drawer avec tous les filtres */}
        <FiltersDrawer
          isOpen={isFiltersDrawerOpen}
          onClose={() => setIsFiltersDrawerOpen(false)}
          title="Filtrer les tournois"
          onReset={() => {
            setSearchTerm('')
            setSelectedFilter('ouverts')
            setSelectedCategories([])
            setSelectedGenres([])
            setCityClubFilter('')
            setRadiusKm(50)
            setSortBy('date')
          }}
        >
          {/* Filtre Statut */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Statut</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedFilter('ouverts')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                  selectedFilter === 'ouverts'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Ouverts
              </button>
              <button
                onClick={() => setSelectedFilter('inscrits')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                  selectedFilter === 'inscrits'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Mes inscriptions
              </button>
              <button
                onClick={() => setSelectedFilter('tous')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                  selectedFilter === 'tous'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Tous
              </button>
            </div>
          </div>

          {/* Filtre Tri */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Trier par</h3>
            <button
              onClick={() => setSortBy('date')}
              className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                sortBy === 'date'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              📅 Date
            </button>
          </div>

          {/* Filtre Autour de */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Autour de</h3>
            <div className="space-y-2">
              <SmartSearchBar
                placeholder="Sélectionner une ville..."
                onSearch={(query) => setCityClubFilter(query)}
                suggestions={[
                  ...getCitySuggestions(),
                  'Le Hangar Sport & Co',
                  'Paul & Louis Sport',
                  'ZE Padel',
                  'QG Padel Club'
                ]}
                storageKey="search-history-city-tournois"
                compact={true}
              />
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                <option value={10}>Rayon : 10 km</option>
                <option value={20}>Rayon : 20 km</option>
                <option value={30}>Rayon : 30 km</option>
                <option value={50}>Rayon : 50 km</option>
                <option value={100}>Rayon : 100 km</option>
              </select>
            </div>
          </div>

          {/* Filtre Niveau */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Niveau</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedCategories([])}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                  selectedCategories.length === 0
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Tous les niveaux
              </button>
              {['P100', 'P250', 'P500', 'P1000', 'P2000'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategorie(cat)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                    selectedCategories.includes(cat)
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre Genre */}
          <div className="mb-0">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Genre</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedGenres([])}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                  selectedGenres.length === 0
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Tous les genres
              </button>
              {['Hommes', 'Femmes', 'Mixte'].map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                    selectedGenres.includes(genre)
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </FiltersDrawer>

        {/* Grille des tournois - Catalogue premium */}
        {filteredTournois.length > 0 ? (
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 md:mb-8">
              {filteredTournois.map((tournoi) => {
                const dateObj = new Date(tournoi.date)
                const dateFormatted = dateObj.toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'short',
                  year: 'numeric'
                })

                return (
                  <TournoiCard
                    key={tournoi.id}
                    id={tournoi.id}
                    nom={tournoi.nom}
                    club={tournoi.club}
                    date={dateFormatted}
                    categorie={tournoi.categorie}
                    imageUrl={tournoi.image}
                    href={`/player/tournois/${tournoi.id}`}
                  />
                )
              })}
            </div>
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
    </div>
  )
}
