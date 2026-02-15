'use client'

import { ReactNode, useEffect, useState } from 'react'
import AutocompleteInput from './AutocompleteInput'
import DatePicker from './DatePicker'
import { useScrollDirection } from '@/hooks/useScrollDirection'

type SearchBarField = {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'select' | 'date'
  options?: { value: string; label: string }[]
  suggestions?: string[]
}

type PageHeaderProps = {
  title: string
  subtitle: string
  leftField: SearchBarField
  middleField?: SearchBarField
  rightField: SearchBarField
  buttonLabel: string
  onSearch: () => void
  onFiltersClick?: () => void
  activeFiltersCount?: number
  enableScrollAnimation?: boolean
}

export default function PageHeader({
  title,
  subtitle,
  leftField,
  middleField,
  rightField,
  buttonLabel,
  onSearch,
  onFiltersClick,
  activeFiltersCount = 0,
  enableScrollAnimation = false
}: PageHeaderProps) {
  const { scrollDirection, scrollY } = useScrollDirection(10)
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    setIsSticky(scrollY > 100)
  }, [scrollY])

  // Calculer l'opacité et la transformation du header (titre + sous-titre)
  const headerOpacity = Math.max(0, 1 - scrollY / 150)
  const headerTranslateY = Math.min(scrollY / 3, 30)

  if (!enableScrollAnimation) {
    // Version cachée par défaut (comportement actuel)
    return (
      <>
        <div className="hidden">
          <h1 className="text-2xl font-bold text-black">
            {title}
          </h1>
        </div>
        <div className="hidden mb-8 md:mb-12">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {title}
            </h1>
            <p className="text-base md:text-lg text-slate-600">
              {subtitle}
            </p>
          </div>

          {/* Barre de recherche unifiée */}
          <div className="w-full max-w-6xl mx-auto px-4 min-w-0">
            <SearchBar
              leftField={leftField}
              middleField={middleField}
              rightField={rightField}
              buttonLabel={buttonLabel}
              onSearch={onSearch}
              onFiltersClick={onFiltersClick}
              activeFiltersCount={activeFiltersCount}
            />
          </div>
        </div>
      </>
    )
  }

  // Version avec animation de scroll
  return (
    <div className="relative mb-8">
      {/* Titre + Sous-titre avec animation de disparition */}
      <div
        className="text-center transition-all duration-500 ease-out"
        style={{
          opacity: headerOpacity,
          transform: `translateY(-${headerTranslateY}px)`,
          pointerEvents: headerOpacity < 0.1 ? 'none' : 'auto',
        }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          {title}
        </h1>
        <p className="text-base md:text-lg text-slate-600 mb-6">
          {subtitle}
        </p>
      </div>

      {/* Barre de recherche sticky */}
      <div
        className={`transition-all duration-300 ease-out ${
          isSticky
            ? 'fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg py-4'
            : 'relative'
        }`}
      >
        <div className="w-full max-w-6xl mx-auto px-4 min-w-0">
          <SearchBar
            leftField={leftField}
            middleField={middleField}
            rightField={rightField}
            buttonLabel={buttonLabel}
            onSearch={onSearch}
            onFiltersClick={onFiltersClick}
            activeFiltersCount={activeFiltersCount}
          />
        </div>
      </div>

      {/* Spacer pour éviter le jump de contenu quand la barre devient sticky */}
      {isSticky && <div className="h-20"></div>}
    </div>
  )
}

// Composant interne pour la barre de recherche (réutilisable)
function SearchBar({
  leftField,
  middleField,
  rightField,
  buttonLabel,
  onSearch,
  onFiltersClick,
  activeFiltersCount,
}: {
  leftField: SearchBarField
  middleField?: SearchBarField
  rightField: SearchBarField
  buttonLabel: string
  onSearch: () => void
  onFiltersClick?: () => void
  activeFiltersCount: number
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center gap-3 w-full min-w-0">
      {/* Zone inputs */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Champ gauche */}
        {leftField.suggestions && leftField.suggestions.length > 0 ? (
          <div className="flex-1 min-w-0">
            <AutocompleteInput
              label={leftField.label}
              placeholder={leftField.placeholder}
              value={leftField.value}
              onChange={leftField.onChange}
              suggestions={leftField.suggestions}
            />
          </div>
        ) : (
          <div className="flex-1 px-4 py-2 min-w-0">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {leftField.label}
            </label>
            <input
              type="text"
              value={leftField.value}
              onChange={(e) => leftField.onChange(e.target.value)}
              placeholder={leftField.placeholder}
              className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>
        )}

        {/* Séparateur si middleField existe */}
        {middleField && <div className="hidden md:block w-px bg-slate-200 self-stretch"></div>}

        {/* Champ du milieu (optionnel) */}
        {middleField && (
          <>
            {middleField.type === 'date' ? (
              <div className="flex-1 min-w-0">
                <DatePicker
                  label={middleField.label}
                  placeholder={middleField.placeholder}
                  value={middleField.value}
                  onChange={middleField.onChange}
                />
              </div>
            ) : middleField.suggestions && middleField.suggestions.length > 0 ? (
              <div className="flex-1 min-w-0">
                <AutocompleteInput
                  label={middleField.label}
                  placeholder={middleField.placeholder}
                  value={middleField.value}
                  onChange={middleField.onChange}
                  suggestions={middleField.suggestions}
                />
              </div>
            ) : (
              <div className="flex-1 px-4 py-2 min-w-0">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {middleField.label}
                </label>
                <input
                  type="text"
                  value={middleField.value}
                  onChange={(e) => middleField.onChange(e.target.value)}
                  placeholder={middleField.placeholder}
                  className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
              </div>
            )}
          </>
        )}

        {/* Séparateur */}
        <div className="hidden md:block w-px bg-slate-200 self-stretch"></div>

        {/* Champ droit */}
        {rightField.type === 'select' && rightField.options ? (
          <div className="flex-1 px-4 py-2 min-w-0">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {rightField.label}
            </label>
            <select
              value={rightField.value}
              onChange={(e) => rightField.onChange(e.target.value)}
              className="w-full text-sm text-slate-900 focus:outline-none bg-transparent cursor-pointer"
            >
              {rightField.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ) : rightField.suggestions && rightField.suggestions.length > 0 ? (
          <div className="flex-1 min-w-0">
            <AutocompleteInput
              label={rightField.label}
              placeholder={rightField.placeholder}
              value={rightField.value}
              onChange={rightField.onChange}
              suggestions={rightField.suggestions}
            />
          </div>
        ) : (
          <div className="flex-1 px-4 py-2 min-w-0">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {rightField.label}
            </label>
            <input
              type="text"
              value={rightField.value}
              onChange={(e) => rightField.onChange(e.target.value)}
              placeholder={rightField.placeholder}
              className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>
        )}
      </div>

      {/* Zone boutons */}
      <div className="w-full flex flex-col gap-2 md:flex-row md:w-auto md:items-center">
        {onFiltersClick && (
          <div className="hidden md:block w-px bg-slate-200 h-10"></div>
        )}

        <button
          onClick={onSearch}
          className="h-10 px-4 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors w-full md:w-auto flex-shrink-0"
        >
          {buttonLabel}
        </button>

        {onFiltersClick && (
          <button
            onClick={onFiltersClick}
            className="relative h-10 px-3 bg-slate-50 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-100 transition-colors w-full md:w-auto flex-shrink-0 flex items-center justify-center gap-2 border border-slate-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
