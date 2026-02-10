'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

type NavItem = {
  href: string
  label: string
  desktopOnly?: boolean
  mobileOnly?: boolean
}

export default function PlayerNav() {
  const pathname = usePathname()

  // Navigation style Planity (texte simple, pas de boutons)
  const navItems: NavItem[] = [
    { href: '/player/accueil', label: 'Accueil' },
    { href: '/player/reservations', label: 'Mes réservations' },
    { href: '/player/clubs', label: 'Clubs' },
    { href: '/player/tournois', label: 'Tournois' },
    { href: '/club-access', label: 'Espace club' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Navigation mobile */}
      <nav className="lg:hidden flex items-center gap-1">
        {navItems.filter(item => !item.desktopOnly).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 text-sm font-bold whitespace-nowrap transition-opacity hover:opacity-70 ${
              isActive(item.href) ? 'border-b border-black' : ''
            }`}
            style={{ color: '#000000' }}
          >
            {item.label}
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
                relative px-4 py-2 text-[14px] font-bold whitespace-nowrap tracking-wide transition-opacity hover:opacity-70
                after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[1px] 
                after:bg-black after:transition-opacity
                ${active ? 'after:opacity-100 group-hover:after:opacity-0' : 'after:opacity-0'}
                hover:after:!opacity-100
              `}
              style={{ color: '#000000' }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
