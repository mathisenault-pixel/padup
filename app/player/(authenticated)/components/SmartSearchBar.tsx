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
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
        ).slice(0, 3)
      : suggestions.slice(0, 3)

    return [
      ...history.map(h => ({ icon: '🕐', text: h, type: 'history' as const })),
      ...filteredSuggestions.map(s => ({ icon: '💡', text: s, type: 'suggestion' as const }))
    ].slice(0, 5)
  }, [query, suggestions, history])

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Gestion du clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false)
        setIsFocused(false)
        inputRef.current?.blur()
      }
    }

    if (showDropdown) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showDropdown])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className={`relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 ${
        isFocused ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}>
        <div className="flex items-center gap-3 px-4">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (e.target.value.length > 0) {
                setShowDropdown(true)
              }
            }}
            onFocus={() => {
              setIsFocused(true)
              if (history.length > 0 || suggestions.length > 0) {
                setShowDropdown(true)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(query)
              }
            }}
            className="flex-1 py-3 text-base focus:outline-none bg-transparent placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="flex-shrink-0 w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Dropdown compact avec historique et suggestions */}
      {showDropdown && allSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fade-in">
          {/* Liste des suggestions - Version compacte */}
          <div className="max-h-64 overflow-y-auto">
            {allSuggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${index}`}
                onClick={() => {
                  setQuery(suggestion.text)
                  handleSearch(suggestion.text)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-all group text-left"
              >
                <span className="text-lg flex-shrink-0">{suggestion.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate text-sm">
                    {suggestion.text}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          {/* Footer minimaliste */}
          {history.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Historique de recherche</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setHistory([])
                  localStorage.removeItem(storageKey)
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
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
