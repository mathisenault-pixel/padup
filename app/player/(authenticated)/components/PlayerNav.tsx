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
            className={`px-3 py-2 text-sm transition-colors whitespace-nowrap ${
              isActive(item.href)
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-700 font-medium hover:text-slate-900'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Navigation desktop - Style Planity (texte simple + underline) */}
      <nav className="hidden lg:flex items-center gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 text-[14px] transition-colors whitespace-nowrap ${
              isActive(item.href)
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'text-slate-700 font-medium hover:text-slate-900'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
