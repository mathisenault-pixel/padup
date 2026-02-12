'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
import { getCitySuggestions } from '@/lib/cities'
import Link from 'next/link'

type Club = {
  id: string
  name: string
  city: string
  address?: string
  courts_count?: number
  rating?: number
}

export default function RecherchePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchOu, setSearchOu] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const suggestions = [
    'Paris',
    'Lyon', 
    'Marseille',
    'Toulouse',
    'Nice',
    'Nantes',
    'Bordeaux',
    'Le Hangar Sport & Co',
    'Paul & Louis Sport',
    'ZE Padel',
    'QG Padel',
    ...getCitySuggestions()
  ]

  const filteredSuggestions = searchOu.trim()
    ? suggestions.filter(s => s.toLowerCase().includes(searchOu.toLowerCase())).slice(0, 8)
    : suggestions.slice(0, 8)

  const handleSearch = async () => {
    if (!searchOu.trim()) {
      return
    }

    setIsLoading(true)
    setHasSearched(true)
    setShowSuggestions(false)

    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name, city, address, courts_count, rating')
        .or(`name.ilike.%${searchOu}%,city.ilike.%${searchOu}%`)
        .order('name')

      if (error) {
        console.error('Erreur de recherche:', error)
      } else {
        setClubs(data || [])
      }
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setSearchOu(q)
      setHasSearched(true)
      handleSearch()
    }
  }, [])

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-black/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-black/5 rounded-full"
            style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-black tracking-tight">Recherche</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Champ Où */}
        <div>
          <label className="block text-sm font-light text-black/60 mb-2 tracking-wide">
            Où souhaitez-vous jouer ?
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchOu}
              onChange={(e) => {
                setSearchOu(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Ville ou club (ex : Paris, Lyon...)"
              className="w-full px-4 py-4 border border-black/10 rounded-xl focus:border-black focus:outline-none text-black font-light placeholder:text-black/40 shadow-sm"
              style={{ 
                fontSize: '16px',
                transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />

            {/* Suggestions dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-black/10 rounded-xl overflow-hidden z-50 shadow-lg"
              >
                <div className="max-h-[300px] overflow-y-auto">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchOu(suggestion)
                        setShowSuggestions(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/5"
                      style={{ transition: 'all 800ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                    >
                      <div className="w-2 h-2 rounded-full bg-black/20 flex-shrink-0"></div>
                      <p className="font-light text-black/70 text-[15px]">{suggestion}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Champ Date */}
        <div>
          <label className="block text-sm font-light text-black/60 mb-2 tracking-wide">
            Quand ?
          </label>
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="w-full px-4 py-4 border border-black/10 rounded-xl focus:border-black focus:outline-none text-black font-light shadow-sm"
            style={{ 
              fontSize: '16px',
              transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </div>

        {/* Bouton de recherche */}
        <button
          onClick={handleSearch}
          disabled={!searchOu.trim() || isLoading}
          className="w-full py-4 bg-black text-white font-light rounded-xl disabled:bg-black/20 disabled:text-black/40 hover:bg-black/80"
          style={{ 
            transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: '48px'
          }}
        >
          {isLoading ? 'Recherche...' : 'Rechercher'}
        </button>

        {/* Résultats */}
        {hasSearched && (
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black tracking-tight">
                {clubs.length} {clubs.length > 1 ? 'clubs trouvés' : 'club trouvé'}
              </h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : clubs.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-black/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-black/50 font-light">Aucun club trouvé</p>
                <p className="text-sm text-black/40 font-light mt-1">Essayez avec une autre recherche</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clubs.map((club) => (
                  <Link
                    key={club.id}
                    href={`/player/clubs/${club.id}/reserver`}
                    className="block p-4 border border-black/10 rounded-xl hover:border-black/20 hover:shadow-md"
                    style={{ transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                  >
                    <h3 className="font-semibold text-black mb-1 tracking-tight">{club.name}</h3>
                    <p className="text-sm text-black/60 font-light">{club.city}</p>
                    {club.courts_count && (
                      <p className="text-xs text-black/40 font-light mt-2">
                        {club.courts_count} terrain{club.courts_count > 1 ? 's' : ''}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
