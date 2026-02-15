'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseBrowser'
import { signOut } from '@/lib/clubAuth'

export default function Dashboard() {
  const router = useRouter()
  const [club, setClub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [isCreatingInvite, setIsCreatingInvite] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadClub()
  }, [router])

  const loadClub = async () => {
    setLoading(true)
    try {
      // 1. Récupérer la session
      const { data: sessionData } = await supabaseBrowser.auth.getSession()
      const session = sessionData.session

      if (!session) {
        router.push('/club')
        return
      }

      // 2. Requête club_memberships
      const { data, error } = await supabaseBrowser
        .from('club_memberships')
        .select('club_id, role, clubs:club_id ( id, name, city, club_code )')
        .eq('user_id', session.user.id)

      if (error) {
        console.error('[Dashboard] Error loading memberships:', error)
        return
      }

      // 3. Extraire le premier club si présent
      const first = data?.[0]
      if (first?.clubs) {
        setClub(first.clubs)
      }
    } catch (err) {
      console.error('[Dashboard] Error loading club:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    // Force un rechargement complet pour effacer le cache
    window.location.href = '/club'
  }

  const handleCreateInvite = async () => {
    if (!club) return

    setIsCreatingInvite(true)
    setInviteLink('')

    try {
      // Générer le token
      const token = crypto.randomUUID().replaceAll('-', '')
      
      // Calculer expires_at (7 jours)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      // Insérer dans club_invites
      const { error } = await supabaseBrowser
        .from('club_invites')
        .insert({
          club_id: club.id,
          token,
          role: 'admin',
          expires_at: expiresAt
        })

      if (error) {
        alert(`Erreur: ${error.message}`)
        return
      }

      // Construire le lien
      const link = `${window.location.origin}/club/invite/${token}`
      setInviteLink(link)
      setShowInviteModal(true)

      console.log('[Invite] ✅ Invitation créée:', token)
    } catch (err: any) {
      console.error('[Invite] Error:', err)
      alert('Erreur lors de la création de l\'invitation')
    } finally {
      setIsCreatingInvite(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert('Erreur lors de la copie')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {club ? (
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bienvenue {club.name}</h1>
              <p className="text-gray-600 mt-2">Ville : {club.city}</p>
              <p className="text-gray-600">Code : {club.club_code}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateInvite}
                disabled={isCreatingInvite}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {isCreatingInvite ? 'Création...' : 'Inviter un admin'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucun club associé</h2>
            <p className="text-gray-600 mb-6">
              Vous n'êtes membre d'aucun club. Demandez une invitation à un administrateur.
            </p>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all"
            >
              Se déconnecter
            </button>
          </div>
        )}

        {/* Modale d'invitation */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Invitation créée !</h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Partagez ce lien avec la personne que vous souhaitez inviter. Le lien expire dans 7 jours.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Lien d'invitation
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copié !
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copier
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowInviteModal(false)}
                className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Menu de navigation */}
        {club && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => router.push('/club/courts')}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="text-3xl mb-3">🎾</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Terrains</h3>
              <p className="text-gray-600">Gérer vos terrains de padel</p>
            </button>

            <button
              onClick={() => router.push('/club/bookings')}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="text-3xl mb-3">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Réservations</h3>
              <p className="text-gray-600">Voir toutes les réservations</p>
            </button>

            <button
              onClick={() => router.push('/club/dashboard/invitations')}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="text-3xl mb-3">✉️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Invitations</h3>
              <p className="text-gray-600">Inviter des administrateurs</p>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
