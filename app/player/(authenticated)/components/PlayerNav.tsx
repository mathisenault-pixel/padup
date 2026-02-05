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

      {/* Navigation desktop - Style Planity (texte simple + underline animé) */}
      <nav className="hidden lg:flex items-center gap-1 group">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative px-4 py-2 text-[14px] transition-colors whitespace-nowrap
                ${active ? 'text-slate-900 font-semibold' : 'text-slate-700 font-medium hover:text-slate-900'}
                after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] 
                after:bg-slate-900 after:transition-opacity after:duration-200
                ${active ? 'after:opacity-100 group-hover:after:opacity-0' : 'after:opacity-0'}
                hover:after:!opacity-100
              `}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
