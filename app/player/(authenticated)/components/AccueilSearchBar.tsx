'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/state/LocaleContext'

export default function AccueilSearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const { t } = useLocale()
  const [searchOu, setSearchOu] = useState('')
  const [searchQuand, setSearchQuand] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchOu.trim()) params.set('q', searchOu.trim())
    if (searchQuand.trim()) params.set('date', searchQuand.trim())
    router.push(`/player/clubs${params.toString() ? `?${params.toString()}` : ''}`)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isExpanded && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isExpanded])

  const showSingleBar = !isExpanded

  return (
    <div ref={containerRef} className={`px-3 md:px-6 lg:px-8 transition-all duration-300 ${compact ? 'py-1 md:py-2' : 'py-3 md:py-4'}`}>
      <div className="max-w-[778px] mx-auto">
        {/* Mobile : barre simple cliquable → déploie la double barre */}
        <div className={`sm:hidden flex items-center bg-white rounded-[1.2rem] shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all duration-300 ${compact ? 'min-h-[2rem]' : 'min-h-[3rem]'}`}>
          {showSingleBar ? (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="flex flex-1 items-center gap-3 px-4 py-3 text-left w-full min-w-0"
            >
              <span className={`flex-1 text-left text-gray-500 truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                {t('accueil.searchPlaceholder')} • {t('accueil.searchQuand')}
              </span>
              <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-[#FF4567] text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </button>
          ) : (
            <>
              <div className={`flex-1 min-w-0 px-3 py-2`}>
                <label className="block text-[10px] font-bold text-gray-600 mb-0.5">{t('accueil.searchOu')}</label>
                <input
                  type="text"
                  value={searchOu}
                  onChange={(e) => setSearchOu(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={t('accueil.searchPlaceholder')}
                  className="w-full text-sm text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex shrink-0 items-center py-1">
                <div className="w-[2px] h-5 bg-gray-200/80" />
              </div>
              <div className={`flex-1 min-w-0 px-3 py-2`}>
                <label className="block text-[10px] font-bold text-gray-600 mb-0.5">{t('accueil.searchDates')}</label>
                <input
                  type="text"
                  value={searchQuand}
                  onChange={(e) => setSearchQuand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={t('accueil.searchQuand')}
                  className="w-full text-sm text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-[#FF4567] text-white hover:bg-[#e63950] active:scale-95 transition-all m-2"
                aria-label="Rechercher"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Desktop (sm+) : double barre toujours visible */}
        <div className={`hidden sm:flex flex-row items-center bg-white rounded-[1.2rem] sm:rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all duration-300 ${compact ? 'min-h-[2rem]' : 'min-h-[3rem]'}`}>
          <div className={`flex-1 min-w-0 ${compact ? 'px-2.5 py-2' : 'px-4 py-3'}`}>
            <label className={`block font-bold text-gray-600 sm:[word-spacing:0.5cm] ${compact ? 'text-[10px] mb-0.5' : 'text-xs mb-0.5'}`}>
              {t('accueil.searchOu')}
            </label>
            <input
              type="text"
              value={searchOu}
              onChange={(e) => setSearchOu(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('accueil.searchPlaceholder')}
              className={`w-full text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none sm:[word-spacing:0.5cm] ${compact ? 'text-xs' : 'text-sm'}`}
            />
          </div>
          <div className="flex flex-shrink-0 items-center">
            <div className="w-[2px] h-6 bg-gray-200/80" />
          </div>
          <div className={`flex-1 min-w-0 ${compact ? 'px-2.5 py-2' : 'px-4 py-3'}`}>
            <label className={`block font-bold text-gray-600 sm:[word-spacing:0.5cm] ${compact ? 'text-[10px] mb-0.5' : 'text-xs mb-0.5'}`}>
              {t('accueil.searchDates')}
            </label>
            <input
              type="text"
              value={searchQuand}
              onChange={(e) => setSearchQuand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('accueil.searchQuand')}
              className={`w-full text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none sm:[word-spacing:0.5cm] ${compact ? 'text-xs' : 'text-sm'}`}
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className={`flex shrink-0 items-center justify-center rounded-full bg-[#FF4567] text-white hover:bg-[#e63950] active:scale-95 transition-all ${compact ? 'w-9 h-9 m-1' : 'w-11 h-11 m-2'}`}
            aria-label="Rechercher"
          >
            <svg className={compact ? 'w-4 h-4' : 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
