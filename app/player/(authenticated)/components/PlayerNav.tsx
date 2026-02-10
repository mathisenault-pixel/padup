'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function PlayerNav() {
  const pathname = usePathname()

  // Navigation style Planity (texte simple, pas de boutons)
  const navItems = [
    { href: '/player/accueil', label: 'Accueil' },
    { href: '/player/reservations', label: 'Mes réservations' },
    { href: '/player/clubs', label: 'Clubs' },
    { href: '/player/tournois', label: 'Tournois' },
    { href: '/player/messages', label: 'Messages', desktopOnly: true },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Navigation mobile - Sans Messages */}
      <nav className="lg:hidden flex items-center gap-1">
        {navItems.filter(item => !item.desktopOnly).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 text-sm whitespace-nowrap ${
              isActive(item.href)
                ? 'text-black font-semibold border-b-2 border-black'
                : 'text-black/50 font-light hover:text-black'
            }`}
            style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Navigation desktop - Minimaliste avec underline */}
      <nav className="hidden lg:flex items-center gap-1 group">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative px-4 py-2 text-[14px] whitespace-nowrap tracking-wide
                ${active ? 'text-black font-normal' : 'text-black/50 font-light hover:text-black/80'}
                after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[1px] 
                after:bg-black
                ${active ? 'after:opacity-30 group-hover:after:opacity-0' : 'after:opacity-0'}
                hover:after:!opacity-100
              `}
              style={{ 
                transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
