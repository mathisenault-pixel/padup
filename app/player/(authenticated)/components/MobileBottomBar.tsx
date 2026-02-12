'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from '@/state/LocaleContext'

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
  const isTournois = pathname === '/player/tournois' || pathname?.startsWith('/player/tournois/')
  const isCompte = pathname === '/player/compte'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-black/10"
      style={{ height: 'calc(2.3cm + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-[2.3cm] px-6">
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
