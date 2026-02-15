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
  const { data: { session } } = await supabaseBrowser.auth.getSession()
  
  if (!session) {
    return { session: null, club: null }
  }

  const { data, error } = await supabaseBrowser
    .from('club_memberships')
    .select('role, clubs:club_id ( id, name, city, club_code, email, phone, address )')
    .eq('user_id', session.user.id)
    .limit(1)
    .single()

  if (error) {
    console.log('[getCurrentClub] Error:', error.message)
    return { session, club: null }
  }

  const club = (data as any)?.clubs ?? null
  
  return { 
    session, 
    club,
    role: data?.role 
  }
}
