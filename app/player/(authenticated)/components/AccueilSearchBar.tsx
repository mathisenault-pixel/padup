'use client'

import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from '@/state/LocaleContext'

export default function AccueilSearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLocale()
  const [searchOu, setSearchOu] = useState('')
  const [searchQuand, setSearchQuand] = useState('')
  const [niveau, setNiveau] = useState('')
  const [genre, setGenre] = useState('')
  const [isDesktop, setIsDesktop] = useState(false)

  const isTournois = pathname?.startsWith('/player/tournois')

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
    
    if (isTournois) {
      if (niveau) params.set('niveau', niveau)
      if (genre) params.set('genre', genre)
      router.push(`/player/tournois${params.toString() ? `?${params.toString()}` : ''}`)
    } else {
      router.push(`/player/clubs${params.toString() ? `?${params.toString()}` : ''}`)
    }
  }

  const barStyle: CSSProperties | undefined = isDesktop
    ? {
        width: isTournois ? '28cm' : '22.4cm',
        height: '1.7cm',
        minWidth: isTournois ? '28cm' : '22.4cm',
        maxWidth: isTournois ? '28cm' : '22.4cm',
        minHeight: '1.7cm',
        maxHeight: '1.7cm',
        boxSizing: 'border-box',
        marginLeft: 'auto',
        marginRight: 'auto',
      }
    : undefined

  /* Mobile : barre simple cliquable → /player/clubs (recherche + filtres) */
  if (!isDesktop) {
    return (
      <div className={`px-6 md:px-6 lg:px-8 py-3 transition-all duration-300 ${compact ? 'py-2' : ''}`}>
        <div className="w-full flex justify-center">
          <button
            type="button"
            onClick={() => router.push('/player/clubs')}
            data-testid="home-search-mobile"
            className="w-full flex items-center justify-center gap-3 rounded-full border border-gray-300 bg-white px-4 py-3 font-sans min-h-[2.75rem]"
          >
            <svg className="w-5 h-5 text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-[14px] font-normal text-gray-600">
              {t('accueil.searchMobilePlaceholder')}
            </span>
          </button>
        </div>
      </div>
    )
  }

  /* Desktop : barre complète Où | Dates | loupe */
  return (
    <div className={`px-3 md:px-6 lg:px-8 transition-all duration-300 ${compact ? 'py-1.5 md:py-2' : 'py-3 md:py-4 lg:py-6'}`}>
      <div className="w-full flex justify-center">
        <div
          data-testid="home-search"
          style={barStyle}
          className="flex items-center rounded-full border border-gray-200 bg-white shadow-sm overflow-hidden font-sans"
        >
          {/* Partie gauche : Où */}
          <div className={`flex-1 min-w-0 flex flex-col justify-center pl-[0.8cm] overflow-hidden ${compact ? 'pr-2 py-0.5 sm:pr-2.5' : 'pr-2.5 py-1 sm:pr-3.5'}`}>
            <label className="block text-[12px] font-medium text-black mb-1.5 leading-none">
              {t('accueil.searchOu')}
            </label>
            <input
              type="text"
              value={searchOu}
              onChange={(e) => setSearchOu(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('accueil.searchPlaceholder')}
              className="w-full h-full text-[15px] font-normal text-gray-800 placeholder:text-gray-400 bg-transparent focus:outline-none"
            />
          </div>

          {/* Trait vertical */}
          <div className="hidden sm:flex flex-shrink-0 items-center self-stretch py-2" aria-hidden>
            <div className="w-px h-6 bg-gray-200/60" />
          </div>

          {/* Partie droite : Dates */}
          <div className={`flex-1 min-w-0 flex flex-col justify-center pl-[0.4cm] overflow-hidden ${compact ? 'pr-2 py-0.5 sm:pr-2.5' : 'pr-2.5 py-1 sm:pr-3.5'}`}>
            <label className="block text-[12px] font-medium text-black mb-1.5 leading-none">
              {t('accueil.searchDates')}
            </label>
            <input
              type="text"
              value={searchQuand}
              onChange={(e) => setSearchQuand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('accueil.searchQuand')}
              className="w-full h-full text-[15px] font-normal text-gray-800 placeholder:text-gray-400 bg-transparent focus:outline-none"
            />
          </div>

          {/* Filtres supplémentaires pour Tournois uniquement */}
          {isTournois && (
            <>
              {/* Trait vertical */}
              <div className="hidden sm:flex flex-shrink-0 items-center self-stretch py-2" aria-hidden>
                <div className="w-px h-6 bg-gray-200/60" />
              </div>

              {/* Filtre Niveau */}
              <div className={`flex-1 min-w-0 flex flex-col justify-center pl-[0.4cm] overflow-hidden ${compact ? 'pr-2 py-0.5 sm:pr-2.5' : 'pr-2.5 py-1 sm:pr-3.5'}`}>
                <label className="block text-[12px] font-medium text-black mb-1.5 leading-none">
                  Niveau
                </label>
                <select
                  value={niveau}
                  onChange={(e) => setNiveau(e.target.value)}
                  className="w-full text-[15px] font-normal text-gray-800 bg-transparent focus:outline-none cursor-pointer appearance-none"
                  style={{ 
                    height: 'auto',
                    lineHeight: '1.5',
                    padding: 0,
                    margin: 0
                  }}
                >
                  <option value="" className="text-gray-400">Tous niveaux</option>
                  <option value="P25">P25</option>
                  <option value="P100">P100</option>
                  <option value="P250">P250</option>
                  <option value="P500">P500</option>
                  <option value="P1000">P1000</option>
                  <option value="P1500">P1500</option>
                  <option value="P2000">P2000</option>
                </select>
              </div>

              {/* Trait vertical */}
              <div className="hidden sm:flex flex-shrink-0 items-center self-stretch py-2" aria-hidden>
                <div className="w-px h-6 bg-gray-200/60" />
              </div>

              {/* Filtre Genre */}
              <div className={`flex-1 min-w-0 flex flex-col justify-center pl-[0.4cm] overflow-hidden ${compact ? 'pr-2 py-0.5 sm:pr-2.5' : 'pr-2.5 py-1 sm:pr-3.5'}`}>
                <label className="block text-[12px] font-medium text-black mb-1.5 leading-none">
                  Genre
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full text-[15px] font-normal text-gray-800 bg-transparent focus:outline-none cursor-pointer appearance-none"
                  style={{ 
                    height: 'auto',
                    lineHeight: '1.5',
                    padding: 0,
                    margin: 0
                  }}
                >
                  <option value="" className="text-gray-400">Tous</option>
                  <option value="Hommes">Hommes</option>
                  <option value="Femmes">Femmes</option>
                  <option value="Mixte">Mixte</option>
                </select>
              </div>
            </>
          )}

          {/* Bouton loupe */}
          <button
            type="button"
            onClick={handleSearch}
            className={`flex items-center justify-center shrink-0 rounded-full bg-gray-900 text-white hover:bg-gray-800 active:scale-95 transition-all origin-center ${compact ? 'w-5 h-5 sm:w-6 sm:h-6 m-1' : 'w-7 h-7 sm:w-8 sm:h-8 m-1.5'} lg:-translate-x-[0.7cm] lg:scale-[1.385]`}
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
