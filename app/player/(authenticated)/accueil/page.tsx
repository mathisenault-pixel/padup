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

export default function AccueilPage() {
  const router = useRouter()
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
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
          prixMin: 11 + index,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50/30">
      {/* Hero - PREMIUM */}
      <section className="px-6 pt-6 md:pt-12 pb-16 md:pb-24">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <span className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-full shadow-lg">
                Jouez plus, cherchez moins
              </span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black text-gray-900 mb-6 leading-none">
              Réservez votre terrain de padel
            </h1>
            
            <p className="text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Accédez aux meilleurs clubs de France et réservez votre terrain en quelques clics.
            </p>

            {/* BARRE DE RECHERCHE */}
            <div className="max-w-4xl mx-auto">
              <SmartSearchBar
                placeholder="Rechercher un club ou une ville"
                onSearch={(query) => {
                  console.log('Recherche:', query)
                  // Logique de recherche ici
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
            </div>

            <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">🇫🇷 Made in France</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Disponibilités en temps réel</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Réservations sans frais</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Séparation Hero → Clubs */}
      <div className="mt-10 mb-10 w-full flex justify-center px-6">
        <div className="h-px w-full max-w-5xl bg-slate-200" />
      </div>

      {/* Clubs - CAROUSEL CARDS STYLE */}
      <section className="pt-[3px] pb-8 md:pb-12 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-3">Clubs autour de chez moi</h2>
              <p className="text-xl text-gray-600">Découvrez nos meilleures adresses</p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/player/clubs')}
              className="hidden md:flex items-center gap-2 text-gray-900 font-bold hover:text-slate-700 transition-colors"
            >
              Voir tout
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {/* Bouton de géolocalisation */}
          <div className="mb-8">
            <UseMyLocationButton
              onCoords={(coords) => {
                setUserCoords(coords);
                setLocationStatus('success');
                console.log('📍 Position détectée:', coords);
                console.log('✅ Les clubs vont être triés par distance réelle');
              }}
            />
            
            {/* ✅ Affichage propre sans popup */}
            {locationStatus === 'success' && userCoords && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-green-800">
                  📍 Position détectée ! Les clubs sont maintenant triés du plus proche au plus éloigné.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
                className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all block"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={club.imageUrl}
                    alt={club.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {index === 0 && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-lg">
                      ⭐ Top choix
                    </div>
                  )}

                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-lg">
                    <svg className="w-4 h-4 text-slate-900 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-black text-gray-900">{club.note.toFixed(1)}</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-black mb-1">{club.name}</h3>
                    <p className="text-sm text-white/90">{club.city}</p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {club.distanceKm !== undefined ? (
                        <span className="font-medium">
                          {club.distance} • {formatDistance(club.distanceKm)}
                        </span>
                      ) : (
                        <span className="font-medium">{club.distance}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {club.nombreTerrains} terrains
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-gray-900">{club.prixMin}€</span>
                      <span className="text-sm text-gray-600">par personne</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">pour 1h30 de jeu</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <button
              type="button"
              onClick={() => router.push('/player/clubs')}
              className="inline-flex items-center gap-2 px-10 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-xl"
            >
              Découvrir tous les clubs
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* RAPPELS AUTOMATIQUES - STYLE PRO */}
      <section className="bg-white mt-8 md:mt-12 mb-16 md:mb-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8 py-12 md:py-16">
          {/* Header */}
          <div className="mb-16 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5 leading-tight">
              Rappels automatiques par e-mail
            </h2>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed">
              Ne manquez plus jamais vos réservations. Recevez des notifications automatiques à chaque étape.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
            {[
              {
                icon: '📧',
                title: 'Confirmation instantanée',
                description: 'Recevez immédiatement un e-mail de confirmation avec tous les détails de votre réservation',
              },
              {
                icon: '🔔',
                title: 'Rappel 24h avant',
                description: 'Un e-mail automatique vous rappelle votre session 24h avant pour ne rien oublier',
              },
              {
                icon: '⏰',
                title: 'Notification dernière minute',
                description: 'Recevez un dernier rappel 2h avant votre match pour être prêt à temps',
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group border border-slate-200 rounded-xl p-8 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <div className="text-5xl mb-5">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Footer */}
          <div className="mt-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="max-w-md">
                <p className="text-sm font-semibold text-slate-900">
                  Gérez vos préférences de notification
                </p>
                <p className="text-xs text-slate-500 mt-1.5">
                  Activez ou désactivez les rappels depuis votre profil
                </p>
              </div>
              <Link
                href="/player/profil"
                className="text-sm text-slate-700 hover:text-slate-900 transition-colors font-medium inline-flex items-center gap-2 group flex-shrink-0"
              >
                Accéder aux paramètres
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* CTA - STYLE PRO */}
      <section className="bg-white mt-8 md:mt-12 mb-16 md:mb-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8 py-12 md:py-16">
          {/* Contenu centré */}
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5 leading-tight">
              Prêt à jouer ?
            </h2>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-10">
              Rejoignez plus de 10 000 joueurs qui font confiance à Pad'Up pour réserver leurs terrains de padel partout en France.
            </p>
            
            {/* CTA principal + lien secondaire */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => router.push('/player/clubs')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
              >
                Commencer maintenant
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <Link
                href="/a-propos"
                className="text-sm text-slate-700 hover:text-slate-900 transition-colors font-medium inline-flex items-center gap-2 group"
              >
                En savoir plus sur Pad'Up
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Statistiques / Social proof */}
          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
              <div>
                <p className="text-3xl font-bold text-slate-900 mb-2">10 000+</p>
                <p className="text-sm text-slate-600">Joueurs actifs</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 mb-2">50+</p>
                <p className="text-sm text-slate-600">Clubs partenaires</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 mb-2">4.8/5</p>
                <p className="text-sm text-slate-600">Note moyenne</p>
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
              <div className="bg-blue-50 rounded-xl p-4 text-center">
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
