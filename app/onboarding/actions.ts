'use server'

import { redirect } from 'next/navigation'

// Actions désactivées temporairement
// TODO: Réimplémenter avec Supabase

export async function selectRoleAction(role: string) {
  // Pour l'instant, rediriger directement vers player
  redirect('/player/accueil')
}
