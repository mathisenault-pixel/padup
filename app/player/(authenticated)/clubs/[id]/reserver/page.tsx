'use client'

import { useState, use, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PlayerSelectionModal from './PlayerSelectionModal'
import PremiumModal from './PremiumModal'

type Club = {
  id: string
  nom: string
  ville: string
  imageUrl: string
  prix: number
  adresse: string
  telephone: string
  email: string
  horaires: {
    semaine: string
    weekend: string
  }
  description: string
  equipements: string[]
  nombreTerrains: number
}

// Clubs en dur (même que dans la page clubs)
const clubs: Club[] = [
  {
    id: '1',
    nom: 'Le Hangar Sport & Co',
    ville: 'Rochefort-du-Gard',
    imageUrl: '/images/clubs/le-hangar.jpg',
    prix: 12,
    adresse: '123 Route de Nîmes, 30650 Rochefort-du-Gard',
    telephone: '+33 4 66 82 45 12',
    email: 'contact@lehangar-sport.fr',
    horaires: {
      semaine: '08h00 - 23h00',
      weekend: '08h00 - 23h30'
    },
    description: 'Le Hangar Sport & Co est un complexe sportif moderne avec 8 terrains de padel de haute qualité. Profitez de notre restaurant et de nos vestiaires équipés.',
    equipements: ['Restaurant', 'Vestiaires', 'Douches', 'Parking', 'WiFi'],
    nombreTerrains: 8
  },
  {
    id: '2',
    nom: 'Paul & Louis Sport',
    ville: 'Le Pontet',
    imageUrl: '/images/clubs/paul-louis.jpg',
    prix: 13,
    adresse: '45 Avenue de la République, 84130 Le Pontet',
    telephone: '+33 4 90 32 78 90',
    email: 'info@pauletlouis.com',
    horaires: {
      semaine: '07h00 - 23h00',
      weekend: '08h00 - 00h00'
    },
    description: 'Centre sportif premium avec 8 terrains de padel professionnels. Salle de fitness et coaching personnalisé disponibles.',
    equipements: ['Restaurant', 'Fitness', 'Coaching', 'Bar', 'Parking'],
    nombreTerrains: 8
  },
  {
    id: '3',
    nom: 'ZE Padel',
    ville: 'Boulbon',
    imageUrl: '/images/clubs/ze-padel.jpg',
    prix: 11,
    adresse: '78 Chemin du Stade, 13150 Boulbon',
    telephone: '+33 4 90 95 12 34',
    email: 'contact@zepadel.fr',
    horaires: {
      semaine: '09h00 - 22h00',
      weekend: '09h00 - 23h00'
    },
    description: 'Club convivial avec 6 terrains de padel en plein air. Ambiance détendue avec bar et snack sur place.',
    equipements: ['Bar', 'Snack', 'WiFi', 'Parking'],
    nombreTerrains: 6
  },
  {
    id: '4',
    nom: 'QG Padel Club',
    ville: 'Saint-Laurent-des-Arbres',
    imageUrl: '/images/clubs/qg-padel.jpg',
    prix: 12,
    adresse: '12 Route de Roquemaure, 30126 Saint-Laurent-des-Arbres',
    telephone: '+33 4 66 50 23 45',
    email: 'reservation@qgpadel.fr',
    horaires: {
      semaine: '08h00 - 22h00',
      weekend: '08h00 - 23h00'
    },
    description: 'Club familial avec 4 terrains de padel. Cours professionnels et snacking disponibles. Idéal pour tous niveaux.',
    equipements: ['Snacking', 'Cours pro', 'Vestiaires', 'Parking'],
    nombreTerrains: 4
  },
]

// Générer les créneaux de 8h à 23h30 par pas de 1h30
const generateTimeSlots = () => {
  const slots = []
  let currentHour = 8
  let currentMinute = 0
  
  while (currentHour < 23 || (currentHour === 23 && currentMinute === 0)) {
    const startTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
    
    // Calculer l'heure de fin (+ 1h30)
    let endHour = currentHour + 1
    let endMinute = currentMinute + 30
    
    if (endMinute >= 60) {
      endHour += 1
      endMinute -= 60
    }
    
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
    
    slots.push({ startTime, endTime })
    
    // Passer au créneau suivant (+1h30)
    currentMinute += 30
    if (currentMinute >= 60) {
      currentHour += 1
      currentMinute -= 60
    }
    currentHour += 1
  }
  
  return slots
}

// Générer les 7 prochains jours
const generateNextDays = () => {
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    days.push(date)
  }
  
  return days
}

// Générer des créneaux indisponibles aléatoirement (environ 30%)
const generateUnavailableSlots = (terrainId: number, date: Date) => {
  const slots = generateTimeSlots()
  const unavailableCount = Math.floor(slots.length * 0.3) // 30% des créneaux
  const unavailableSet = new Set<string>()
  
  // Utiliser une seed basée sur le terrain et la date pour avoir des résultats cohérents
  const seed = terrainId * 1000 + date.getDate() * 100 + date.getMonth()
  
  // ✅ OPTIMISATION: Éviter la boucle infinie avec un compteur max
  let attempts = 0
  const maxAttempts = slots.length * 3 // Protection contre boucle infinie
  
  while (unavailableSet.size < unavailableCount && attempts < maxAttempts) {
    // Utiliser seed + attempts pour varier les résultats
    const x = Math.sin(seed + attempts) * 10000
    const randomIndex = Math.floor((x - Math.floor(x)) * slots.length)
    const slot = slots[randomIndex].startTime
    
    // ✅ Set.add() est O(1) vs array.includes() qui est O(n)
    unavailableSet.add(slot)
    attempts++
  }
  
  return Array.from(unavailableSet)
}

export default function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  
  // ============================================
  // STABILISATION: Club en dehors du render
  // ============================================
  const club = useMemo(() => clubs.find(c => c.id === resolvedParams.id), [resolvedParams.id])
  
  // Créneaux et dates (constants)
  const timeSlots = useMemo(() => generateTimeSlots(), [])
  const nextDays = useMemo(() => generateNextDays(), [])
  
  // ============================================
  // STATE
  // ============================================
  const [selectedDate, setSelectedDate] = useState(nextDays[0])
  const [selectedTerrain, setSelectedTerrain] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null)
  const [showPlayerModal, setShowPlayerModal] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  
  
  if (!club) {
    return <div className="p-8">Club introuvable</div>
  }
  
  // Terrains
  const terrains = useMemo(() => 
    Array.from({ length: club.nombreTerrains }, (_, i) => ({
      id: i + 1,
      nom: `Terrain ${i + 1}`,
      type: i % 2 === 0 ? 'Intérieur' : 'Extérieur'
    }))
  , [club.nombreTerrains])
  
  // Map/Set pour O(1) lookup des créneaux indisponibles
  const unavailableSet = useMemo(() => {
    const map = new Map<number, Set<string>>()
    terrains.forEach(terrain => {
      const unavailableSlots = generateUnavailableSlots(terrain.id, selectedDate)
      map.set(terrain.id, new Set(unavailableSlots))
    })
    return map
  }, [selectedDate, club.nombreTerrains]) // ✅ Retirer 'terrains' pour éviter recalculs inutiles
  
  // Vérifier si un créneau est disponible (O(1))
  const isSlotAvailable = useCallback((terrainId: number, slot: { startTime: string }): boolean => {
    const terrainSet = unavailableSet.get(terrainId)
    if (!terrainSet) return true
    return !terrainSet.has(slot.startTime)
  }, [unavailableSet])
  
  // Handler stable pour la confirmation finale
  const handleFinalConfirmation = (withPremium: boolean) => {
    console.log('[FINAL] handleFinalConfirmation start')
    
    try {
      // Créer la nouvelle réservation
      const newReservation = {
        id: `res_${Date.now()}`,
        date: selectedDate.toISOString().split('T')[0],
        start_time: selectedSlot?.startTime,
        end_time: selectedSlot?.endTime,
        status: 'confirmed',
        price: club.prix * (selectedPlayers.length + 1), // Prix total
        created_at: new Date().toISOString(),
        courts: {
          name: `Terrain ${selectedTerrain}`,
          clubs: {
            id: club.id,
            name: club.nom,
            city: club.ville,
            address: club.adresse,
            imageUrl: club.imageUrl
          }
        }
      }
      
      // Sauvegarder dans localStorage
      const existingReservations = JSON.parse(localStorage.getItem('demoReservations') || '[]')
      existingReservations.unshift(newReservation) // Ajouter au début
      localStorage.setItem('demoReservations', JSON.stringify(existingReservations))
      
      console.log('[FINAL] Reservation saved to localStorage')
      
      alert(`✅ Réservation confirmée !\n\n${club.nom}\n${formatDate(selectedDate).full}\n${selectedSlot?.startTime} - ${selectedSlot?.endTime}\n\nPrix : ${club.prix}€ / pers\n${selectedPlayers.length + 1} joueur(s)${withPremium ? '\n\n💎 Vous êtes membre Pad\'up + !\nProfitez de -20% sur la restauration au club.' : ''}`)
      
      // ✅ Utiliser setTimeout pour éviter le freeze lors de la navigation
      setTimeout(() => {
        console.log('[FINAL] Navigating to /player/reservations')
        router.push('/player/reservations')
      }, 100)
    } catch (error) {
      console.error('[FINAL] Error:', error)
      alert('❌ Erreur lors de la réservation. Veuillez réessayer.')
    }
  }
  
  const handleSlotClick = useCallback((terrainId: number, slot: { startTime: string; endTime: string }) => {
    if (isSlotAvailable(terrainId, slot)) {
      setSelectedTerrain(terrainId)
      setSelectedSlot(slot)
      setShowPlayerModal(true)
    }
  }, [isSlotAvailable])
  
  const handlePlayersContinue = (players: string[], showPremium: boolean) => {
    setSelectedPlayers(players)
    setShowPlayerModal(false)
    
    if (showPremium) {
      setShowPremiumModal(true)
    } else {
      handleFinalConfirmation(false)
    }
  }
  
  const handleSubscribePremium = () => {
    alert('Abonnement Pad\'up + souscrit ! 🎉\n\nVous bénéficiez maintenant de -20% sur toutes vos réservations.')
    handleFinalConfirmation(true)
  }
  
  const handleContinueWithout = () => {
    handleFinalConfirmation(false)
  }
  
  const formatDate = (date: Date) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
      full: date.toLocaleDateString('fr-FR')
    }
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/player/clubs" className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block">
            ← Retour aux clubs
          </Link>
          
          {/* Info principale du club */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg mt-4">
            <div className="flex items-start gap-6 p-6">
              <img 
                src={club.imageUrl} 
                alt={club.nom}
                className="w-40 h-40 object-cover rounded-xl shadow-md"
              />
              <div className="flex-1">
                <h1 className="text-4xl font-black text-gray-900 mb-3">{club.nom}</h1>
                <p className="text-lg text-gray-600 mb-4">{club.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-lg">
                    {club.prix}€ / pers pour 1h30
                  </span>
                  <span className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold">
                    {club.nombreTerrains} terrains
                  </span>
                </div>
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="border-t-2 border-gray-100 bg-gray-50 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Adresse */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Adresse</p>
                    <p className="text-gray-900 font-semibold">{club.adresse}</p>
                  </div>
                </div>

                {/* Téléphone */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Téléphone</p>
                    <a href={`tel:${club.telephone}`} className="text-gray-900 font-semibold hover:text-blue-600">{club.telephone}</a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                    <a href={`mailto:${club.email}`} className="text-gray-900 font-semibold hover:text-blue-600">{club.email}</a>
                  </div>
                </div>

                {/* Horaires */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Horaires</p>
                    <p className="text-gray-900 font-semibold">Lun-Ven : {club.horaires.semaine}</p>
                    <p className="text-gray-900 font-semibold">Sam-Dim : {club.horaires.weekend}</p>
                  </div>
                </div>
              </div>

              {/* Équipements */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Équipements disponibles</p>
                <div className="flex flex-wrap gap-2">
                  {club.equipements.map((equipement, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold">
                      {equipement}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sélection de la date */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Choisir une date</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {nextDays.map((day, idx) => {
              const formatted = formatDate(day)
              const isSelected = selectedDate.toDateString() === day.toDateString()
              
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`flex-shrink-0 px-6 py-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-900 border-gray-200 hover:border-blue-600'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm font-semibold">{formatted.day}</div>
                    <div className="text-2xl font-black my-1">{formatted.date}</div>
                    <div className="text-sm">{formatted.month}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Terrains et créneaux horaires */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Choisir un terrain et un créneau - {formatDate(selectedDate).full}
          </h2>
          
          <div className="space-y-6">
            {terrains.map((terrain) => {
              // Calculer le nombre de créneaux disponibles pour ce terrain
              const availableCount = timeSlots.filter(slot => isSlotAvailable(terrain.id, slot)).length
              const totalCount = timeSlots.length
              const availabilityPercent = Math.round((availableCount / totalCount) * 100)
              
              return (
                <div key={terrain.id} className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Header du terrain */}
                  <div className="bg-gradient-to-r from-blue-50 to-gray-50 p-5 border-b-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg">
                          {terrain.id}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-gray-900">{terrain.nom}</h3>
                          <p className="text-sm text-gray-600 font-semibold">{terrain.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Disponibilité</div>
                        <div className={`text-2xl font-black ${availabilityPercent > 50 ? 'text-green-600' : availabilityPercent > 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {availableCount}/{totalCount}
                        </div>
                        <div className="text-xs text-gray-600">({availabilityPercent}%)</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Créneaux pour ce terrain */}
                  <div className="p-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {timeSlots.map((slot, idx) => {
                        const available = isSlotAvailable(terrain.id, slot)
                        
                        return (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => handleSlotClick(terrain.id, slot)}
                            disabled={!available}
                            className={`p-3 rounded-xl border-2 font-bold transition-all ${
                              available
                                ? 'bg-white text-gray-900 border-gray-200 hover:border-blue-600 hover:bg-blue-50 hover:scale-105'
                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <div className="text-center">
                              <div className="text-base font-black">{slot.startTime}</div>
                              <div className="text-xs text-gray-500">→</div>
                              <div className="text-base font-black">{slot.endTime}</div>
                            </div>
                            {!available && (
                              <div className="text-xs mt-1 text-red-500 font-semibold">Réservé</div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
      </div>
      
      {/* Modal Joueurs */}
      {showPlayerModal && selectedSlot && selectedTerrain && (
        <PlayerSelectionModal
          onClose={() => setShowPlayerModal(false)}
          onContinue={handlePlayersContinue}
          clubName={`${club.nom} - Terrain ${selectedTerrain}`}
          timeSlot={`${selectedSlot.startTime} - ${selectedSlot.endTime}`}
        />
      )}
      
      {/* Modal Premium */}
      {showPremiumModal && (
        <PremiumModal
          onClose={() => {
            setShowPremiumModal(false)
            setShowPlayerModal(false)
            setSelectedSlot(null)
          }}
          onSubscribe={handleSubscribePremium}
          onContinueWithout={handleContinueWithout}
          clubName={club.nom}
          normalPrice={club.prix}
        />
      )}
    </div>
  )
}

