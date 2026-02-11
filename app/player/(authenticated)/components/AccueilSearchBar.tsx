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
    <div className={`px-3 md:px-6 lg:px-8 transition-all duration-300 ${compact ? 'py-0.5 md:py-1' : 'py-1.5 md:py-2'}`}>
      <div className="max-w-[1400px] mx-auto">
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-[0.7rem] sm:rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-300 ${compact ? 'min-h-[1rem] sm:min-h-0' : 'min-h-[1.5rem] sm:min-h-0'}`}>
          {/* Partie gauche : Où */}
          <div className={`flex-1 min-w-0 ${compact ? 'px-1 py-0.5 sm:px-1.5 sm:py-1' : 'px-1.5 py-1 sm:px-2 sm:py-1.5'}`}>
            <label className={`block font-bold text-gray-600 ${compact ? 'text-[9px] mb-0' : 'text-[9px] mb-0'}`}>
              {t('accueil.searchOu')}
            </label>
            <input
              type="text"
              value={searchOu}
              onChange={(e) => setSearchOu(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('accueil.searchPlaceholder')}
              className={`w-full text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none ${compact ? 'text-[9px]' : 'text-[10px]'}`}
            />
          </div>

          {/* Trait vertical - centré, hauteur limitée */}
          <div className="hidden sm:flex flex-shrink-0 items-center" aria-hidden>
            <div className="w-px h-3 bg-gray-200/80" />
          </div>
          {/* Trait horizontal mobile - centré */}
          <div className="sm:hidden flex justify-center flex-shrink-0 py-0.5" aria-hidden>
            <div className="w-7 h-px bg-gray-200/80" />
          </div>

          {/* Partie droite : Dates */}
          <div className={`flex-1 min-w-0 ${compact ? 'px-1 py-0.5 sm:px-1.5 sm:py-1' : 'px-1.5 py-1 sm:px-2 sm:py-1.5'}`}>
            <label className={`block font-bold text-gray-600 ${compact ? 'text-[9px] mb-0' : 'text-[9px] mb-0'}`}>
              {t('accueil.searchDates')}
            </label>
            <input
              type="text"
              value={searchQuand}
              onChange={(e) => setSearchQuand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('accueil.searchQuand')}
              className={`w-full text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none ${compact ? 'text-[9px]' : 'text-[10px]'}`}
            />
          </div>

          {/* Bouton loupe */}
          <button
            type="button"
            onClick={handleSearch}
            className={`flex items-center justify-center shrink-0 rounded-full bg-[#FF4567] text-white hover:bg-[#e63950] active:scale-95 transition-all ${compact ? 'w-4 h-4 sm:w-5 sm:h-5 m-0.5' : 'w-5 h-5 sm:w-6 sm:h-6 m-1'}`}
            aria-label="Rechercher"
          >
            <svg className={compact ? 'w-2 h-2' : 'w-2.5 h-2.5'} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
