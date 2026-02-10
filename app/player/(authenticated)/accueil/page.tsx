'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'

// ✅ Force dynamic rendering (pas de pre-render statique)
// Nécessaire car supabaseBrowser accède à document.cookie
export const dynamic = 'force-dynamic'
import SmartSearchBar from '../components/SmartSearchBar'
import UseMyLocationButton from '@/components/UseMyLocationButton'
import { getClubImage, filterOutDemoClub } from '@/lib/clubImages'
import { getCitySuggestions } from '@/lib/cities'
import { haversineKm, formatTravelTime, estimateMinutes, formatDistance } from '@/lib/geoUtils'
import { SectionDivider } from '@/components/ui/SectionDivider'
import { getClubById } from '@/lib/data/clubs'

type Club = {
  id: string // ✅ UUID depuis public.clubs
  name: string // ✅ Correspond à public.clubs.name
  city: string // ✅ Correspond à public.clubs.city
  lat: number // ✅ Latitude GPS
  lng: number // ✅ Longitude GPS
  distance: string
  distanceKm?: number // ✅ Distance calculée (si géoloc active)
  nombreTerrains: number
  note: number
  avis: number
  photo: string
  imageUrl: string
  prixMin: number
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

/**
 * Génère une prochaine disponibilité mock réaliste
 * TODO: Remplacer par les vraies données depuis l'API
 */
function getNextAvailability(index: number): string {
  const now = new Date()
  const currentHour = now.getHours()
  
  // Si on est le matin (avant 14h), montrer une dispo ce jour
  if (currentHour < 14) {
    const hours = [18, 19, 20, 21][index % 4]
    return `Dispo dès ${hours}:00`
  }
  
  // Sinon, montrer demain
  const hours = [9, 10, 14, 18][index % 4]
  return `Demain ${hours}:00`
}

export default function AccueilPage() {
  const router = useRouter()
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSearchError, setShowSearchError] = useState(false)

  const [clubs, setClubs] = useState<Club[]>([])

  // ============================================
  // CHARGEMENT DES CLUBS DEPUIS SUPABASE
  // ============================================
  // ✅ Identique connecté ou non (pas de filtre user/owner_id/memberships)
  useEffect(() => {
    const loadClubs = async () => {
      console.log('[ACCUEIL] Loading clubs from Supabase...')
      console.log('[ACCUEIL] Query: from("clubs").select("id,name,city").order("created_at",{ascending:false})')
      
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name, city')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('[ACCUEIL] Error loading clubs:', error)
        console.error('[ACCUEIL] Error details:', JSON.stringify(error, null, 2))
        setIsLoading(false)
        return
      }
      
      console.log('[ACCUEIL] ✅ Clubs loaded:', data?.length || 0, 'clubs')
      console.log('[ACCUEIL] Data:', data)
      
      // Transformer les données Supabase en format UI
      const clubsWithUI = (data || []).map((club, index) => {
        const coords = CLUB_COORDINATES[club.id] || { lat: 43.9, lng: 4.8 } // Fallback Avignon
        const clubData = getClubById(club.id) // Récupérer les vraies données
        return {
          id: club.id,
          name: club.name || 'Club sans nom',
          city: club.city || 'Ville non spécifiée',
          lat: coords.lat,
          lng: coords.lng,
          distance: `${5 + index * 5} min`, // Sera recalculé avec géoloc
          nombreTerrains: 6 + index * 2, // TODO: Compter depuis public.courts
          note: 4.6 + (index * 0.1),
          avis: 100 + index * 50,
          photo: ['🏗️', '🎾', '⚡', '🏟️'][index % 4],
          imageUrl: getClubImage(club.id), // ✅ Image par clubId
          prixMin: clubData?.prixMin || 11 + index, // Utiliser le vrai prix depuis CLUBS_DATA
        }
      })
      
      // ✅ Filtrer pour exclure le Club Démo
      const filteredClubs = filterOutDemoClub(clubsWithUI)
      console.log('[ACCUEIL] ✅ Filtered clubs (without demo):', filteredClubs.length, 'clubs')
      
      setClubs(filteredClubs)
      setIsLoading(false)
    }
    
    loadClubs()
  }, [])

  // ============================================
  // CALCUL DES DISTANCES ET TRI
  // ============================================
  const clubsWithDistance = useMemo(() => {
    if (!userCoords) {
      // Pas de géoloc: retourner les clubs sans tri
      return clubs
    }

    // Calculer la distance pour chaque club
    const clubsWithDist = clubs.map(club => {
      const distanceKm = haversineKm(
        userCoords.lat,
        userCoords.lng,
        club.lat,
        club.lng
      )
      const distanceMinutes = estimateMinutes(distanceKm)
      
      return {
        ...club,
        distanceKm,
        distance: formatTravelTime(distanceMinutes)
      }
    })

    // Trier du plus proche au plus éloigné
    return clubsWithDist.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))
  }, [clubs, userCoords])

  const handleReserver = (club: Club) => {
    setSelectedClub(club)
    setShowReservationModal(true)
  }

  const handleCTAClick = () => {
    // Lire la valeur actuelle du champ de recherche
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
    const currentQuery = searchInput?.value || ''
    
    if (!currentQuery.trim()) {
      setShowSearchError(true)
      searchInput?.focus()
      // Masquer le message après 3 secondes
      setTimeout(() => setShowSearchError(false), 3000)
      return
    }
    // Naviguer vers la page clubs avec le filtre
    router.push(`/player/clubs?q=${encodeURIComponent(currentQuery)}`)
  }

  const handleEnterCity = () => {
    // Scroll vers le hero et focus la search
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => {
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
      searchInput?.focus()
    }, 300)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero - ULTRA PREMIUM - Compact */}
      <section className="px-4 pt-12 sm:pt-16 pb-6 md:pb-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <div className="inline-block mb-4 sm:mb-5">
              <span className="px-4 py-2.5 sm:px-8 sm:py-3 bg-black text-white text-xs sm:text-sm font-medium rounded-full tracking-wide whitespace-nowrap">
                Réserver un terrain n'a jamais été aussi simple
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-black mb-3 sm:mb-4 leading-[0.95] tracking-tight px-2">
              Réservez un terrain de padel en 30 secondes
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-black/60 mb-6 sm:mb-8 max-w-3xl mx-auto font-light tracking-tight px-2">
              Disponibilités en temps réel, réservation sans appel ni attente.
            </p>

            {/* BARRE DE RECHERCHE */}
            <div className="max-w-4xl mx-auto mb-4">
              <SmartSearchBar
                placeholder="Ville ou club (ex : Paris, Lyon, Le Hangar…)"
                onSearch={(query) => {
                  // Naviguer directement vers les clubs avec le filtre
                  router.push(`/player/clubs?q=${encodeURIComponent(query)}`)
                }}
                suggestions={[
                  'Le Hangar Sport & Co',
                  'Paul & Louis Sport',
                  'ZE Padel',
                  'QG Padel Club',
                  ...getCitySuggestions()
                ]}
                storageKey="search-history-accueil"
                compact={false}
              />
              {showSearchError && (
                <p className="text-sm text-black/50 mt-2 font-light animate-fade-in">
                  Entrez une ville ou un club
                </p>
              )}
            </div>

            {/* CTA PRINCIPAL */}
            <div className="max-w-4xl mx-auto mb-4">
              <button
                type="button"
                onClick={handleCTAClick}
                className="w-full sm:w-auto px-8 py-4 bg-black text-white font-light rounded-lg tracking-wide text-base hover:bg-black/80"
                style={{ 
                  transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)',
                  minHeight: '48px' // Hauteur tactile iOS
                }}
              >
                Voir les terrains disponibles
              </button>
            </div>

            {/* MICRO-PREUVE */}
            <div className="text-center mb-8">
              <p className="text-sm text-black/40 font-light tracking-wide">
                Aucun frais pour les joueurs · Disponibilités en temps réel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clubs - MINIMAL STYLE */}
      <section className="pt-12 md:pt-16 pb-16 md:pb-24 px-6 bg-white border-t border-black/5">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-black mb-3 tracking-tight">Clubs autour de chez moi</h2>
              <p className="text-lg md:text-xl text-black/50 font-light">Découvrez nos meilleures adresses</p>
            </div>
            <Link
              href="/player/clubs"
              className="hidden md:inline-flex text-sm text-black hover:text-black/60 font-light items-center gap-2 group tracking-wide"
              style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              Voir tout
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ transition: 'transform 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Bouton de géolocalisation + fallback */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <UseMyLocationButton
                onCoords={(coords) => {
                  setUserCoords(coords);
                  setLocationStatus('success');
                  setLocationError(null);
                  console.log('📍 Position détectée:', coords);
                  console.log('✅ Les clubs vont être triés par distance réelle');
                }}
                onError={(error) => {
                  setLocationStatus('error');
                  setLocationError(error);
                }}
              />
              <button
                type="button"
                onClick={handleEnterCity}
                className="text-sm text-black/60 hover:text-black font-light underline underline-offset-4 transition-colors"
              >
                Entrer une ville
              </button>
            </div>
            
            {/* Message de succès */}
            {locationStatus === 'success' && userCoords && (
              <div className="mt-6 p-5 bg-black text-white rounded-lg flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"></span>
                <p className="text-sm font-light tracking-wide">
                  Position détectée. Clubs triés par distance.
                </p>
              </div>
            )}
            
            {/* Message d'erreur */}
            {locationStatus === 'error' && locationError && (
              <div className="mt-4 p-4 bg-black/5 border border-black/10 rounded-lg flex items-start gap-3">
                <p className="text-sm text-black/70 font-light">
                  {locationError} — <button onClick={handleEnterCity} className="underline hover:text-black">entrez une ville</button>
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clubsWithDistance.map((club, index) => (
              <Link
                key={club.id}
                href={`/player/clubs/${club.id}/reserver`}
                onClick={() => {
                  console.log('[CLUB CARD CLICK] ✅ Navigation to:', club.name)
                  console.log('[CLUB CARD CLICK] club.id:', club.id, 'type:', typeof club.id)
                  console.log('[CLUB CARD CLICK] URL will be:', `/player/clubs/${club.id}/reserver`)
                  if (!club.id) {
                    console.error('[CLUB CARD CLICK] ❌ WARNING: club.id is undefined/null!')
                  }
                }}
                className="group bg-white border border-black/10 rounded-xl overflow-hidden hover:border-black/30 block"
                style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={club.imageUrl}
                    alt={club.name}
                    className="w-full h-full object-cover"
                    style={{ transition: 'transform 1200ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  
                  {index === 0 && (
                    <div className="absolute top-5 left-5 px-4 py-2 bg-black text-white text-xs font-light rounded-md tracking-widest">
                      TOP
                    </div>
                  )}

                  <div className="absolute top-5 right-5 flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-md">
                    <span className="text-sm font-medium text-black">{club.note.toFixed(1)}</span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-2xl font-bold mb-1 tracking-tight">{club.name}</h3>
                    <p className="text-sm text-white/80 font-light">{club.city}</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-black/5">
                    <div className="flex items-center gap-2 text-sm text-black/50">
                      {club.distanceKm !== undefined ? (
                        <span className="font-light">
                          {formatDistance(club.distanceKm)}
                        </span>
                      ) : (
                        <span className="font-light">{club.distance}</span>
                      )}
                    </div>
                    <div className="text-sm text-black/50 font-light">
                      {club.nombreTerrains} terrains
                    </div>
                  </div>

                  {/* Prochaine disponibilité */}
                  <div className="mb-4 py-2 px-3 bg-black/5 rounded-lg">
                    <p className="text-xs text-black/60 font-medium tracking-wide">
                      {getNextAvailability(index)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-black tracking-tight">{club.prixMin}€</span>
                      <span className="text-sm text-black/50 font-light">par personne</span>
                    </div>
                    <p className="text-xs text-black/40 mt-1 font-light">1h30 de jeu</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12 md:hidden">
            <button
              type="button"
              onClick={() => router.push('/player/clubs')}
              className="inline-flex items-center gap-3 px-12 py-4 bg-black text-white font-light rounded-lg tracking-wide"
              style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              Tous les clubs
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* RAPPELS AUTOMATIQUES - COMPACT */}
      <section className="bg-white mt-16 md:mt-20 mb-16 md:mb-20 border-t border-black/5">
        <div className="mx-auto max-w-7xl px-6 md:px-8 py-12 md:py-16">
          {/* Header */}
          <div className="mb-10 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 leading-tight tracking-tight">
              Rappels automatiques
            </h2>
            <p className="text-base md:text-lg text-black/50 leading-relaxed font-light">
              Ne manquez plus jamais vos réservations. Recevez des notifications automatiques à chaque étape.
            </p>
          </div>

          {/* Features Grid - Mini cards compactes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Confirmation instantanée',
                description: 'Recevez immédiatement un e-mail de confirmation avec tous les détails',
              },
              {
                title: 'Rappel 24h avant',
                description: 'Un e-mail automatique vous rappelle votre session pour ne rien oublier',
              },
              {
                title: 'Notification dernière minute',
                description: 'Recevez un dernier rappel 2h avant votre match',
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="p-5 border border-black/10 rounded-xl bg-white hover:border-black/20 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <svg className="w-5 h-5 text-black flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-base font-semibold text-black mb-2 tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-black/60 leading-relaxed font-light">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* CTA - MINIMAL */}
      <section className="bg-black text-white mt-24 md:mt-32">
        <div className="mx-auto max-w-7xl px-6 md:px-8 py-20 md:py-32">
          {/* Contenu centré */}
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
              Prêt à jouer ?
            </h2>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed mb-12 font-light">
              Trouvez votre terrain de padel et réservez en quelques clics. Simple, rapide et sans frais.
            </p>
            
            {/* CTA principal + lien secondaire */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => router.push('/player/clubs')}
                className="inline-flex items-center gap-3 px-10 py-4 bg-white text-black font-light rounded-lg tracking-wide hover:bg-white/90"
                style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                Voir les terrains disponibles
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <Link
                href="/a-propos"
                className="text-sm text-white/60 hover:text-white font-light inline-flex items-center gap-2 group tracking-wide"
                style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                En savoir plus
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ transition: 'transform 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Bénéfices crédibles */}
          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-lg mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-lg font-semibold mb-2 tracking-tight">Réservation en 30 secondes</p>
                <p className="text-sm text-white/50 font-light">Trouvez et réservez votre terrain en quelques clics</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-lg mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-lg font-semibold mb-2 tracking-tight">Paiement sécurisé</p>
                <p className="text-sm text-white/50 font-light">Payez directement sur place, aucune CB requise en ligne</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-lg mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-lg font-semibold mb-2 tracking-tight">Disponibilités en temps réel</p>
                <p className="text-sm text-white/50 font-light">Voyez instantanément les créneaux libres sans appeler</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* FAQ - STYLE PRO */}
      <section className="bg-white mt-8 md:mt-12 mb-16 md:mb-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8 py-12 md:py-16">
          {/* Header */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5 leading-tight">
              Questions fréquentes
            </h2>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed">
              Tout ce que vous devez savoir sur Pad'Up et nos services de réservation
            </p>
          </div>

          {/* Accordéon FAQ */}
          <div className="space-y-3 max-w-4xl mx-auto">
            {[
              {
                question: "Comment réserver un terrain ?",
                answer: "Il vous suffit de rechercher un club, de sélectionner le créneau horaire souhaité et de confirmer votre réservation. Vous recevrez une confirmation immédiate par email."
              },
              {
                question: "Le paiement est-il sécurisé ?",
                answer: "Oui, vous payez directement sur place au club. Aucune carte bancaire n'est requise lors de la réservation en ligne, ce qui garantit une sécurité maximale."
              },
              {
                question: "Puis-je annuler ma réservation ?",
                answer: "Oui, vous pouvez annuler votre réservation depuis votre espace personnel. Les conditions d'annulation dépendent de chaque club et sont indiquées lors de la réservation."
              },
              {
                question: "Y a-t-il des frais de service ?",
                answer: "Non, Pad'Up est 100% gratuit pour les joueurs. Vous ne payez que le prix du terrain directement au club."
              },
              {
                question: "Comment recevoir les rappels de mes matchs ?",
                answer: "Vous recevez automatiquement des notifications par email avant vos réservations. Vous pouvez gérer vos préférences de notification dans votre profil."
              }
            ].map((faq, i) => (
              <details key={i} className="group border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-all">
                <summary className="flex items-center justify-between px-6 md:px-8 py-5 cursor-pointer hover:bg-slate-50 transition-all">
                  <span className="text-base md:text-lg font-semibold text-slate-900 pr-4">{faq.question}</span>
                  <svg className="w-5 h-5 text-slate-600 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 md:px-8 pb-5 pt-3 text-sm md:text-base text-slate-600 leading-relaxed">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>

          {/* CTA Footer */}
          <div className="mt-16 text-center">
            <p className="text-sm font-semibold text-slate-900 mb-3">
              Vous avez d'autres questions ?
            </p>
            <Link
              href="/faq"
              className="text-sm text-slate-700 hover:text-slate-900 transition-colors font-medium inline-flex items-center gap-2 group"
            >
              Consulter la FAQ complète
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showReservationModal && selectedClub && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReservationModal(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-1">{selectedClub.name}</h3>
                <p className="text-gray-600">{selectedClub.city}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowReservationModal(false)}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all"
              >
                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-gray-900 mb-1">{selectedClub.nombreTerrains}</p>
                <p className="text-xs font-bold text-gray-600 uppercase">Terrains</p>
              </div>
              <div className="bg-slate-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-slate-900 mb-1">{selectedClub.note.toFixed(1)}★</p>
                <p className="text-xs font-bold text-slate-700 uppercase">Note</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-gray-900 mb-1">{selectedClub.prixMin}€</p>
                <p className="text-xs font-bold text-gray-600 uppercase">Prix/h</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowReservationModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-full transition-all"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Réservation confirmée au ${selectedClub.name} !`)
                  setShowReservationModal(false)
                }}
                className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-full transition-all"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
