'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from '@/state/LocaleContext'

export default function HeaderUserMenu() {
  const { t } = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 text-black/70 hover:text-black transition-colors"
        aria-label="Menu utilisateur"
      >
        {/* Icône hamburger : 3 barres horizontales */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 py-2 w-44 bg-white rounded-xl shadow-lg border border-black/10 z-50">
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 text-sm font-medium text-black hover:bg-black/5 transition-colors"
          >
            {t('nav.sInscrire')}
          </Link>
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 text-sm font-medium text-black hover:bg-black/5 transition-colors"
          >
            {t('nav.seConnecter')}
          </Link>
        </div>
      )}
    </div>
  )
}
