'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from '@/state/LocaleContext'

const IconClubs = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
  const isClubs = pathname === '/player/clubs' || pathname?.startsWith('/player/clubs/')
  const isTournois = pathname === '/player/tournois' || pathname?.startsWith('/player/tournois/')
  const isCompte = pathname === '/player/compte'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-black/10"
      style={{ height: 'calc(2.3cm + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-[2.3cm] px-6">
        <Link
          href="/player/clubs"
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
