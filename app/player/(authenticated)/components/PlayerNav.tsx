'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from '@/state/LocaleContext'

type NavItem = {
  href: string
  labelKey: string
}

export default function PlayerNav() {
  const pathname = usePathname()
  const { t } = useLocale()

  const navItems: NavItem[] = [
    { href: '/player/accueil', labelKey: 'nav.accueil' },
    { href: '/player/reservations', labelKey: 'nav.mesReservations' },
    { href: '/player/clubs', labelKey: 'nav.clubs' },
    { href: '/player/tournois', labelKey: 'nav.tournois' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Navigation mobile */}
      <nav className="lg:hidden flex items-center gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 text-sm font-normal whitespace-nowrap transition-opacity hover:opacity-70 ${
              isActive(item.href) ? 'border-b border-black' : ''
            }`}
            style={{ color: '#000000' }}
          >
            {t(item.labelKey)}
          </Link>
        ))}
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
                relative px-4 py-2 text-[14px] font-normal whitespace-nowrap tracking-wide transition-opacity hover:opacity-70
                after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[1px] 
                after:bg-black after:transition-opacity
                ${active ? 'after:opacity-100 group-hover:after:opacity-0' : 'after:opacity-0'}
                hover:after:!opacity-100
              `}
              style={{ color: '#000000' }}
            >
              {t(item.labelKey)}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
