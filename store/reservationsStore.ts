/**
 * Store global des réservations et blocages (front-only MVP)
 * Partagé entre player et club admin
 * 
 * Principe: slotId unique, un seul état global pour griser le bon créneau partout
 */

import { create } from 'zustand'

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled'

export type Reservation = {
  id: string
  clubId: string
  courtId: string
  slotId: string // ID unique du créneau (ex: "slot-14h00-15h30")
  date: string // YYYY-MM-DD
  startTime: string // HH:mm:ss
  endTime: string // HH:mm:ss
  playerName: string
  playerEmail: string
  status: ReservationStatus
  createdAt: string
}

export type BlockedSlot = {
  id: string
  clubId: string
  courtId: string
  slotId: string // ID unique du créneau
  date: string // YYYY-MM-DD
  startTime: string // HH:mm:ss
  endTime: string // HH:mm:ss
  reason: string // "Maintenance", "Événement privé", etc.
  createdAt: string
}

type ReservationsStore = {
  reservations: Reservation[]
  blockedSlots: BlockedSlot[]
  
  // Réservations
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => void
  cancelReservation: (reservationId: string) => void
  getReservationsByClub: (clubId: string) => Reservation[]
  getReservationsByDate: (clubId: string, date: string) => Reservation[]
  
  // Blocages
  blockSlot: (block: Omit<BlockedSlot, 'id' | 'createdAt'>) => void
  unblockSlot: (blockId: string) => void
  getBlockedSlotsByClub: (clubId: string) => BlockedSlot[]
  getBlockedSlotsByDate: (clubId: string, date: string) => BlockedSlot[]
  
  // Disponibilité
  isSlotAvailable: (clubId: string, courtId: string, date: string, slotId: string) => boolean
}

/**
 * Données de démo (MVP)
 */
const DEMO_RESERVATIONS: Reservation[] = [
  {
    id: 'res-1',
    clubId: 'a1b2c3d4-e5f6-4789-a012-3456789abcde', // Le Hangar
    courtId: 'court-hangar-1',
    slotId: 'slot-14h00-15h30',
    date: '2026-01-25',
    startTime: '14:00:00',
    endTime: '15:30:00',
    playerName: 'Jean Dupont',
    playerEmail: 'jean.dupont@example.com',
    status: 'confirmed',
    createdAt: '2026-01-20T10:00:00.000Z',
  },
  {
    id: 'res-2',
    clubId: 'a1b2c3d4-e5f6-4789-a012-3456789abcde', // Le Hangar
    courtId: 'court-hangar-2',
    slotId: 'slot-16h00-17h30',
    date: '2026-01-25',
    startTime: '16:00:00',
    endTime: '17:30:00',
    playerName: 'Marie Martin',
    playerEmail: 'marie.martin@example.com',
    status: 'confirmed',
    createdAt: '2026-01-20T11:00:00.000Z',
  },
]

const DEMO_BLOCKED_SLOTS: BlockedSlot[] = [
  {
    id: 'block-1',
    clubId: 'a1b2c3d4-e5f6-4789-a012-3456789abcde', // Le Hangar
    courtId: 'court-hangar-1',
    slotId: 'slot-10h00-11h30',
    date: '2026-01-26',
    startTime: '10:00:00',
    endTime: '11:30:00',
    reason: 'Maintenance terrain',
    createdAt: '2026-01-20T09:00:00.000Z',
  },
]

export const useReservationsStore = create<ReservationsStore>((set, get) => ({
  reservations: DEMO_RESERVATIONS,
  blockedSlots: DEMO_BLOCKED_SLOTS,

  // === RÉSERVATIONS ===

  addReservation: (reservation) => {
    const newReservation: Reservation = {
      ...reservation,
      id: `res-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    set(state => ({
      reservations: [...state.reservations, newReservation],
    }))
  },

  cancelReservation: (reservationId) => {
    set(state => ({
      reservations: state.reservations.map(res =>
        res.id === reservationId ? { ...res, status: 'cancelled' as ReservationStatus } : res
      ),
    }))
  },

  getReservationsByClub: (clubId) => {
    return get().reservations.filter(res => res.clubId === clubId && res.status !== 'cancelled')
  },

  getReservationsByDate: (clubId, date) => {
    return get().reservations.filter(
      res => res.clubId === clubId && res.date === date && res.status !== 'cancelled'
    )
  },

  // === BLOCAGES ===

  blockSlot: (block) => {
    const newBlock: BlockedSlot = {
      ...block,
      id: `block-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    set(state => ({
      blockedSlots: [...state.blockedSlots, newBlock],
    }))
  },

  unblockSlot: (blockId) => {
    set(state => ({
      blockedSlots: state.blockedSlots.filter(block => block.id !== blockId),
    }))
  },

  getBlockedSlotsByClub: (clubId) => {
    return get().blockedSlots.filter(block => block.clubId === clubId)
  },

  getBlockedSlotsByDate: (clubId, date) => {
    return get().blockedSlots.filter(block => block.clubId === clubId && block.date === date)
  },

  // === DISPONIBILITÉ ===

  isSlotAvailable: (clubId, courtId, date, slotId) => {
    const { reservations, blockedSlots } = get()

    // Vérifier si réservé
    const isReserved = reservations.some(
      res =>
        res.clubId === clubId &&
        res.courtId === courtId &&
        res.date === date &&
        res.slotId === slotId &&
        res.status === 'confirmed'
    )

    // Vérifier si bloqué
    const isBlocked = blockedSlots.some(
      block =>
        block.clubId === clubId &&
        block.courtId === courtId &&
        block.date === date &&
        block.slotId === slotId
    )

    return !isReserved && !isBlocked
  },
}))
