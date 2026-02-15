/**
 * Helper pour récupérer le club de l'utilisateur connecté
 * Basé sur session Supabase + table club_memberships
 */

import { supabaseBrowser } from './supabaseBrowser'

export interface ClubInfo {
  id: string
  name: string
  city: string
  club_code: string
  email?: string
  phone?: string
  address?: string
}

export interface GetCurrentClubResult {
  session: any
  club: ClubInfo | null
  role?: string
}

export async function getCurrentClub(): Promise<GetCurrentClubResult> {
  // 1. Récupérer la session
  const { data: { session } } = await supabaseBrowser.auth.getSession()
  
  if (!session) {
    console.log('[getCurrentClub] Pas de session')
    return { session: null, club: null }
  }

  console.log('[getCurrentClub] Session user_id:', session.user.id)

  // 2. Récupérer le membership avec les infos du club
  const { data, error } = await supabaseBrowser
    .from('club_memberships')
    .select('role, clubs:club_id ( id, name, city, club_code, email, phone, address )')
    .eq('user_id', session.user.id)
    .single()

  if (error) {
    console.error('[getCurrentClub] Error:', error)
    return { session, club: null }
  }

  if (!data) {
    console.log('[getCurrentClub] Pas de data')
    return { session, club: null }
  }

  console.log('[getCurrentClub] Data brute:', data)

  // 3. Extraire le club (gérer le cas où clubs est un array ou un objet)
  const clubData = Array.isArray(data.clubs) ? data.clubs[0] : data.clubs
  const club = clubData ? (clubData as ClubInfo) : null
  
  console.log('[getCurrentClub] Club extrait:', club)
  
  return { 
    session, 
    club,
    role: data.role 
  }
}
