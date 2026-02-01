// =====================================================
// MAPPING DES IMAGES DES CLUBS PAR UUID
// =====================================================
// Images réutilisées depuis le code existant (tournois, dashboard)
// Voir: app/player/(authenticated)/tournois/page.tsx
//      app/player/dashboard/page.tsx

// UUID du Club Démo (à EXCLURE des listes)
export const DEMO_CLUB_UUID = 'ba43c579-e522-4b51-8542-737c2c6452bb'

// UUIDs des clubs historiques (voir RESTORE_HISTORIC_CLUBS.sql)
export const LE_HANGAR_UUID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde'
export const PAUL_LOUIS_UUID = 'b2c3d4e5-f6a7-4890-b123-456789abcdef'
export const ZE_PADEL_UUID = 'c3d4e5f6-a7b8-4901-c234-56789abcdef0'
export const QG_PADEL_UUID = 'd4e5f6a7-b8c9-4012-d345-6789abcdef01'

// Mapping clubId → imageUrl
// ✅ Réutilise les images déjà présentes dans le code
export const clubImagesById: Record<string, string> = {
  [LE_HANGAR_UUID]: '/images/clubs/le-hangar.jpg',
  [PAUL_LOUIS_UUID]: '/images/clubs/paul-louis.jpg',
  [ZE_PADEL_UUID]: '/images/clubs/ze-padel.jpg',
  [QG_PADEL_UUID]: '/images/clubs/qg-padel.jpg',
  [DEMO_CLUB_UUID]: '/images/clubs/demo-padup.jpg', // Fallback si besoin
}

// Fallback image par défaut
export const DEFAULT_CLUB_IMAGE = '/images/clubs/demo-padup.jpg'

/**
 * Récupérer l'image d'un club par son UUID
 * @param clubId - UUID du club
 * @returns URL de l'image ou fallback
 */
export function getClubImage(clubId: string): string {
  return clubImagesById[clubId] || DEFAULT_CLUB_IMAGE
}

/**
 * Filtrer les clubs pour exclure le Club Démo
 * @param clubs - Liste des clubs
 * @returns Liste filtrée sans le Club Démo
 */
export function filterOutDemoClub<T extends { id: string }>(clubs: T[]): T[] {
  return clubs.filter(club => club.id !== DEMO_CLUB_UUID)
}
