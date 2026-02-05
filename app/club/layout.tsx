'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getClubSession, logoutClub, type ClubSession } from '@/lib/clubAuth'
import Link from 'next/link'

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<ClubSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check session côté client uniquement (évite SSR issues)
    const checkAuth = () => {
      const currentSession = getClubSession()

      // Pages publiques (pas de protection)
      const publicPages = ['/club/login', '/club/signup']
      const isPublicPage = publicPages.includes(pathname)

      // Si pas de session et qu'on n'est pas sur une page publique
      if (!currentSession && !isPublicPage) {
        console.log('[Club Layout] No session, redirecting to login')
        router.replace('/club/login')
        return
      }

      setSession(currentSession)
      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  const handleLogout = () => {
    logoutClub()
    router.push('/club/login')
  }

  // Pages publiques: pas de layout avec header
  const publicPages = ['/club/login', '/club/signup']
  if (publicPages.includes(pathname)) {
    return <>{children}</>
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent mb-4 mx-auto"></div>
          <p className="text-gray-600 font-semibold">Vérification...</p>
        </div>
      </div>
    )
  }

  // Pas de session: redirect (déjà géré dans useEffect, mais sécurité)
  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo + Club name */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-slate-900 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{session.clubName}</h1>
                <p className="text-xs text-gray-500">Espace d'administration</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/club"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname === '/club'
                    ? 'bg-slate-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <Link
                href="/club/courts"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname === '/club/courts'
                    ? 'bg-slate-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                Terrains
              </Link>
              <Link
                href="/club/reservations"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname === '/club/reservations'
                    ? 'bg-slate-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Réservations
              </Link>
              <Link
                href="/club/settings"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pathname === '/club/settings'
                    ? 'bg-slate-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Paramètres
              </Link>
            </nav>

            {/* User info + logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900">{session.email}</p>
                <p className="text-xs text-gray-500">Administrateur</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
