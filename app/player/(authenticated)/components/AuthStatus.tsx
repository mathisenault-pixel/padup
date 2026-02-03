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

  // ============================================
  // Handler de déconnexion
  // ============================================
  const handleSignOut = async () => {
    console.log('[AUTH STATUS] Signing out...')
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('[AUTH STATUS] Error signing out:', error)
      alert('Erreur lors de la déconnexion')
    } else {
      console.log('[AUTH STATUS] ✅ Signed out successfully')
      setUser(null)
      router.push('/player/accueil')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Si connecté
  if (user) {
    return (
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mon compte */}
        <button
          type="button"
          onClick={() => router.push('/player/compte')}
          className="px-3 md:px-5 py-2 md:py-2.5 text-sm md:text-[14px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg md:rounded-xl transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="hidden sm:inline">Mon compte</span>
        </button>

        {/* Déconnexion - Caché sur mobile (affiché uniquement sur desktop) */}
        <button
          type="button"
          onClick={handleSignOut}
          className="hidden md:flex px-3 md:px-5 py-2 md:py-2.5 text-sm md:text-[14px] font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg md:rounded-xl transition-all duration-200 items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Déconnexion</span>
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
        className="px-5 py-2.5 text-[14px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
      >
        Se connecter
      </button>
      <button
        type="button"
        onClick={() => router.push('/login')}
        className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-[14px] font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
      >
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          S&apos;inscrire
        </span>
      </button>
    </div>
  )
}
