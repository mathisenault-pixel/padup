'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/state/LocaleContext'

export default function AccueilSearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const { t } = useLocale()
  const [searchOu, setSearchOu] = useState('')
  const [searchQuand, setSearchQuand] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchOu.trim()) params.set('q', searchOu.trim())
    if (searchQuand.trim()) params.set('date', searchQuand.trim())
    router.push(`/player/clubs${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className={`px-3 md:px-6 lg:px-8 transition-all duration-300 ${compact ? 'py-1 md:py-2' : 'py-3 md:py-4'}`}>
      <div className="max-w-[778px] mx-auto">
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-[1.2rem] sm:rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all duration-300 ${compact ? 'min-h-[2rem] sm:min-h-0' : 'min-h-[3rem] sm:min-h-0'}`}>
          {/* Partie gauche : Où */}
          <div className={`flex-1 min-w-0 ${compact ? 'px-2 py-1 sm:px-2.5 sm:py-2' : 'px-3 py-2 sm:px-4 sm:py-3'}`}>
            <label className={`block font-bold text-gray-600 ${compact ? 'text-[10px] mb-0.5' : 'text-xs mb-0.5'}`}>
              {t('accueil.searchOu')}
            </label>
            <input
              type="text"
              value={searchOu}
              onChange={(e) => setSearchOu(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('accueil.searchPlaceholder')}
              className={`w-full text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none ${compact ? 'text-xs' : 'text-sm'}`}
            />
          </div>

          {/* Trait vertical - centré, hauteur limitée */}
          <div className="hidden sm:flex flex-shrink-0 items-center" aria-hidden>
            <div className="w-px h-6 bg-gray-200/80" />
          </div>
          {/* Trait horizontal mobile - centré */}
          <div className="sm:hidden flex justify-center flex-shrink-0 py-1" aria-hidden>
            <div className="w-12 h-px bg-gray-200/80" />
          </div>

          {/* Partie droite : Dates */}
          <div className={`flex-1 min-w-0 ${compact ? 'px-2 py-1 sm:px-2.5 sm:py-2' : 'px-3 py-2 sm:px-4 sm:py-3'}`}>
            <label className={`block font-bold text-gray-600 ${compact ? 'text-[10px] mb-0.5' : 'text-xs mb-0.5'}`}>
              {t('accueil.searchDates')}
            </label>
            <input
              type="text"
              value={searchQuand}
              onChange={(e) => setSearchQuand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('accueil.searchQuand')}
              className={`w-full text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none ${compact ? 'text-xs' : 'text-sm'}`}
            />
          </div>

          {/* Bouton loupe */}
          <button
            type="button"
            onClick={handleSearch}
            className={`flex items-center justify-center shrink-0 rounded-full bg-[#FF4567] text-white hover:bg-[#e63950] active:scale-95 transition-all ${compact ? 'w-8 h-8 sm:w-9 sm:h-9 m-1' : 'w-10 h-10 sm:w-11 sm:h-11 m-2'}`}
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
