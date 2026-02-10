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
      {/* Hero - SIMPLIFIÉ */}
      <section className="px-4 pt-16 pb-12">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            {/* Titre */}
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3 leading-tight">
              Réservez un terrain de padel en 30 secondes
            </h1>
            
            {/* Sous-texte */}
            <p className="text-sm text-black/60 mb-8">
              Disponibilités en temps réel. Réservation instantanée. Sans frais.
            </p>

            {/* BARRE DE RECHERCHE */}
            <div className="max-w-2xl mx-auto mb-5">
              <SmartSearchBar
                placeholder="Où voulez-vous jouer ? (ville ou club)"
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
                <p className="text-sm text-black/50 mt-2">
                  Entrez une ville ou un club
                </p>
              )}
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={handleCTAClick}
              className="px-8 py-3 bg-black text-white font-medium rounded-lg text-sm hover:bg-black/90 transition-colors"
            >
              Voir les terrains disponibles
            </button>
          </div>
        </div>
      </section>

      {/* Clubs */}
      <section className="pt-8 pb-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black">Clubs près de chez vous</h2>
            
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
          </div>

          {/* Message status */}
          {locationStatus === 'success' && userCoords && (
            <div className="mb-4 text-xs text-black/60">
              Clubs triés par distance
            </div>
          )}
          
          {locationStatus === 'error' && locationError && (
            <div className="mb-4 text-xs text-black/60">
              {locationError} — <button onClick={handleEnterCity} className="underline">entrez une ville</button>
            </div>
          )}

          {/* Grille */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clubsWithDistance.map((club, index) => (
              <Link
                key={club.id}
                href={`/player/clubs/${club.id}/reserver`}
                className="group block"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden rounded-lg mb-3">
                  <img
                    src={club.imageUrl}
                    alt={club.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Infos */}
                <div>
                  <h3 className="text-sm font-semibold text-black mb-1">{club.name}</h3>
                  <p className="text-xs text-black/60 mb-2">{club.city}</p>
                  
                  <div className="flex items-center gap-3 text-xs text-black/60 mb-2">
                    <span>{club.note.toFixed(1)} ★</span>
                    <span>{getNextAvailability(index)}</span>
                  </div>
                  
                  <p className="text-xs text-black/80 font-medium">
                    {club.prixMin}€ / personne
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Voir tous */}
          <div className="text-center mt-8">
            <Link
              href="/player/clubs"
              className="text-sm text-black/60 hover:text-black underline"
            >
              Voir tous les clubs
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ça marche - Ligne discrète */}
      <section className="bg-white py-8 border-t border-black/5">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-center text-sm text-black/60">
            Trouvez un club → Choisissez un créneau → Jouez
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-12 border-t border-black/5">
        <div className="mx-auto max-w-3xl px-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-black">
              Questions fréquentes
            </h2>
          </div>

          {/* Accordéon FAQ */}
          <div className="space-y-2">
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
              <details key={i} className="group border border-black/10 rounded-lg overflow-hidden">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-black/5">
                  <span className="text-sm font-medium text-black pr-4">{faq.question}</span>
                  <svg className="w-4 h-4 text-black/60 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-3 pt-1 text-xs text-black/60">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
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
