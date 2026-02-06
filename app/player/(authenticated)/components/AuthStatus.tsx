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
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Si connecté
  if (user) {
    return (
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mon compte - Seul vrai bouton (style Planity) */}
        <button
          type="button"
          onClick={() => router.push('/player/compte')}
          className="px-4 py-2 text-[14px] font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors"
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
        className="px-2 py-2 text-[14px] font-medium text-slate-700 hover:text-slate-900 transition-colors"
      >
        Se connecter
      </button>
      <button
        type="button"
        onClick={() => router.push('/login')}
        className="hidden md:inline-flex px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-medium rounded-md transition-colors"
      >
        S&apos;inscrire
      </button>
    </div>
  )
}
