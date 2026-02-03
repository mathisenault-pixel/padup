'use client'

import { useState, use, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PlayerSelectionModal from './PlayerSelectionModal'
import PremiumModal from './PremiumModal'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
import { getClubImage } from '@/lib/clubImages'
import { getClubById } from '@/lib/data/clubs'

type Club = {
  id: string
  name: string // ✅ Correspond à public.clubs.name
  city: string // ✅ Correspond à public.clubs.city
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
  club_id: string
  court_id: string
  booking_date: string // DATE (YYYY-MM-DD)
  slot_id: number // BIGINT (référence vers time_slots.id)
  slot_start: string // timestamptz (ISO format)
  slot_end: string // timestamptz (ISO format)
  status: string // enum: 'confirmed' | 'cancelled'
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Combiner une date (YYYY-MM-DD) et une heure (HH:MM:SS) en timestamp ISO UTC
 * ✅ IMPORTANT: Retourne toujours format ISO avec timezone Z pour cohérence avec Supabase
 * Ex: combineDateAndTime("2026-01-23", "14:00:00") => "2026-01-23T14:00:00.000Z"
 */
function combineDateAndTime(dateStr: string, timeStr: string): string {
  // Créer un Date object en UTC pour éviter les conversions de timezone
  const isoString = `${dateStr}T${timeStr}Z` // Ajouter Z pour forcer UTC
  const date = new Date(isoString)
  return date.toISOString() // Retourne format cohérent avec Z
}

/**
 * Calculer slot_end en ajoutant EXACTEMENT 90 minutes à slot_start
 * ✅ Garantit la contrainte DB: slot_end - slot_start = 90 minutes EXACT
 * ✅ Utilise getTime() pour calcul en millisecondes (pas d'arrondi)
 */
function calculateSlotEnd(slotStartISO: string): string {
  const startDate = new Date(slotStartISO)
  const endDate = new Date(startDate.getTime() + 90 * 60 * 1000) // +90 minutes EXACT
  return endDate.toISOString() // Format UTC avec Z
}

/**
 * Valider que la durée entre deux timestamps est exactement 90 minutes
 * ✅ Compare en millisecondes pour précision maximale (pas d'arrondi)
 */
function validateSlotDuration(slotStart: string, slotEnd: string): { valid: boolean; durationMs: number; durationMinutes: number } {
  const start = new Date(slotStart)
  const end = new Date(slotEnd)
  const durationMs = end.getTime() - start.getTime()
  const expectedMs = 90 * 60 * 1000 // 5400000 ms
  return {
    valid: durationMs === expectedMs, // ✅ Comparaison stricte en millisecondes
    durationMs,
    durationMinutes: durationMs / (60 * 1000) // Pour affichage
  }
}

// ============================================
// CLUB & COURTS — VRAIS UUIDs depuis Supabase
// ============================================

// ✅ UUID du club démo (historique, maintenant exclu des listes)
const DEMO_CLUB_UUID = 'ba43c579-e522-4b51-8542-737c2c6452bb'

// ============================================
// ⚠️ OBSOLETE: COURT_UUIDS hardcodé
// ============================================
// Les courts sont maintenant chargés depuis Supabase (public.courts)
// via useEffect → setCourts() → terrains.map(court => ({ id, courtId: court.id, ... }))
// Conserver ici uniquement pour référence historique
// const COURT_UUIDS: Record<number, string> = {
//   1: '21d9a066-b7db-4966-abf1-cc210f7476c1', // Terrain 1
//   2: '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e', // Terrain 2
// }

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
  // ============================================
  // 1️⃣ RÉSOUDRE params EN PREMIER (avant tout autre code)
  // ============================================
  const resolvedParams = use(params)
  const clubId = resolvedParams?.id
  
  // ============================================
  // 2️⃣ TOUS LES HOOKS (SANS CONDITION)
  // ============================================
  const router = useRouter()
  
  // ============================================
  // CHARGEMENT DU CLUB DEPUIS SUPABASE
  // ============================================
  const [clubData, setClubData] = useState<Club | null>(null)
  const [isLoadingClub, setIsLoadingClub] = useState(true)
  
  useEffect(() => {
    if (!clubId) {
      console.warn('[CLUB FETCH] Guard: clubId is falsy, skipping fetch')
      return // Guard: pas d'ID
    }
    
    const loadClub = async () => {
      console.log('[CLUB FETCH] 🔍 Starting fetch for clubId:', clubId)
      console.log('[CLUB FETCH] Query: from("clubs").select("id, name, city").eq("id", clubId).maybeSingle()')
      
      // ✅ Utiliser maybeSingle() pour ne jamais throw
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name, city')
        .eq('id', clubId)
        .maybeSingle()
      
      console.log('[CLUB FETCH] Response received - data:', data, 'error:', error)
      
      if (error || !data) {
        console.error('[CLUB FETCH] ❌ Club fetch failed!')
        console.error('[CLUB FETCH] Error object:', error)
        console.error('[CLUB FETCH] Data object:', data)
        console.error('[CLUB FETCH] clubId used:', clubId)
        setIsLoadingClub(false)
        setClubData(null)
        return
      }
      
      console.log('[CLUB FETCH] ✅ Club loaded successfully:', data)
      
      // Récupérer les données complètes depuis CLUBS_DATA
      const clubDetails = getClubById(data.id)
      
      // Transformer les données Supabase en format UI avec les vraies données
      const club: Club = {
        id: data.id,
        name: data.name || clubDetails?.name || 'Club sans nom',
        city: data.city || clubDetails?.city || 'Ville non spécifiée',
        imageUrl: getClubImage(data.id),
        prix: clubDetails?.prixMin || 12,
        adresse: clubDetails?.address || '123 Avenue du Padel',
        telephone: clubDetails?.phone || '+33 4 90 00 00 00',
        email: clubDetails?.email || 'contact@club.fr',
        horaires: {
          semaine: '09h00 - 00h00',
          weekend: '09h00 - 20h00'
        },
        description: clubDetails?.description || 'Club de padel moderne avec terrains de qualité professionnelle.',
        equipements: clubDetails?.equipements || ['Bar', 'Vestiaires', 'Douches', 'Parking', 'WiFi'],
        nombreTerrains: clubDetails?.courts?.length || 2
      }
      
      setClubData(club)
      setIsLoadingClub(false)
    }
    
    loadClub()
  }, [clubId])
  
  // ============================================
  // STABILISATION: Club en dehors du render
  // ============================================
  const club = useMemo(() => {
    console.log('[CLUB] Selected club:', clubData)
    return clubData
  }, [clubData])
  
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
  const [courts, setCourts] = useState<Array<{ id: string; name: string; type?: string }>>([])
  const [bookedByCourt, setBookedByCourt] = useState<Record<string, Set<number>>>({}) // Map de court_id → Set<slot_id>
  const [isLoadingSlots, setIsLoadingSlots] = useState(true)
  const [isLoadingCourts, setIsLoadingCourts] = useState(true)
  
  // ============================================
  // LOGS AUTH AU MOUNT DE LA PAGE
  // ============================================
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[RESERVER PAGE] Checking auth on mount...')
      
      const sessionResult = await supabase.auth.getSession()
      console.log('[AUTH session] On mount:', sessionResult)
      console.log('[AUTH session] Session present:', sessionResult.data.session ? 'YES' : 'NO')
      if (sessionResult.data.session) {
        console.log('[AUTH session] User email:', sessionResult.data.session.user?.email)
        console.log('[AUTH session] Access token:', sessionResult.data.session.access_token?.substring(0, 20) + '...')
      }
      
      const userResult = await supabase.auth.getUser()
      console.log('[AUTH user] On mount:', userResult)
      console.log('[AUTH user] User present:', userResult.data.user ? 'YES' : 'NO')
      if (userResult.data.user) {
        console.log('[AUTH user] User email:', userResult.data.user.email)
        console.log('[AUTH user] User ID:', userResult.data.user.id)
      }
    }
    
    checkAuth()
  }, [])
  
  // ✅ Redirection si pas de clubId (dans useEffect pour ne pas bloquer les hooks)
  useEffect(() => {
    if (!clubId) {
      console.error('[RESERVER PAGE] ❌ No clubId in params, redirecting to clubs list')
      router.replace('/player/clubs')
    }
  }, [clubId, router])
  
  // ============================================
  // ÉTAPE 0 — Charger les courts depuis Supabase
  // ============================================
  useEffect(() => {
    const loadCourts = async () => {
      if (!club?.id) {
        console.warn('[COURTS] No club.id, skipping courts load')
        setIsLoadingCourts(false)
        return
      }
      
      console.log('🔍 [DEBUG COURTS] START Loading courts from Supabase')
      console.log('🔍 [DEBUG COURTS] Club ID:', club.id)
      console.log('🔍 [DEBUG COURTS] Query: from("courts").select("*").eq("club_id", club.id)')
      
      // ✅ Charger TOUS les courts du club (sans filtre is_active pour MVP)
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('club_id', club.id)
        .order('name', { ascending: true })
      
      if (error) {
        console.error('❌ [DEBUG COURTS] Error loading courts:', error)
        console.error('❌ [DEBUG COURTS] Error message:', error.message)
        console.error('❌ [DEBUG COURTS] Error details:', JSON.stringify(error, null, 2))
        setIsLoadingCourts(false)
        return
      }
      
      console.log('✅ [DEBUG COURTS] Query successful')
      console.log('✅ [DEBUG COURTS] Courts count:', data?.length || 0)
      console.log('✅ [DEBUG COURTS] Raw data:', JSON.stringify(data, null, 2))
      
      // Transform DB data to UI format
      const courtsFormatted = (data || []).map((court, index) => {
        console.log(`✅ [DEBUG COURTS] Court ${index + 1}:`, {
          id: court.id,
          name: court.name,
          court_type: court.court_type
        })
        return {
          id: court.id, // UUID
          name: court.name || 'Terrain',
          type: court.court_type || 'Indoor'
        }
      })
      
      console.log('✅ [DEBUG COURTS] Formatted courts:', courtsFormatted.length, 'courts')
      
      setCourts(courtsFormatted)
      setIsLoadingCourts(false)
      
      // ✅ Sélectionner le premier terrain par défaut si aucun n'est sélectionné
      if (!selectedTerrain && courtsFormatted.length > 0) {
        console.log('✅ [DEBUG COURTS] Auto-selecting first court (terrain id: 1)')
        setSelectedTerrain(1)
      }
    }
    
    loadCourts()
  }, [club?.id])
  
  // ✅ LEGACY: Mapping terrains pour compatibilité UI (utilise les courts depuis Supabase)
  const terrains = useMemo(() => 
    courts.map((court, i) => ({
      id: i + 1, // Index UI (1, 2, 3...)
      courtId: court.id, // ✅ VRAI UUID pour insert bookings
      name: court.name,
      type: court.type || 'Intérieur'
    }))
  , [courts])
  
  // ============================================
  // ÉTAPE 1 — Charger les time_slots depuis Supabase
  // ============================================
  useEffect(() => {
    const loadTimeSlots = async () => {
      console.log('🔍 [DEBUG SLOTS] START Loading time_slots from Supabase')
      console.log('🔍 [DEBUG SLOTS] Query: from("time_slots").select("*").order("start_time")')
      
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .order('start_time', { ascending: true })
      
      if (error) {
        console.error('❌ [DEBUG SLOTS] Error loading time_slots:', error)
        console.error('❌ [DEBUG SLOTS] Error message:', error.message)
        console.error('❌ [DEBUG SLOTS] Error details:', JSON.stringify(error, null, 2))
        setIsLoadingSlots(false)
        return
      }
      
      console.log('✅ [DEBUG SLOTS] Query successful')
      console.log('✅ [DEBUG SLOTS] Time slots count:', data?.length || 0)
      console.log('✅ [DEBUG SLOTS] Raw data (first 3):', data?.slice(0, 3))
      console.log('✅ [DEBUG SLOTS] Full data:', JSON.stringify(data, null, 2))
      
      setTimeSlots(data || [])
      setIsLoadingSlots(false)
    }
    
    loadTimeSlots()
  }, [])
  
  // ============================================
  // ÉTAPE 2 — Charger les bookings confirmés pour TOUS les courts du club
  // ============================================
  useEffect(() => {
    // ✅ GUARD: Vérifier que club est complètement prêt
    if (!club) {
      console.warn('🔍 [DEBUG BOOKINGS] No club, skipping')
      return
    }
    if (!club.id) {
      console.warn('🔍 [DEBUG BOOKINGS] No club.id, skipping')
      return
    }
    
    const loadBookings = async () => {
      // ✅ Construire la liste de tous les court_id (UUIDs réels depuis Supabase)
      const courtIds = terrains
        .map(t => t.courtId)
        .filter(Boolean) as string[]
      
      if (courtIds.length === 0) {
        console.warn('🔍 [DEBUG BOOKINGS] No courts loaded yet, skipping booking fetch')
        console.warn('🔍 [DEBUG BOOKINGS] terrains:', terrains)
        // ✅ Ne pas bloquer : si 0 courts chargés, on attend qu'ils se chargent
        setBookedByCourt({})
        return
      }
      
      // ✅ MVP SIMPLE : utiliser booking_date (DATE) pour filtrer
      const bookingDate = selectedDate.toISOString().split('T')[0] // YYYY-MM-DD
      
      console.log('🔍 [DEBUG BOOKINGS] START Loading bookings')
      console.log('🔍 [DEBUG BOOKINGS] Club ID:', club.id)
      console.log('🔍 [DEBUG BOOKINGS] Date:', bookingDate)
      console.log('🔍 [DEBUG BOOKINGS] Query: from("bookings").select("court_id, slot_id, status").eq("club_id", club.id).eq("booking_date", date).eq("status", "confirmed")')
      
      // ✅ Charger les bookings du club pour la date sélectionnée
      const { data, error } = await supabase
        .from('bookings')
        .select('court_id, slot_id, status')
        .eq('club_id', club.id)
        .eq('booking_date', bookingDate)
        .eq('status', 'confirmed')
      
      if (error) {
        console.error('❌ [DEBUG BOOKINGS] Error loading bookings:', error)
        console.error('❌ [DEBUG BOOKINGS] Error message:', error.message)
        console.error('❌ [DEBUG BOOKINGS] Error code:', error.code)
        console.error('❌ [DEBUG BOOKINGS] Error details:', error.details)
        // ✅ En cas d'erreur, on continue avec 0 bookings (tous les slots disponibles)
        setBookedByCourt({})
        return
      }
      
      console.log('✅ [DEBUG BOOKINGS] Query successful')
      console.log('✅ [DEBUG BOOKINGS] Bookings count:', data?.length || 0)
      console.log('✅ [DEBUG BOOKINGS] Raw data:', JSON.stringify(data, null, 2))
      
      // ✅ Construire bookedByCourt : court_id → Set<slot_id>
      // Clé MVP = ${courtId}_${slotId}
      const map: Record<string, Set<number>> = {}
      for (const row of data ?? []) {
        const courtKey = String(row.court_id)
        if (!map[courtKey]) map[courtKey] = new Set()
        map[courtKey].add(row.slot_id)
        
        // Log exemple de clé générée
        console.log(`✅ [DEBUG BOOKINGS] Key example: court_id=${courtKey}, slot_id=${row.slot_id}`)
      }
      
      const totalBookedSlots = Object.values(map).reduce((sum, set) => sum + set.size, 0)
      console.log('✅ [DEBUG BOOKINGS] Total booked slots:', totalBookedSlots)
      console.log('✅ [DEBUG BOOKINGS] Booked by court:', Object.fromEntries(
        Object.entries(map).map(([courtId, set]) => [courtId, Array.from(set)])
      ))
      
      setBookedByCourt(map)
    }
    
    loadBookings()
  }, [selectedDate, club, terrains])
  
  // ============================================
  // ÉTAPE 3 — SYNCHRONISATION TEMPS RÉEL (tous les courts du club)
  // ============================================
  useEffect(() => {
    // ✅ GUARD: Vérifier que club est complètement prêt
    if (!club) {
      console.warn('[REALTIME] No club, skipping')
      return
    }
    if (!club.id) {
      console.warn('[REALTIME] No club.id, skipping')
      return
    }
    
    const bookingDate = selectedDate.toISOString().split('T')[0] // YYYY-MM-DD
    
    console.log('[REALTIME] Subscribing to bookings:', { 
      clubId: club.id, 
      bookingDate
    })
    
    // ✅ Construire la liste des court_id (UUIDs réels depuis Supabase)
    const courtIds = terrains
      .map(t => t.courtId)
      .filter(Boolean) as string[]
    
    if (courtIds.length === 0) {
      console.warn('[REALTIME] No courts loaded yet, skipping subscription')
      return
    }
    
    // ✅ MVP SIMPLE : Écouter changements sur bookings avec booking_date filter
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
            console.log('[REALTIME] Ignoring: court not in our list')
            return
          }
          
          // ✅ INSERT: ajouter si status = 'confirmed'
          if (payload.eventType === 'INSERT' && payloadNew) {
            if (payloadNew.status === 'confirmed') {
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
              // old → confirmed: ajouter
              if (payloadNew.status === 'confirmed') {
                setBookedByCourt(prev => {
                  const newMap = { ...prev }
                  if (!newMap[courtKey]) newMap[courtKey] = new Set()
                  newMap[courtKey] = new Set([...newMap[courtKey], payloadNew.slot_id])
                  return newMap
                })
                console.log('[REALTIME] ✅ Slot booked (UPDATE):', { courtKey, slotId: payloadNew.slot_id })
              }
              // confirmed → cancelled: retirer
              else if (payloadNew.status === 'cancelled' && payloadOld.status === 'confirmed') {
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
                // Retirer ancien slot si c'était confirmed
                if (payloadOld.status === 'confirmed') {
                  newSet.delete(payloadOld.slot_id)
                }
                // Ajouter nouveau slot si c'est confirmed
                if (payloadNew.status === 'confirmed') {
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
  
  // ✅ MVP SIMPLE : Vérifier si un créneau est disponible par slot_id
  const isSlotAvailable = useCallback((courtId: string, slotId: number): boolean => {
    return !(bookedByCourt[courtId]?.has(slotId))
  }, [bookedByCourt])
  
  // ✅ Fonction pour envoyer les invitations automatiquement
  const sendInvitations = useCallback(async (reservationId: string) => {
    // ✅ GUARD: Vérifier que club est prêt
    if (!club || !club.id || !club.name) {
      console.error('[INVITE] ❌ Club not ready:', { club })
      return
    }
    
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
          clubName: club.name,
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
    
    // ✅ GUARDS CRITIQUES : Vérifier TOUS les champs obligatoires
    if (!club || !club.id) {
      console.error('[RESERVE] ❌ CRITICAL: club or club.id is null/undefined', { club })
      alert('Erreur critique: Données du club manquantes')
      return
    }
    
    if (!selectedDate) {
      console.error('[RESERVE] ❌ CRITICAL: selectedDate is null/undefined')
      alert('Erreur critique: Date non sélectionnée')
      return
    }
    
    if (!selectedSlot) {
      console.error('[RESERVE] ❌ CRITICAL: selectedSlot is null/undefined')
      alert('Erreur critique: Créneau non sélectionné')
      return
    }
    
    if (!selectedSlot.id) {
      console.error('[RESERVE] ❌ CRITICAL: selectedSlot.id is null/undefined', selectedSlot)
      alert('Erreur critique: ID du créneau manquant')
      return
    }
    
    if (!selectedTerrain) {
      console.error('[RESERVE] ❌ CRITICAL: selectedTerrain is null/undefined')
      alert('Erreur critique: Terrain non sélectionné')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // ✅ RÉCUPÉRER L'UTILISATEUR CONNECTÉ (OBLIGATOIRE POUR RLS)
      console.log('[RESERVE] Getting authenticated user...')
      
      // ✅ LOG DÉTAILLÉ: getUser() + getSession()
      const getUserResult = await supabase.auth.getUser()
      console.log('[AUTH getUser] Full response:', getUserResult)
      console.log('[AUTH getUser] User:', getUserResult.data?.user)
      console.log('[AUTH getUser] Error:', getUserResult.error)
      
      const getSessionResult = await supabase.auth.getSession()
      console.log('[AUTH getSession] Full response:', getSessionResult)
      console.log('[AUTH getSession] Session:', getSessionResult.data?.session)
      console.log('[AUTH getSession] Error:', getSessionResult.error)
      
      const { data: { user }, error: userErr } = getUserResult
      
      if (userErr) {
        console.error('[RESERVE] ❌ CRITICAL: Error fetching user:', userErr)
        console.error('[RESERVE] ❌ User error details:', JSON.stringify(userErr, null, 2))
        alert('Erreur lors de la récupération de l\'utilisateur. Redirection vers login...')
        setIsSubmitting(false)
        router.push('/player/login')
        return
      }
      
      if (!user) {
        console.error('[RESERVE] ❌ CRITICAL: No user logged in (user is null)')
        console.error('[RESERVE] ❌ Not authenticated - redirecting to login')
        alert('Vous devez être connecté pour réserver. Redirection vers login...')
        setIsSubmitting(false)
        router.push('/player/login')
        return
      }
      
      console.log('[RESERVE] ✅ User authenticated:', user.id)
      console.log('[RESERVE] ✅ User email:', user.email)
      
      // ✅ Récupérer le court_id (UUID réel depuis le terrain sélectionné)
      const selectedTerrainData = terrains.find(t => t.id === selectedTerrain)
      if (!selectedTerrainData) {
        console.error('[RESERVE] ❌ CRITICAL: No terrain found for id:', selectedTerrain)
        alert('Erreur: Terrain invalide')
        setIsSubmitting(false)
        return
      }
      
      let courtId = selectedTerrainData.courtId
      
      // ============================================
      // 🚨 PATCH MVP TEMPORAIRE - FALLBACK COURT_ID
      // ============================================
      // TODO: RETIRER CE FALLBACK APRÈS DEBUG DU CHARGEMENT DES COURTS
      // Si aucun court chargé depuis DB ou court_id invalide, forcer Terrain 1 (MVP)
      if (!courtId) {
        const FALLBACK_COURT_ID = '21d09a66-b7db-4966-abf1-cc210f7476c1' // Terrain 1 (MVP hardcodé)
        console.warn('═══════════════════════════════════════════════════════════')
        console.warn('[RESERVE] ⚠️⚠️⚠️ MVP FALLBACK ACTIVÉ')
        console.warn('[RESERVE] ⚠️ Court UUID manquant pour terrain:', selectedTerrainData)
        console.warn('[RESERVE] ⚠️ Utilisation du fallback hardcodé (Terrain 1)')
        console.warn('[RESERVE] ⚠️ FALLBACK court_id:', FALLBACK_COURT_ID)
        console.warn('[RESERVE] ⚠️ TODO: Retirer ce fallback après debug du chargement courts')
        console.warn('═══════════════════════════════════════════════════════════')
        courtId = FALLBACK_COURT_ID
      }
      // ============================================
      
      console.log('[RESERVE] ✅ Court ID (UUID):', courtId)
      console.log('[RESERVE] ✅ Terrain:', selectedTerrainData.name)
      
      const bookingDate = selectedDate.toISOString().split('T')[0] // YYYY-MM-DD
      
      // ============================================
      // ✅ CALCUL STRICT ET UNIQUE DE LA DURÉE 90 MINUTES
      // ============================================
      // Ne dépend d'AUCUNE source externe (pas de time_slots.end_time, pas de slot_id, etc.)
      // Calcul unique et strict: end = start + 90 minutes EXACTEMENT
      
      // Étape 1: Construire slot_start depuis date + heure du slot sélectionné
      const slotStartString = `${bookingDate}T${selectedSlot.start_time}Z` // Force UTC avec Z
      const start = new Date(slotStartString)
      
      // Étape 2: Calculer slot_end = start + 90 minutes EXACT
      const end = new Date(start.getTime() + 90 * 60 * 1000)
      
      // Étape 3: Convertir en ISO UTC pour Supabase
      const slot_start = start.toISOString()
      const slot_end = end.toISOString()
      
      // ✅ LOG DE DEBUG OBLIGATOIRE
      const diffMin = (end.getTime() - start.getTime()) / 60000
      console.log('BOOKING_DEBUG', {
        start: slot_start,
        end: slot_end,
        diffMin: diffMin,
      })
      
      // ✅ GUARD: Vérifier que la durée est EXACTEMENT 90 minutes
      if (diffMin !== 90) {
        console.error('[BOOKING] ❌ CRITICAL: Duration is not 90 minutes:', diffMin)
        alert(`Erreur critique: Durée calculée = ${diffMin} minutes (attendu: 90 minutes exactement).\n\nVeuillez contacter le support.`)
        setIsSubmitting(false)
        return
      }
      
      console.log('[BOOKING] ✅ Duration verified: EXACTLY 90 minutes')
      
      // ✅ PAYLOAD REAL SCHEMA CONFIRMED: bookings(club_id, court_id, booking_date, slot_id, slot_start, slot_end, status)
      const bookingPayload = {
        club_id: club.id,                       // ✅ UUID réel depuis public.clubs
        court_id: courtId,                      // ✅ UUID réel depuis public.courts
        booking_date: bookingDate,              // ✅ DATE (YYYY-MM-DD)
        slot_id: selectedSlot.id,               // ✅ BIGINT (référence time_slots.id)
        slot_start: slot_start,                 // ✅ timestamptz - calculé = date + start_time
        slot_end: slot_end,                     // ✅ timestamptz - calculé = slot_start + 90 min
        status: 'confirmed' as const,           // ✅ enum: 'confirmed' | 'cancelled'
        created_by: user.id,                    // ✅ UUID de l'utilisateur connecté (pour RLS)
        created_at: new Date().toISOString()    // ✅ timestamptz
      }
      
      // ✅ LOGGING COMPLET DU PAYLOAD AVANT INSERT
      console.log('═══════════════════════════════════════════════════════════')
      console.log('[BOOKING INSERT] 🚀 ABOUT TO INSERT INTO bookings TABLE')
      console.log('═══════════════════════════════════════════════════════════')
      console.log('[BOOKING PAYLOAD] Complete payload:')
      console.log(JSON.stringify(bookingPayload, null, 2))
      console.log('───────────────────────────────────────────────────────────')
      console.log('[BOOKING PAYLOAD] Critical fields:')
      console.log('  • club_id:', bookingPayload.club_id, '(UUID from clubs)')
      console.log('  • court_id:', bookingPayload.court_id, '(UUID from courts - MUST EXIST IN DB)')
      console.log('  • booking_date:', bookingPayload.booking_date, '(DATE YYYY-MM-DD)')
      console.log('  • slot_id:', bookingPayload.slot_id, '(BIGINT from time_slots)')
      console.log('[BOOKING PAYLOAD] Timestamps:')
      console.log('  • slot_start:', bookingPayload.slot_start, '← TIMESTAMPTZ ISO UTC')
      console.log('  • slot_end:', bookingPayload.slot_end, '← TIMESTAMPTZ ISO UTC')
      console.log('  • duration:', diffMin, 'minutes (MUST BE 90)')
      console.log('[BOOKING PAYLOAD] Other fields:')
      console.log('  • status:', bookingPayload.status, '← confirmed | cancelled')
      console.log('  • created_by:', bookingPayload.created_by, '← REQUIRED FOR RLS')
      console.log('  • created_at:', bookingPayload.created_at)
      console.log('═══════════════════════════════════════════════════════════')
      
      // ✅ VALIDATION FINALE : S'assurer qu'aucun champ critique n'est null/undefined
      if (!bookingPayload.booking_date) {
        console.error('[BOOKING] ❌ CRITICAL: booking_date is falsy:', bookingPayload.booking_date)
        alert('Erreur critique: booking_date manquant')
        setIsSubmitting(false)
        return
      }
      
      if (!bookingPayload.slot_id && bookingPayload.slot_id !== 0) {
        console.error('[BOOKING] ❌ CRITICAL: slot_id is falsy:', bookingPayload.slot_id)
        alert('Erreur critique: slot_id manquant')
        setIsSubmitting(false)
        return
      }
      
      if (!bookingPayload.slot_start || !bookingPayload.slot_end) {
        console.error('[BOOKING] ❌ CRITICAL: slot_start or slot_end is falsy')
        alert('Erreur critique: Timestamps manquants')
        setIsSubmitting(false)
        return
      }
      
      // ✅ VALIDATION FORMAT ISO UTC
      if (!bookingPayload.slot_start.endsWith('Z') || !bookingPayload.slot_end.endsWith('Z')) {
        console.error('[BOOKING] ❌ CRITICAL: Timestamps not in UTC format')
        console.error('  slot_start:', bookingPayload.slot_start, 'has Z?', bookingPayload.slot_start.endsWith('Z'))
        console.error('  slot_end:', bookingPayload.slot_end, 'has Z?', bookingPayload.slot_end.endsWith('Z'))
        alert('Erreur critique: Format timestamp invalide (doit être ISO UTC avec Z)')
        setIsSubmitting(false)
        return
      }
      
      // ✅ VALIDATION COURT_ID (CRITIQUE POUR FOREIGN KEY)
      if (!bookingPayload.court_id) {
        console.error('[BOOKING] ❌❌❌ CRITICAL: court_id is NULL/UNDEFINED')
        console.error('[BOOKING] This will cause foreign key error: bookings_court_id_fkey')
        alert('Erreur critique: court_id manquant. La réservation ne peut pas être créée.')
        setIsSubmitting(false)
        return
      }
      
      // Vérifier que court_id est un UUID valide (format basique)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(bookingPayload.court_id)) {
        console.error('[BOOKING] ❌❌❌ CRITICAL: court_id is not a valid UUID format')
        console.error('[BOOKING] court_id received:', bookingPayload.court_id)
        console.error('[BOOKING] Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')
        alert(`Erreur critique: court_id invalide (${bookingPayload.court_id}).\nFormat UUID attendu.`)
        setIsSubmitting(false)
        return
      }
      
      console.log('[BOOKING] ✅ All validations passed')
      console.log('[BOOKING] ✅ court_id validation passed:', bookingPayload.court_id)
      console.log('[BOOKING] ✅ court_id is valid UUID format')
      console.log('[BOOKING INSERT] Calling Supabase insert...')
      
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingPayload])
        .select()
        .single()
      
      if (bookingError) {
        // ✅ LOGGING COMPLET DE L'ERREUR
        console.error('[BOOKING INSERT ERROR] ❌❌❌')
        console.error('[BOOKING INSERT ERROR] Object:', bookingError)
        console.error('[BOOKING INSERT ERROR] JSON:', JSON.stringify(bookingError, null, 2))
        console.error('[BOOKING INSERT ERROR - Full details]', {
          table: 'bookings',
          message: bookingError.message,
          details: bookingError.details,
          hint: bookingError.hint,
          code: bookingError.code
        })
        
        // ✅ AFFICHAGE DÉTAILLÉ DE L'ERREUR
        // Détecter les erreurs spécifiques
        let errorMessage = ''
        
        // Erreur de contrainte CHECK (durée 90 minutes)
        if (bookingError.code === '23514' || bookingError.message?.includes('90min') || bookingError.message?.includes('booking_90min')) {
          const startHasZ = bookingPayload.slot_start.endsWith('Z')
          errorMessage = [
            `❌ Erreur de contrainte: La durée du créneau doit être exactement 90 minutes`,
            ``,
            `ANALYSE DU PROBLÈME:`,
            `Durée calculée (frontend): ${diffMin} minutes`,
            `Durée attendue: 90 minutes exactement`,
            ``,
            `FORMAT DU TIMESTAMP:`,
            `slot_start: ${bookingPayload.slot_start}`,
            `  - Format UTC (Z)? ${startHasZ ? '✅ OUI' : '❌ NON'}`,
            `  - Longueur: ${bookingPayload.slot_start.length}`,
            ``,
            `Note: La fin de créneau est calculée automatiquement (slot_start + 90 min)`,
            ``,
            `Erreur PostgreSQL:`,
            `${bookingError.message}`,
            bookingError.details ? `Détails: ${bookingError.details}` : '',
            ``,
            `⚠️ Veuillez contacter le support technique avec ces informations.`
          ].filter(Boolean).join('\n')
        }
        // Erreur de double-booking (UNIQUE violation)
        else if (bookingError.code === '23505') {
          errorMessage = `❌ Ce créneau est déjà réservé.\n\nVeuillez choisir un autre créneau disponible.`
        }
        // Erreur RLS (permission refusée)
        else if (bookingError.code === '42501' || bookingError.message?.includes('policy')) {
          errorMessage = `❌ Permission refusée.\n\nVeuillez vous reconnecter et réessayer.`
        }
        // Erreur Foreign Key (ex: court_id not found in courts table)
        else if (bookingError.code === '23503' || bookingError.message?.includes('foreign key') || bookingError.message?.includes('fkey')) {
          errorMessage = [
            `❌ Erreur de clé étrangère (foreign key violation)`,
            ``,
            `PROBLÈME DÉTECTÉ:`,
            `Un des IDs envoyés n'existe pas dans la base de données.`,
            ``,
            `PAYLOAD ENVOYÉ:`,
            `  • club_id: ${bookingPayload.club_id}`,
            `  • court_id: ${bookingPayload.court_id} ← DOIT EXISTER DANS public.courts`,
            `  • booking_date: ${bookingPayload.booking_date}`,
            `  • slot_id: ${bookingPayload.slot_id} ← DOIT EXISTER DANS public.time_slots`,
            `  • slot_start: ${bookingPayload.slot_start}`,
            `  • slot_end: ${bookingPayload.slot_end}`,
            ``,
            `ERREUR POSTGRESQL:`,
            `${bookingError.message}`,
            bookingError.details ? `Détails: ${bookingError.details}` : '',
            ``,
            `⚠️ Veuillez vérifier que le terrain et le créneau sélectionnés existent dans la base.`
          ].filter(Boolean).join('\n')
        }
        // Autres erreurs
        else {
          errorMessage = [
            `❌ Erreur réservation (table: bookings)`,
            ``,
            `MESSAGE: ${bookingError.message}`,
            bookingError.details ? `DÉTAILS: ${bookingError.details}` : '',
            bookingError.hint ? `CONSEIL: ${bookingError.hint}` : '',
            bookingError.code ? `CODE: ${bookingError.code}` : '',
            ``,
            `PAYLOAD ENVOYÉ:`,
            `  • club_id: ${bookingPayload.club_id}`,
            `  • court_id: ${bookingPayload.court_id}`,
            `  • booking_date: ${bookingPayload.booking_date}`,
            `  • slot_id: ${bookingPayload.slot_id}`,
            `  • slot_start: ${bookingPayload.slot_start}`,
            `  • slot_end: ${bookingPayload.slot_end}`,
            `  • status: ${bookingPayload.status}`,
            `  • created_by: ${bookingPayload.created_by}`
          ].filter(Boolean).join('\n')
        }
        
        alert(errorMessage)
        setIsSubmitting(false)
        return
      }
      
      // ✅ LOGGING SUCCÈS AVEC DONNÉES COMPLÈTES
      console.log('[BOOKING INSERT] ✅✅✅ SUCCESS')
      console.log('[BOOKING INSERT] ✅ Data returned from DB:', JSON.stringify(bookingData, null, 2))
      console.log('[BOOKING INSERT] ✅ Vérification champs critiques:')
      console.log('  - id:', bookingData.id)
      console.log('  - club_id:', bookingData.club_id)
      console.log('  - court_id:', bookingData.court_id)
      console.log('  - booking_date:', bookingData.booking_date, '(DATE)')
      console.log('  - slot_id:', bookingData.slot_id, '(BIGINT)')
      console.log('  - slot_start:', bookingData.slot_start, '(TIMESTAMPTZ)')
      console.log('  - slot_end:', bookingData.slot_end, '(TIMESTAMPTZ)')
      console.log('  - status:', bookingData.status, '(ENUM)')
      
      // ✅ VÉRIFICATION POST-INSERT : champs critiques ne doivent PAS être NULL
      if (!bookingData.booking_date) {
        console.error('[BOOKING INSERT] ⚠️⚠️⚠️ WARNING: booking_date is NULL in DB!')
        alert('ATTENTION: La réservation a été créée mais booking_date est NULL en base!')
      }
      
      if (!bookingData.slot_id && bookingData.slot_id !== 0) {
        console.error('[BOOKING INSERT] ⚠️⚠️⚠️ WARNING: slot_id is NULL in DB!')
        alert('ATTENTION: La réservation a été créée mais slot_id est NULL en base!')
      }
      
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
            name: club.name,
            city: club.city,
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
    
    // ✅ Récupérer le court depuis terrains (chargé depuis Supabase)
    const terrain = terrains.find(t => t.id === terrainId)
    if (!terrain) {
      console.warn('[SLOT CLICK] No terrain found for id:', terrainId)
      return
    }
    
    const courtId = terrain.courtId
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
  }, [isSlotAvailable, isSubmitting, terrains])
  
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
  
  // ============================================
  // 3️⃣ GUARDS POUR LE JSX (APRÈS TOUS LES HOOKS)
  // ============================================
  
  // ✅ Guard: Si pas d'ID, ne rien afficher (le useEffect redirige)
  if (!clubId) {
    return null
  }
  
  // ✅ Vérification du club (chargement en cours ou erreur)
  if (isLoadingClub) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-semibold">Chargement du club...</p>
        </div>
      </div>
    )
  }
  
  // ✅ GUARD STRICT: Vérifier que club existe ET a toutes les propriétés nécessaires
  if (!club) {
    console.error('[CLUB] ❌ CRITICAL: No club found!')
    console.error('[CLUB] clubId:', clubId)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-5xl mb-4">🏟️</div>
            <h2 className="text-xl font-bold text-red-900 mb-2">Club introuvable</h2>
            <p className="text-red-700 mb-4">Le club demandé n'existe pas ou n'est plus disponible.</p>
            <p className="text-sm text-red-600 mb-6 font-mono">ID: {clubId}</p>
            <Link href="/player/clubs" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors">
              ← Retour aux clubs
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  // ✅ GUARD STRICT: Vérifier que club.id existe (propriété critique)
  if (!club.id) {
    console.error('[CLUB] ❌ CRITICAL: Club has no id!')
    console.error('[CLUB] club object:', club)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-900 mb-2">Données invalides</h2>
            <p className="text-red-700 mb-4">Les données du club sont incomplètes.</p>
            <Link href="/player/clubs" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors">
              ← Retour aux clubs
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  // ============================================
  // 4️⃣ HELPER FUNCTIONS & JSX
  // ============================================
  
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
                alt={club.name}
                className="w-40 h-40 object-cover rounded-xl shadow-md"
              />
              <div className="flex-1">
                <h1 className="text-4xl font-black text-gray-900 mb-3">{club.name}</h1>
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
          
          {/* ✅ Affichage de chargement courts */}
          {isLoadingCourts ? (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600 font-semibold">Chargement des terrains...</p>
            </div>
          ) : courts.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-red-200 p-12 text-center bg-red-50">
              <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-900 font-bold text-lg mb-2">Aucun terrain disponible</p>
              <p className="text-red-700 mb-4">Aucun terrain n'a été trouvé pour ce club dans la base de données.</p>
              <div className="text-left max-w-md mx-auto bg-white p-4 rounded-lg border border-red-200 text-sm">
                <p className="font-semibold text-gray-900 mb-2">🔍 Debug Info:</p>
                <ul className="space-y-1 text-gray-700">
                  <li>• Club ID: <code className="bg-gray-100 px-1 rounded">{club.id}</code></li>
                  <li>• Query: <code className="bg-gray-100 px-1 rounded text-xs">from("courts").eq("club_id", ...)</code></li>
                  <li>• Résultat: <strong>0 terrains</strong></li>
                  <li className="mt-2 text-xs text-gray-500">→ Vérifier que les courts existent en DB pour ce club</li>
                </ul>
              </div>
            </div>
          ) : isLoadingSlots ? (
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
                // ✅ Récupérer le court_id (UUID réel depuis Supabase)
                const courtId = terrain.courtId
                const courtKey = courtId ? String(courtId) : null
                
                if (!courtId) {
                  console.error('[RENDER] Terrain missing courtId:', terrain)
                  return null // Skip terrains without UUID
                }
                
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
                            <h3 className="text-2xl font-black text-gray-900">{terrain.name}</h3>
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
                          // ✅ MVP : Vérifier disponibilité par slot_id
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
          clubName={`${club.name} - Terrain ${selectedTerrain}`}
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
          clubName={club.name}
          normalPrice={club.prix}
        />
      )}
    </div>
  )
}

