/**
 * Authentification club avec Supabase Auth
 * Remplace le système localStorage + password en clair
 */

import { supabaseBrowser } from './supabaseBrowser'

export interface ClubWithMembership {
  id: string
  name: string
  city: string
  club_code: string
  email?: string
  phone?: string
  address?: string
  role: string
}

/**
 * Connexion d'un utilisateur club via email/password
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = supabaseBrowser
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('[Club Auth] Sign in error:', error)
    return { user: null, error }
  }

  return { user: data.user, error: null }
}

/**
 * Inscription d'un nouvel utilisateur club
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  clubData: {
    name: string
    city: string
    club_code: string
    phone?: string
    address?: string
  }
) {
  const supabase = supabaseBrowser

  // 1. Créer l'utilisateur auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    console.error('[Club Auth] Sign up error:', authError)
    return { club: null, error: authError }
  }

  try {
    // 2. Créer le club
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .insert({
        name: clubData.name,
        city: clubData.city,
        club_code: clubData.club_code,
        email: email,
        phone: clubData.phone,
        address: clubData.address,
      })
      .select()
      .single()

    if (clubError || !club) {
      console.error('[Club Auth] Club creation error:', clubError)
      // TODO: Rollback user creation
      return { club: null, error: clubError }
    }

    // 3. Créer le membership (admin)
    const { error: membershipError } = await supabase
      .from('club_memberships')
      .insert({
        user_id: authData.user.id,
        club_id: club.id,
        role: 'admin',
      })

    if (membershipError) {
      console.error('[Club Auth] Membership creation error:', membershipError)
      return { club: null, error: membershipError }
    }

    console.log('[Club Auth] ✅ Club créé avec succès:', club)
    return { club, error: null }
  } catch (err: any) {
    console.error('[Club Auth] Exception:', err)
    return { club: null, error: err }
  }
}

/**
 * Récupère les clubs de l'utilisateur connecté
 */
export async function getUserClubs(): Promise<ClubWithMembership[]> {
  const supabase = supabaseBrowser

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }

  // Récupérer les memberships avec les infos du club
  const { data, error } = await supabase
    .from('club_memberships')
    .select(`
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
    .eq('user_id', user.id)

  if (error) {
    console.error('[Club Auth] Get clubs error:', error)
    return []
  }

  // Formatter les données
  return (data || []).map((item: any) => ({
    id: item.clubs.id,
    name: item.clubs.name,
    city: item.clubs.city,
    club_code: item.clubs.club_code,
    email: item.clubs.email,
    phone: item.clubs.phone,
    address: item.clubs.address,
    role: item.role,
  }))
}

/**
 * Récupère le premier club de l'utilisateur (pour simplifier)
 */
export async function getDefaultClub(): Promise<ClubWithMembership | null> {
  const clubs = await getUserClubs()
  return clubs.length > 0 ? clubs[0] : null
}

/**
 * Déconnexion
 */
export async function signOut() {
  const supabase = supabaseBrowser
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('[Club Auth] Sign out error:', error)
    return { error }
  }

  return { error: null }
}

/**
 * Récupère la session actuelle
 */
export async function getSession() {
  const supabase = supabaseBrowser
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('[Club Auth] Get session error:', error)
    return null
  }

  return session
}

/**
 * Vérifie si l'utilisateur est connecté
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

/**
 * Vérifie si l'utilisateur est membre d'un club spécifique
 */
export async function isMemberOfClub(clubId: string): Promise<boolean> {
  const supabase = supabaseBrowser

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return false
  }

  const { data, error } = await supabase
    .from('club_memberships')
    .select('id')
    .eq('user_id', user.id)
    .eq('club_id', clubId)
    .single()

  return !error && data !== null
}

/**
 * Hook React pour écouter les changements de session
 */
export function onAuthStateChange(callback: (user: any) => void) {
  const supabase = supabaseBrowser
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session?.user || null)
    }
  )

  return subscription
}
