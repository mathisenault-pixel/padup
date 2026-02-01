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
    id: 'ba43c579-e522-4b51-8542-737c2c6452bb', // ✅ UUID réel depuis public.clubs
    name: 'Club Démo Pad\'up',
    address: '123 Avenue du Padel',
    city: 'Avignon',
    email: 'contact@padup.fr',
    is_active: true,
    owner_id: 'demo-owner-1',
    created_at: '2024-01-01T10:00:00.000Z',
  }
]

// Terrains démo
export const demoCourts = [
  {
    id: '21d9a066-b7db-4966-abf1-cc210f7476c1', // ✅ UUID réel Terrain 1
    club_id: 'ba43c579-e522-4b51-8542-737c2c6452bb',
    name: 'Terrain 1',
    type: 'indoor' as const,
    is_active: true,
    price_per_hour: 45,
    created_at: '2024-01-01T10:00:00.000Z',
  },
  {
    id: '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e', // ✅ UUID réel Terrain 2
    club_id: 'ba43c579-e522-4b51-8542-737c2c6452bb',
    name: 'Terrain 2',
    type: 'indoor' as const,
    is_active: true,
    price_per_hour: 45,
    created_at: '2024-01-01T10:00:00.000Z',
  }
]

// Réservations démo
export const demoReservations = [
  {
    id: 'demo-reservation-1',
    court_id: '21d9a066-b7db-4966-abf1-cc210f7476c1', // Terrain 1
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
      id: '21d9a066-b7db-4966-abf1-cc210f7476c1',
      name: 'Terrain 1',
      type: 'indoor' as const,
      price_per_hour: 45,
      clubs: {
        id: 'ba43c579-e522-4b51-8542-737c2c6452bb',
        name: 'Club Démo Pad\'up',
        city: 'Avignon',
      },
    },
  },
  {
    id: 'demo-reservation-2',
    court_id: '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e', // Terrain 2
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
      id: '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e',
      name: 'Terrain 2',
      type: 'indoor' as const,
      price_per_hour: 40,
      clubs: {
        id: 'ba43c579-e522-4b51-8542-737c2c6452bb',
        name: 'Club Démo Pad\'up',
        city: 'Avignon',
      },
    },
  }
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

