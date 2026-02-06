'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
import SmartSearchBar from '../components/SmartSearchBar'
import FiltersDrawer from '../components/FiltersDrawer'
import ActiveFiltersChips from '../components/ActiveFiltersChips'
import ClubCard from '../components/ClubCard'
import PageHeader from '../components/PageHeader'
import { getClubImage, filterOutDemoClub } from '@/lib/clubImages'
import { useUserLocation } from '@/hooks/useUserLocation'
import { haversineKm, formatDistance, estimateMinutes, formatTravelTime } from '@/lib/geoUtils'
import { getCitySuggestions, getCityCoordinates } from '@/lib/cities'
import { CLUBS_DATA, getClubById } from '@/lib/data/clubs'

// ✅ Force dynamic rendering (pas de pre-render statique)
// Nécessaire car supabaseBrowser accède à document.cookie
export const dynamic = 'force-dynamic'

type Club = {
  id: string // ✅ UUID depuis public.clubs
  name: string // ✅ Correspond à public.clubs.name
  city: string // ✅ Correspond à public.clubs.city
  lat: number // ✅ Latitude GPS
  lng: number // ✅ Longitude GPS
  distanceKm?: number // ✅ Distance calculée (uniquement si géoloc active)
  distanceMinutes?: number // ✅ Temps de trajet estimé (uniquement si géoloc active)
  nombreTerrains: number
  note: number
  avis: number
  imageUrl: string
  prixMin: number
  equipements: string[]
  favoris: boolean
  disponible: boolean
}

/**
 * Coordonnées GPS des clubs (hardcodé pour MVP)
 * TODO: Déplacer dans Supabase (colonnes latitude, longitude dans table clubs)
 */
const CLUB_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'a1b2c3d4-e5f6-4789-a012-3456789abcde': { lat: 43.9781, lng: 4.6911 }, // Le Hangar - Rochefort-du-Gard
  'b2c3d4e5-f6a7-4890-b123-456789abcdef': { lat: 43.9608, lng: 4.8583 }, // Paul & Louis - Le Pontet
  'c3d4e5f6-a7b8-4901-c234-56789abcdef0': { lat: 43.8519, lng: 4.7111 }, // ZE Padel - Boulbon
  'd4e5f6a7-b8c9-4012-d345-6789abcdef01': { lat: 44.0528, lng: 4.6981 }, // QG Padel - Saint-Laurent-des-Arbres
}

export default function ClubsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [cityClubFilter, setCityClubFilter] = useState<string>('')
  const [radiusKm, setRadiusKm] = useState<number>(50)
  const [sortBy, setSortBy] = useState<'prix-asc' | 'prix-desc' | 'note'>('note')
  const [selectedEquipements, setSelectedEquipements] = useState<string[]>([])
  const [selectedPrixRanges, setSelectedPrixRanges] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false)

  const [clubs, setClubs] = useState<Club[]>([])
  
  // États pour le header de recherche
  const [headerSearchTerm, setHeaderSearchTerm] = useState('')
  const [headerCitySearch, setHeaderCitySearch] = useState('')
  
  // ✅ Géolocalisation avec hook custom (cache + gestion erreurs)
  const { status: locationStatus, coords: userCoords, error: locationError, requestLocation } = useUserLocation()

  // ============================================
  // CHARGEMENT DES CLUBS DEPUIS SUPABASE
  // ============================================
  // ✅ Identique connecté ou non (pas de filtre user/owner_id/memberships)
  useEffect(() => {
    const loadClubs = async () => {
      console.log('[CLUBS] Loading clubs from Supabase...')
      console.log('[CLUBS] Query: from("clubs").select("id,name,city").order("created_at",{ascending:false})')
      
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name, city')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('[CLUBS] Error loading clubs:', error)
        console.error('[CLUBS] Error details:', JSON.stringify(error, null, 2))
        setIsLoading(false)
        return
      }
      
      console.log('[CLUBS] ✅ Clubs loaded:', data?.length || 0, 'clubs')
      console.log('[CLUBS] Data:', data)
      
      // Transformer les données Supabase en format UI avec les vraies données de CLUBS_DATA
      const clubsWithUI = (data || []).map(club => {
        // Récupérer les données complètes depuis CLUBS_DATA
        const clubData = getClubById(club.id)
        const coordinates = CLUB_COORDINATES[club.id]
        
        return {
          id: club.id,
          name: club.name || clubData?.name || 'Club sans nom',
          city: club.city || clubData?.city || 'Ville non spécifiée',
          lat: coordinates?.lat || clubData?.lat || 0,
          lng: coordinates?.lng || clubData?.lng || 0,
          nombreTerrains: clubData?.courts?.length || 2,
          note: clubData?.note || 4.5,
          avis: clubData?.avis || 0,
          imageUrl: getClubImage(club.id),
          prixMin: clubData?.prixMin || 12,
          equipements: clubData?.equipements || ['Bar', 'Vestiaires', 'Douches', 'Parking', 'WiFi'],
          favoris: false,
          disponible: clubData?.isActive ?? true
        }
      })
      
      // ✅ Filtrer pour exclure le Club Démo
      const filteredClubs = filterOutDemoClub(clubsWithUI)
      console.log('[CLUBS] ✅ Filtered clubs (without demo):', filteredClubs.length, 'clubs')
      
      setClubs(filteredClubs)
      setIsLoading(false)
    }
    
    loadClubs()
  }, [])

  const toggleEquipement = (equipement: string) => {
    setSelectedEquipements(prev => 
      prev.includes(equipement) ? prev.filter(e => e !== equipement) : [...prev, equipement]
    )
  }

  const togglePrixRange = (range: string) => {
    setSelectedPrixRanges(prev => 
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    )
  }

  // Mémoïser le toggle favoris (forme fonctionnelle pour éviter boucle)
  const toggleFavoris = useCallback((clubId: string) => {
    setClubs(prev => 
      prev.map(club => 
        club.id === clubId ? { ...club, favoris: !club.favoris } : club
      )
    )
  }, [])

  // Calculer les distances et temps de trajet (uniquement si géoloc active)
  const clubsWithDistance = useMemo(() => {
    if (locationStatus !== 'ready' || !userCoords) {
      return clubs
    }

    return clubs.map(club => {
      // Calcul de distance uniquement si le club a des coordonnées
      if (!club.lat || !club.lng) {
        return club
      }

      const distanceKm = haversineKm(userCoords.lat, userCoords.lng, club.lat, club.lng)
      const distanceMinutes = estimateMinutes(distanceKm)

      return {
        ...club,
        distanceKm,
        distanceMinutes
      }
    })
  }, [clubs, userCoords, locationStatus])

  // Trouver les coordonnées de référence pour le filtre "Autour de"
  const referenceCoords = useMemo(() => {
    if (!cityClubFilter) return null
    
    // 1. D'abord chercher dans la base de villes
    const cityCoords = getCityCoordinates(cityClubFilter)
    if (cityCoords) {
      return cityCoords
    }
    
    // 2. Sinon, chercher un club correspondant au filtre (ville ou nom)
    const matchingClub = clubs.find(club => 
      club.city.toLowerCase().includes(cityClubFilter.toLowerCase()) ||
      club.name.toLowerCase().includes(cityClubFilter.toLowerCase())
    )
    
    if (matchingClub && matchingClub.lat && matchingClub.lng) {
      return { lat: matchingClub.lat, lng: matchingClub.lng }
    }
    
    return null
  }, [cityClubFilter, clubs])

  // Filtrer et trier avec useMemo (évite recalcul inutile)
  const filteredAndSortedClubs = useMemo(() => {
    const result = clubsWithDistance
      .filter(club => {
        // Recherche principale
        const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          club.city.toLowerCase().includes(searchTerm.toLowerCase())
        
        if (!matchesSearch) return false

        // Filtre "Autour de" avec rayon
        let matchesCityClubRadius = true
        if (cityClubFilter && referenceCoords && club.lat && club.lng) {
          const distanceKm = haversineKm(
            referenceCoords.lat,
            referenceCoords.lng,
            club.lat,
            club.lng
          )
          matchesCityClubRadius = distanceKm <= radiusKm
        }

        // Filtre équipements (multi-sélection)
        const matchesEquipements = selectedEquipements.length === 0 || 
          selectedEquipements.some(eq => club.equipements.some(clubEq => clubEq.toLowerCase().includes(eq.toLowerCase())))

        // Filtre prix (multi-sélection)
        let matchesPrix = selectedPrixRanges.length === 0
        if (selectedPrixRanges.length > 0) {
          matchesPrix = selectedPrixRanges.some(range => {
            if (range === '0-8') return club.prixMin <= 8
            if (range === '9-10') return club.prixMin >= 9 && club.prixMin <= 10
            if (range === '11+') return club.prixMin >= 11
            return false
          })
        }

        return matchesCityClubRadius && matchesEquipements && matchesPrix
      })
      .sort((a, b) => {
        // Si la géolocalisation est active, trier d'abord par distance
        if (locationStatus === 'ready' && userCoords && a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm
        }
        
        // Sinon, utiliser le tri sélectionné par l'utilisateur
        switch (sortBy) {
          case 'prix-asc':
            return a.prixMin - b.prixMin
          case 'prix-desc':
            return b.prixMin - a.prixMin
          case 'note':
            return b.note - a.note
          default:
            return 0
        }
      })
    
    return result
  }, [clubsWithDistance, searchTerm, sortBy, selectedEquipements, selectedPrixRanges, cityClubFilter, referenceCoords, radiusKm])

  return (
    <div className="min-h-screen bg-white">
      <div className="px-3 md:px-6 lg:px-8 py-4 md:py-8">
        
        {/* Header */}
        <PageHeader
          title="Clubs"
          subtitle="Trouvez les meilleurs clubs de padel près de chez vous"
          leftField={{
            label: "Que cherchez-vous ?",
            placeholder: "Nom du club",
            value: headerSearchTerm,
            onChange: setHeaderSearchTerm
          }}
          rightField={{
            label: "Où",
            placeholder: "Ville",
            value: headerCitySearch,
            onChange: setHeaderCitySearch
          }}
          buttonLabel="Rechercher"
          onSearch={() => {
            setSearchTerm(headerSearchTerm)
            setCityClubFilter(headerCitySearch)
          }}
        />

        {/* Barre de filtres compacte (nouvelle organisation) */}
        <div className="mb-4">
          <div className="flex items-center gap-3 py-3 border-b border-slate-200 flex-wrap">
            {/* Filtre principal : Tri */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Trier:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-10 px-3 pr-8 text-sm font-medium border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-slate-700 cursor-pointer"
              >
                <option value="note">Mieux notés</option>
                <option value="prix-asc">Prix croissant</option>
                <option value="prix-desc">Prix décroissant</option>
              </select>
            </div>

            {/* Bouton "Filtres" */}
            <button
              onClick={() => setIsFiltersDrawerOpen(true)}
              className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filtres
            </button>
          </div>

          {/* Chips de filtres actifs */}
          <ActiveFiltersChips
            chips={[
              ...(searchTerm ? [{
                id: 'search',
                label: 'Recherche',
                value: searchTerm,
                onRemove: () => setSearchTerm('')
              }] : []),
              ...(sortBy !== 'note' ? [{
                id: 'tri',
                label: 'Tri',
                value: sortBy === 'prix-asc' ? 'Prix croissant' : 'Prix décroissant',
                onRemove: () => setSortBy('note')
              }] : []),
              ...selectedEquipements.map(eq => ({
                id: `eq-${eq}`,
                label: 'Équipement',
                value: eq,
                onRemove: () => toggleEquipement(eq)
              })),
              ...selectedPrixRanges.map(range => {
                const labels: Record<string, string> = { '0-8': '≤ 8€', '9-10': '9-10€', '11+': '≥ 11€' }
                return {
                  id: `prix-${range}`,
                  label: 'Prix',
                  value: labels[range] || range,
                  onRemove: () => togglePrixRange(range)
                }
              }),
              ...(cityClubFilter ? [{
                id: 'location',
                label: 'Ville',
                value: `${cityClubFilter} (${radiusKm}km)`,
                onRemove: () => setCityClubFilter('')
              }] : []),
            ]}
            onClearAll={() => {
              setSearchTerm('')
              setSortBy('note')
              setSelectedEquipements([])
              setSelectedPrixRanges([])
              setCityClubFilter('')
              setRadiusKm(50)
            }}
          />
        </div>

        {/* Drawer avec tous les filtres */}
        <FiltersDrawer
          isOpen={isFiltersDrawerOpen}
          onClose={() => setIsFiltersDrawerOpen(false)}
          title="Filtrer les clubs"
          onReset={() => {
            setSearchTerm('')
            setSortBy('note')
            setSelectedEquipements([])
            setSelectedPrixRanges([])
            setCityClubFilter('')
            setRadiusKm(50)
          }}
        >
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
                storageKey="search-history-city"
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

          {/* Filtres Équipements */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Équipements</h3>
            <div className="flex flex-col gap-2">
              {['Restaurant', 'Parking', 'Bar', 'Fitness', 'Coaching'].map((equipement) => (
                <button
                  key={equipement}
                  onClick={() => toggleEquipement(equipement)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                    selectedEquipements.includes(equipement)
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {equipement}
                </button>
              ))}
            </div>
          </div>

          {/* Filtres Gamme de prix */}
          <div className="mb-0">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Gamme de prix</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: '≤ 8€', value: '0-8' },
                { label: '9-10€', value: '9-10' },
                { label: '≥ 11€', value: '11+' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => togglePrixRange(range.value)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                    selectedPrixRanges.includes(range.value)
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </FiltersDrawer>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-semibold">Chargement des clubs...</p>
          </div>
        )}

        {/* Grille des clubs - Catalogue premium */}
        {!isLoading && filteredAndSortedClubs.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 md:mb-8">
              {filteredAndSortedClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  id={club.id}
                  name={club.name}
                  city={club.city}
                  imageUrl={club.imageUrl}
                  href={`/player/clubs/${club.id}/reserver`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Message si aucun résultat */}
        {!isLoading && filteredAndSortedClubs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun club trouvé</h3>
            <p className="text-gray-600 mb-6">Essayez de modifier votre recherche</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSortBy('note')
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
