'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'
import { useRouter } from 'next/navigation'

export default function SeedMembershipPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [clubId, setClubId] = useState('')

  const handleSeedMembership = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // 1. Récupérer la session
      const { data: { session } } = await supabaseBrowser.auth.getSession()
      
      if (!session) {
        setError('Vous devez être connecté pour créer une membership')
        setLoading(false)
        return
      }

      const currentUserId = session.user.id
      setUserId(currentUserId)

      // 2. Récupérer le club "Club Démo Pad'up"
      const { data: clubData, error: clubError } = await supabaseBrowser
        .from('clubs')
        .select('id, name')
        .eq('name', "Club Démo Pad'up")
        .single()

      if (clubError || !clubData) {
        setError(`Club "Club Démo Pad'up" introuvable: ${clubError?.message || 'club non trouvé'}`)
        setLoading(false)
        return
      }

      const demoClubId = clubData.id
      setClubId(demoClubId)

      // 3. Insérer la membership
      const { error: insertError } = await supabaseBrowser
        .from('club_memberships')
        .insert({
          club_id: demoClubId,
          user_id: currentUserId,
          role: 'admin'
        })

      if (insertError) {
        // Si la membership existe déjà (conflit), c'est OK
        if (insertError.code === '23505') {
          setError('Membership déjà existante pour ce user/club')
        } else {
          setError(`Erreur lors de l'insertion: ${insertError.message}`)
        }
        setLoading(false)
        return
      }

      console.log('[Seed] ✅ Membership créée:', { userId: currentUserId, clubId: demoClubId, role: 'admin' })
      setSuccess(true)

    } catch (err: any) {
      console.error('[Seed] Error:', err)
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🔧 Seed Membership Admin
            </h1>
            <p className="text-sm text-gray-600">
              Page temporaire pour créer votre première membership admin sur le club démo.
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-1">Attention</p>
                <p className="text-sm text-yellow-700">
                  Cette page doit être supprimée après utilisation. Elle crée une membership admin sur le club "Club Démo Pad'up" pour votre compte.
                </p>
              </div>
            </div>
          </div>

          {/* Action */}
          {!success && !error && (
            <button
              onClick={handleSeedMembership}
              disabled={loading}
              className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Création...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Me lier au club démo
                </>
              )}
            </button>
          )}

          {/* Success */}
          {success && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900 mb-1">Membership créée !</p>
                    <p className="text-sm text-green-700 mb-3">
                      Vous êtes maintenant admin du club "Club Démo Pad'up".
                    </p>
                    {userId && (
                      <p className="text-xs text-green-600 font-mono">User ID: {userId}</p>
                    )}
                    {clubId && (
                      <p className="text-xs text-green-600 font-mono">Club ID: {clubId}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/club/dashboard')}
                  className="flex-1 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all"
                >
                  Aller au dashboard
                </button>
                <button
                  onClick={() => {
                    setSuccess(false)
                    setError('')
                    setUserId('')
                    setClubId('')
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900 mb-1">Erreur</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setError('')
                  setSuccess(false)
                }}
                className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Note :</strong> Cette page doit être supprimée après utilisation (supprimez le dossier <code className="bg-gray-100 px-1 py-0.5 rounded">app/dev/</code>). 
              Ensuite, utilisez uniquement le système d'invitation pour ajouter de nouveaux membres.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
