/**
 * Helper pour récupérer le club connecté via club_memberships
 * Source de vérité : session Supabase + membership
 */

import { supabaseBrowser } from './supabaseBrowser'

export interface ClubFromMembership {
  id: string
  name: string
  city: string
  club_code: string
  email?: string
  phone?: string
  address?: string
}

export interface CurrentClubResult {
  club: ClubFromMembership | null
  session: any
  role?: string
}

/**
 * Récupère le club de l'utilisateur connecté via club_memberships
 * @returns Le club et la session, ou null si pas connecté/pas de membership
 */
export async function getCurrentClub(): Promise<CurrentClubResult> {
  // Vérifier la session
  const { data: { session } } = await supabaseBrowser.auth.getSession()
  
  if (!session) {
    return { club: null, session: null }
  }

  // Récupérer le membership avec les infos du club
  const { data, error } = await supabaseBrowser
    .from('club_memberships')
    .select(`
      club_id,
      role,
      clubs:club_id (
        id,
        name,
        city,
        club_code,
        email,
        phone,
        address
      )
    `)
    .eq('user_id', session.user.id)
    .limit(1)
    .single()

  if (error) {
    console.error('[Get Club] Error:', error)
    return { club: null, session }
  }

  // Formater les données
  const club = data?.clubs ? {
    id: (data.clubs as any).id,
    name: (data.clubs as any).name,
    city: (data.clubs as any).city,
    club_code: (data.clubs as any).club_code,
    email: (data.clubs as any).email,
    phone: (data.clubs as any).phone,
    address: (data.clubs as any).address,
  } : null

  return { 
    club, 
    session,
    role: data?.role 
  }
}

/**
 * Récupère uniquement l'ID du club connecté
 * @returns L'ID du club ou null
 */
export async function getCurrentClubId(): Promise<string | null> {
  const { club } = await getCurrentClub()
  return club?.id || null
}
