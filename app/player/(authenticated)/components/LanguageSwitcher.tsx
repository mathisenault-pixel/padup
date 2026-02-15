'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from '@/state/LocaleContext'

export default function LanguageSwitcher() {
  const { locale, setLocale, locales } = useLocale()
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

  const handleSelect = (code: typeof locale) => {
    setLocale(code)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-black/70 hover:text-black bg-black/5 rounded-full hover:bg-black/10 focus:outline-none"
        style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        aria-label="Changer la langue"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 py-2 w-44 bg-white rounded-xl shadow-lg border border-black/10 z-[100]">
          {locales.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => handleSelect(code)}
              className={`block w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                locale === code ? 'bg-black/5 text-black' : 'text-black hover:bg-black/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
