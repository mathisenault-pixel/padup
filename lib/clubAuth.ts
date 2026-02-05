/**
 * Authentification Club (front-only MVP)
 * Utilise des cookies pour la session
 * 
 * ⚠️ DEV ONLY - NE PAS DEPLOYER EN PROD TEL QUEL
 * 
 * TODO PRODUCTION:
 * 1. Migrer vers table `club_access_codes` (code, club_id, email, active, hashed_password)
 *    OU ajouter colonne `access_code` dans table `clubs` (unique)
 * 2. Utiliser Supabase Auth avec passwords hashés individuels (pas de password global)
 * 3. Implémenter rate limiting sur login
 * 4. Logs d'audit pour tentatives de connexion
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
 * ⚠️ DEV ONLY - Mapping CODE -> email/clubId
 * 
 * PROD: Remplacer par requête Supabase:
 * - Table `club_access_codes`: { code, club_id, email, active, created_at }
 * - OU colonne `access_code` dans table `clubs`
 */
const CODE_TO_CLUB: Record<string, { email: string; clubId: string; clubName: string }> = {
  'PADUP-1234': { email: 'admin@lehangar.fr', clubId: LE_HANGAR_UUID, clubName: 'Le Hangar Sport & Co' },
  'PADUP-5678': { email: 'admin@pauletlouis.fr', clubId: PAUL_LOUIS_UUID, clubName: 'Paul & Louis Sport' },
  'PADUP-9012': { email: 'admin@zepadel.fr', clubId: ZE_PADEL_UUID, clubName: 'ZE Padel' },
  'PADUP-3456': { email: 'admin@qgpadel.fr', clubId: QG_PADEL_UUID, clubName: 'QG Padel Club' },
}

/**
 * Mapping email -> clubId (legacy, pour rétrocompatibilité)
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
 * ⚠️ DEV ONLY - Mot de passe global démo
 * 
 * PROD: Chaque club doit avoir son propre password hashé
 * - Via Supabase Auth: auth.users avec metadata club_id
 * - OU table `club_users` avec bcrypt hash
 */
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_CLUB_DEMO_PASSWORD || 'club2026'

/**
 * Login club avec CODE (nouveau système)
 */
export function loginClubWithCode(code: string, password: string): { success: boolean; error?: string; session?: ClubSession } {
  // Normaliser le code (uppercase, trim)
  const normalizedCode = code.toUpperCase().trim()
  
  // Vérifier le mot de passe
  if (password !== DEMO_PASSWORD) {
    return { success: false, error: 'Mot de passe incorrect' }
  }

  // Vérifier le code et récupérer les infos du club
  const clubInfo = CODE_TO_CLUB[normalizedCode]
  if (!clubInfo) {
    return { success: false, error: 'Identifiant club invalide' }
  }

  // Créer la session
  const session: ClubSession = {
    email: clubInfo.email,
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
 * Login club (legacy avec email - pour rétrocompatibilité)
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
