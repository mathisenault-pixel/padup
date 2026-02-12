'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
import { useLocale } from '@/state/LocaleContext'

// ✅ Force dynamic rendering (pas de pre-render statique)
// Nécessaire car supabaseBrowser accède à document.cookie
export const dynamic = 'force-dynamic'
import { getClubImage, filterOutDemoClub } from '@/lib/clubImages'
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
/** 4 clubs "bientôt disponibles" (cartes non cliquables) - pas de photo existante */
const COMING_SOON_CLUBS = [
  { name: 'Club de padel', city: 'Ouverture bientôt' },
  { name: 'Club de padel', city: 'Ouverture bientôt' },
  { name: 'Club de padel', city: 'Ouverture bientôt' },
  { name: 'Club de padel', city: 'Ouverture bientôt' },
]

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
function getNextAvailability(index: number, t: (k: string) => string): string {
  const now = new Date()
  const currentHour = now.getHours()

  if (currentHour < 14) {
    const hours = [18, 19, 20, 21][index % 4]
    return `${t('common.dispoDes')} ${hours}:00`
  }

  const hours = [9, 10, 14, 18][index % 4]
  return `${t('common.demain')} ${hours}:00`
}

export default function AccueilPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
  // DEMANDE AUTOMATIQUE DE LOCALISATION
  // ============================================
  useEffect(() => {
    // Vérifier si déjà demandé dans cette session
    const hasRequestedLocation = sessionStorage.getItem('locationRequested')
    
    if (hasRequestedLocation === 'true') {
      console.log('[GEOLOCATION] Already requested in this session, skipping')
      return
    }

    // Vérifier si la géolocalisation est disponible
    if (!navigator.geolocation) {
      console.log('[GEOLOCATION] Not available in this browser')
      sessionStorage.setItem('locationRequested', 'true')
      return
    }

    console.log('[GEOLOCATION] Auto-requesting user location...')
    sessionStorage.setItem('locationRequested', 'true')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        console.log('[GEOLOCATION] ✅ Location accepted:', coords)
        setUserCoords(coords)
        setLocationStatus('success')
        setLocationError(null)
      },
      (error) => {
        console.log('[GEOLOCATION] ❌ Location refused or error:', error.message)
        setLocationStatus('error')
        setLocationError('Localisation refusée')
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000, // 5 minutes de cache
      }
    )
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

  return (
    <div className="overflow-x-hidden">
      {/* Clubs - header accueil = logo + onglets + barre de recherche ; puis 1.5cm + 2.8cm ou 2.8cm */}
      <section className="pt-[calc(10rem+1.5cm+2.8cm)] md:pt-[calc(8.5rem+2.8cm)] pb-0 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-black">{t('accueil.clubsTitle')}</h2>
          </div>

          {/* Grille : clubs disponibles + clubs bientôt */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cartes cliquables */}
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
                    {getNextAvailability(index, t)}
                  </p>
                  
                  <p className="text-sm text-black/80">
                    {t('accueil.aPartirDe')} <span className="font-semibold">{club.prixMin} €</span> / {t('accueil.pers')}
                  </p>
                </div>
              </Link>
            ))}

            {/* Cartes bientôt disponibles (non cliquables) - pas de photo */}
            {COMING_SOON_CLUBS.map((club, index) => (
              <div
                key={`bientot-${index}`}
                className="opacity-85 border border-black/10 rounded-lg overflow-hidden cursor-not-allowed select-none"
                role="presentation"
              >
                <div className="relative h-48 overflow-hidden bg-slate-200 flex items-center justify-center">
                  <span className="text-slate-400 text-sm font-medium">—</span>
                  <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-medium bg-black/70 text-white rounded-full">
                    {t('accueil.bientot')}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-semibold text-black mb-2">{club.name}</h3>
                  
                  <p className="text-sm text-black/60 mb-3">
                    {club.city}
                  </p>
                  
                  <p className="text-sm text-black/50 italic">
                    {t('accueil.ouvertureProchainement')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Lien Voir tout */}
          <div className="text-center mt-10 mb-[1.5cm]">
            <Link
              href="/player/clubs"
              className="text-sm text-black/60 hover:text-black underline transition-colors"
            >
              {t('accueil.voirTousClubs')}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA - pt-12/16 = même espace qu'entre hero et "Les meilleurs clubs" */}
      <section className="bg-white pt-12 md:pt-16 pb-16 md:pb-20 border-t border-black/5">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          {/* Contenu centré */}
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 leading-tight tracking-tight">
              {t('accueil.ctaTitle')}
            </h2>
            
            {/* CTA principal unique */}
            <button
              type="button"
              onClick={() => router.push('/player/clubs')}
              className="inline-flex items-center gap-3 px-10 py-4 bg-black text-white font-semibold rounded-xl tracking-wide hover:bg-black/90 shadow-lg transition-all mt-6"
            >
              {t('accueil.voirTerrainsDisponibles')}
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
              <p className="text-sm font-semibold text-black mb-1">{t('accueil.reservation30s')}</p>
              <p className="text-xs text-black/50 font-light">{t('accueil.simpleRapide')}</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-black/5 rounded-full mb-3">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-black mb-1">{t('accueil.paiementSecurise')}</p>
              <p className="text-xs text-black/50 font-light">{t('accueil.surPlaceAuClub')}</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-black/5 rounded-full mb-3">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-black mb-1">{t('accueil.disposTempsReel')}</p>
              <p className="text-xs text-black/50 font-light">{t('accueil.sansAppeler')}</p>
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
              {t('accueil.faqTitle')}
            </h2>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
              {t('accueil.faqSubtitle')}
            </p>
          </div>

          {/* Accordéon FAQ */}
          <div className="space-y-2 max-w-3xl mx-auto">
            {[
              { q: 'faq.q1', a: 'faq.a1' },
              { q: 'faq.q2', a: 'faq.a2' },
              { q: 'faq.q3', a: 'faq.a3' },
              { q: 'faq.q4', a: 'faq.a4' },
              { q: 'faq.q5', a: 'faq.a5' },
            ].map((faq, i) => (
              <details key={i} className="group border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-all">
                <summary className="flex items-center justify-between px-5 md:px-6 py-4 cursor-pointer hover:bg-slate-50 transition-all">
                  <span className="text-sm md:text-base font-semibold text-slate-900 pr-4">{t(faq.q)}</span>
                  <svg className="w-4 h-4 text-slate-600 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 md:px-6 pb-4 pt-2 text-xs md:text-sm text-slate-600 leading-relaxed">
                  <p>{t(faq.a)}</p>
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
              {t('accueil.trouverUnClub')}
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
                <p className="text-xs font-bold text-gray-600 uppercase">{t('accueil.terrains')}</p>
              </div>
              <div className="bg-slate-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-slate-900 mb-1">{selectedClub.note.toFixed(1)}★</p>
                <p className="text-xs font-bold text-slate-700 uppercase">{t('accueil.note')}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-gray-900 mb-1">{selectedClub.prixMin}€</p>
                <p className="text-xs font-bold text-gray-600 uppercase">{t('accueil.prixH')}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowReservationModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-full transition-all"
              >
                {t('accueil.annuler')}
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Réservation confirmée au ${selectedClub.name} !`)
                  setShowReservationModal(false)
                }}
                className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-full transition-all"
              >
                {t('accueil.confirmer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
