'use server'

// Actions désactivées temporairement
// TODO: Réimplémenter avec Supabase

export async function signInAction(formData: FormData) {
  return { error: 'Authentification non implémentée (en cours de configuration)' }
}

export async function signUpAction(formData: FormData) {
  return { error: 'Inscription non implémentée (en cours de configuration)' }
}
