'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PlayerNav from './components/PlayerNav'
import AuthStatus from './components/AuthStatus'

export default function PlayerAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      {/* Header Premium avec Glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-20">
            
            {/* Logo */}
            <button
              type="button"
              onClick={() => router.push('/player/accueil')}
              className="group flex items-center gap-2 transition-all"
            >
              <span className="text-lg md:text-xl font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">Pad&apos;Up</span>
            </button>

            {/* Navigation Center */}
            <div className="hidden lg:flex flex-1 justify-center max-w-3xl mx-12">
              <PlayerNav />
            </div>

            {/* Auth Section Premium - Dynamic based on auth state */}
            <div className="flex items-center gap-3">
              {/* Messages - Visible uniquement sur mobile (icône seulement) */}
              <Link
                href="/player/messages"
                className="lg:hidden flex items-center gap-2 px-2 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </Link>

              {/* Espace club - Visible desktop et mobile */}
              <Link
                href="/club-access"
                className="flex items-center gap-2 px-2 md:px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="hidden md:inline">Espace club</span>
              </Link>

              <AuthStatus />
            </div>

          </div>
        </div>

        {/* Mobile Navigation Premium */}
        <div className="lg:hidden border-t border-gray-100 px-2 py-2 bg-white/50 backdrop-blur-xl overflow-x-auto">
          <div className="min-w-max">
            <PlayerNav />
          </div>
        </div>
      </header>

      {/* Main Content avec espacement premium */}
      <main className="min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-80px)]">
        {children}
      </main>
    </div>
  )
}
