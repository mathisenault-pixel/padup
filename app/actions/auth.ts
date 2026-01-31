'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Actions désactivées temporairement (migration Supabase → Prisma)
// TODO: Réimplémenter avec Prisma + authentification

export async function signOutAction() {
  // Pour l'instant, juste rediriger
  revalidatePath('/', 'layout')
  redirect('/player/accueil')
}
