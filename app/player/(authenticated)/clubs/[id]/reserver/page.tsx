'use client'

import { useState, use, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PlayerSelectionModal from './PlayerSelectionModal'
import PremiumModal from './PremiumModal'
import { supabase } from '@/lib/supabaseClient'

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

type TimeSlot = {
  id: number
  start_time: string
  end_time: string
  duration_minutes: number
  label: string
}

type Booking = {
  id: string
  court_id: string
  booking_date: string // DATE YYYY-MM-DD
  slot_id: number // référence vers time_slots.id
  status: string // 'confirmed' | 'pending' | 'cancelled'
  slot_start?: string // timestamp ISO (optionnel)
  slot_end?: string // timestamp ISO (optionnel)
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Combiner une date (YYYY-MM-DD) et une heure (HH:MM:SS) en timestamp ISO
 * Ex: combineDateAndTime("2026-01-23", "14:00:00") => "2026-01-23T14:00:00"
 */
function combineDateAndTime(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}`
}

// ============================================
// CLUB & COURTS — VRAIS UUIDs depuis Supabase
// ============================================

// Club réel depuis la base de données
const clubs: Club[] = [
  {
    id: 'ba43c579-e522-4b51-8542-737c2c6452bb', // ✅ UUID réel depuis public.clubs
    nom: 'Club Démo Pad\'up',
    ville: 'Avignon',
    imageUrl: '/images/clubs/demo-padup.jpg',
    prix: 12,
    adresse: '123 Avenue du Padel, 84000 Avignon',
    telephone: '+33 4 90 00 00 00',
    email: 'contact@padup.fr',
    horaires: {
      semaine: '08h00 - 23h00',
      weekend: '08h00 - 23h00'
    },
    description: 'Club de padel moderne avec terrains de qualité professionnelle.',
    equipements: ['Bar', 'Vestiaires', 'Douches', 'Parking', 'WiFi'],
    nombreTerrains: 2
  }
]

// UUIDs réels des terrains depuis public.courts
const COURT_UUIDS: Record<number, string> = {
  1: '21d9a066-b7db-4966-abf1-cc210f7476c1', // ✅ Terrain 1
  2: '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e', // ✅ Terrain 2
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

export default function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  
  // ============================================
  // STABILISATION: Club en dehors du render
  // ============================================
  const club = useMemo(() => clubs.find(c => c.id === resolvedParams.id), [resolvedParams.id])
  
  // Dates (constant)
  const nextDays = useMemo(() => generateNextDays(), [])
  
  // ============================================
  // STATE
  // ============================================
  const [selectedDate, setSelectedDate] = useState(nextDays[0])
  const [selectedTerrain, setSelectedTerrain] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [showPlayerModal, setShowPlayerModal] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]) // ✅ Stocker les emails invités
  const [isSubmitting, setIsSubmitting] = useState(false) // ✅ Guard anti double-clic global
  
  // ✅ NOUVEAUX STATES POUR SUPABASE
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [bookedByCourt, setBookedByCourt] = useState<Record<string, Set<number>>>({}) // Map de court_id → Set<slot_id>
  const [isLoadingSlots, setIsLoadingSlots] = useState(true)
  
  
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
  
  // ============================================
  // ÉTAPE 1 — Charger les time_slots depuis Supabase
  // ============================================
  useEffect(() => {
    const loadTimeSlots = async () => {
      console.log('[SLOTS] Loading time_slots from Supabase...')
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .order('start_time', { ascending: true })
      
      if (error) {
        console.error('[SLOTS] Error loading time_slots:', error)
        return
      }
      
      console.log('[SLOTS] Loaded:', data)
      setTimeSlots(data || [])
      setIsLoadingSlots(false)
    }
    
    loadTimeSlots()
  }, [])
  
  // ============================================
  // ÉTAPE 2 — Charger les bookings confirmés pour TOUS les courts du club
  // ============================================
  useEffect(() => {
    if (!club) return
    
    const loadBookings = async () => {
      // ✅ Construire la liste de tous les court_id (UUIDs réels)
      const courtIds = terrains
        .map(t => COURT_UUIDS[t.id])
        .filter(Boolean) as string[]
      
      const bookingDate = selectedDate.toISOString().split('T')[0] // YYYY-MM-DD
      
      console.log('[BOOKINGS] Loading for all courts:', { courtIds, bookingDate })
      
      const { data, error } = await supabase
        .from('bookings')
        .select('id, court_id, booking_date, slot_id, status')
        .in('court_id', courtIds)
        .eq('booking_date', bookingDate)
        .in('status', ['confirmed', 'pending'])
      
      if (error) {
        console.error('[BOOKINGS] Error:', {
          table: 'bookings',
          message: error.message,
          code: error.code,
          details: error.details
        })
        return
      }
      
      console.log('[BOOKINGS] fetched count', data?.length)
      
      // ✅ Construire bookedByCourt : court_id → Set<slot_id>
      const map: Record<string, Set<number>> = {}
      for (const row of data ?? []) {
        const courtKey = String(row.court_id)
        if (!map[courtKey]) map[courtKey] = new Set()
        map[courtKey].add(row.slot_id)
      }
      
      console.log('[BOOKINGS] bookedSlots size', Object.values(map).reduce((sum, set) => sum + set.size, 0))
      setBookedByCourt(map)
    }
    
    loadBookings()
  }, [selectedDate, club, terrains])
  
  // ============================================
  // ÉTAPE 3 — SYNCHRONISATION TEMPS RÉEL (tous les courts du club)
  // ============================================
  useEffect(() => {
    if (!club) return
    
    const bookingDate = selectedDate.toISOString().split('T')[0]
    
    console.log('[REALTIME] Subscribing to bookings:', { 
      clubId: club.id, 
      bookingDate
    })
    
    // ✅ Construire la liste des court_id (UUIDs réels)
    const courtIds = terrains
      .map(t => COURT_UUIDS[t.id])
      .filter(Boolean) as string[]
    
    const channel = supabase
      .channel(`bookings-${club.id}-${bookingDate}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `booking_date=eq.${bookingDate}`
        },
        (payload) => {
          console.log('[REALTIME bookings] payload', payload)
          
          const payloadNew = payload.new as Booking | null
          const payloadOld = payload.old as Booking | null
          
          const courtKey = String((payloadNew ?? payloadOld)?.court_id)
          
          if (!courtKey || !courtIds.includes(courtKey)) {
            return
          }
          
          // ✅ INSERT: ajouter si status = 'confirmed' ou 'pending'
          if (payload.eventType === 'INSERT' && payloadNew) {
            if (payloadNew.status === 'confirmed' || payloadNew.status === 'pending') {
              setBookedByCourt(prev => {
                const newMap = { ...prev }
                if (!newMap[courtKey]) newMap[courtKey] = new Set()
                newMap[courtKey] = new Set([...newMap[courtKey], payloadNew.slot_id])
                return newMap
              })
              console.log('[REALTIME] ✅ Slot booked (INSERT):', { courtKey, slotId: payloadNew.slot_id })
            }
          }
          
          // ✅ UPDATE: gérer changement de status ou slot_id
          else if (payload.eventType === 'UPDATE' && payloadNew && payloadOld) {
            // Cas 1: changement de status
            if (payloadOld.status !== payloadNew.status) {
              // old → confirmed/pending: ajouter
              if (payloadNew.status === 'confirmed' || payloadNew.status === 'pending') {
                setBookedByCourt(prev => {
                  const newMap = { ...prev }
                  if (!newMap[courtKey]) newMap[courtKey] = new Set()
                  newMap[courtKey] = new Set([...newMap[courtKey], payloadNew.slot_id])
                  return newMap
                })
                console.log('[REALTIME] ✅ Slot booked (UPDATE):', { courtKey, slotId: payloadNew.slot_id })
              }
              // confirmed/pending → cancelled: retirer
              else if (payloadNew.status === 'cancelled' && (payloadOld.status === 'confirmed' || payloadOld.status === 'pending')) {
                setBookedByCourt(prev => {
                  const newMap = { ...prev }
                  if (newMap[courtKey]) {
                    const newSet = new Set(newMap[courtKey])
                    newSet.delete(payloadOld.slot_id)
                    newMap[courtKey] = newSet
                  }
                  return newMap
                })
                console.log('[REALTIME] ✅ Slot freed (UPDATE cancelled):', { courtKey, slotId: payloadOld.slot_id })
              }
            }
            // Cas 2: changement de slot_id (rare)
            else if (payloadOld.slot_id !== payloadNew.slot_id) {
              setBookedByCourt(prev => {
                const newMap = { ...prev }
                if (!newMap[courtKey]) newMap[courtKey] = new Set()
                const newSet = new Set(newMap[courtKey])
                // Retirer ancien slot si c'était confirmed/pending
                if (payloadOld.status === 'confirmed' || payloadOld.status === 'pending') {
                  newSet.delete(payloadOld.slot_id)
                }
                // Ajouter nouveau slot si c'est confirmed/pending
                if (payloadNew.status === 'confirmed' || payloadNew.status === 'pending') {
                  newSet.add(payloadNew.slot_id)
                }
                newMap[courtKey] = newSet
                return newMap
              })
              console.log('[REALTIME] ✅ Slot changed:', { courtKey, old: payloadOld.slot_id, new: payloadNew.slot_id })
            }
          }
          
          // ✅ DELETE: retirer le slot
          else if (payload.eventType === 'DELETE' && payloadOld) {
            setBookedByCourt(prev => {
              const newMap = { ...prev }
              if (newMap[courtKey]) {
                const newSet = new Set(newMap[courtKey])
                newSet.delete(payloadOld.slot_id)
                newMap[courtKey] = newSet
              }
              return newMap
            })
            console.log('[REALTIME] ✅ Slot freed (DELETE):', { courtKey, slotId: payloadOld.slot_id })
          }
        }
      )
      .subscribe()
    
    return () => {
      console.log('[REALTIME] Unsubscribing')
      supabase.removeChannel(channel)
    }
  }, [selectedDate, club, terrains])
  
  // Vérifier si un créneau est disponible (O(1)) - Compare par slot_id
  const isSlotAvailable = useCallback((courtId: string, slotId: number): boolean => {
    return !(bookedByCourt[courtId]?.has(slotId))
  }, [bookedByCourt])
  
  // ✅ Fonction pour envoyer les invitations automatiquement
  const sendInvitations = useCallback(async (reservationId: string) => {
    // Vérifier s'il y a des emails à envoyer
    if (invitedEmails.length === 0) {
      console.log('[INVITE] No emails to send')
      return
    }

    console.log('[INVITE] Sending invitations to:', invitedEmails)

    try {
      const dateFormatted = `${formatDate(selectedDate).day} ${formatDate(selectedDate).date} ${formatDate(selectedDate).month} à ${selectedSlot?.start_time}`
      const bookingUrl = `${window.location.origin}/player/reservations`

      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: invitedEmails, // ✅ Envoyer la liste d'emails
          clubName: club.nom,
          dateText: dateFormatted,
          message: 'Vous avez été invité à rejoindre cette partie de padel !',
          bookingUrl: bookingUrl
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('[INVITE] API error:', data)
      } else {
        console.log('[INVITE] Success:', data)
      }
    } catch (error) {
      console.error('[INVITE] Network error:', error)
      // ✅ Ne pas bloquer l'UI - l'utilisateur a déjà sa réservation
    }
  }, [invitedEmails, club, selectedDate, selectedSlot])

  // Handler stable pour la confirmation finale
  const handleFinalConfirmation = useCallback(async (withPremium: boolean) => {
    console.time('reserve')
    console.log('[RESERVE] START - handleFinalConfirmation', { 
      withPremium, 
      isSubmitting,
      invitedEmails: invitedEmails.length 
    })
    
    // ✅ Guard anti double-clic
    if (isSubmitting) {
      console.log('[RESERVE] BLOCKED - Already submitting')
      return
    }
    
    if (!selectedSlot || !selectedTerrain) {
      console.error('[RESERVE] Missing slot or terrain')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // ✅ Récupérer le court_id (UUID réel)
      const courtId = COURT_UUIDS[selectedTerrain]
      if (!courtId) {
        console.error('[RESERVE] No court UUID for terrain', selectedTerrain)
        alert('Erreur: Terrain invalide')
        setIsSubmitting(false)
        return
      }
      
      const bookingDate = selectedDate.toISOString().split('T')[0] // YYYY-MM-DD
      
      // ✅ INSERTION DANS public.bookings (SOURCE DE VÉRITÉ)
      const slotStartTimestamp = combineDateAndTime(bookingDate, selectedSlot.start_time)
      const slotEndTimestamp = combineDateAndTime(bookingDate, selectedSlot.end_time)
      
      const bookingPayload = {
        club_id: club.id,                       // ✅ UUID réel depuis public.clubs
        court_id: courtId,                      // ✅ UUID réel depuis public.courts
        booking_date: bookingDate,              // DATE YYYY-MM-DD NOT NULL
        slot_id: selectedSlot.id,               // INTEGER NOT NULL (référence time_slots.id)
        slot_start: slotStartTimestamp,         // timestamptz
        slot_end: slotEndTimestamp,             // timestamptz
        status: 'confirmed' as const,           // 'confirmed' | 'pending' | 'cancelled'
        created_by: null,                       // TODO: remplacer par auth.uid()
        created_at: new Date().toISOString()
      }
      
      // ✅ LOGGING DU PAYLOAD
      console.log('[BOOKING INSERT]', {
        club_id: bookingPayload.club_id,
        court_id: bookingPayload.court_id,
        booking_date: bookingPayload.booking_date,
        slot_id: bookingPayload.slot_id,
        status: bookingPayload.status
      })
      
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingPayload])
        .select()
        .single()
      
      if (bookingError) {
        // ✅ LOGGING COMPLET DE L'ERREUR
        console.error('[BOOKING INSERT ERROR]', bookingError)
        console.error('[BOOKING INSERT ERROR - Full details]', {
          table: 'bookings',
          message: bookingError.message,
          details: bookingError.details,
          hint: bookingError.hint,
          code: bookingError.code
        })
        
        // ✅ AFFICHAGE DÉTAILLÉ DE L'ERREUR
        const errorMessage = [
          `Erreur réservation (table: bookings)`,
          `Message: ${bookingError.message}`,
          bookingError.details ? `Détails: ${bookingError.details}` : '',
          bookingError.hint ? `Conseil: ${bookingError.hint}` : '',
          bookingError.code ? `Code: ${bookingError.code}` : ''
        ].filter(Boolean).join('\n')
        
        alert(errorMessage)
        setIsSubmitting(false)
        return
      }
      
      // ✅ LOGGING SUCCÈS AVEC DONNÉES COMPLÈTES
      console.log('[BOOKING INSERT] ✅ Success:', bookingData)
      console.log('[BOOKING INSERT] ✅ Success - ID:', bookingData.id)
      
      // ✅ Sauvegarder aussi dans localStorage pour affichage "Mes réservations"
      const reservationId = bookingData.id
      const newReservation = {
        id: reservationId,
        date: bookingDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        status: 'confirmed',
        price: club.prix * (selectedPlayers.length + 1),
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
      
      const existingReservations = JSON.parse(localStorage.getItem('demoReservations') || '[]')
      existingReservations.unshift(newReservation)
      localStorage.setItem('demoReservations', JSON.stringify(existingReservations))
      
      console.log('[RESERVE] Saved successfully')
      console.timeEnd('reserve')
      
      // ✅ Envoyer les invitations automatiquement (async, non bloquant)
      sendInvitations(String(reservationId)).catch(err => {
        console.error('[RESERVE] Invitation sending failed (non-blocking):', err)
      })
      
      // ✅ Navigation immédiate sans attendre les invitations
      console.log('[RESERVE] Navigating to /player/reservations')
      router.push('/player/reservations')
      
    } catch (error) {
      // ✅ LOGGING COMPLET DES ERREURS INATTENDUES
      console.error('[RESERVE] ERROR:', error)
      console.error('[RESERVE] ERROR - Full object:', JSON.stringify(error, null, 2))
      console.timeEnd('reserve')
      setIsSubmitting(false)
      
      // ✅ AFFICHAGE DÉTAILLÉ DE L'ERREUR
      const errorMessage = error instanceof Error 
        ? `Erreur inattendue: ${error.message}\n\nStack: ${error.stack || 'N/A'}`
        : `Erreur inattendue: ${JSON.stringify(error)}`
      
      alert(errorMessage)
    }
  }, [isSubmitting, selectedDate, selectedSlot, selectedPlayers, selectedTerrain, club, router, invitedEmails, sendInvitations])
  
  const handleSlotClick = useCallback((terrainId: number, slot: TimeSlot) => {
    console.log('[SLOT CLICK]', { terrainId, slot, isSubmitting })
    
    // ✅ Guard: Ne pas ouvrir de modal si en cours de soumission
    if (isSubmitting) {
      console.log('[SLOT CLICK] BLOCKED - Already submitting')
      return
    }
    
    const courtId = COURT_UUIDS[terrainId]
    if (!courtId) {
      console.warn('[SLOT CLICK] No court UUID for terrain', terrainId)
      return
    }
    
    if (isSlotAvailable(String(courtId), slot.id)) {
      console.log('[SLOT CLICK] Opening player modal')
      setSelectedTerrain(terrainId)
      setSelectedSlot(slot)
      setShowPlayerModal(true)
    } else {
      console.log('[SLOT CLICK] Slot not available')
    }
  }, [isSlotAvailable, isSubmitting, club])
  
  const handlePlayersContinue = useCallback((players: string[], emails: string[], showPremium: boolean) => {
    console.log('[PLAYERS CONTINUE]', { 
      players, 
      emails: emails.length,
      showPremium, 
      isSubmitting 
    })
    
    if (isSubmitting) {
      console.log('[PLAYERS CONTINUE] BLOCKED - Already submitting')
      return
    }
    
    setSelectedPlayers(players)
    setInvitedEmails(emails) // ✅ Stocker les emails pour l'envoi automatique
    setShowPlayerModal(false)
    
    if (showPremium) {
      setShowPremiumModal(true)
    } else {
      // ✅ Appel async pour éviter le freeze
      requestAnimationFrame(() => {
        handleFinalConfirmation(false)
      })
    }
  }, [isSubmitting, handleFinalConfirmation])
  
  const handleSubscribePremium = useCallback(() => {
    console.log('[PREMIUM] Subscribe')
    requestAnimationFrame(() => {
      handleFinalConfirmation(true)
    })
  }, [handleFinalConfirmation])
  
  const handleContinueWithout = useCallback(() => {
    console.log('[PREMIUM] Continue without')
    requestAnimationFrame(() => {
      handleFinalConfirmation(false)
    })
  }, [handleFinalConfirmation])
  
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
          <button
            type="button"
            onClick={() => router.push('/player/clubs')}
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block"
          >
            ← Retour aux clubs
          </button>
          
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
          
          {/* ✅ Affichage de chargement */}
          {isLoadingSlots ? (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600 font-semibold">Chargement des créneaux disponibles...</p>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
              <p className="text-gray-600 font-semibold">Aucun créneau disponible</p>
            </div>
          ) : (
            <div className="space-y-6">
              {terrains.map((terrain) => {
                // ✅ Récupérer le court_id (UUID réel)
                const courtId = COURT_UUIDS[terrain.id]
                const courtKey = courtId ? String(courtId) : null
                
                // Calculer le nombre de créneaux disponibles pour ce terrain
                const availableCount = courtKey 
                  ? timeSlots.filter(slot => isSlotAvailable(courtKey, slot.id)).length
                  : timeSlots.length // Si pas de court_id, tous sont disponibles (fallback)
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
                        {timeSlots.map((slot) => {
                          // ✅ Vérifier disponibilité par slot_id
                          const available = courtKey ? isSlotAvailable(courtKey, slot.id) : true
                          
                          return (
                            <button
                              type="button"
                              key={slot.id}
                              onClick={() => handleSlotClick(terrain.id, slot)}
                              disabled={!available || isSubmitting}
                              className={`p-3 rounded-xl border-2 font-bold transition-all ${
                                available && !isSubmitting
                                  ? 'bg-white text-gray-900 border-gray-200 hover:border-blue-600 hover:bg-blue-50 hover:scale-105'
                                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-base font-black">{slot.start_time}</div>
                                <div className="text-xs text-gray-500">→</div>
                                <div className="text-base font-black">{slot.end_time}</div>
                              </div>
                              {!available && (
                                <div className="text-xs mt-1 text-red-500 font-semibold">Réservé</div>
                              )}
                              {isSubmitting && available && (
                                <div className="text-xs mt-1 text-blue-500 font-semibold">...</div>
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
          )}
        </div>
        
      </div>
      
      {/* Modal Joueurs */}
      {showPlayerModal && selectedSlot && selectedTerrain && (
        <PlayerSelectionModal
          onClose={() => setShowPlayerModal(false)}
          onContinue={handlePlayersContinue}
          clubName={`${club.nom} - Terrain ${selectedTerrain}`}
          timeSlot={`${selectedSlot.start_time} - ${selectedSlot.end_time}`}
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

