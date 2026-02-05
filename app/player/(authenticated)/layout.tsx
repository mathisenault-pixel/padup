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
      {/* Header style Planity (sobre, texte simple) */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            
            {/* Logo */}
            <Link
              href="/player/accueil"
              className="flex items-center gap-2 transition-colors"
            >
              <span className="text-lg md:text-xl font-bold text-slate-900">Pad&apos;Up</span>
            </Link>

            {/* Navigation Center */}
            <div className="hidden lg:flex flex-1 justify-center max-w-3xl mx-12">
              <PlayerNav />
            </div>

            {/* Actions à droite (style Planity) */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Messages - Visible uniquement sur mobile (icône seulement) */}
              <Link
                href="/player/messages"
                className="lg:hidden px-2 py-2 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </Link>

              {/* Espace club - Lien texte simple (style Planity) */}
              <Link
                href="/club-access"
                className="hidden md:inline-flex px-2 py-2 text-[14px] font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Espace club
              </Link>

              <AuthStatus />
            </div>

          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-gray-100 px-2 py-2 bg-white overflow-x-auto">
          <div className="min-w-max">
            <PlayerNav />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  )
}
