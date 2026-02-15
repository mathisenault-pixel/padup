'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signUpWithEmail } from '@/lib/clubAuth'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export default function ClubAuthSignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    clubName: '',
    city: '',
    clubCode: '',
    phone: '',
    address: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // Check si déjà connecté au chargement
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession()
      
      if (session) {
        console.log('[Club Auth Signup] ✅ Session déjà existante -> redirect dashboard')
        router.replace('/club/hangar/dashboard')
        return
      }
      
      setIsCheckingSession(false)
    }

    checkSession()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const generateClubCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    setFormData({
      ...formData,
      clubCode: `PADUP-${randomNum}`,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (!formData.clubCode) {
      setError('Veuillez générer un code club')
      return
    }

    setIsLoading(true)

    try {
      const { club, error: signUpError } = await signUpWithEmail(
        formData.email,
        formData.password,
        {
          name: formData.clubName,
          city: formData.city,
          club_code: formData.clubCode,
          phone: formData.phone,
          address: formData.address,
        }
      )

      if (signUpError || !club) {
        setError(signUpError?.message || 'Erreur lors de la création du compte')
        return
      }

      console.log('[Club Auth Signup] ✅ Club créé:', club)

      // Redirection DIRECT vers le dashboard Hangar
      router.replace('/club/hangar/dashboard')
    } catch (err: any) {
      console.error('[Club Auth Signup] Error:', err)
      setError('Une erreur est survenue lors de la création du compte')
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Pad'up</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Créer votre espace club</h2>
          <p className="text-gray-600">Rejoignez la plateforme de réservation de padel</p>
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

            {/* Section: Informations du club */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Informations du club</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="clubName" className="block text-sm font-semibold text-gray-900 mb-2">
                    Nom du club *
                  </label>
                  <input
                    id="clubName"
                    name="clubName"
                    type="text"
                    value={formData.clubName}
                    onChange={handleChange}
                    placeholder="Padel Center Paris"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-900 mb-2">
                    Ville *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Paris"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="clubCode" className="block text-sm font-semibold text-gray-900 mb-2">
                    Code club *
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="clubCode"
                      name="clubCode"
                      type="text"
                      value={formData.clubCode}
                      onChange={handleChange}
                      placeholder="PADUP-1234"
                      required
                      readOnly
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={generateClubCode}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Générer
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Ce code sera utilisé par vos clients pour réserver
                  </p>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                    Téléphone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="01 23 45 67 89"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-gray-900 mb-2">
                    Adresse
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Rue Example, 75001 Paris"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section: Compte administrateur */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Compte administrateur</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                    Mot de passe *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Au moins 6 caractères
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Création du compte...' : 'Créer mon espace club'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <button
                onClick={() => router.push('/club/auth/login')}
                className="text-slate-700 font-semibold hover:text-slate-900"
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
