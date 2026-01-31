'use server'

// Actions désactivées temporairement (migration Supabase → Prisma)
// TODO: Réimplémenter avec Prisma

export async function createReservationAction(data: any) {
  return { error: 'Réservation non implémentée (migration en cours)' }
}

export async function cancelReservationAction(id: string) {
  return { error: 'Annulation non implémentée (migration en cours)' }
}

export async function clubCancelReservationAction(id: string, reason?: string) {
  return { error: 'Annulation club non implémentée (migration en cours)' }
}

export async function markReservationAsPaidAction(id: string) {
  return { error: 'Paiement non implémenté (migration en cours)' }
}
