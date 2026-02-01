'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'

// ✅ Force dynamic rendering (pas de pre-render statique)
// Nécessaire car supabaseBrowser accède à document.cookie
export const dynamic = 'force-dynamic'
import SmartSearchBar from '../components/SmartSearchBar'
import UseMyLocationButton from '@/components/UseMyLocationButton'
import { getClubImage, filterOutDemoClub } from '@/lib/clubImages'

type Club = {
  id: string // ✅ UUID depuis public.clubs
  name: string // ✅ Correspond à public.clubs.name
  city: string // ✅ Correspond à public.clubs.city
  distance: string
  nombreTerrains: number
  note: number
  avis: number
  photo: string
  imageUrl: string
  prixMin: number
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
      const clubsWithUI = (data || []).map((club, index) => ({
        id: club.id,
        name: club.name || 'Club sans nom',
        city: club.city || 'Ville non spécifiée',
        distance: `${5 + index * 5} min`, // TODO: Calculer avec géolocation
        nombreTerrains: 6 + index * 2, // TODO: Compter depuis public.courts
        note: 4.6 + (index * 0.1),
        avis: 100 + index * 50,
        photo: ['🏗️', '🎾', '⚡', '🏟️'][index % 4],
        imageUrl: getClubImage(club.id), // ✅ Image par clubId
        prixMin: 11 + index,
      }))
      
      // ✅ Filtrer pour exclure le Club Démo
      const filteredClubs = filterOutDemoClub(clubsWithUI)
      console.log('[ACCUEIL] ✅ Filtered clubs (without demo):', filteredClubs.length, 'clubs')
      
      setClubs(filteredClubs)
      setIsLoading(false)
    }
    
    loadClubs()
  }, [])

  const handleReserver = (club: Club) => {
    setSelectedClub(club)
    setShowReservationModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Hero - PREMIUM */}
      <section className="px-6 pt-32 pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <span className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-full shadow-lg">
                Réserver un terrain n'a jamais été aussi simple
              </span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black text-gray-900 mb-6 leading-none">
              Réservez votre terrain de padel<br />
              <span className="text-blue-600">en quelques secondes</span>
            </h1>
            
            <p className="text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Trouvez un club, choisissez un créneau, jouez. Pad'Up s'occupe du reste.
            </p>

            {/* BARRE DE RECHERCHE DISCRÈTE */}
            <div className="max-w-2xl mx-auto">
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
                  'Rochefort-du-Gard',
                  'Clubs avec restaurant'
                ]}
                storageKey="search-history-accueil"
                compact={true}
              />
            </div>

            <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Réservation instantanée</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Aucun frais caché</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clubs - CAROUSEL CARDS STYLE */}
      <section className="pt-8 pb-16 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-3">Clubs autour de chez moi</h2>
              <p className="text-xl text-gray-600">Découvrez nos meilleures adresses</p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/player/clubs')}
              className="hidden md:flex items-center gap-2 text-gray-900 font-bold hover:text-blue-600 transition-colors"
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
                // TODO: Trier les clubs par distance réelle
              }}
            />
            
            {/* ✅ Affichage propre sans popup */}
            {locationStatus === 'success' && userCoords && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-green-800">
                  📍 Position détectée ! Nous allons bientôt afficher les clubs les plus proches de vous.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {clubs.map((club, index) => (
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
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-lg">
                      ⭐ Top choix
                    </div>
                  )}

                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-lg">
                    <svg className="w-4 h-4 text-blue-600 fill-current" viewBox="0 0 20 20">
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">{club.distance}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {club.nombreTerrains} terrains
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
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

      {/* POURQUOI PAD'UP - CARDS ÉLÉGANTES */}
      <section className="py-16 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-gray-900 mb-4">Rappels automatiques par e-mail</h2>
            <p className="text-xl text-gray-600">Ne manquez plus jamais vos réservations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div key={i} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-500 rounded-3xl transform group-hover:scale-105 transition-transform opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-xl group-hover:shadow-2xl transition-all">
                  <div className="text-6xl mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - PREMIUM */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-100">
            <div className="relative px-12 py-16 text-center">
              <h2 className="text-6xl font-black text-gray-900 mb-6">
                Prêt à jouer ?
              </h2>
              <p className="text-2xl text-gray-600 mb-10">
                Rejoignez plus de 10 000 joueurs sur Pad'Up
              </p>
              <button
                type="button"
                onClick={() => router.push('/player/clubs')}
                className="inline-flex items-center gap-3 px-12 py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all text-lg shadow-2xl shadow-blue-600/50"
              >
                Commencer maintenant
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-3">Questions fréquentes</h2>
            <p className="text-lg text-gray-600">Tout ce que vous devez savoir</p>
          </div>

          <div className="space-y-4">
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
              <details key={i} className="group bg-white rounded-xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-gray-50 transition-all">
                  <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                  <svg className="w-5 h-5 text-gray-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                  {faq.answer}
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
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-blue-600 mb-1">{selectedClub.note.toFixed(1)}★</p>
                <p className="text-xs font-bold text-blue-700 uppercase">Note</p>
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
