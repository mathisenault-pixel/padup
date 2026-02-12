'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from '@/state/LocaleContext'

const IconTournois = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
)

const IconConnexion = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998-5.59A7.502 7.502 0 0118 18v-2.25M4.501 20.118a7.5 7.5 0 0114.998-5.59 7.5 7.5 0 01-5.59 14.998" />
  </svg>
)

export default function MobileBottomBar() {
  const pathname = usePathname()
  const { t } = useLocale()
  const isTournois = pathname === '/player/tournois'
  const isCompte = pathname === '/player/compte'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-black/10"
      style={{ height: 'calc(2.3cm + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-between h-[2.3cm] px-12 max-w-md mx-auto">
        <Link
          href="/player/tournois"
          className={`flex flex-col items-center gap-1 transition-opacity hover:opacity-70 ${isTournois ? 'text-black' : 'text-black/70'}`}
        >
          <IconTournois />
          <span className="text-xs font-medium">{t('nav.tournois')}</span>
        </Link>
        <Link
          href="/player/compte"
          className={`flex flex-col items-center gap-1 transition-opacity hover:opacity-70 ${isCompte ? 'text-black' : 'text-black/70'}`}
        >
          <IconConnexion />
          <span className="text-xs font-medium">{t('nav.connexion')}</span>
        </Link>
      </div>
    </div>
  )
}
