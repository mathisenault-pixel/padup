/**
 * Helpers pour la gestion des invitations club
 */

import { supabaseBrowser } from './supabaseBrowser'

export interface ClubInvite {
  id: string
  club_id: string
  token: string
  role: string
  expires_at: string
  used_at: string | null
  used_by: string | null
  created_at: string
  created_by: string | null
}

export interface InviteValidation {
  valid: boolean
  error?: string
  club_id?: string
  club_name?: string
  club_city?: string
  club_code?: string
  role?: string
  expires_at?: string
}

/**
 * Génère un token unique pour une invitation
 */
export function generateInviteToken(): string {
  // Utilise crypto.randomUUID() et enlève les tirets
  return crypto.randomUUID().replaceAll('-', '')
}

/**
 * Crée une nouvelle invitation pour un club
 */
export async function createClubInvite(
  clubId: string,
  role: string = 'admin',
  expiresInDays: number = 7
) {
  const supabase = supabaseBrowser

  // Générer le token
  const token = generateInviteToken()

  // Calculer la date d'expiration
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  // Créer l'invitation
  const { data, error } = await supabase
    .from('club_invites')
    .insert({
      club_id: clubId,
      token,
      role,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('[Club Invites] Create error:', error)
    return { invite: null, error }
  }

  console.log('[Club Invites] ✅ Invitation créée:', token)
  return { invite: data, error: null }
}

/**
 * Valide un token d'invitation (sans l'utiliser)
 */
export async function validateInviteToken(token: string): Promise<InviteValidation> {
  const supabase = supabaseBrowser

  try {
    const { data, error } = await supabase.rpc('validate_club_invite', {
      p_token: token,
    })

    if (error) {
      console.error('[Club Invites] Validation error:', error)
      return { valid: false, error: error.message }
    }

    return data as InviteValidation
  } catch (err: any) {
    console.error('[Club Invites] Exception:', err)
    return { valid: false, error: err.message }
  }
}

/**
 * Utilise une invitation (crée le membership)
 */
export async function redeemInvite(token: string) {
  const supabase = supabaseBrowser

  try {
    const { data: clubId, error } = await supabase.rpc('redeem_club_invite', {
      p_token: token,
    })

    if (error) {
      console.error('[Club Invites] Redeem error:', error)
      return { clubId: null, error }
    }

    console.log('[Club Invites] ✅ Invitation utilisée, club_id:', clubId)
    return { clubId, error: null }
  } catch (err: any) {
    console.error('[Club Invites] Exception:', err)
    return { clubId: null, error: err }
  }
}

/**
 * Récupère toutes les invitations d'un club
 */
export async function getClubInvites(clubId: string): Promise<ClubInvite[]> {
  const supabase = supabaseBrowser

  const { data, error } = await supabase
    .from('club_invites')
    .select('*')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Club Invites] Get invites error:', error)
    return []
  }

  return data || []
}

/**
 * Génère le lien d'invitation complet
 */
export function getInviteLink(token: string, origin?: string): string {
  const baseUrl = origin || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${baseUrl}/club/invite/${token}`
}

/**
 * Copie un lien d'invitation dans le presse-papiers
 */
export async function copyInviteLink(token: string): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const link = getInviteLink(token)

  try {
    await navigator.clipboard.writeText(link)
    return true
  } catch (err) {
    console.error('[Club Invites] Copy error:', err)
    return false
  }
}
