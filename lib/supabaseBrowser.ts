import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Client Supabase pour composants client ('use client')
 * 
 * Utilise @supabase/ssr avec createBrowserClient pour:
 * - Persister la session dans localStorage ET cookies
 * - Auto-refresh des tokens
 * - Partage de session entre client et server
 * - Gestion correcte de l'auth côté client
 * 
 * ⚠️ IMPORTANT: Ce client utilise les mêmes cookies que le server
 * pour garantir que la session est partagée entre:
 * - Server Actions (app/login/actions.ts)
 * - Client Components (app/player/.../reserver/page.tsx)
 * - Server Components
 */
export const supabaseBrowser = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    cookies: {
      get(name: string) {
        // Utilise document.cookie pour lire les cookies
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift()
      },
      set(name: string, value: string, options: any) {
        // Utilise document.cookie pour écrire les cookies
        let cookie = `${name}=${value}`
        
        if (options?.maxAge) {
          cookie += `; max-age=${options.maxAge}`
        }
        if (options?.domain) {
          cookie += `; domain=${options.domain}`
        }
        if (options?.path) {
          cookie += `; path=${options.path}`
        }
        if (options?.sameSite) {
          cookie += `; samesite=${options.sameSite}`
        }
        if (options?.secure) {
          cookie += '; secure'
        }
        
        document.cookie = cookie
      },
      remove(name: string, options: any) {
        // Supprime le cookie en mettant max-age=0
        this.set(name, '', { ...options, maxAge: 0 })
      },
    },
  }
)

export default supabaseBrowser
