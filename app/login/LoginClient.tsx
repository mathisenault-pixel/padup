'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
import { useLocale } from '@/state/LocaleContext'

interface LoginClientProps {
  callbackUrl?: string
}

export default function LoginClient({ callbackUrl }: LoginClientProps) {
  const { t } = useLocale()
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
          setError(t('login.verifierEmail'))
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
      setError(t('login.erreurInattendue'))
      setIsPending(false)
    }
  }

  const isRedirected = callbackUrl && callbackUrl !== '/player/accueil'

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Bouton retour */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/player/accueil')}
            className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 font-normal transition-all"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('login.retourAccueil')}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-8 md:p-10">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-900 rounded-xl mb-5 p-2">
              <img 
                src="/icon.png" 
                alt="Pad'Up Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">{t('login.bienvenue')}</h1>
            <p className="text-gray-600 text-base">{t('login.connectezEspace')}</p>
          </div>

          {/* Message si redirigé depuis une page protégée */}
          {isRedirected && (
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">{t('login.connexionRequise')}</p>
                  <p className="text-sm text-gray-600">{t('login.connectezPage')}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                {t('login.adresseEmail')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={isPending}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 outline-none transition-all disabled:opacity-50 text-gray-900 placeholder:text-gray-400"
                placeholder={t('login.placeholderEmail')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                {t('login.motDePasse')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isPending}
                minLength={6}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 outline-none transition-all disabled:opacity-50 text-gray-900 placeholder:text-gray-400"
                placeholder="••••••••"
              />
              <p className="mt-2 text-xs text-gray-500">{t('login.min6car')}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                data-action="signin"
                disabled={isPending}
                className="flex-1 px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all disabled:opacity-50 active:scale-95"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {t('login.connexionEnCours')}
                  </span>
                ) : (
                  t('login.connexion')
                )}
              </button>
              <button
                type="submit"
                data-action="signup"
                disabled={isPending}
                className="flex-1 px-5 py-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-xl font-medium transition-all disabled:opacity-50 active:scale-95"
              >
                {t('login.inscription')}
              </button>
            </div>
          </form>

          {/* Séparateur */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">{t('login.nouveauSurPadup')}</span>
            </div>
          </div>

          {/* Info */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('login.creezCompte')}
            </p>
          </div>
        </div>

        {/* Footer légal */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            En vous connectant, vous acceptez nos{' '}
            <a href="/conditions-utilisation" target="_blank" className="underline hover:text-gray-900 transition-colors">Conditions d&apos;utilisation</a>
            {' '}et notre{' '}
            <a href="/confidentialite" target="_blank" className="underline hover:text-gray-900 transition-colors">Politique de confidentialité</a>
          </p>
        </div>
      </div>
    </div>
  )
}
