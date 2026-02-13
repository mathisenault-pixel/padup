'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from '@/state/LocaleContext'

type NavItem = {
  href: string
  labelKey: string
  icon: React.ReactNode
}

const IconClubs = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)
const IconTournois = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
)

/** Onglets masqués - à réintégrer ailleurs si besoin */
const NAV_ITEMS_HIDDEN: NavItem[] = [
  { href: '/player/reservations', labelKey: 'nav.mesReservations', icon: null! },
]

export default function PlayerNav() {
  const pathname = usePathname()
  const { t } = useLocale()

  const navItems: NavItem[] = [
    { href: '/player/accueil', labelKey: 'nav.clubs', icon: <IconClubs /> },
    { href: '/player/tournois', labelKey: 'nav.tournois', icon: <IconTournois /> },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Navigation mobile - logos + label en dessous */}
      <nav className="lg:hidden flex items-center gap-6 sm:gap-8">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 px-2 py-2 transition-opacity hover:opacity-70 ${
                active ? 'text-black' : 'text-black/70'
              }`}
            >
              <span className={active ? 'text-black' : 'text-black/70'}>{item.icon}</span>
              <span className="text-[11px] font-medium">{t(item.labelKey)}</span>
              {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-black rounded-full" />}
            </Link>
          )
        })}
      </nav>

      {/* Navigation desktop */}
      <nav className="hidden lg:flex items-center gap-1 group">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative px-4 py-2 text-[14px] font-normal whitespace-nowrap transition-all
                after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] 
                after:bg-gray-900 after:transition-opacity
                ${active ? 'after:opacity-100 text-gray-900 group-hover:after:opacity-0' : 'after:opacity-0 text-gray-600 hover:text-gray-900'}
                hover:after:!opacity-100
              `}
            >
              {t(item.labelKey)}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
