/**
 * Helpers pour la gestion multi-club
 * Récupération et validation du club connecté
 */

export interface Club {
  id: string
  name: string
  city: string
  club_code: string
  password?: string
  email?: string
  phone?: string
  address?: string
  [key: string]: any
}

/**
 * Récupère le club connecté depuis localStorage
 * @returns Le club ou null si non connecté
 */
export function getConnectedClub(): Club | null {
  if (typeof window === 'undefined') return null
  
  const storedClub = localStorage.getItem('club')
  if (!storedClub) return null
  
  try {
    return JSON.parse(storedClub)
  } catch (error) {
    console.error('[Club Helpers] Error parsing club data:', error)
    return null
  }
}

/**
 * Récupère l'ID du club connecté
 * @returns L'ID du club ou null si non connecté
 */
export function getConnectedClubId(): string | null {
  const club = getConnectedClub()
  return club?.id || null
}

/**
 * Vérifie si un club est connecté
 * @returns true si connecté, false sinon
 */
export function isClubConnected(): boolean {
  return getConnectedClubId() !== null
}

/**
 * Stocke le club en localStorage
 * @param club - Les données du club à stocker
 */
export function storeClub(club: Club): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('club', JSON.stringify(club))
}

/**
 * Supprime le club du localStorage (déconnexion)
 */
export function removeClub(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('club')
}

/**
 * Ajoute automatiquement le club_id aux données d'insertion
 * @param data - Les données à insérer
 * @returns Les données avec club_id ajouté
 */
export function addClubId<T extends Record<string, any>>(data: T): T & { club_id: string } {
  const clubId = getConnectedClubId()
  
  if (!clubId) {
    throw new Error('Aucun club connecté. Veuillez vous reconnecter.')
  }
  
  return {
    ...data,
    club_id: clubId
  }
}
