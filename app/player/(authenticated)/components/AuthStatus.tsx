'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
import type { User } from '@supabase/supabase-js'

export default function AuthStatus() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // ============================================
    // Charger la session au mount
    // ============================================
    const loadSession = async () => {
      console.log('[AUTH STATUS] Loading session...')
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('[AUTH STATUS] Error loading session:', error)
      } else {
        console.log('[AUTH STATUS] Session loaded:', session ? 'YES' : 'NO')
        if (session?.user) {
          console.log('[AUTH STATUS] User email:', session.user.email)
          setUser(session.user)
        }
      }
      
      setIsLoading(false)
    }
    
    loadSession()

    // ============================================
    // Écouter les changements d'état d'auth
    // ============================================
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AUTH STATUS] Auth state changed:', event, session?.user?.email || 'NO USER')
        setUser(session?.user || null)
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Afficher "Mon compte" dans tous les cas
  // Si connecté → aller vers /player/compte
  // Si non connecté → aller vers /login
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <button
        type="button"
        onClick={() => router.push(user ? '/player/compte' : '/login')}
        className="px-4 py-2 text-[13px] font-normal bg-white hover:bg-black/5 border border-black/10 rounded-lg tracking-wide transition-all"
        style={{ color: '#000000' }}
      >
        Mon compte
      </button>
    </div>
  )
}
