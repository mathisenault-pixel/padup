'use client'

import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/state/LocaleContext'

export default function AccueilSearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const { t } = useLocale()
  const [searchOu, setSearchOu] = useState('')
  const [searchQuand, setSearchQuand] = useState('')
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = () => setIsDesktop(mq.matches)
    handler()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchOu.trim()) params.set('q', searchOu.trim())
    if (searchQuand.trim()) params.set('date', searchQuand.trim())
    router.push(`/player/clubs${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const barStyle: CSSProperties | undefined = isDesktop
    ? {
        width: '22.6cm',
        height: '1.7cm',
        minWidth: '22.6cm',
        maxWidth: '22.6cm',
        minHeight: '1.7cm',
        maxHeight: '1.7cm',
        boxSizing: 'border-box',
        marginLeft: 'auto',
        marginRight: 'auto',
      }
    : undefined

  return (
    <div className={`px-3 md:px-6 lg:px-8 pt-[1.1cm] transition-all duration-300 ${compact ? 'py-1.5 md:py-2' : 'py-3 md:py-4'}`}>
      <div className="w-full flex justify-center">
        <div
          data-testid="home-search"
          style={barStyle}
          className={`
            flex items-center rounded-full border border-gray-300 bg-white overflow-hidden
            ${isDesktop ? '' : 'w-full min-h-[2rem]'}
          `}
        >
          {/* Partie gauche : Où - texte décalé 0,8cm à droite */}
          <div className={`flex-1 min-w-0 flex flex-col justify-center pl-[0.8cm] overflow-hidden ${compact ? 'pr-2 py-0.5 sm:pr-2.5' : 'pr-2.5 py-1 sm:pr-3.5'}`}>
            <label className="block font-bold text-gray-600 text-[12px] mb-1.5 leading-none">
              {t('accueil.searchOu')}
            </label>
            <input
              type="text"
              value={searchOu}
              onChange={(e) => setSearchOu(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('accueil.searchPlaceholder')}
              className="w-full h-full text-[12px] text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
            />
          </div>

          {/* Trait vertical - centré, ne touche pas le haut ni le bas */}
          <div className="hidden sm:flex flex-shrink-0 items-center self-stretch py-2" aria-hidden>
            <div className="w-px h-6 bg-gray-200/80" />
          </div>
          {/* Trait horizontal mobile - centré */}
          <div className="sm:hidden flex justify-center flex-shrink-0 py-1" aria-hidden>
            <div className="w-12 h-px bg-gray-200/80" />
          </div>

          {/* Partie droite : Dates - texte décalé 0,4cm à droite */}
          <div className={`flex-1 min-w-0 flex flex-col justify-center pl-[0.4cm] overflow-hidden ${compact ? 'pr-2 py-0.5 sm:pr-2.5' : 'pr-2.5 py-1 sm:pr-3.5'}`}>
            <label className="block font-bold text-gray-600 text-[12px] mb-1.5 leading-none">
              {t('accueil.searchDates')}
            </label>
            <input
              type="text"
              value={searchQuand}
              onChange={(e) => setSearchQuand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('accueil.searchQuand')}
              className="w-full h-full text-[12px] text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
            />
          </div>

          {/* Bouton loupe */}
          <button
            type="button"
            onClick={handleSearch}
            className={`flex items-center justify-center shrink-0 rounded-full bg-[#FF4567] text-white hover:bg-[#e63950] active:scale-95 transition-all ${compact ? 'w-5 h-5 sm:w-6 sm:h-6 m-1' : 'w-7 h-7 sm:w-8 sm:h-8 m-1.5'}`}
            aria-label="Rechercher"
          >
            <svg className={compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
