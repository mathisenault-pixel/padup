'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentClub } from '@/lib/getClub'
import { signOut } from '@/lib/clubAuth'
import { getClubById, type ClubData } from '@/lib/data/clubs'

export default function ClubSettingsPage() {
  const router = useRouter()
  const [clubData, setClubData] = useState<ClubData | null>(null)
  const [club, setClub] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
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
      const localClubData = getClubById(userClub.id)
      setClubData(localClubData || null)
    }

    loadData()
  }, [router])

  const handleLogout = async () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      await signOut()
      router.push('/club/auth/login')
    }
  }

  if (!clubData || !club) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
        <p className="text-gray-600">Gérez les paramètres de votre club</p>
      </div>

      {/* Session Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Session actuelle</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-500">Email</span>
            <span className="text-sm font-medium text-gray-900">{clubData.email || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-500">Rôle</span>
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
              {club.role || 'Administrateur'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-semibold text-gray-500">Club ID</span>
            <span className="text-sm font-mono text-gray-600">
              {club.id}
            </span>
          </div>
        </div>
      </div>

      {/* Club Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Informations du club</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">Nom du club</label>
            <input
              type="text"
              value={clubData.name}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">Ville</label>
            <input
              type="text"
              value={clubData.city}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">Adresse</label>
            <input
              type="text"
              value={clubData.address}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-2">Email</label>
              <input
                type="email"
                value={clubData.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-2">Téléphone</label>
              <input
                type="tel"
                value={clubData.phone}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-2">Description</label>
            <textarea
              value={clubData.description}
              disabled
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed resize-none"
            />
          </div>
        </div>

        {/* Readonly notice */}
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Mode lecture seule (MVP)</p>
              <p className="text-sm text-gray-600">
                Les modifications seront possibles dans une prochaine version. Pour l'instant, contactez l'administrateur système pour modifier ces informations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Équipements */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Équipements</h2>
        <div className="flex flex-wrap gap-2">
          {clubData.equipements.map((eq, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg"
            >
              {eq}
            </span>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
        <h2 className="text-xl font-bold text-red-600 mb-4">Zone de danger</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Déconnexion</p>
            <p className="text-sm text-gray-600">
              Vous serez redirigé vers la page de connexion
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Se déconnecter
          </button>
        </div>
      </div>

      {/* Back to player */}
      <div className="text-center py-4">
        <a href="/player/clubs" className="text-sm text-slate-700 hover:underline">
          ← Retour à l'espace joueur
        </a>
      </div>
    </div>
  )
}
