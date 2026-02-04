'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'

interface LoginClientProps {
  callbackUrl?: string
}

export default function LoginClient({ callbackUrl }: LoginClientProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const action = (e.nativeEvent as SubmitEvent).submitter?.getAttribute('data-action')

    console.log('[LOGIN] Form submitted, action:', action)
    console.log('[LOGIN] Email:', email)

    try {
      if (action === 'signup') {
        // ✅ INSCRIPTION avec Supabase
        console.log('[LOGIN] Calling signUp...')
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (signUpError) {
          console.error('[LOGIN] ❌ Sign up error:', signUpError)
          setError(signUpError.message)
          setIsPending(false)
          return
        }

        console.log('[LOGIN] ✅ Sign up successful')
        console.log('[LOGIN OK]', data.user?.id)
        
        // Vérifier la session
        const sessionResult = await supabase.auth.getSession()
        console.log('[SESSION]', sessionResult)
        
        // Si l'email confirmation est requise
        if (data.user && !data.session) {
          setError('Veuillez vérifier votre email pour confirmer votre inscription')
          setIsPending(false)
          return
        }

        // Redirection vers la page clubs
        router.push('/player/clubs')
      } else {
        // ✅ CONNEXION avec Supabase
        console.log('[LOGIN] Calling signInWithPassword...')
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          console.error('[LOGIN] ❌ Sign in error:', signInError)
          setError(signInError.message)
          setIsPending(false)
          return
        }

        console.log('[LOGIN] ✅ Sign in successful')
        console.log('[LOGIN OK]', data.user?.id)
        console.log('[LOGIN] User email:', data.user?.email)
        
        // Vérifier la session
        const sessionResult = await supabase.auth.getSession()
        console.log('[SESSION]', sessionResult)
        console.log('[SESSION] Access token:', sessionResult.data.session?.access_token?.substring(0, 20) + '...')

        // Redirection vers la page clubs
        router.push('/player/clubs')
      }
    } catch (err) {
      console.error('[LOGIN] ❌ Unexpected error:', err)
      setError('Une erreur inattendue est survenue')
      setIsPending(false)
    }
  }

  const isRedirected = callbackUrl && callbackUrl !== '/player/accueil'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Effets de fond premium */}
      <div className="absolute inset-0 bg-[url('/images/texture.png')] opacity-5"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Bouton retour premium */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/player/accueil')}
            className="group flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-all"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l&apos;accueil
          </button>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 animate-scale-in">
          {/* Logo et titre premium */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-xl p-2">
              <img 
                src="/icon.png" 
                alt="Pad'Up Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Bienvenue</h1>
            <p className="text-gray-600 text-lg">Connectez-vous à votre espace</p>
          </div>

          {/* Message si redirigé depuis une page protégée */}
          {isRedirected && (
            <div className="mb-8 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900 mb-1">Connexion requise</p>
                  <p className="text-sm text-blue-800">Connectez-vous pour accéder à cette page</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-3">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={isPending}
                className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 text-gray-900 font-medium placeholder:text-gray-400"
                placeholder="vous@exemple.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-3">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isPending}
                minLength={6}
                className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 text-gray-900 font-medium placeholder:text-gray-400"
                placeholder="••••••••"
              />
              <p className="mt-2 text-xs text-gray-500">Minimum 6 caractères</p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                data-action="signin"
                disabled={isPending}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 hover:scale-105"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Connexion...
                  </span>
                ) : (
                  'Connexion'
                )}
              </button>
              <button
                type="submit"
                data-action="signup"
                disabled={isPending}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 hover:scale-105"
              >
                Inscription
              </button>
            </div>
          </form>

          {/* Séparateur */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Nouveau sur Pad&apos;Up ?</span>
            </div>
          </div>

          {/* Info premium */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Créez un compte pour réserver vos terrains<br />et accéder aux tournois exclusifs
            </p>
          </div>
        </div>

        {/* Footer légal */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white/60">
            En vous connectant, vous acceptez nos{' '}
            <a href="/conditions-utilisation" target="_blank" className="underline hover:text-white/90 transition-colors">Conditions d&apos;utilisation</a>
            {' '}et notre{' '}
            <a href="/confidentialite" target="_blank" className="underline hover:text-white/90 transition-colors">Politique de confidentialité</a>
          </p>
        </div>
      </div>
    </div>
  )
}
