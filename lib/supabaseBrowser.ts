import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Client Supabase pour composants client ('use client')
 * Utilise @supabase/ssr avec createBrowserClient pour:
 * - Persister la session dans localStorage
 * - Auto-refresh des tokens
 * - Gestion correcte de l'auth côté client
 */
export const supabaseBrowser = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)

export default supabaseBrowser
