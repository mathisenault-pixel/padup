'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import PlayerNav from './components/PlayerNav'
import LanguageSwitcher from './components/LanguageSwitcher'
import HeaderUserMenu from './components/HeaderUserMenu'

export default function PlayerAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAccueil = pathname === '/player/accueil'

  return (
    <div className={`min-h-screen w-full overflow-x-hidden ${isAccueil ? '' : 'bg-white'}`}>
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

            {/* Actions à droite (style Planity) - mobile: Messages | Langue | 3 barres */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Messages - premier à gauche sur mobile */}
              <Link
                href="/player/messages"
                className="lg:hidden px-2 py-2 text-black/60 hover:text-black transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </Link>
              {/* Langue */}
              <LanguageSwitcher />
              {/* Menu hamburger (3 barres) */}
              <HeaderUserMenu />
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

      {/* Main - w-full overflow-x-hidden pour éviter bande blanche / scroll horizontal */}
      <main className={`w-full overflow-x-hidden ${isAccueil ? '' : 'pt-14 md:pt-16 min-h-screen'}`}>
        {children}
      </main>
    </div>
  )
}
