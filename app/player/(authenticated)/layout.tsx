'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import PlayerNav from './components/PlayerNav'
import AuthStatus from './components/AuthStatus'

export default function PlayerAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAccueil = pathname === '/player/accueil'
  const heroBgImage = 'https://images.pexels.com/photos/33226056/pexels-photo-33226056.jpeg'

  return (
    <div
      className={`min-h-screen ${isAccueil ? '' : 'bg-white'}`}
      style={isAccueil ? {
        backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.5) 100%), url('${heroBgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center calc(50% + 8cm)',
        backgroundAttachment: 'scroll',
      } : undefined}
    >
      {/* Navbar - fixed, transparent sur accueil */}
      <header
        className={`fixed top-0 left-0 w-full z-50 pt-[env(safe-area-inset-top)] ${
          isAccueil ? 'bg-transparent backdrop-blur-sm border-b border-black/5' : 'bg-white border-b border-black/10'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 md:h-14">
            
            {/* Logo */}
            <Link
              href="/player/accueil"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <span className="text-lg md:text-xl font-bold text-black">Pad&apos;Up</span>
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
                className="lg:hidden px-2 py-2 text-black/60 hover:text-black transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </Link>

              {/* Espace club - masqué sur accueil */}
              {!isAccueil && (
                <Link
                  href="/club-access"
                  className="hidden md:inline-flex px-4 py-2 text-[14px] font-normal tracking-wide transition-opacity hover:opacity-70"
                  style={{ color: '#000000' }}
                >
                  Espace club
                </Link>
              )}

              {/* Mon compte - masqué sur accueil */}
              {!isAccueil && <AuthStatus />}
            </div>

          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden border-t px-2 py-2 overflow-x-auto ${isAccueil ? 'bg-transparent border-black/5' : 'bg-white border-black/5'}`}>
          <div className="min-w-max">
            <PlayerNav />
          </div>
        </div>
      </header>

      {/* Main - pas de pt sur accueil (hero en haut), pt pour les autres pages */}
      <main className={isAccueil ? '' : 'pt-14 md:pt-16 min-h-screen'}>
        {children}
      </main>
    </div>
  )
}
