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

  // Si connecté
  if (user) {
    return (
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mon compte - Seul vrai bouton */}
        <button
          type="button"
          onClick={() => router.push('/player/compte')}
          className="px-4 py-2 text-[14px] font-light bg-black hover:bg-black/80 text-white rounded-md tracking-wide"
          style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          Mon compte
        </button>
      </div>
    )
  }

  // Si non connecté
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => router.push('/login')}
        className="px-2 py-2 text-[14px] font-light text-black/60 hover:text-black tracking-wide"
        style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        Se connecter
      </button>
      <button
        type="button"
        onClick={() => router.push('/login')}
        className="hidden md:inline-flex px-4 py-2 bg-black hover:bg-black/80 text-white text-[14px] font-light rounded-md tracking-wide"
        style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        S&apos;inscrire
      </button>
    </div>
  )
}
