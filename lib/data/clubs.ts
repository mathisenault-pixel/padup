/**
 * Source unique des données clubs (partagée entre player et club admin)
 * MVP: Front-only, en attendant migration complète vers Supabase
 */

import { 
  LE_HANGAR_UUID, 
  PAUL_LOUIS_UUID, 
  ZE_PADEL_UUID, 
  QG_PADEL_UUID,
  DEMO_CLUB_UUID,
  getClubImage 
} from '@/lib/clubImages'

export type Court = {
  id: string
  clubId: string
  name: string
  type: 'indoor' | 'outdoor'
  isActive: boolean
  pricePerHour: number
}

export type ClubData = {
  id: string
  name: string
  city: string
  address: string
  email: string
  phone: string
  lat: number
  lng: number
  imageUrl: string
  description: string
  equipements: string[]
  note: number
  avis: number
  prixMin: number
  isActive: boolean
  courts: Court[]
}

/**
 * Base de données clubs MVP (front-only)
 * TODO: Migrer vers Supabase quand RLS/RPC prêts
 */
export const CLUBS_DATA: ClubData[] = [
  {
    id: LE_HANGAR_UUID,
    name: 'Le Hangar Sport & Co',
    city: 'Rochefort-du-Gard',
    address: '123 Avenue du Sport, 30650 Rochefort-du-Gard',
    email: 'contact@lehangar.fr',
    phone: '04 66 00 11 22',
    lat: 43.9781,
    lng: 4.6911,
    imageUrl: getClubImage(LE_HANGAR_UUID),
    description: 'Club moderne avec terrains couverts et extérieurs',
    equipements: ['Bar', 'Vestiaires', 'Douches', 'Parking', 'WiFi', 'Pro Shop'],
    note: 4.8,
    avis: 142,
    prixMin: 12,
    isActive: true,
    courts: [
      {
        id: 'court-hangar-1',
        clubId: LE_HANGAR_UUID,
        name: 'Terrain 1',
        type: 'indoor',
        isActive: true,
        pricePerHour: 45,
      },
      {
        id: 'court-hangar-2',
        clubId: LE_HANGAR_UUID,
        name: 'Terrain 2',
        type: 'indoor',
        isActive: true,
        pricePerHour: 45,
      },
      {
        id: 'court-hangar-3',
        clubId: LE_HANGAR_UUID,
        name: 'Terrain 3',
        type: 'outdoor',
        isActive: true,
        pricePerHour: 38,
      },
    ],
  },
  {
    id: PAUL_LOUIS_UUID,
    name: 'Paul & Louis Sport',
    city: 'Le Pontet',
    address: '456 Boulevard des Champions, 84130 Le Pontet',
    email: 'contact@pauletlouis.fr',
    phone: '04 90 11 22 33',
    lat: 43.9608,
    lng: 4.8583,
    imageUrl: getClubImage(PAUL_LOUIS_UUID),
    description: 'Club familial avec ambiance conviviale',
    equipements: ['Restaurant', 'Bar', 'Vestiaires', 'Parking', 'Coaching'],
    note: 4.6,
    avis: 89,
    prixMin: 10,
    isActive: true,
    courts: [
      {
        id: 'court-paul-1',
        clubId: PAUL_LOUIS_UUID,
        name: 'Court Central',
        type: 'indoor',
        isActive: true,
        pricePerHour: 42,
      },
      {
        id: 'court-paul-2',
        clubId: PAUL_LOUIS_UUID,
        name: 'Court 2',
        type: 'indoor',
        isActive: true,
        pricePerHour: 42,
      },
    ],
  },
  {
    id: ZE_PADEL_UUID,
    name: 'ZE Padel',
    city: 'Boulbon',
    address: '789 Route du Padel, 13150 Boulbon',
    email: 'contact@zepadel.fr',
    phone: '04 13 33 44 55',
    lat: 43.8519,
    lng: 4.7111,
    imageUrl: getClubImage(ZE_PADEL_UUID),
    description: 'Infrastructure moderne, terrains premium',
    equipements: ['Bar', 'Vestiaires', 'Douches', 'Parking', 'WiFi', 'Fitness'],
    note: 4.7,
    avis: 156,
    prixMin: 13,
    isActive: true,
    courts: [
      {
        id: 'court-ze-1',
        clubId: ZE_PADEL_UUID,
        name: 'Terrain Premium 1',
        type: 'indoor',
        isActive: true,
        pricePerHour: 48,
      },
      {
        id: 'court-ze-2',
        clubId: ZE_PADEL_UUID,
        name: 'Terrain Premium 2',
        type: 'indoor',
        isActive: true,
        pricePerHour: 48,
      },
      {
        id: 'court-ze-3',
        clubId: ZE_PADEL_UUID,
        name: 'Terrain Extérieur',
        type: 'outdoor',
        isActive: true,
        pricePerHour: 35,
      },
    ],
  },
  {
    id: QG_PADEL_UUID,
    name: 'QG Padel Club',
    city: 'Saint-Laurent-des-Arbres',
    address: '321 Chemin des Vignes, 30126 Saint-Laurent-des-Arbres',
    email: 'contact@qgpadel.fr',
    phone: '04 66 55 66 77',
    lat: 44.0528,
    lng: 4.6981,
    imageUrl: getClubImage(QG_PADEL_UUID),
    description: 'Club récent avec équipements haut de gamme',
    equipements: ['Bar', 'Vestiaires', 'Douches', 'Parking', 'WiFi', 'Pro Shop', 'Coaching'],
    note: 4.9,
    avis: 203,
    prixMin: 14,
    isActive: true,
    courts: [
      {
        id: 'court-qg-1',
        clubId: QG_PADEL_UUID,
        name: 'Court 1',
        type: 'indoor',
        isActive: true,
        pricePerHour: 50,
      },
      {
        id: 'court-qg-2',
        clubId: QG_PADEL_UUID,
        name: 'Court 2',
        type: 'indoor',
        isActive: true,
        pricePerHour: 50,
      },
    ],
  },
]

/**
 * Récupérer un club par son ID
 */
export function getClubById(clubId: string): ClubData | undefined {
  return CLUBS_DATA.find(club => club.id === clubId)
}

/**
 * Récupérer tous les clubs actifs
 */
export function getActiveClubs(): ClubData[] {
  return CLUBS_DATA.filter(club => club.isActive)
}

/**
 * Récupérer les terrains d'un club
 */
export function getClubCourts(clubId: string): Court[] {
  const club = getClubById(clubId)
  return club?.courts || []
}
