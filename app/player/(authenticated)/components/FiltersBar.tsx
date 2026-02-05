'use client'

import { useState, ReactNode } from 'react'

type FilterButton = {
  id: string
  label: string
  count?: number
  icon?: ReactNode
}

type FilterDropdown = {
  id: string
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

type FiltersBarProps = {
  // Recherche (optionnel)
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  searchValue?: string
  
  // Boutons de filtre (ex: Tous, Parties, Tournois)
  filterButtons?: FilterButton[]
  activeFilter?: string
  onFilterChange?: (filterId: string) => void
  
  // Dropdowns (ex: Trier par)
  dropdowns?: FilterDropdown[]
  
  // Chips de filtres actifs
  activeChips?: { id: string; label: string; onRemove: () => void }[]
  
  // Bouton réinitialiser
  onReset?: () => void
  showReset?: boolean
  
  // Style compact ou non
  variant?: 'default' | 'compact'
}

export default function FiltersBar({
  searchPlaceholder,
  onSearch,
  searchValue = '',
  filterButtons = [],
  activeFilter,
  onFilterChange,
  dropdowns = [],
  activeChips = [],
  onReset,
  showReset = false,
  variant = 'default'
}: FiltersBarProps) {
  const [searchInput, setSearchInput] = useState(searchValue)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    onSearch?.(value)
  }

  return (
    <>
      {/* Desktop Filters Bar */}
      <div className="hidden lg:block">
        <div className="flex items-center gap-3 py-3 border-b border-slate-200">
          {/* Recherche (si présente) */}
          {onSearch && (
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-11 pl-10 pr-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900 placeholder-slate-400 transition-all"
                />
                <svg 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          )}

          {/* Filtres boutons */}
          {filterButtons.length > 0 && (
            <div className="flex items-center gap-2">
              {filterButtons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => onFilterChange?.(button.id)}
                  className={`inline-flex items-center gap-2 h-11 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                    activeFilter === button.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
                  }`}
                >
                  {button.icon && <span className="text-lg">{button.icon}</span>}
                  {button.label}
                  {button.count !== undefined && (
                    <span className={`ml-1 ${activeFilter === button.id ? 'opacity-80' : 'opacity-60'}`}>
                      ({button.count})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Dropdowns */}
          {dropdowns.length > 0 && (
            <div className="flex items-center gap-2">
              {dropdowns.map((dropdown) => (
                <div key={dropdown.id} className="relative">
                  <select
                    value={dropdown.value}
                    onChange={(e) => dropdown.onChange(e.target.value)}
                    className="h-11 pl-4 pr-10 text-sm font-medium border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-700 cursor-pointer appearance-none transition-all"
                  >
                    {dropdown.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <svg 
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              ))}
            </div>
          )}

          {/* Bouton reset */}
          {showReset && onReset && (
            <button
              onClick={onReset}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium underline decoration-dotted underline-offset-4"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Chips de filtres actifs */}
        {activeChips.length > 0 && (
          <div className="flex items-center gap-2 py-3 flex-wrap">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Filtres actifs :</span>
            {activeChips.map((chip) => (
              <button
                key={chip.id}
                onClick={chip.onRemove}
                className="inline-flex items-center gap-2 h-8 px-3 text-sm font-medium bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
              >
                {chip.label}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Filters Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="w-full flex items-center justify-center gap-2 h-11 px-4 text-sm font-medium bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filtres
          {activeChips.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-slate-900 text-white text-xs font-bold rounded-full">
              {activeChips.length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Filtres</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Recherche mobile */}
            {onSearch && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Recherche
                </label>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-11 px-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900 placeholder-slate-400"
                />
              </div>
            )}

            {/* Filtres boutons mobile */}
            {filterButtons.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Filtrer par
                </label>
                <div className="space-y-2">
                  {filterButtons.map((button) => (
                    <button
                      key={button.id}
                      onClick={() => {
                        onFilterChange?.(button.id)
                        setShowMobileFilters(false)
                      }}
                      className={`w-full flex items-center gap-3 h-11 px-4 text-sm font-medium rounded-lg transition-all ${
                        activeFilter === button.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {button.icon && <span className="text-lg">{button.icon}</span>}
                      <span className="flex-1 text-left">{button.label}</span>
                      {button.count !== undefined && (
                        <span className="opacity-70">({button.count})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dropdowns mobile */}
            {dropdowns.length > 0 && (
              <div className="mb-4">
                {dropdowns.map((dropdown) => (
                  <div key={dropdown.id} className="mb-4">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      {dropdown.label}
                    </label>
                    <select
                      value={dropdown.value}
                      onChange={(e) => dropdown.onChange(e.target.value)}
                      className="w-full h-11 px-4 text-sm font-medium border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-slate-700"
                    >
                      {dropdown.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              {showReset && onReset && (
                <button
                  onClick={() => {
                    onReset()
                    setShowMobileFilters(false)
                  }}
                  className="flex-1 h-11 px-4 text-sm font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Réinitialiser
                </button>
              )}
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 h-11 px-4 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
