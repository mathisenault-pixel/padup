'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginClub } from '@/lib/clubAuth'

export default function ClubLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = loginClub(email, password)

      if (result.success) {
        console.log('[Club Login] ✅ Success:', result.session)
        router.push('/club')
      } else {
        setError(result.error || 'Erreur de connexion')
      }
    } catch (err) {
      setError('Erreur inattendue')
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
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@club.fr"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe
            </label>
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

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-semibold text-gray-700 mb-2">📌 Identifiants démo (MVP):</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Email: <code className="bg-white px-2 py-0.5 rounded">admin@lehangar.fr</code></li>
            <li>• Email: <code className="bg-white px-2 py-0.5 rounded">admin@pauletlouis.fr</code></li>
            <li>• Email: <code className="bg-white px-2 py-0.5 rounded">admin@zepadel.fr</code></li>
            <li>• Mot de passe: <code className="bg-white px-2 py-0.5 rounded">club2026</code></li>
          </ul>
        </div>

        {/* Back to player */}
        <div className="mt-6 text-center">
          <a href="/player/clubs" className="text-sm text-slate-700 hover:underline">
            ← Retour à l'espace joueur
          </a>
        </div>
      </div>
    </div>
  )
}
