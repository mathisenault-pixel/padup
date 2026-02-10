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
      {/* Hero - PREMIUM SIMPLIFIÉ */}
      <section className="px-4 pt-10 sm:pt-14 pb-20 md:pb-32 min-h-[calc(100vh-56px)]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <div className="inline-block mb-3 sm:mb-4">
              <span className="px-4 py-2.5 sm:px-8 sm:py-3 bg-black text-white text-xs sm:text-sm font-medium rounded-full tracking-wide whitespace-nowrap">
                Réserver un terrain n'a jamais été aussi simple
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-black mb-3 sm:mb-4 leading-[0.95] tracking-tight px-2">
              Réservez un terrain de padel en 30 secondes
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-black/60 mb-5 sm:mb-6 max-w-3xl mx-auto font-light tracking-tight px-2">
              Disponibilités en temps réel, réservation sans appel ni attente.
            </p>

            {/* BARRE DE RECHERCHE */}
            <div className="max-w-4xl mx-auto mb-5">
              <SmartSearchBar
                placeholder="Ville ou club (ex : Paris, Lyon, Le Hangar…)"
                onSearch={(query) => {
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
            <div className="max-w-4xl mx-auto">
              <button
                type="button"
                onClick={handleCTAClick}
                className="w-full sm:w-auto px-10 py-4 bg-black text-white font-medium rounded-lg tracking-wide text-base hover:bg-black/90 shadow-lg hover:shadow-xl transition-all"
              >
                Voir les terrains disponibles
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Clubs */}
      <section className="pt-12 md:pt-16 pb-16 md:pb-20 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-6">Les meilleurs clubs près de chez vous</h2>
            
            <div className="flex items-center gap-3">
              <UseMyLocationButton
                onCoords={(coords) => {
                  setUserCoords(coords);
                  setLocationStatus('success');
                  setLocationError(null);
                }}
                onError={(error) => {
                  setLocationStatus('error');
                  setLocationError(error);
                }}
              />
              <button
                type="button"
                onClick={handleEnterCity}
                className="text-sm text-black/60 hover:text-black underline transition-colors"
              >
                Entrer une ville
              </button>
            </div>
            
            {/* Messages status */}
            {locationStatus === 'success' && userCoords && (
              <p className="mt-3 text-xs text-black/60">Clubs triés par distance</p>
            )}
            {locationStatus === 'error' && locationError && (
              <p className="mt-3 text-xs text-black/60">
                {locationError} — <button onClick={handleEnterCity} className="underline">entrez une ville</button>
              </p>
            )}
          </div>

          {/* Grille */}
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
                className="group block border border-black/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image simple */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={club.imageUrl}
                    alt={club.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Bloc texte aligné à gauche */}
                <div className="p-4">
                  <h3 className="text-base font-semibold text-black mb-2">{club.name}</h3>
                  
                  <p className="text-sm text-black/60 mb-3">
                    {club.city} • {club.distanceKm !== undefined ? formatDistance(club.distanceKm) : club.distance}
                  </p>
                  
                  <p className="text-sm text-black mb-2">
                    {getNextAvailability(index)}
                  </p>
                  
                  <p className="text-sm text-black/80">
                    À partir de <span className="font-semibold">{club.prixMin} €</span> / pers
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Lien Voir tout */}
          <div className="text-center mt-10">
            <Link
              href="/player/clubs"
              className="text-sm text-black/60 hover:text-black underline transition-colors"
            >
              Voir tous les clubs
            </Link>
          </div>
        </div>
      </section>

      {/* 3 ÉTAPES - PREMIUM */}
      <section className="bg-white mt-16 md:mt-20 mb-16 md:mb-20 border-t border-black/5">
        <div className="mx-auto max-w-6xl px-6 md:px-8 py-12 md:py-16">
          {/* Header */}
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-3 leading-tight tracking-tight">
              Réserver n'a jamais été aussi simple
            </h2>
            <p className="text-sm md:text-base text-black/50 leading-relaxed font-light">
              Confirmation immédiate et rappels automatiques inclus
            </p>
          </div>

          {/* 3 étapes horizontales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: '1',
                title: 'Trouvez un club',
                description: 'Recherchez par ville ou utilisez votre localisation',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                ),
              },
              {
                number: '2',
                title: 'Choisissez un créneau',
                description: 'Disponibilités en temps réel, réservation instantanée',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                ),
              },
              {
                number: '3',
                title: 'Jouez',
                description: 'Présentez-vous au club, payez sur place et jouez',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((step, i) => (
              <div 
                key={i} 
                className="relative text-center"
              >
                <div className="flex flex-col items-center">
                  <div className="mb-4 w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -left-2 w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                    <span className="text-lg font-bold text-black/30">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2 tracking-tight">{step.title}</h3>
                  <p className="text-sm text-black/60 leading-relaxed font-light max-w-xs">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white mt-16 md:mt-20 py-16 md:py-20 border-t border-black/5">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          {/* Contenu centré */}
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 leading-tight tracking-tight">
              Réservez votre terrain en quelques clics
            </h2>
            
            {/* CTA principal unique */}
            <button
              type="button"
              onClick={() => router.push('/player/clubs')}
              className="inline-flex items-center gap-3 px-10 py-4 bg-black text-white font-semibold rounded-xl tracking-wide hover:bg-black/90 shadow-lg transition-all mt-6"
            >
              Voir les terrains disponibles
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {/* 3 bénéfices - Compacts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8 border-t border-black/5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-black/5 rounded-full mb-3">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-black mb-1">Réservation en 30 secondes</p>
              <p className="text-xs text-black/50 font-light">Simple et rapide</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-black/5 rounded-full mb-3">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-black mb-1">Paiement sécurisé</p>
              <p className="text-xs text-black/50 font-light">Sur place au club</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-black/5 rounded-full mb-3">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-black mb-1">Disponibilités en temps réel</p>
              <p className="text-xs text-black/50 font-light">Sans appeler le club</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - COMPACT */}
      <section className="bg-white mt-12 md:mt-16 mb-12 md:mb-16 border-t border-black/5">
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
