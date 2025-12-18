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

    if (!profile || profile.role !== 'club') {
      await supabase.auth.signOut()
      return { error: 'Accès réservé aux clubs' }
    }
  }

  revalidatePath('/club/accueil', 'layout')
  redirect('/club/accueil')
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
        role: 'club',
      })

    if (profileError) {
      return { error: profileError.message }
    }
  }

  revalidatePath('/club/accueil', 'layout')
  redirect('/club/accueil')
}
