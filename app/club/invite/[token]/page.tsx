'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export default function ClubInvitePage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isRedeeming, setIsRedeeming] = useState(false)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabaseBrowser.auth.getSession()
    setSession(session)
    setLoading(false)

    // Si connecté, redeem automatiquement
    if (session) {
      handleRedeem()
    }
  }

  const handleRedeem = async () => {
    setIsRedeeming(true)
    setError('')

    try {
      const { data, error: rpcError } = await supabaseBrowser.rpc('redeem_club_invite', {
        p_token: token
      })

      if (rpcError) {
        setError(rpcError.message)
        return
      }

      console.log('[Invite] ✅ Invitation acceptée, club_id:', data)
      router.push('/club/dashboard')
    } catch (err: any) {
      console.error('[Invite] Error:', err)
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setIsRedeeming(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Invitation club</h1>
            <p className="text-gray-600">Connectez-vous pour accepter cette invitation</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="space-y-3">
              <button
                onClick={() => router.push('/club/auth/login')}
                className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all"
              >
                Se connecter
              </button>
              <button
                onClick={() => router.push('/club/auth/signup')}
                className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
              >
                Créer un compte
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          {error ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => router.push('/club/dashboard')}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all"
              >
                Aller au dashboard
              </button>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent mb-4 mx-auto"></div>
              <p className="text-gray-600">{isRedeeming ? 'Acceptation de l\'invitation...' : 'Redirection...'}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
