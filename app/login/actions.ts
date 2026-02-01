'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Créer un client Supabase pour les Server Actions
 * Utilise les cookies pour partager la session avec le client
 */
async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Ignore l'erreur si on est dans un middleware
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Ignore l'erreur si on est dans un middleware
          }
        },
      },
    }
  )
}

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email et mot de passe requis' }
  }

  const supabase = await createSupabaseServerClient()

  console.log('[SERVER ACTION] Sign in attempt for:', email)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('[SERVER ACTION] Sign in error:', error.message)
    return { error: error.message }
  }

  console.log('[SERVER ACTION] ✅ Sign in successful')
  console.log('[SERVER ACTION] User ID:', data.user?.id)
  console.log('[SERVER ACTION] Session:', data.session ? 'Present' : 'Missing')

  // ✅ LOG DÉTAILLÉ: session après signInWithPassword
  const sessionResult = await supabase.auth.getSession()
  console.log('[AUTH session] After signIn:', sessionResult.data.session ? 'Present' : 'Missing')
  if (sessionResult.data.session) {
    console.log('[AUTH session] Access token:', sessionResult.data.session.access_token?.substring(0, 20) + '...')
    console.log('[AUTH session] User:', sessionResult.data.session.user?.email)
  }

  const userResult = await supabase.auth.getUser()
  console.log('[AUTH user] After signIn:', userResult.data.user?.email || 'null')

  // Redirection vers la page d'accueil
  redirect('/player/accueil')
}

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email et mot de passe requis' }
  }

  if (password.length < 6) {
    return { error: 'Le mot de passe doit contenir au moins 6 caractères' }
  }

  const supabase = await createSupabaseServerClient()

  console.log('[SERVER ACTION] Sign up attempt for:', email)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    console.error('[SERVER ACTION] Sign up error:', error.message)
    return { error: error.message }
  }

  console.log('[SERVER ACTION] ✅ Sign up successful')
  console.log('[SERVER ACTION] User ID:', data.user?.id)
  console.log('[SERVER ACTION] Session:', data.session ? 'Present' : 'Missing')

  // ✅ LOG DÉTAILLÉ: session après signUp
  const sessionResult = await supabase.auth.getSession()
  console.log('[AUTH session] After signUp:', sessionResult.data.session ? 'Present' : 'Missing')
  if (sessionResult.data.session) {
    console.log('[AUTH session] Access token:', sessionResult.data.session.access_token?.substring(0, 20) + '...')
    console.log('[AUTH session] User:', sessionResult.data.session.user?.email)
  }

  const userResult = await supabase.auth.getUser()
  console.log('[AUTH user] After signUp:', userResult.data.user?.email || 'null')

  // Si l'email confirmation est requise
  if (data.user && !data.session) {
    return { 
      error: 'Veuillez vérifier votre email pour confirmer votre inscription',
      success: true
    }
  }

  // Redirection vers la page d'accueil
  redirect('/player/accueil')
}
