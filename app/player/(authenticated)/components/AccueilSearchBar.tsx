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
    <div className={`px-3 md:px-6 lg:px-8 transition-all duration-300 ${compact ? 'py-1 md:py-1.5' : 'py-2 md:py-3'}`}>
      <div className="max-w-[1400px] mx-auto">
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-[1.2rem] sm:rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all duration-300 ${compact ? 'min-h-[1.75rem] sm:min-h-0' : 'min-h-[2.5rem] sm:min-h-0'}`}>
          {/* Partie gauche : Où */}
          <div className={`flex-1 min-w-0 ${compact ? 'px-2 py-1 sm:px-2.5 sm:py-1.5' : 'px-3 py-1.5 sm:px-4 sm:py-2'}`}>
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
            <div className="w-px h-5 bg-gray-200/80" />
          </div>
          {/* Trait horizontal mobile - centré */}
          <div className="sm:hidden flex justify-center flex-shrink-0 py-1" aria-hidden>
            <div className="w-12 h-px bg-gray-200/80" />
          </div>

          {/* Partie droite : Dates */}
          <div className={`flex-1 min-w-0 ${compact ? 'px-2 py-1 sm:px-2.5 sm:py-1.5' : 'px-3 py-1.5 sm:px-4 sm:py-2'}`}>
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
            className={`flex items-center justify-center shrink-0 rounded-full bg-[#FF4567] text-white hover:bg-[#e63950] active:scale-95 transition-all ${compact ? 'w-7 h-7 sm:w-8 sm:h-8 m-1' : 'w-9 h-9 sm:w-10 sm:h-10 m-1.5'}`}
            aria-label="Rechercher"
          >
            <svg className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
