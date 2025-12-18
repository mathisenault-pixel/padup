'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData): Promise<{ error: string } | never> {
  const supabase = await createClient()

  const email = formData.get('email')
  const password = formData.get('password')

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return { error: 'Email et mot de passe requis' }
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (authData.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (!profile || profile.role !== 'player') {
      await supabase.auth.signOut()
      return { error: 'Accès réservé aux joueurs' }
    }
  }

  revalidatePath('/player/clubs', 'layout')
  redirect('/player/clubs')
}

export async function signup(formData: FormData): Promise<{ error: string } | never> {
  const supabase = await createClient()

  const email = formData.get('email')
  const password = formData.get('password')

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return { error: 'Email et mot de passe requis' }
  }

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        role: 'player',
      })

    if (profileError) {
      return { error: profileError.message }
    }
  }

  revalidatePath('/player/clubs', 'layout')
  redirect('/player/clubs')
}
