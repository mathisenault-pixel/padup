'use client'

import { usePathname, useRouter } from 'next/navigation'

export default function PlayerNav() {
  const pathname = usePathname()
  const router = useRouter()

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
      href: '/player/clubs',
      label: 'Clubs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
    },
    {
      href: '/player/messages',
      label: 'Messages',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      primary: true,
      desktopOnly: true // Visible uniquement sur desktop
    }
  ]

  // Onglet "Mon compte" retiré - accessible via le bouton dans AuthStatus
  const accountNavItems: any[] = []

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Navigation mobile - Sans Messages */}
      <nav className="lg:hidden flex items-center gap-3">
        <div className="flex items-center gap-2">
          {mainNavItems.filter(item => !item.desktopOnly).map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={`group relative inline-flex items-center px-3 md:px-5 py-2 md:py-3 text-sm md:text-[15px] font-semibold rounded-xl md:rounded-2xl transition-all duration-300 whitespace-nowrap ${
                isActive(item.href)
                  ? 'text-white bg-slate-900 shadow-lg'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Navigation desktop - Avec tous les items */}
      <nav className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2">
          {mainNavItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={`group relative inline-flex items-center px-3 md:px-5 py-2 md:py-3 text-sm md:text-[15px] font-semibold rounded-xl md:rounded-2xl transition-all duration-300 whitespace-nowrap ${
                isActive(item.href)
                  ? 'text-white bg-slate-900 shadow-lg'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
