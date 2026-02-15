'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentClub } from '@/lib/getClub'
import { 
  createClubInvite, 
  getClubInvites, 
  getInviteLink, 
  copyInviteLink,
  type ClubInvite 
} from '@/lib/clubInvites'

export default function ClubInvitationsPage() {
  const router = useRouter()
  const [club, setClub] = useState<any>(null)
  const [invites, setInvites] = useState<ClubInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [router])

  const loadData = async () => {
    setLoading(true)
    try {
      const { club: userClub, session } = await getCurrentClub()
      
      if (!session) {
        router.push('/club')
        return
      }

      if (!userClub) {
        alert('Aucun club associé')
        router.push('/club/dashboard')
        return
      }
      
      setClub(userClub)
      await loadInvites(userClub.id)
    } catch (err) {
      console.error('Error loading data:', err)
      router.push('/club')
    } finally {
      setLoading(false)
    }
  }

  const loadInvites = async (clubId: string) => {
    const invitesList = await getClubInvites(clubId)
    setInvites(invitesList)
  }

  const handleCreateInvite = async () => {
    if (!club) return

    setIsCreating(true)
    try {
      const { invite, error } = await createClubInvite(club.id, 'admin', 7)

      if (error || !invite) {
        alert('Erreur lors de la création de l\'invitation')
        return
      }

      console.log('✅ Invitation créée:', invite.token)
      
      // Copier automatiquement le lien
      const success = await copyInviteLink(invite.token)
      if (success) {
        setCopiedToken(invite.token)
        setTimeout(() => setCopiedToken(null), 3000)
      }

      // Recharger la liste
      await loadInvites(club.id)
    } catch (err) {
      console.error('Error creating invite:', err)
      alert('Erreur lors de la création de l\'invitation')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyLink = async (token: string) => {
    const success = await copyInviteLink(token)
    if (success) {
      setCopiedToken(token)
      setTimeout(() => setCopiedToken(null), 2000)
    } else {
      alert('Erreur lors de la copie du lien')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isExpired = (dateStr: string) => {
    return new Date(dateStr) < new Date()
  }

  if (loading || !club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent"></div>
      </div>
    )
  }

  const activeInvites = invites.filter(i => !i.used_at && !isExpired(i.expires_at))
  const usedInvites = invites.filter(i => i.used_at)
  const expiredInvites = invites.filter(i => !i.used_at && isExpired(i.expires_at))

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/club/dashboard')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invitations</h1>
              <p className="text-gray-600 mt-1">Invitez des administrateurs à rejoindre {club.name}</p>
            </div>
            <button
              onClick={handleCreateInvite}
              disabled={isCreating}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {isCreating ? 'Création...' : 'Créer une invitation'}
            </button>
          </div>
        </div>

        {/* Invitations actives */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Invitations actives ({activeInvites.length})
          </h2>
          {activeInvites.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <p className="text-gray-600">Aucune invitation active</p>
              <p className="text-sm text-gray-500 mt-1">Créez une invitation pour inviter un administrateur</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Active
                        </span>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full uppercase">
                          {invite.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Expire le {formatDate(invite.expires_at)}
                      </p>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200">
                        <code className="flex-1 text-sm text-gray-700 font-mono overflow-hidden text-ellipsis">
                          {getInviteLink(invite.token)}
                        </code>
                        <button
                          onClick={() => handleCopyLink(invite.token)}
                          className="px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          {copiedToken === invite.token ? (
                            <>
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Copié !
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copier
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invitations utilisées */}
        {usedInvites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Invitations utilisées ({usedInvites.length})
            </h2>
            <div className="space-y-3">
              {usedInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 opacity-75"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                      Utilisée
                    </span>
                    <p className="text-sm text-gray-600">
                      Le {formatDate(invite.used_at!)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invitations expirées */}
        {expiredInvites.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Invitations expirées ({expiredInvites.length})
            </h2>
            <div className="space-y-3">
              {expiredInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="bg-white rounded-lg border border-red-200 p-6 opacity-75"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                      Expirée
                    </span>
                    <p className="text-sm text-gray-600">
                      Le {formatDate(invite.expires_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Comment ça marche ?</p>
              <p className="text-sm text-blue-700">
                Créez une invitation et partagez le lien avec la personne que vous souhaitez inviter. 
                Elle devra créer un compte ou se connecter, puis accepter l'invitation pour devenir membre de votre club.
                Les invitations sont valables 7 jours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
