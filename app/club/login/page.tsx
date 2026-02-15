'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'

export default function ClubLoginPage() {
  const router = useRouter()
  const [clubId, setClubId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data, error: loginError } = await supabase
        .from('clubs')
        .select('*')
        .eq('club_code', clubId)
        .eq('password', password)
        .single()

      if (data) {
        console.log('[Club Login] ✅ Success:', data)
        localStorage.setItem('club', JSON.stringify(data))
        router.push('/club/dashboard')
      } else {
        setError('Identifiant ou mot de passe incorrect')
      }
    } catch (err) {
      setError('Identifiant ou mot de passe incorrect')
      console.error('[Club Login] Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Espace Club</h1>
          <p className="text-gray-600">Connectez-vous pour gérer votre club</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code club */}
          <div>
            <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
              Identifiant club
            </label>
            <input
              id="code"
              type="text"
              value={clubId}
              onChange={(e) => setClubId(e.target.value.toUpperCase())}
              placeholder="Ex: PADUP-1234"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all font-mono uppercase"
            />
            <p className="text-xs text-gray-500 mt-1">Le code unique fourni par Pad&apos;Up lors de votre inscription</p>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Mot de passe
              </label>
              <button
                type="button"
                onClick={() => alert('Pour réinitialiser votre mot de passe, contactez-nous à contact@padup.one')}
                className="text-xs text-slate-700 hover:text-slate-900 underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Connexion...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Se connecter
              </>
            )}
          </button>
        </form>

        {/* Access request link */}
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-2">Vous n&apos;avez pas encore de code ?</p>
          <a 
            href="/club/signup" 
            className="text-sm font-semibold text-slate-700 hover:text-slate-900 underline"
          >
            Demander un accès club →
          </a>
        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <a href="/club-access" className="text-sm text-slate-700 hover:underline">
            ← Retour
          </a>
        </div>
      </div>
    </div>
  )
}
