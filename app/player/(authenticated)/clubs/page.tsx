'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
import SmartSearchBar from '../components/SmartSearchBar'
import UseMyLocationButton from '@/components/UseMyLocationButton'
import { getClubImage, filterOutDemoClub } from '@/lib/clubImages'

// ✅ Force dynamic rendering (pas de pre-render statique)
// Nécessaire car supabaseBrowser accède à document.cookie
export const dynamic = 'force-dynamic'

type Club = {
  id: string // ✅ UUID depuis public.clubs
  name: string // ✅ Correspond à public.clubs.name
  city: string // ✅ Correspond à public.clubs.city
  distance: number
  nombreTerrains: number
  note: number
  avis: number
  imageUrl: string
  prixMin: number
  equipements: string[]
  favoris: boolean
  disponible: boolean
}

export default function ClubsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'distance' | 'prix-asc' | 'prix-desc' | 'note'>('distance')
  const [selectedEquipements, setSelectedEquipements] = useState<string[]>([])
  const [selectedPrixRanges, setSelectedPrixRanges] = useState<string[]>([])
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'success'>('idle')
  const [isLoading, setIsLoading] = useState(true)

  const [clubs, setClubs] = useState<Club[]>([])

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
      
      // Transformer les données Supabase en format UI
      const clubsWithUI = (data || []).map(club => ({
        id: club.id,
        name: club.name || 'Club sans nom',
        city: club.city || 'Ville non spécifiée',
        distance: 5, // TODO: Calculer avec géolocation
        nombreTerrains: 2, // TODO: Compter depuis public.courts
        note: 4.5,
        avis: 0,
        imageUrl: getClubImage(club.id), // ✅ Image par clubId
        prixMin: 12,
        equipements: ['Bar', 'Vestiaires', 'Douches', 'Parking', 'WiFi'], // TODO: Depuis DB
        favoris: false,
        disponible: true
      }))
      
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

  // Filtrer et trier avec useMemo (évite recalcul inutile)
  const filteredAndSortedClubs = useMemo(() => {
    const result = clubs
      .filter(club => {
        // Recherche
        const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          club.city.toLowerCase().includes(searchTerm.toLowerCase())
        
        if (!matchesSearch) return false

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

        return matchesEquipements && matchesPrix
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'distance':
            return a.distance - b.distance
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
  }, [clubs, searchTerm, sortBy, selectedEquipements, selectedPrixRanges])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        

        {/* Barre de recherche + Filtres */}
        <div className="mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
          {/* Recherche */}
          <div className="mb-4">
            <SmartSearchBar
              placeholder="Rechercher un club ou une ville..."
              onSearch={(query) => setSearchTerm(query)}
              suggestions={[
                'Le Hangar Sport & Co',
                'Paul & Louis Sport',
                'ZE Padel',
                'QG Padel Club',
                'Rochefort-du-Gard',
                'Le Pontet',
                'Boulbon',
                'Clubs avec restaurant',
                'Clubs avec parking'
              ]}
              storageKey="search-history-clubs"
              compact={false}
            />
          </div>

          {/* Géolocalisation */}
          <div className="mb-4">
            <UseMyLocationButton
              onCoords={(coords) => {
                setUserCoords(coords);
                setLocationStatus('success');
                console.log('📍 Position utilisateur:', coords);
                // TODO: Trier les clubs par distance réelle ou appeler API
              }}
            />
            
            {/* ✅ Affichage propre sans popup */}
            {locationStatus === 'success' && userCoords && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-green-800">
                  📍 Position détectée ! Les clubs seront bientôt triés par distance.
                </p>
              </div>
            )}
          </div>

          {/* Filtres Tri */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2">Trier par :</span>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <button
                onClick={() => setSortBy('distance')}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
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
                onClick={() => setSortBy('prix-asc')}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  sortBy === 'prix-asc'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Prix croissant
              </button>
              <button
                onClick={() => setSortBy('prix-desc')}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  sortBy === 'prix-desc'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                Prix décroissant
              </button>
              <button
                onClick={() => setSortBy('note')}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  sortBy === 'note'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Mieux notés
              </button>
            </div>
          </div>

          {/* Filtres Équipements (multi-sélection) */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2">Équipements :</span>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              {['Restaurant', 'Parking', 'Bar', 'Fitness', 'Coaching'].map((equipement) => (
                <button
                  key={equipement}
                  onClick={() => toggleEquipement(equipement)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedEquipements.includes(equipement)
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {equipement}
                </button>
              ))}
            </div>
          </div>

          {/* Filtres Gamme de prix (multi-sélection) */}
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2">Gamme de prix :</span>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              {[
                { label: '≤ 8€', value: '0-8' },
                { label: '9-10€', value: '9-10' },
                { label: '≥ 11€', value: '11+' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => togglePrixRange(range.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedPrixRanges.includes(range.value)
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-semibold">Chargement des clubs...</p>
          </div>
        )}

        {/* Liste des clubs */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredAndSortedClubs.map((club) => (
            <Link
              key={club.id}
              href={`/player/clubs/${club.id}/reserver`}
              onClick={() => {
                console.log('[CLUB LIST CLICK] ✅ Navigation to:', club.name)
                console.log('[CLUB LIST CLICK] club.id:', club.id, 'type:', typeof club.id)
                console.log('[CLUB LIST CLICK] URL will be:', `/player/clubs/${club.id}/reserver`)
                if (!club.id) {
                  console.error('[CLUB LIST CLICK] ❌ WARNING: club.id is undefined/null!')
                }
              }}
              className="group flex gap-6 bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-lg transition-all"
            >
              {/* Image */}
              <div className="relative w-64 h-44 flex-shrink-0 rounded-lg overflow-hidden">
                <img
                  src={club.imageUrl}
                  alt={club.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Distance badge */}
                <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="font-bold text-sm">À {club.distance} min</span>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    toggleFavoris(club.id)
                  }}
                  className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                >
                  <svg 
                    className={`w-5 h-5 ${club.favoris ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                    fill={club.favoris ? 'currentColor' : 'none'}
                    stroke="currentColor" 
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Contenu */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {club.name}
                      </h3>
                      <p className="text-gray-600 flex items-center gap-1.5 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {club.city}
                      </p>
                    </div>
                    {club.disponible && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Disponible
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold text-gray-900">{club.note}</span>
                      <span className="text-gray-500 text-sm">({club.avis} avis)</span>
                    </div>
                    <div className="text-gray-600 text-sm">
                      {club.nombreTerrains} terrains
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {club.equipements.map((eq, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">À partir de</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {club.prixMin}€ <span className="text-base text-gray-500 font-normal">/ pers · 1h30</span>
                    </p>
                  </div>
                  <div className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg group-hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Réserver
                  </div>
                </div>
              </div>
            </Link>
          ))}

            {/* Message si aucun résultat */}
            {filteredAndSortedClubs.length === 0 && (
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
                setSortBy('distance')
              }}
              className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Réinitialiser
            </button>
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
