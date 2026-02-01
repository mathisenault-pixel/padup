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
    address: '370 allées des Issards, 30650 Rochefort-du-Gard',
    email: 'contact@hangar-sport.fr',
    phone: '07 88 72 14 47',
    lat: 43.9781,
    lng: 4.6911,
    imageUrl: getClubImage(LE_HANGAR_UUID),
    description: 'Complexe de 2500m² avec 8 terrains (hauteur 9m), ouvert 9h-minuit en semaine. Club house, terrasse et animations.',
    equipements: ['Club house', 'Terrasse', 'Pétanque', 'Ping-pong', 'Baby-foot', 'Fléchettes', 'Vestiaires', 'Douches', 'Parking'],
    note: 4.8,
    avis: 142,
    prixMin: 11,
    isActive: true,
    courts: [
      {
        id: 'court-hangar-1',
        clubId: LE_HANGAR_UUID,
        name: 'Terrain Double 1',
        type: 'indoor',
        isActive: true,
        pricePerHour: 44,
      },
      {
        id: 'court-hangar-2',
        clubId: LE_HANGAR_UUID,
        name: 'Terrain Double 2',
        type: 'indoor',
        isActive: true,
        pricePerHour: 44,
      },
      {
        id: 'court-hangar-3',
        clubId: LE_HANGAR_UUID,
        name: 'Terrain Double 3',
        type: 'indoor',
        isActive: true,
        pricePerHour: 44,
      },
      {
        id: 'court-hangar-4',
        clubId: LE_HANGAR_UUID,
        name: 'Terrain Double 4',
        type: 'indoor',
        isActive: true,
        pricePerHour: 44,
      },
      {
        id: 'court-hangar-5',
        clubId: LE_HANGAR_UUID,
        name: 'Terrain Double 5',
        type: 'outdoor',
        isActive: true,
        pricePerHour: 40,
      },
      {
        id: 'court-hangar-6',
        clubId: LE_HANGAR_UUID,
        name: 'Terrain Double 6',
        type: 'outdoor',
        isActive: true,
        pricePerHour: 40,
      },
      {
        id: 'court-hangar-7',
        clubId: LE_HANGAR_UUID,
        name: 'Terrain Simple 1',
        type: 'indoor',
        isActive: true,
        pricePerHour: 35,
      },
      {
        id: 'court-hangar-8',
        clubId: LE_HANGAR_UUID,
        name: 'Terrain Simple 2',
        type: 'indoor',
        isActive: true,
        pricePerHour: 35,
      },
    ],
  },
  {
    id: PAUL_LOUIS_UUID,
    name: 'Paul & Louis Sport',
    city: 'Le Pontet',
    address: '255 rue des Tonneliers, 84130 Le Pontet',
    email: 'contact@paul-louis-sport.com',
    phone: '04 84 85 88 72',
    lat: 43.9608,
    lng: 4.8583,
    imageUrl: getClubImage(PAUL_LOUIS_UUID),
    description: 'Club complet avec 8 terrains (4 indoor/4 outdoor), restaurant italien Il Capistrello, salle fitness et boutique.',
    equipements: ['Restaurant', 'Bar', 'Fitness', 'Boutique', 'Vestiaires', 'Douches', 'Parking', 'Coaching', 'Salle réunion'],
    note: 4.6,
    avis: 89,
    prixMin: 10,
    isActive: true,
    courts: [
      {
        id: 'court-paul-1',
        clubId: PAUL_LOUIS_UUID,
        name: 'Terrain Indoor 1',
        type: 'indoor',
        isActive: true,
        pricePerHour: 42,
      },
      {
        id: 'court-paul-2',
        clubId: PAUL_LOUIS_UUID,
        name: 'Terrain Indoor 2',
        type: 'indoor',
        isActive: true,
        pricePerHour: 42,
      },
      {
        id: 'court-paul-3',
        clubId: PAUL_LOUIS_UUID,
        name: 'Terrain Indoor 3',
        type: 'indoor',
        isActive: true,
        pricePerHour: 42,
      },
      {
        id: 'court-paul-4',
        clubId: PAUL_LOUIS_UUID,
        name: 'Terrain Indoor 4',
        type: 'indoor',
        isActive: true,
        pricePerHour: 42,
      },
      {
        id: 'court-paul-5',
        clubId: PAUL_LOUIS_UUID,
        name: 'Terrain Outdoor 1',
        type: 'outdoor',
        isActive: true,
        pricePerHour: 38,
      },
      {
        id: 'court-paul-6',
        clubId: PAUL_LOUIS_UUID,
        name: 'Terrain Outdoor 2',
        type: 'outdoor',
        isActive: true,
        pricePerHour: 38,
      },
      {
        id: 'court-paul-7',
        clubId: PAUL_LOUIS_UUID,
        name: 'Terrain Outdoor 3',
        type: 'outdoor',
        isActive: true,
        pricePerHour: 38,
      },
      {
        id: 'court-paul-8',
        clubId: PAUL_LOUIS_UUID,
        name: 'Terrain Outdoor 4',
        type: 'outdoor',
        isActive: true,
        pricePerHour: 38,
      },
    ],
  },
  {
    id: ZE_PADEL_UUID,
    name: 'ZE Padel',
    city: 'Boulbon',
    address: 'ZA Le Colombier, 13150 Boulbon',
    email: 'contact@zepadel.com',
    phone: '04 13 41 82 29',
    lat: 43.8519,
    lng: 4.7111,
    imageUrl: getClubImage(ZE_PADEL_UUID),
    description: '6 terrains (4 couverts + 2 extérieurs), ouvert 9h-minuit. Infrastructure moderne avec TV et WiFi.',
    equipements: ['WiFi', 'TV', 'Casiers', 'Douches', 'Parking', 'Vestiaires'],
    note: 4.7,
    avis: 156,
    prixMin: 6,
    isActive: true,
    courts: [
      {
        id: 'court-ze-1',
        clubId: ZE_PADEL_UUID,
        name: 'Terrain Couvert 1',
        type: 'indoor',
        isActive: true,
        pricePerHour: 24,
      },
      {
        id: 'court-ze-2',
        clubId: ZE_PADEL_UUID,
        name: 'Terrain Couvert 2',
        type: 'indoor',
        isActive: true,
        pricePerHour: 24,
      },
      {
        id: 'court-ze-3',
        clubId: ZE_PADEL_UUID,
        name: 'Terrain Couvert 3',
        type: 'indoor',
        isActive: true,
        pricePerHour: 24,
      },
      {
        id: 'court-ze-4',
        clubId: ZE_PADEL_UUID,
        name: 'Terrain Couvert 4',
        type: 'indoor',
        isActive: true,
        pricePerHour: 24,
      },
      {
        id: 'court-ze-5',
        clubId: ZE_PADEL_UUID,
        name: 'Terrain Extérieur 1',
        type: 'outdoor',
        isActive: true,
        pricePerHour: 24,
      },
      {
        id: 'court-ze-6',
        clubId: ZE_PADEL_UUID,
        name: 'Terrain Extérieur 2',
        type: 'outdoor',
        isActive: true,
        pricePerHour: 24,
      },
    ],
  },
  {
    id: QG_PADEL_UUID,
    name: 'QG Padel Club',
    city: 'Saint-Laurent-des-Arbres',
    address: '239 Rue des Entrepreneurs, 30126 Saint-Laurent-des-Arbres',
    email: 'contact@leqgpadelclub.fr',
    phone: '06 00 00 00 00',
    lat: 44.0528,
    lng: 4.6981,
    imageUrl: getClubImage(QG_PADEL_UUID),
    description: 'Nouveau club (nov 2025) avec 4 terrains SuperPano (hauteur 10m). Bar licence III, restaurant (pizzas), terrasse et pétanque.',
    equipements: ['Bar', 'Restaurant', 'Vestiaires', 'Douches', 'Terrasse', 'Pétanque', 'Parking'],
    note: 4.9,
    avis: 203,
    prixMin: 3,
    isActive: true,
    courts: [
      {
        id: 'court-qg-1',
        clubId: QG_PADEL_UUID,
        name: 'Terrain SuperPano 1',
        type: 'indoor',
        isActive: true,
        pricePerHour: 12,
      },
      {
        id: 'court-qg-2',
        clubId: QG_PADEL_UUID,
        name: 'Terrain SuperPano 2',
        type: 'indoor',
        isActive: true,
        pricePerHour: 12,
      },
      {
        id: 'court-qg-3',
        clubId: QG_PADEL_UUID,
        name: 'Terrain SuperPano 3',
        type: 'indoor',
        isActive: true,
        pricePerHour: 12,
      },
      {
        id: 'court-qg-4',
        clubId: QG_PADEL_UUID,
        name: 'Terrain SuperPano 4',
        type: 'indoor',
        isActive: true,
        pricePerHour: 13,
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
