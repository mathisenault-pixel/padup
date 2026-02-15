'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmail } from '@/lib/clubAuth'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export default function ClubAuthLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // Check si déjà connecté au chargement
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession()
      
      if (session) {
        console.log('[Club Auth Login] ✅ Session déjà existante -> redirect dashboard')
        router.replace('/club/hangar/dashboard')
        return
      }
      
      setIsCheckingSession(false)
    }

    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { user, error: signInError } = await signInWithEmail(email, password)

      if (signInError || !user) {
        setError('Email ou mot de passe incorrect')
        return
      }

      console.log('[Club Auth Login] ✅ Connexion réussie:', user.id)

      // Redirection DIRECT vers le dashboard Hangar
      router.replace('/club/hangar/dashboard')
    } catch (err: any) {
      console.error('[Club Auth Login] Error:', err)
      setError('Une erreur est survenue lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  // Afficher un loader pendant la vérification de session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Pad'up</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Espace Club</h2>
          <p className="text-gray-600">Connectez-vous à votre compte</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <button
                onClick={() => router.push('/club/auth/signup')}
                className="text-slate-700 font-semibold hover:text-slate-900"
              >
                Créer un compte
              </button>
            </p>
            <p className="text-sm text-gray-600">
              <button
                onClick={() => router.push('/club/login')}
                className="text-gray-500 hover:text-gray-700"
              >
                → Ancien système de connexion (temporaire)
              </button>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Système d'authentification sécurisé</p>
              <p className="text-sm text-blue-700">
                Vos données sont protégées par Supabase Auth et Row Level Security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
