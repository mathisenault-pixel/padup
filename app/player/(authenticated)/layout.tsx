'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import PlayerNav from './components/PlayerNav'
import LanguageSwitcher from './components/LanguageSwitcher'
import HeaderUserMenu from './components/HeaderUserMenu'
import AccueilSearchBar from './components/AccueilSearchBar'
import MobileBottomBar from './components/MobileBottomBar'

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
        className={`fixed top-0 left-0 w-full z-50 pt-[env(safe-area-inset-top)] bg-[#F0F0F0] transition-all duration-300 ${isAccueil ? 'pb-[0.5cm]' : ''}`}
      >
        {/* Logo + nav + actions - masqués sur mobile accueil (uniquement barre de recherche) ; masqués au scroll */}
        <div
          className={`max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8 pt-[0.7cm] transition-all duration-300 ${
            showCompactSearch ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-[6rem] md:max-h-[4rem] opacity-100 overflow-visible'
          } ${isAccueil ? 'lg:opacity-100 max-lg:hidden' : ''}`}
        >
          <div className="relative flex items-center justify-between h-12 md:h-14">
            <Link href="/player/accueil" className="flex items-center gap-2 transition-opacity hover:opacity-80 -ml-[6.8cm]">
              <span className="text-[1.35rem] md:text-[1.5rem] font-bold text-black">Pad&apos;Up</span>
            </Link>
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
              <PlayerNav />
            </div>
            <div className="flex items-center gap-2 ml-[17cm] lg:translate-x-[8cm]">
              <Link
                href="/club/signup"
                className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors rounded-lg hover:bg-gray-200/60"
              >
                Devenir visible
              </Link>
              <Link 
                href="/player/messages" 
                className="lg:hidden px-2.5 py-2.5 text-black/60 hover:text-black transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </Link>
              <span className="inline-flex lg:rounded-full lg:border lg:border-black/20 lg:p-0.5 lg:-ml-1">
                <LanguageSwitcher />
              </span>
              <span className="inline-flex lg:rounded-full lg:border lg:border-black/20 lg:p-0.5">
                <HeaderUserMenu />
              </span>
            </div>
          </div>
          <div className="lg:hidden px-2.5 py-2.5 overflow-x-auto">
            <div className="min-w-max">
              <PlayerNav />
            </div>
          </div>
        </div>

        {/* Barre de recherche (accueil uniquement) */}
        {isAccueil && <AccueilSearchBar compact={showCompactSearch} />}
      </header>

      {/* Main - padding bottom pour barre fixe mobile */}
      <main className={`w-full overflow-x-hidden lg:pb-0 pb-[calc(2.8cm+env(safe-area-inset-bottom,0px))] ${isAccueil ? 'pt-[0.6cm]' : 'pt-14 md:pt-16 min-h-screen'}`}>
        {children}
      </main>

      {/* Barre fixe mobile en bas : Tournois + Connexion */}
      <MobileBottomBar />
    </div>
  )
}
