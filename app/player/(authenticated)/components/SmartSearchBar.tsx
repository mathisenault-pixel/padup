'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { debug } from '@/lib/debug'

type SearchSuggestion = {
  icon: string
  text: string
  type: 'history' | 'suggestion'
}

type SmartSearchBarProps = {
  placeholder: string
  onSearch: (query: string) => void
  suggestions: string[]
  storageKey: string
  className?: string
  compact?: boolean
}

export default function SmartSearchBar({ 
  placeholder, 
  onSearch, 
  suggestions, 
  storageKey,
  className = '',
  compact = false
}: SmartSearchBarProps) {
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Debug: compteur de renders
  debug.count('🔄 SmartSearchBar render')

  // Charger l'historique depuis localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(storageKey)
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [storageKey])

  // Sauvegarder l'historique dans localStorage (forme fonctionnelle pour éviter boucle)
  const saveToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    setHistory(prev => {
      const newHistory = [
        searchQuery,
        ...prev.filter(item => item !== searchQuery)
      ].slice(0, 3) // Garder seulement les 3 derniers
      
      localStorage.setItem(storageKey, JSON.stringify(newHistory))
      return newHistory
    })
  }, [storageKey])

  // Mémoïser le handler de recherche
  const handleSearch = useCallback((searchQuery: string) => {
    debug.log('🔍 [SEARCH] Start:', searchQuery)
    debug.time('search-duration')
    
    if (searchQuery.trim()) {
      saveToHistory(searchQuery)
      onSearch(searchQuery)
      setShowDropdown(false)
      setIsFocused(false)
      inputRef.current?.blur()
    }
    
    debug.timeEnd('search-duration')
    debug.log('🔍 [SEARCH] End')
  }, [onSearch, saveToHistory])

  // Mémoïser les suggestions filtrées (évite recalcul à chaque frappe)
  const allSuggestions: SearchSuggestion[] = useMemo(() => {
    const filteredSuggestions = query.trim()
      ? suggestions.filter(s => 
          s.toLowerCase().includes(query.toLowerCase())
        ) // Afficher TOUS les résultats qui correspondent
      : suggestions // Par défaut, montrer TOUTES les suggestions

    return [
      ...history.map(h => ({ icon: '🕐', text: h, type: 'history' as const })),
      ...filteredSuggestions.map(s => ({ icon: '💡', text: s, type: 'suggestion' as const }))
    ] // Pas de limite - TOUTES les suggestions
  }, [query, suggestions, history])

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
        setIsFocused(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Réinitialiser l'index quand les suggestions changent
  useEffect(() => {
    setSelectedIndex(-1)
  }, [query])

  // Scroll automatique vers la suggestion sélectionnée
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
    }
  }, [selectedIndex])

  // Gestion du clavier (flèches + Escape)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || allSuggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch(query)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < allSuggestions.length) {
          const selected = allSuggestions[selectedIndex]
          setQuery(selected.text)
          handleSearch(selected.text)
        } else {
          handleSearch(query)
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowDropdown(false)
        setIsFocused(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }, [showDropdown, allSuggestions, selectedIndex, query, handleSearch])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className={`relative bg-white border transition-all ${
        isFocused ? 'border-black shadow-lg' : 'border-black/10 shadow-md'
      }`}
      style={{ 
        borderRadius: '12px',
        transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div className={`flex items-center gap-3 ${compact ? 'px-5' : 'px-6'}`}>
          <svg className={`${compact ? 'w-5 h-5' : 'w-5 h-5'} flex-shrink-0 ${isFocused ? 'text-black' : 'text-black/40'}`} 
               fill="none" 
               stroke="currentColor" 
               viewBox="0 0 24 24"
               strokeWidth="1.5"
               style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(-1)
              setShowDropdown(true)
            }}
            onFocus={() => {
              setIsFocused(true)
              setShowDropdown(true) // Toujours afficher au focus
            }}
            onKeyDown={handleKeyDown}
            className={`flex-1 ${compact ? 'py-3.5 text-base' : 'py-4 text-base'} focus:outline-none bg-transparent placeholder:text-black/40 text-black font-light`}
            style={{ fontSize: '16px' }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setSelectedIndex(-1)
                inputRef.current?.focus()
              }}
              className={`flex-shrink-0 ${compact ? 'w-7 h-7' : 'w-8 h-8'} bg-black/5 hover:bg-black/10 rounded-full flex items-center justify-center`}
              style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <svg className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-black/60`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Dropdown élégant avec suggestions */}
      {showDropdown && allSuggestions.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-3 bg-white border border-black/10 overflow-hidden z-50 animate-fade-in"
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}
        >
          {/* Liste des suggestions */}
          <div className="max-h-[280px] overflow-y-auto">
            {allSuggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${index}`}
                ref={(el) => { suggestionRefs.current[index] = el }}
                onClick={() => {
                  setQuery(suggestion.text)
                  setSelectedIndex(-1)
                  handleSearch(suggestion.text)
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 text-left group ${
                  selectedIndex === index 
                    ? 'bg-black/5' 
                    : 'hover:bg-black/5'
                }`}
                style={{ transition: 'all 800ms cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                <div className="w-2 h-2 rounded-full bg-black/20 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className={`font-light truncate text-[15px] ${
                    selectedIndex === index
                      ? 'text-black'
                      : 'text-black/70'
                  }`}
                  style={{ transition: 'all 800ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    {suggestion.text}
                  </p>
                  {suggestion.type === 'history' && (
                    <p className="text-xs text-black/40 font-light mt-0.5">Recherche récente</p>
                  )}
                </div>
                <svg 
                  className={`w-4 h-4 flex-shrink-0 ${
                    selectedIndex === index
                      ? 'text-black'
                      : 'text-black/20'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  style={{ transition: 'all 800ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          {/* Footer pour effacer l'historique */}
          {history.length > 0 && (
            <div className="px-5 py-3 bg-black/[0.02] border-t border-black/5 flex items-center justify-between">
              <span className="text-xs text-black/40 font-light">Historique</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setHistory([])
                  localStorage.removeItem(storageKey)
                }}
                className="text-xs font-light text-black/60 hover:text-black"
                style={{ transition: 'all 800ms cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                Effacer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
