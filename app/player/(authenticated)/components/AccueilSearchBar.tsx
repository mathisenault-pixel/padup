'use client'

import { useState, useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/state/LocaleContext'
import { getCitySuggestions } from '@/lib/cities'

export default function AccueilSearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const { t } = useLocale()
  const [searchOu, setSearchOu] = useState('')
  const [searchQuand, setSearchQuand] = useState('')
  const [isDesktop, setIsDesktop] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [focusedField, setFocusedField] = useState<'ou' | 'quand' | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = () => setIsDesktop(mq.matches)
    handler()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setFocusedField(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const suggestions = [
    'Paris',
    'Lyon', 
    'Marseille',
    'Toulouse',
    'Nice',
    'Nantes',
    'Bordeaux',
    'Le Hangar Sport & Co',
    'Paul & Louis Sport',
    'ZE Padel',
    ...getCitySuggestions()
  ]

  const filteredSuggestions = searchOu.trim()
    ? suggestions.filter(s => s.toLowerCase().includes(searchOu.toLowerCase())).slice(0, 6)
    : suggestions.slice(0, 6)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchOu.trim()) params.set('q', searchOu.trim())
    if (searchQuand.trim()) params.set('date', searchQuand.trim())
    router.push(`/player/clubs${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const barStyle: CSSProperties | undefined = isDesktop
    ? {
        width: '22.4cm',
        height: '1.7cm',
        minWidth: '22.4cm',
        maxWidth: '22.4cm',
        minHeight: '1.7cm',
        maxHeight: '1.7cm',
        boxSizing: 'border-box',
        marginLeft: 'auto',
        marginRight: 'auto',
      }
    : undefined

  /* Mobile : barre simple cliquable → /player/recherche (page de recherche dédiée) */
  if (!isDesktop) {
    return (
      <div className={`px-3 md:px-6 lg:px-8 mt-0 pt-[0.2cm] transition-all duration-300 ${compact ? 'py-1.5 md:py-2' : 'py-3 md:py-4'}`}>
        <div className="w-full flex justify-center">
          <button
            type="button"
            onClick={() => router.push('/player/recherche')}
            data-testid="home-search-mobile"
            className="w-full flex items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3.5 font-sans text-left min-h-[2.75rem] shadow-md hover:shadow-lg hover:border-black/20"
            style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <span className="flex-1 text-[15px] font-light text-black/50">
              {t('accueil.searchMobilePlaceholder')}
            </span>
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    )
  }

  /* Desktop : barre complète Où | Dates | loupe */
  return (
    <div className={`px-3 md:px-6 lg:px-8 mt-[0.7cm] pt-[1.1cm] transition-all duration-300 ${compact ? 'py-1.5 md:py-2' : 'py-3 md:py-4'}`}>
      <div className="w-full flex justify-center">
        <div className="relative" ref={dropdownRef}>
          <div
            data-testid="home-search"
            style={{
              ...barStyle,
              borderRadius: '50px',
              transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            className={`flex items-center bg-white overflow-hidden font-sans border ${
              focusedField ? 'border-black shadow-lg' : 'border-black/10 shadow-md'
            }`}
            onFocus={() => setShowSuggestions(true)}
            onMouseDown={() => setShowSuggestions(true)}
          >
            {/* Partie gauche : Où */}
            <div className={`flex-1 min-w-0 flex flex-col justify-center pl-[0.8cm] overflow-hidden ${compact ? 'pr-2 py-0.5 sm:pr-2.5' : 'pr-2.5 py-1 sm:pr-3.5'}`}>
              <label className="block text-[11px] font-light text-black/60 mb-1 leading-none tracking-wide">
                {t('accueil.searchOu')}
              </label>
              <input
                type="text"
                value={searchOu}
                onChange={(e) => {
                  setSearchOu(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => {
                  setFocusedField('ou')
                  setShowSuggestions(true)
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('accueil.searchPlaceholder')}
                className="w-full h-full text-[14px] font-light text-black placeholder:text-black/40 bg-transparent focus:outline-none"
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Trait vertical */}
            <div className="hidden sm:flex flex-shrink-0 items-center self-stretch py-2" aria-hidden>
              <div className="w-px h-6 bg-black/10" />
            </div>

            {/* Partie droite : Dates */}
            <div className={`flex-1 min-w-0 flex flex-col justify-center pl-[0.4cm] overflow-hidden ${compact ? 'pr-2 py-0.5 sm:pr-2.5' : 'pr-2.5 py-1 sm:pr-3.5'}`}>
              <label className="block text-[11px] font-light text-black/60 mb-1 leading-none tracking-wide">
                {t('accueil.searchDates')}
              </label>
              <input
                type="text"
                value={searchQuand}
                onChange={(e) => setSearchQuand(e.target.value)}
                onFocus={() => setFocusedField('quand')}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('accueil.searchQuand')}
                className="w-full h-full text-[14px] font-light text-black placeholder:text-black/40 bg-transparent focus:outline-none"
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Bouton loupe */}
            <button
              type="button"
              onClick={handleSearch}
              className={`flex items-center justify-center shrink-0 rounded-full bg-black text-white hover:bg-black/80 active:scale-95 origin-center ${compact ? 'w-5 h-5 sm:w-6 sm:h-6 m-1' : 'w-7 h-7 sm:w-8 sm:h-8 m-1.5'} lg:-translate-x-[0.7cm] lg:scale-[1.385]`}
              style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
              aria-label="Rechercher"
            >
              <svg className={compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Dropdown des suggestions */}
          {showSuggestions && focusedField === 'ou' && filteredSuggestions.length > 0 && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-black/10 overflow-hidden z-50 animate-fade-in"
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                width: barStyle?.width
              }}
            >
              <div className="max-h-[280px] overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchOu(suggestion)
                      setShowSuggestions(false)
                      handleSearch()
                    }}
                    className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-black/5"
                    style={{ transition: 'all 800ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                  >
                    <div className="w-2 h-2 rounded-full bg-black/20 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-light truncate text-[15px] text-black/70">
                        {suggestion}
                      </p>
                    </div>
                    <svg 
                      className="w-4 h-4 flex-shrink-0 text-black/20" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
