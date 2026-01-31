/**
 * Données de démonstration pour le mode démo (sans Supabase)
 * 
 * Ce fichier contient toutes les données utilisées quand NEXT_PUBLIC_DEMO_MODE=true
 */

export const isDemoMode = () => process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

// Utilisateur démo
export const demoUser = {
  id: 'demo-user-123',
  email: 'demo@padup.com',
  created_at: '2024-01-15T10:00:00.000Z',
}

// Profil démo
export const demoProfile = {
  id: 'demo-user-123',
  role: 'player' as const,
  player_name: 'Joueur Démo',
  club_name: null,
  email: 'demo@padup.com',
  created_at: '2024-01-15T10:00:00.000Z',
  updated_at: '2024-01-15T10:00:00.000Z',
}

// Clubs démo
export const demoClubs = [
  {
    id: '1',
    name: 'Le Hangar Sport & Co',
    address: '370 Allées des Issards',
    city: 'Rochefort-du-Gard',
    email: 'contact@lehangar.com',
    is_active: true,
    owner_id: 'club-owner-1',
    created_at: '2024-01-01T10:00:00.000Z',
  },
  {
    id: '2',
    name: 'Paul & Louis Sport',
    address: '255 Rue des Tonneliers',
    city: 'Le Pontet',
    email: 'contact@paullouis.com',
    is_active: true,
    owner_id: 'club-owner-2',
    created_at: '2024-01-01T10:00:00.000Z',
  },
  {
    id: '3',
    name: 'ZE Padel',
    address: 'Z.A du Colombier',
    city: 'Boulbon',
    email: 'contact@zepadel.com',
    is_active: true,
    owner_id: 'club-owner-3',
    created_at: '2024-01-01T10:00:00.000Z',
  },
  {
    id: '4',
    name: 'QG Padel Club',
    address: '239 Rue des Entrepreneurs',
    city: 'Saint-Laurent-des-Arbres',
    email: 'contact@qgpadel.com',
    is_active: true,
    owner_id: 'club-owner-4',
    created_at: '2024-01-01T10:00:00.000Z',
  },
]

// Terrains démo
export const demoCourts = [
  {
    id: '1',
    club_id: '1',
    name: 'Court Central 1',
    type: 'indoor' as const,
    is_active: true,
    price_per_hour: 45,
    created_at: '2024-01-01T10:00:00.000Z',
  },
  {
    id: '2',
    club_id: '1',
    name: 'Court Central 2',
    type: 'indoor' as const,
    is_active: true,
    price_per_hour: 45,
    created_at: '2024-01-01T10:00:00.000Z',
  },
  {
    id: '3',
    club_id: '2',
    name: 'Court Extérieur 1',
    type: 'outdoor' as const,
    is_active: true,
    price_per_hour: 40,
    created_at: '2024-01-01T10:00:00.000Z',
  },
  {
    id: '4',
    club_id: '3',
    name: 'Court Premium',
    type: 'indoor' as const,
    is_active: true,
    price_per_hour: 55,
    created_at: '2024-01-01T10:00:00.000Z',
  },
]

// Réservations démo
export const demoReservations = [
  {
    id: '1',
    court_id: '1',
    player_id: 'demo-user-123',
    date: '2026-01-25',
    start_time: '14:00:00',
    end_time: '15:30:00',
    status: 'confirmed' as const,
    payment_status: 'pending' as const,
    price: 45,
    created_at: '2026-01-20T10:00:00.000Z',
    cancelled_at: null,
    paid_at: null,
    courts: {
      id: '1',
      name: 'Court Central 1',
      type: 'indoor' as const,
      price_per_hour: 45,
      clubs: {
        id: '1',
        name: 'Le Hangar Sport & Co',
        city: 'Rochefort-du-Gard',
      },
    },
  },
  {
    id: '2',
    court_id: '3',
    player_id: 'demo-user-123',
    date: '2026-01-27',
    start_time: '10:00:00',
    end_time: '11:30:00',
    status: 'confirmed' as const,
    payment_status: 'pending' as const,
    price: 40,
    created_at: '2026-01-20T11:00:00.000Z',
    cancelled_at: null,
    paid_at: null,
    courts: {
      id: '3',
      name: 'Court Extérieur 1',
      type: 'outdoor' as const,
      price_per_hour: 40,
      clubs: {
        id: '2',
        name: 'Paul & Louis Sport',
        city: 'Le Pontet',
      },
    },
  },
  {
    id: '3',
    court_id: '4',
    player_id: 'demo-user-123',
    date: '2026-01-15',
    start_time: '18:00:00',
    end_time: '19:30:00',
    status: 'confirmed' as const,
    payment_status: 'paid_on_site' as const,
    price: 55,
    created_at: '2026-01-10T10:00:00.000Z',
    cancelled_at: null,
    paid_at: '2026-01-15T18:00:00.000Z',
    courts: {
      id: '4',
      name: 'Court Premium',
      type: 'indoor' as const,
      price_per_hour: 55,
      clubs: {
        id: '3',
        name: 'ZE Padel',
        city: 'Boulbon',
      },
    },
  },
]

// Fonction helper pour récupérer les réservations démo
export function getDemoReservations() {
  return demoReservations
}

// Mock client Supabase pour le mode démo
export const createDemoSupabaseClient = () => {
  const mockClient = {
    auth: {
      getUser: async () => ({
        data: { user: demoUser },
        error: null,
      }),
      signInWithPassword: async () => ({
        data: { user: demoUser, session: null },
        error: null,
      }),
      signUp: async () => ({
        data: { user: demoUser, session: null },
        error: null,
      }),
      signOut: async () => ({
        error: null,
      }),
    },
    from: (table: string) => {
      const queryBuilder = {
        select: (columns: string) => {
          const chain = {
            eq: (column: string, value: any) => chain,
            single: async () => {
              if (table === 'profiles') {
                return { data: demoProfile, error: null }
              }
              return { data: null, error: null }
            },
            order: (column: string, options?: any) => chain,
            or: (condition: string) => chain,
            lt: (column: string, value: any) => chain,
            gt: (column: string, value: any) => chain,
            then: async (resolve: any) => {
              // Pour les requêtes avec .then() (utilisé parfois)
              if (table === 'reservations') {
                return resolve({ data: demoReservations, error: null })
              }
              if (table === 'clubs') {
                return resolve({ data: demoClubs, error: null })
              }
              if (table === 'courts') {
                return resolve({ data: demoCourts, error: null })
              }
              return resolve({ data: [], error: null })
            },
          }
          
          // Ajouter une méthode then pour rendre la chaîne "thenable"
          Object.assign(chain, {
            then: async (resolve: any) => {
              if (table === 'reservations') {
                return resolve({ data: demoReservations, error: null })
              }
              if (table === 'clubs') {
                return resolve({ data: demoClubs, error: null })
              }
              if (table === 'courts') {
                return resolve({ data: demoCourts, error: null })
              }
              if (table === 'profiles') {
                return resolve({ data: [demoProfile], error: null })
              }
              return resolve({ data: [], error: null })
            },
          })
          
          return chain
        },
        insert: (data: any) => ({
          select: () => ({
            single: async () => ({
              data: { id: 'new-reservation-' + Date.now(), ...data },
              error: null,
            }),
          }),
        }),
        update: (data: any) => ({
          eq: (column: string, value: any) => ({
            then: async (resolve: any) => resolve({ error: null }),
          }),
        }),
      }
      return queryBuilder
    },
  }
  
  return mockClient as any
}

