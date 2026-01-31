'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function PlayerNav() {
  const pathname = usePathname()

  // Navigation organisée par groupes logiques
  const mainNavItems = [
    {
      href: '/player/accueil',
      label: 'Accueil',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      primary: true
    },
    {
      href: '/player/clubs',
      label: 'Clubs de Padel',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      primary: true
    },
    {
      href: '/player/reservations',
      label: 'Mes réservations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      primary: true
    },
    {
      href: '/player/tournois',
      label: 'Tournois',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      primary: true
    }
  ]

  const accountNavItems = [
    {
      href: '/player/parametres',
      label: 'Paramètres',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      badge: null
    }
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="flex items-center gap-3">
      {/* Navigation principale */}
      <div className="flex items-center gap-2">
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative inline-flex items-center px-5 py-3 text-[19px] font-semibold rounded-2xl transition-all duration-300 whitespace-nowrap ${
              isActive(item.href)
                ? 'text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="whitespace-nowrap">{item.label}</span>
            {isActive(item.href) && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl blur-xl opacity-30 -z-10"></div>
            )}
          </Link>
        ))}
      </div>

      {/* Navigation compte */}
      <div className="flex items-center gap-2">
        {accountNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative inline-flex items-center px-5 py-3 text-[19px] font-semibold rounded-2xl transition-all duration-300 whitespace-nowrap ${
              isActive(item.href)
                ? 'text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="whitespace-nowrap">{item.label}</span>
            {isActive(item.href) && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl blur-xl opacity-30 -z-10"></div>
            )}
            {item.badge && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  )
}
