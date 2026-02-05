'use client'

import { useState, use, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type TournoiDetail = {
  id: number
  nom: string
  club: string
  clubAdresse: string
  clubAdresseComplete?: string
  clubDescription?: string
  clubTelephone?: string
  clubEmail?: string
  clubNombreTerrains?: number
  clubHoraires?: {
    semaine: string
    weekend: string
  }
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
    clubAdresseComplete: '123 Avenue du Sport, 30650 Rochefort-du-Gard',
    clubDescription: 'Club premium avec 6 terrains couverts et éclairés, bar restaurant, pro shop et parking gratuit.',
    clubTelephone: '04 66 57 12 34',
    clubEmail: 'contact@lehangar-padel.fr',
    clubNombreTerrains: 6,
    clubHoraires: {
      semaine: '08h00 - 23h00',
      weekend: '08h00 - 23h00'
    },
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
    clubAdresseComplete: '45 Rue du Padel, 84130 Le Pontet',
    clubDescription: 'Complexe sportif moderne avec 4 terrains indoor et outdoor, vestiaires, espace détente et boutique.',
    clubTelephone: '04 90 32 45 67',
    clubEmail: 'info@paullouis-sport.fr',
    clubNombreTerrains: 4,
    clubHoraires: {
      semaine: '09h00 - 22h00',
      weekend: '09h00 - 20h00'
    },
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
    clubAdresseComplete: '78 Route des Alpilles, 13150 Boulbon',
    clubDescription: 'Club familial avec 3 terrains panoramiques, ambiance conviviale et petite restauration sur place.',
    clubTelephone: '04 90 95 78 90',
    clubEmail: 'contact@zepadel.fr',
    clubNombreTerrains: 3,
    clubHoraires: {
      semaine: '10h00 - 21h00',
      weekend: '10h00 - 19h00'
    },
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
    clubAdresseComplete: '12 Chemin des Vignes, 30126 Saint-Laurent-des-Arbres',
    clubDescription: 'Club haut de gamme avec 5 terrains premium, coaching professionnel, salle de sport et restaurant gastronomique.',
    clubTelephone: '04 66 50 23 45',
    clubEmail: 'info@qgpadel.com',
    clubNombreTerrains: 5,
    clubHoraires: {
      semaine: '07h00 - 23h00',
      weekend: '08h00 - 22h00'
    },
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
    clubAdresseComplete: '123 Avenue du Sport, 30650 Rochefort-du-Gard',
    clubDescription: 'Club premium avec 6 terrains couverts et éclairés, bar restaurant, pro shop et parking gratuit.',
    clubTelephone: '04 66 57 12 34',
    clubEmail: 'contact@lehangar-padel.fr',
    clubNombreTerrains: 6,
    clubHoraires: {
      semaine: '08h00 - 23h00',
      weekend: '08h00 - 23h00'
    },
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
  const [isInscrit, setIsInscrit] = useState(false)
  
  // Trouver le tournoi
  const tournoi = useMemo(() => {
    const t = TOURNOIS_DATA.find(t => t.id === tournoiId)
    if (t) {
      // Vérifier dans localStorage si déjà inscrit
      const storedRegistrations = localStorage.getItem('tournamentRegistrations')
      if (storedRegistrations) {
        const registrations = JSON.parse(storedRegistrations)
        const isRegistered = registrations.some((r: any) => r.id === tournoiId)
        return { ...t, inscrit: isRegistered }
      }
    }
    return t
  }, [tournoiId])

  // Synchroniser l'état local avec le tournoi
  useEffect(() => {
    if (tournoi) {
      setIsInscrit(tournoi.inscrit)
    }
  }, [tournoi])

  if (!tournoi) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tournoi introuvable</h1>
          <Link href="/player/tournois" className="text-slate-700 hover:text-slate-900 underline">
            Retour aux tournois
          </Link>
        </div>
      </div>
    )
  }

  const handleInscription = async () => {
    if (isSubmitting || isInscrit || tournoi.statut !== 'Ouvert') return
    
    setIsSubmitting(true)
    
    // Simuler un délai d'inscription
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Sauvegarder l'inscription dans localStorage
    const registration = {
      id: tournoi.id,
      type: 'tournament' as const,
      nom: tournoi.nom,
      club: tournoi.club,
      clubAdresse: tournoi.clubAdresse,
      date: tournoi.date,
      heureDebut: tournoi.heureDebut,
      categorie: tournoi.categorie,
      genre: tournoi.genre,
      prixInscription: tournoi.prixInscription,
      image: tournoi.image,
      inscriptionDate: new Date().toISOString()
    }
    
    // Récupérer les inscriptions existantes
    const storedRegistrations = localStorage.getItem('tournamentRegistrations')
    const registrations = storedRegistrations ? JSON.parse(storedRegistrations) : []
    
    // Vérifier si déjà inscrit
    const alreadyRegistered = registrations.find((r: any) => r.id === tournoi.id)
    if (!alreadyRegistered) {
      registrations.push(registration)
      localStorage.setItem('tournamentRegistrations', JSON.stringify(registrations))
      setIsInscrit(true)
    }
    
    setShowSuccessModal(true)
    setIsSubmitting(false)
  }

  const placesRestantes = tournoi.nombreEquipesMax - tournoi.nombreEquipes
  const pourcentageRempli = (tournoi.nombreEquipes / tournoi.nombreEquipesMax) * 100

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-3 md:px-6 py-4 md:py-8 max-w-6xl">
        
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <Link
            href="/player/tournois"
            className="text-slate-700 hover:text-slate-900 font-semibold mb-4 inline-block text-sm md:text-base"
          >
            ← Retour aux tournois
          </Link>
          
          {/* Info principale du tournoi */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg mt-4">
            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 p-4 md:p-6">
              <img 
                src={tournoi.image} 
                alt={tournoi.nom}
                className="w-full md:w-40 h-48 md:h-40 object-cover rounded-xl shadow-md"
              />
              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-start gap-2 mb-3">
                  <span className="px-3 py-1.5 bg-slate-900 text-white text-xs md:text-sm font-bold rounded-lg">
                    {tournoi.categorie}
                  </span>
                  {isInscrit && (
                    <span className="px-3 py-1.5 bg-green-600 text-white text-xs md:text-sm font-bold rounded-lg">
                      ✓ Inscrit
                    </span>
                  )}
                  {tournoi.statut === 'Complet' && !isInscrit && (
                    <span className="px-3 py-1.5 bg-gray-900 text-white text-xs md:text-sm font-bold rounded-lg">
                      Complet
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-2 md:mb-3">{tournoi.nom}</h1>
                <p className="text-sm md:text-lg text-gray-600 mb-3 md:mb-4 line-clamp-3 md:line-clamp-none">{tournoi.description}</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
                  <span className="w-full sm:w-auto text-center px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-base md:text-lg">
                    {tournoi.prixInscription}€ / personne
                  </span>
                  <span className="w-full sm:w-auto text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold">
                    {tournoi.statut}
                  </span>
                </div>
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="border-t-2 border-gray-100 bg-gray-50 p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Date */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Date du tournoi</p>
                    <p className="text-gray-900 font-semibold">{new Date(tournoi.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                {/* Heure */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Heure de début</p>
                    <p className="text-gray-900 font-semibold">{tournoi.heureDebut}</p>
                  </div>
                </div>

                {/* Genre */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Catégorie</p>
                    <p className="text-gray-900 font-semibold">{tournoi.genre}</p>
                  </div>
                </div>

                {/* Format */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Format</p>
                    <p className="text-gray-900 font-semibold">{tournoi.format}</p>
                  </div>
                </div>

                {/* Club organisateur */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Club organisateur</p>
                    <p className="text-gray-900 font-semibold">{tournoi.club}</p>
                  </div>
                </div>

                {/* Adresse */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Adresse</p>
                    <p className="text-gray-900 font-semibold">{tournoi.clubAdresseComplete || tournoi.clubAdresse}</p>
                  </div>
                </div>

                {/* Téléphone */}
                {tournoi.clubTelephone && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Téléphone</p>
                      <a href={`tel:${tournoi.clubTelephone}`} className="text-gray-900 font-semibold hover:text-slate-900">{tournoi.clubTelephone}</a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {tournoi.clubEmail && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                      <a href={`mailto:${tournoi.clubEmail}`} className="text-gray-900 font-semibold hover:text-slate-900">{tournoi.clubEmail}</a>
                    </div>
                  </div>
                )}

                {/* Nombre de terrains */}
                {tournoi.clubNombreTerrains && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nombre de terrains</p>
                      <p className="text-gray-900 font-semibold">{tournoi.clubNombreTerrains} terrain{tournoi.clubNombreTerrains > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )}

                {/* Horaires */}
                {tournoi.clubHoraires && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Horaires</p>
                      <p className="text-gray-900 font-semibold">Lun-Ven : {tournoi.clubHoraires.semaine}</p>
                      <p className="text-gray-900 font-semibold">Sam-Dim : {tournoi.clubHoraires.weekend}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Informations supplémentaires */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Informations du tournoi</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold">
                    💰 Dotation : {tournoi.dotation}
                  </span>
                  <span className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold">
                    👥 {tournoi.nombreEquipes}/{tournoi.nombreEquipesMax} équipes
                  </span>
                  <span className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold">
                    📋 Inscription par équipe de 2
                  </span>
                  {tournoi.clubDescription && (
                    <span className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold">
                      🏟️ {tournoi.clubDescription}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Inscription */}
        <div className="max-w-3xl mx-auto">
          
          {/* Jauge de remplissage */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-gray-900">Places disponibles</span>
              <span className="text-lg font-black text-slate-900">{placesRestantes} / {tournoi.nombreEquipesMax} équipes</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-900 rounded-full transition-all duration-300"
                style={{ width: `${pourcentageRempli}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              {placesRestantes > 0 ? `Il reste ${placesRestantes} place${placesRestantes > 1 ? 's' : ''} disponible${placesRestantes > 1 ? 's' : ''} pour ce tournoi` : 'Ce tournoi est complet'}
            </p>
          </div>

          {/* Bouton d'inscription */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-center mb-6">
              <p className="text-5xl font-black text-gray-900 mb-2">{tournoi.prixInscription}€</p>
              <p className="text-gray-600 text-lg">par personne</p>
            </div>

              {isInscrit ? (
                <div className="px-6 py-4 bg-slate-100 border-2 border-slate-900 text-slate-700 text-center font-semibold rounded-xl mb-4">
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
                  className="w-full px-6 py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
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

      {/* Modal de succès */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => {
          setShowSuccessModal(false)
          router.push('/player/tournois')
        }}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
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
              className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
            >
              Retour aux tournois
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
