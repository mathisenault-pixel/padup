'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
import { getCurrentClub, type ClubFromMembership } from '@/lib/getClub'

interface Court {
  id: string
  club_id: string
  name: string
  type: string
  is_active: boolean
  created_at: string
}

export default function CourtsPage() {
  const router = useRouter()
  const [club, setClub] = useState<ClubFromMembership | null>(null)
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [newCourtName, setNewCourtName] = useState('')
  const [newCourtType, setNewCourtType] = useState('padel')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadData()
  }, [router])

  const loadData = async () => {
    setLoading(true)
    try {
      const { club: userClub, session } = await getCurrentClub()
      
      if (!session) {
        router.replace('/club')
        return
      }

      if (!userClub) {
        alert('Aucun club associé à votre compte')
        router.replace('/club/dashboard')
        return
      }
      
      setClub(userClub)
      await fetchCourts(userClub.id)
    } catch (err) {
      console.error('Error loading data:', err)
      router.replace('/club')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourts = async (clubId: string) => {
    try {
      // 🔒 RLS filtre automatiquement par club_id via membership
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setCourts(data || [])
    } catch (err) {
      console.error('Erreur récupération terrains:', err)
    }
  }

  const handleCreateCourt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!club) return

    setIsCreating(true)

    try {
      // ✅ RLS vérifie automatiquement le membership
      const { error } = await supabase
        .from('courts')
        .insert({
          club_id: club.id,
          name: newCourtName,
          type: newCourtType,
          is_active: true
        })

      if (error) throw error

      console.log('✅ Terrain créé avec succès')
      setNewCourtName('')
      setNewCourtType('padel')
      fetchCourts(club.id)
    } catch (err: any) {
      console.error('❌ Erreur création terrain:', err)
      alert(err.message || 'Erreur lors de la création du terrain')
    } finally {
      setIsCreating(false)
    }
  }

  const handleToggleActive = async (courtId: string, currentStatus: boolean) => {
    if (!club) return

    try {
      // 🔒 RLS vérifie automatiquement le membership
      const { error } = await supabase
        .from('courts')
        .update({ is_active: !currentStatus })
        .eq('id', courtId)
        .eq('club_id', club.id)

      if (error) throw error

      console.log('✅ Statut du terrain mis à jour')
      fetchCourts(club.id)
    } catch (err) {
      console.error('❌ Erreur mise à jour:', err)
    }
  }

  const handleDeleteCourt = async (courtId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce terrain ?')) return
    if (!club) return

    try {
      // 🔒 RLS vérifie automatiquement le membership
      const { error } = await supabase
        .from('courts')
        .delete()
        .eq('id', courtId)
        .eq('club_id', club.id)

      if (error) throw error

      console.log('✅ Terrain supprimé')
      fetchCourts(club.id)
    } catch (err) {
      console.error('❌ Erreur suppression:', err)
    }
  }

  if (!club) return null

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => router.push('/club/dashboard')}
              className="text-blue-600 hover:text-blue-700 mb-2"
            >
              ← Retour au dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des terrains</h1>
            <p className="text-gray-600 mt-1">{club.name}</p>
          </div>
        </div>

        {/* Formulaire création */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Ajouter un terrain</h2>
          <form onSubmit={handleCreateCourt} className="flex gap-4">
            <input
              type="text"
              value={newCourtName}
              onChange={(e) => setNewCourtName(e.target.value)}
              placeholder="Nom du terrain (ex: Terrain 1)"
              required
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={newCourtType}
              onChange={(e) => setNewCourtType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="padel">Padel</option>
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
            </select>
            <button
              type="submit"
              disabled={isCreating}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isCreating ? 'Création...' : 'Ajouter'}
            </button>
          </form>
        </div>

        {/* Liste des terrains */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Terrains ({courts.length})</h2>
          
          {loading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : courts.length === 0 ? (
            <p className="text-gray-500">Aucun terrain pour le moment. Créez-en un ci-dessus !</p>
          ) : (
            <div className="space-y-3">
              {courts.map((court) => (
                <div
                  key={court.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{court.name}</h3>
                      <p className="text-sm text-gray-500">
                        Type: {court.type} • {court.is_active ? '✅ Actif' : '❌ Inactif'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(court.id, court.is_active)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      {court.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      onClick={() => handleDeleteCourt(court.id)}
                      className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
