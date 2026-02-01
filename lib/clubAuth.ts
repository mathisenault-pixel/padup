/**
 * Authentification Club (front-only MVP)
 * Utilise des cookies pour la session
 * 
 * MVP: Email/password simple, sans Supabase
 * TODO: Migrer vers Supabase Auth quand RLS/RPC prêts
 */

import { LE_HANGAR_UUID, PAUL_LOUIS_UUID, ZE_PADEL_UUID, QG_PADEL_UUID } from '@/lib/clubImages'

export type ClubSession = {
  email: string
  clubId: string
  clubName: string
  ts: number
}

const COOKIE_NAME = 'club_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 jours

/**
 * Mapping email -> clubId (MVP front-only)
 * En prod, ce serait dans une table users_clubs dans Supabase
 */
const EMAIL_TO_CLUB: Record<string, { clubId: string; clubName: string }> = {
  'admin@lehangar.fr': { clubId: LE_HANGAR_UUID, clubName: 'Le Hangar Sport & Co' },
  'admin@pauletlouis.fr': { clubId: PAUL_LOUIS_UUID, clubName: 'Paul & Louis Sport' },
  'admin@zepadel.fr': { clubId: ZE_PADEL_UUID, clubName: 'ZE Padel' },
  'admin@qgpadel.fr': { clubId: QG_PADEL_UUID, clubName: 'QG Padel Club' },
  'club@padup.one': { clubId: LE_HANGAR_UUID, clubName: 'Le Hangar Sport & Co' }, // Fallback demo
}

/**
 * Mot de passe démo (front-only)
 * En prod, ce serait dans Supabase Auth avec hash
 */
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_CLUB_DEMO_PASSWORD || 'club2026'

/**
 * Login club (MVP front-only)
 */
export function loginClub(email: string, password: string): { success: boolean; error?: string; session?: ClubSession } {
  // Vérifier le mot de passe
  if (password !== DEMO_PASSWORD) {
    return { success: false, error: 'Mot de passe incorrect' }
  }

  // Vérifier l'email et récupérer le clubId
  const clubInfo = EMAIL_TO_CLUB[email.toLowerCase()]
  if (!clubInfo) {
    return { success: false, error: 'Email non autorisé' }
  }

  // Créer la session
  const session: ClubSession = {
    email: email.toLowerCase(),
    clubId: clubInfo.clubId,
    clubName: clubInfo.clubName,
    ts: Date.now(),
  }

  // Sauvegarder dans un cookie
  if (typeof document !== 'undefined') {
    const expires = new Date(Date.now() + SESSION_DURATION).toUTCString()
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(session))}; path=/; expires=${expires}; SameSite=Strict`
  }

  return { success: true, session }
}

/**
 * Logout club
 */
export function logoutClub(): void {
  if (typeof document !== 'undefined') {
    // Supprimer le cookie
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict`
  }
}

/**
 * Récupérer la session club (côté client)
 */
export function getClubSession(): ClubSession | null {
  if (typeof document === 'undefined') {
    return null
  }

  try {
    const cookies = document.cookie.split(';')
    const sessionCookie = cookies.find(c => c.trim().startsWith(`${COOKIE_NAME}=`))
    
    if (!sessionCookie) {
      return null
    }

    const sessionValue = sessionCookie.split('=')[1]
    const session: ClubSession = JSON.parse(decodeURIComponent(sessionValue))

    // Vérifier que la session n'est pas expirée
    if (Date.now() - session.ts > SESSION_DURATION) {
      logoutClub()
      return null
    }

    return session
  } catch (e) {
    console.error('[clubAuth] Failed to parse session', e)
    return null
  }
}

/**
 * Vérifier si un club est connecté
 */
export function isClubAuthenticated(): boolean {
  return getClubSession() !== null
}
