'use client'

import { useState, useRef, useEffect } from 'react'

type AutocompleteInputProps = {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  suggestions?: string[]
}

export default function AutocompleteInput({
  label,
  placeholder,
  value,
  onChange,
  suggestions = []
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filtrer les suggestions basées sur la valeur actuelle
  const filteredSuggestions = suggestions.filter(s =>
    s.toLowerCase().includes(value.toLowerCase())
  )

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Gestion clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
        setHighlightedIndex(0)
      }
      return
    }

    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
          onChange(filteredSuggestions[highlightedIndex])
          setIsOpen(false)
          setHighlightedIndex(-1)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion)
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }

  return (
    <div ref={containerRef} className="relative flex-1 px-4 py-2">
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (filteredSuggestions.length > 0) setIsOpen(true)
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
      />

      {/* Dropdown suggestions */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                index === highlightedIndex
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Message "Aucun résultat" */}
      {isOpen && value && filteredSuggestions.length === 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50">
          <p className="text-sm text-slate-500 text-center">Aucun résultat</p>
        </div>
      )}
    </div>
  )
}
