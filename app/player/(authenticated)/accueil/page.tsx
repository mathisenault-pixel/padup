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
      {/* Hero - SEARCH FIRST */}
      <section className="px-4 pt-16 sm:pt-20 pb-12 md:pb-16">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center">
            {/* H1 discret, secondaire */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-2 leading-tight tracking-tight">
              Réservez un terrain de padel
            </h1>
            
            <p className="text-sm sm:text-base text-black/50 mb-8 font-light">
              Disponibilités en temps réel, partout en France
            </p>

            {/* BARRE DE RECHERCHE - ÉLÉMENT CENTRAL */}
            <div className="max-w-3xl mx-auto mb-6">
              <SmartSearchBar
                placeholder="Où voulez-vous jouer ? (ville ou club)"
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

            {/* CTA PRINCIPAL UNIQUE */}
            <div className="max-w-3xl mx-auto">
              <button
                type="button"
                onClick={handleCTAClick}
                className="w-full sm:w-auto px-12 py-4 bg-black text-white font-semibold rounded-xl text-base hover:bg-black/90 shadow-lg hover:shadow-xl transition-all"
              >
                Voir les terrains disponibles
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Clubs - STYLE AIRBNB */}
      <section className="pt-12 md:pt-16 pb-16 md:pb-24 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          {/* Header minimaliste */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-black tracking-tight">Clubs près de chez vous</h2>
            
            <div className="flex items-center gap-3">
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
            </div>
          </div>

          {/* Message status - Discret */}
          {locationStatus === 'success' && userCoords && (
            <div className="mb-6 py-2 px-4 bg-black/5 rounded-lg inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0"></span>
              <p className="text-xs font-medium text-black/70">
                Clubs triés par distance
              </p>
            </div>
          )}
          
          {locationStatus === 'error' && locationError && (
            <div className="mb-6 py-2 px-4 bg-black/5 rounded-lg inline-flex items-start gap-2">
              <p className="text-xs text-black/60">
                {locationError} — <button onClick={handleEnterCity} className="underline hover:text-black font-medium">entrez une ville</button>
              </p>
            </div>
          )}

          {/* Grille style Airbnb - 3 colonnes large */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                className="group block"
                style={{ transition: 'all 200ms ease' }}
              >
                {/* Image dominante */}
                <div className="relative h-80 md:h-[22rem] overflow-hidden rounded-2xl mb-3">
                  <img
                    src={club.imageUrl}
                    alt={club.name}
                    className="w-full h-full object-cover group-hover:scale-[1.01]"
                    style={{ transition: 'transform 300ms ease' }}
                  />
                  
                  {/* Note discrète */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                    <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-semibold text-black">{club.note.toFixed(1)}</span>
                  </div>
                </div>

                {/* Infos essentielles */}
                <div className="px-0.5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-black mb-1 tracking-tight">{club.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-black/50 mb-2">
                        <span className="font-light">
                          {club.distanceKm !== undefined ? formatDistance(club.distanceKm) : club.distance}
                        </span>
                        <span className="text-black/30">·</span>
                        <span className="font-light">{club.note.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Prochaine disponibilité - Badge discret */}
                  <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/5 rounded-md">
                    <svg className="w-3.5 h-3.5 text-black/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-black/70 font-medium">
                      {getNextAvailability(index)}
                    </span>
                  </div>
                  
                  {/* Prix - Secondaire */}
                  <p className="text-xs text-black/50">
                    <span className="font-medium text-black/70">{club.prixMin}€</span>
                    <span className="font-light"> / personne</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA Voir tout - Discret */}
          <div className="text-center mt-12">
            <Link
              href="/player/clubs"
              className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black font-medium transition-colors"
            >
              Voir tous les clubs
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE - PREMIUM */}
      <section className="bg-white py-14 md:py-16 border-t border-black/5">
        <div className="mx-auto max-w-5xl px-6 md:px-8">
          {/* Header */}
          <div className="text-center mb-10 max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-black leading-tight tracking-tight">
              Comment ça marche
            </h2>
          </div>

          {/* 3 étapes - Icône + Titre + Description */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {[
              {
                title: 'Trouvez un club',
                description: 'Recherchez par ville ou géolocalisation',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                ),
              },
              {
                title: 'Choisissez un créneau',
                description: 'Disponibilités en temps réel',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                ),
              },
              {
                title: 'Jouez',
                description: 'Confirmation immédiate par email',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((step, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center mb-3">
                  {step.icon}
                </div>
                <h3 className="text-base font-semibold text-black mb-1">{step.title}</h3>
                <p className="text-sm text-black/50 font-light">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POSITIONNEMENT - SECTION NOIRE */}
      <section className="bg-black text-white py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6 md:px-8">
          {/* Message principal */}
          <div className="text-center flex flex-col items-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight tracking-tight">
              La façon la plus simple de réserver un terrain de padel
            </h2>
            
            {/* CTA principal - TRÈS VISIBLE */}
            <button
              type="button"
              onClick={() => router.push('/player/clubs')}
              className="inline-flex items-center gap-3 px-14 py-5 bg-white text-black font-bold rounded-xl text-base hover:bg-gray-100 shadow-2xl transition-all mb-10"
            >
              Voir les terrains disponibles
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            {/* 3 bénéfices - Inline compacts */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-light text-white/80">Réservation en 30 secondes</p>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-sm font-light text-white/80">Paiement sécurisé</p>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-sm font-light text-white/80">Disponibilités en temps réel</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION POUR LES CLUBS */}
      <section className="bg-white py-16 md:py-20 border-t border-black/5">
        <div className="mx-auto max-w-3xl px-6 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-3 leading-tight tracking-tight">
            Vous êtes un club de padel ?
          </h2>
          <p className="text-base md:text-lg text-black/60 mb-8 font-light">
            Augmentez vos réservations et gérez vos terrains simplement.
          </p>
          <Link
            href="/club-access"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm text-black bg-black/5 hover:bg-black hover:text-white border border-black/10 hover:border-black rounded-xl font-medium transition-all"
          >
            Découvrir l'espace club
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* FAQ - COMPACT */}
      <section className="bg-white mb-12 md:mb-16 border-t border-black/5">
        <div className="mx-auto max-w-5xl px-6 md:px-8 py-10 md:py-12">
          {/* Header */}
          <div className="text-center mb-8 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 leading-tight">
              Questions fréquentes
            </h2>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
              Tout ce que vous devez savoir sur Pad'Up
            </p>
          </div>

          {/* Accordéon FAQ */}
          <div className="space-y-2 max-w-3xl mx-auto">
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
              <details key={i} className="group border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-all">
                <summary className="flex items-center justify-between px-5 md:px-6 py-4 cursor-pointer hover:bg-slate-50 transition-all">
                  <span className="text-sm md:text-base font-semibold text-slate-900 pr-4">{faq.question}</span>
                  <svg className="w-4 h-4 text-slate-600 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 md:px-6 pb-4 pt-2 text-xs md:text-sm text-slate-600 leading-relaxed">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>

          {/* CTA Footer discret */}
          <div className="mt-10 text-center">
            <Link
              href="/player/clubs"
              className="inline-flex items-center gap-2 px-8 py-3 text-sm text-slate-700 hover:text-white bg-slate-100 hover:bg-black rounded-lg font-medium transition-all shadow-sm"
            >
              Trouver un club
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
