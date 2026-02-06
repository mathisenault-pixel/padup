'use client'

import { ReactNode } from 'react'
import AutocompleteInput from './AutocompleteInput'

type SearchBarField = {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'select'
  options?: { value: string; label: string }[]
  suggestions?: string[]
}

type PageHeaderProps = {
  title: string
  subtitle: string
  leftField: SearchBarField
  rightField: SearchBarField
  buttonLabel: string
  onSearch: () => void
  onFiltersClick?: () => void
  activeFiltersCount?: number
}

export default function PageHeader({
  title,
  subtitle,
  leftField,
  rightField,
  buttonLabel,
  onSearch,
  onFiltersClick,
  activeFiltersCount = 0
}: PageHeaderProps) {
  return (
    <div className="mb-8 md:mb-12">
      {/* Titre + Sous-titre centrés */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          {title}
        </h1>
        <p className="text-base md:text-lg text-slate-600">
          {subtitle}
        </p>
      </div>

      {/* Barre de recherche unifiée */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-3 flex items-stretch gap-0">
          {/* Champ gauche - avec autocomplete si suggestions fournies */}
          {leftField.suggestions && leftField.suggestions.length > 0 ? (
            <AutocompleteInput
              label={leftField.label}
              placeholder={leftField.placeholder}
              value={leftField.value}
              onChange={leftField.onChange}
              suggestions={leftField.suggestions}
            />
          ) : (
            <div className="flex-1 px-4 py-2">
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

          {/* Séparateur vertical */}
          <div className="w-px bg-slate-200 self-stretch my-2"></div>

          {/* Champ droit */}
          {rightField.type === 'select' && rightField.options ? (
            <div className="flex-1 px-4 py-2">
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
            <AutocompleteInput
              label={rightField.label}
              placeholder={rightField.placeholder}
              value={rightField.value}
              onChange={rightField.onChange}
              suggestions={rightField.suggestions}
            />
          ) : (
            <div className="flex-1 px-4 py-2">
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

          {/* Bouton Filtres (optionnel) */}
          {onFiltersClick && (
            <>
              <div className="w-px bg-slate-200 self-stretch my-2"></div>
              <button
                onClick={onFiltersClick}
                className="relative px-4 py-3 bg-slate-50 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0 flex items-center gap-2 border border-slate-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span className="text-sm">Filtres</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </>
          )}

          {/* Bouton Rechercher */}
          <button
            onClick={onSearch}
            className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
