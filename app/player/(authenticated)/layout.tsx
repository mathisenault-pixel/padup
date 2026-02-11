'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import PlayerNav from './components/PlayerNav'
import LanguageSwitcher from './components/LanguageSwitcher'
import HeaderUserMenu from './components/HeaderUserMenu'
import AccueilSearchBar from './components/AccueilSearchBar'

const SCROLL_THRESHOLD = 80

export default function PlayerAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAccueil = pathname === '/player/accueil'
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(typeof window !== 'undefined' ? window.scrollY > SCROLL_THRESHOLD : false)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const showCompactSearch = isAccueil && isScrolled

  return (
    <div className={`min-h-screen w-full overflow-x-hidden ${isAccueil ? '' : 'bg-white'}`}>
      {/* Navbar - fond gris ; au scroll : onglets masqués, barre de recherche réduite ÷1,5 */}
      <header
        className={`fixed top-0 left-0 w-full z-50 pt-[env(safe-area-inset-top)] bg-[#F0F0F0] transition-all duration-300 ${isAccueil ? 'pb-[0.8cm]' : ''}`}
      >
        {/* Logo + nav + actions - masqués au scroll sur accueil */}
        <div
          className={`max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 overflow-hidden transition-all duration-300 ${
            showCompactSearch ? 'max-h-0 opacity-0' : 'max-h-[6rem] md:max-h-[4rem] opacity-100'
          }`}
        >
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
                className="lg:hidden px-2.5 py-2.5 text-black/60 hover:text-black transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </Link>
              {/* Langue */}
              <LanguageSwitcher />
              {/* Menu hamburger (3 barres) */}
              <HeaderUserMenu />
            </div>

          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden px-2.5 py-2.5 overflow-x-auto">
            <div className="min-w-max">
              <PlayerNav />
            </div>
          </div>
        </div>

        {/* Barre de recherche (accueil uniquement) - réduite ÷1,5 au scroll */}
        {isAccueil && <AccueilSearchBar compact={showCompactSearch} />}
      </header>

      {/* Main - w-full overflow-x-hidden pour éviter bande blanche / scroll horizontal */}
      <main className={`w-full overflow-x-hidden ${isAccueil ? '' : 'pt-14 md:pt-16 min-h-screen'}`}>
        {children}
      </main>
    </div>
  )
}
