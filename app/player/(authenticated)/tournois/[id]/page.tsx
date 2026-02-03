'use client'

import { useState, use, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type TournoiDetail = {
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
}

// Données hardcodées des tournois
const TOURNOIS_DATA: TournoiDetail[] = [
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
  },
]

export default function TournoiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const tournoiId = parseInt(resolvedParams.id)
  
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Trouver le tournoi
  const tournoi = useMemo(() => {
    return TOURNOIS_DATA.find(t => t.id === tournoiId)
  }, [tournoiId])

  if (!tournoi) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tournoi introuvable</h1>
          <Link href="/player/tournois" className="text-blue-600 hover:text-blue-700 underline">
            Retour aux tournois
          </Link>
        </div>
      </div>
    )
  }

  const handleInscription = async () => {
    if (isSubmitting || tournoi.inscrit || tournoi.statut !== 'Ouvert') return
    
    setIsSubmitting(true)
    
    // Simuler un délai d'inscription
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setShowSuccessModal(true)
    setIsSubmitting(false)
  }

  const placesRestantes = tournoi.nombreEquipesMax - tournoi.nombreEquipes
  const pourcentageRempli = (tournoi.nombreEquipes / tournoi.nombreEquipesMax) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec image */}
      <div className="relative h-64 md:h-80 bg-gray-900">
        <img
          src={tournoi.image}
          alt={tournoi.nom}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        
        {/* Breadcrumb */}
        <div className="absolute top-4 left-4 md:top-6 md:left-8">
          <Link
            href="/player/tournois"
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm md:text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux tournois
          </Link>
        </div>

        {/* Titre et infos */}
        <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8">
          <div className="flex items-start gap-3 mb-3">
            <span className="px-3 py-1.5 bg-white text-gray-900 text-sm font-bold rounded-lg">
              {tournoi.categorie}
            </span>
            {tournoi.inscrit && (
              <span className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg">
                ✓ Inscrit
              </span>
            )}
            {tournoi.statut === 'Complet' && !tournoi.inscrit && (
              <span className="px-3 py-1.5 bg-gray-900 text-white text-sm font-bold rounded-lg">
                Complet
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{tournoi.nom}</h1>
          <p className="text-white/90 flex items-center gap-2 text-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {tournoi.club} · {tournoi.clubAdresse}
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description du tournoi */}
            {tournoi.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-3">À propos du tournoi</h2>
                <p className="text-gray-700">{tournoi.description}</p>
              </div>
            )}

            {/* Détails du tournoi */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Détails du tournoi</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Date', value: new Date(tournoi.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Heure de début', value: tournoi.heureDebut },
                  { label: 'Genre', value: tournoi.genre },
                  { label: 'Format', value: tournoi.format },
                  { label: 'Prix d\'inscription', value: `${tournoi.prixInscription}€ par personne` },
                  { label: 'Dotation', value: tournoi.dotation },
                  { label: 'Places disponibles', value: `${placesRestantes} / ${tournoi.nombreEquipesMax}` },
                  { label: 'Statut', value: tournoi.statut },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{item.label}</p>
                    <p className="font-bold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Jauge de remplissage */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Équipes inscrites</span>
                  <span className="text-sm font-bold text-gray-900">{tournoi.nombreEquipes}/{tournoi.nombreEquipesMax}</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${pourcentageRempli}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Informations du club */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Le club organisateur</h2>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{tournoi.club}</h3>
              <p className="text-gray-600 flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {tournoi.clubAdresse}
              </p>

              {tournoi.clubDescription && (
                <p className="text-gray-700 mb-4">{tournoi.clubDescription}</p>
              )}

              <div className="space-y-2 border-t pt-4">
                {tournoi.clubTelephone && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {tournoi.clubTelephone}
                  </p>
                )}
                {tournoi.clubEmail && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {tournoi.clubEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-6">
              <div className="text-center mb-6">
                <p className="text-4xl font-black text-gray-900 mb-1">{tournoi.prixInscription}€</p>
                <p className="text-gray-600">par personne</p>
              </div>

              {tournoi.inscrit ? (
                <div className="px-6 py-4 bg-blue-50 border-2 border-blue-600 text-blue-700 text-center font-semibold rounded-xl mb-4">
                  ✓ Vous êtes inscrit à ce tournoi
                </div>
              ) : tournoi.statut === 'Complet' ? (
                <button
                  disabled
                  className="w-full px-6 py-4 bg-gray-300 text-gray-500 rounded-xl font-bold text-lg cursor-not-allowed"
                >
                  Complet
                </button>
              ) : tournoi.statut !== 'Ouvert' ? (
                <button
                  disabled
                  className="w-full px-6 py-4 bg-gray-300 text-gray-500 rounded-xl font-bold text-lg cursor-not-allowed"
                >
                  Tournoi {tournoi.statut.toLowerCase()}
                </button>
              ) : (
                <button
                  onClick={handleInscription}
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire au tournoi'}
                </button>
              )}

              <div className="mt-6 pt-6 border-t space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Début du tournoi</p>
                    <p>{new Date(tournoi.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {tournoi.heureDebut}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Inscription par équipe</p>
                    <p>2 joueurs par équipe</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Confirmation instantanée</p>
                    <p>Vous recevrez un email de confirmation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de succès */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => {
          setShowSuccessModal(false)
          router.push('/player/tournois')
        }}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Inscription réussie !</h3>
            <p className="text-gray-600 mb-6">
              Vous êtes maintenant inscrit au tournoi <strong>{tournoi.nom}</strong>. Un email de confirmation vous a été envoyé.
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false)
                router.push('/player/tournois')
              }}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Retour aux tournois
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
