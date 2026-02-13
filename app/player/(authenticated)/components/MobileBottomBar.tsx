'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from '@/state/LocaleContext'

const IconClubs = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const IconTournois = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12a6 6 0 0112 0" />
  </svg>
)

const IconConnexion = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

export default function MobileBottomBar() {
  const pathname = usePathname()
  const { t } = useLocale()
  const isClubs = pathname === '/player/accueil' || pathname === '/player/clubs' || pathname?.startsWith('/player/clubs/')
  const isTournois = pathname === '/player/tournois' || pathname?.startsWith('/player/tournois/')
  const isCompte = pathname === '/player/compte'

  return (
    <div
      className="fixed left-0 right-0 z-50 lg:hidden bg-white border-t border-black/10"
      style={{ bottom: '-0.4cm', height: 'calc(1.9cm + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-[1.9cm] px-6">
        <Link
          href="/player/accueil"
          className={`flex flex-col items-center gap-1 ${isClubs ? 'text-black' : 'text-black/50'}`}
          style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <IconClubs />
          <span className="text-xs font-light">{t('nav.clubs')}</span>
        </Link>
        <Link
          href="/player/tournois"
          className={`flex flex-col items-center gap-1 ${isTournois ? 'text-black' : 'text-black/50'}`}
          style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <IconTournois />
          <span className="text-xs font-light">{t('nav.tournois')}</span>
        </Link>
        <Link
          href="/player/compte"
          className={`flex flex-col items-center gap-1 ${isCompte ? 'text-black' : 'text-black/50'}`}
          style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <IconConnexion />
          <span className="text-xs font-light">{t('nav.connexion')}</span>
        </Link>
      </div>
    </div>
  )
}
