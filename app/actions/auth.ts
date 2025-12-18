'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/supabase/types'

export async function signup(formData: FormData): Promise<{ error: string } | never> {
  const supabase = await createClient()

  const email = formData.get('email')
  const password = formData.get('password')
  const role = formData.get('role')

  if (!email || !password || !role || typeof email !== 'string' || typeof password !== 'string') {
    return { error: 'Données invalides' }
  }

  if (role !== 'player' && role !== 'club') {
    return { error: 'Rôle invalide' }
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
        role: role as UserRole,
      })

    if (profileError) {
      return { error: profileError.message }
    }
  }

  if (role === 'club') {
    revalidatePath('/club/accueil', 'layout')
    redirect('/club/accueil')
  } else {
    revalidatePath('/player/clubs', 'layout')
    redirect('/player/clubs')
  }
}

export async function login(formData: FormData): Promise<{ error: string } | never> {
  const supabase = await createClient()

  const email = formData.get('email')
  const password = formData.get('password')
  const expectedRole = formData.get('role')

  if (!email || !password || !expectedRole || typeof email !== 'string' || typeof password !== 'string') {
    return { error: 'Données invalides' }
  }

  if (expectedRole !== 'player' && expectedRole !== 'club') {
    return { error: 'Rôle invalide' }
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

    if (!profile || profile.role !== expectedRole) {
      await supabase.auth.signOut()
      return { error: `Accès réservé aux ${expectedRole === 'club' ? 'clubs' : 'joueurs'}` }
    }
  }

  if (expectedRole === 'club') {
    revalidatePath('/club/accueil', 'layout')
    redirect('/club/accueil')
  } else {
    revalidatePath('/player/clubs', 'layout')
    redirect('/player/clubs')
  }
}

export async function logout(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

