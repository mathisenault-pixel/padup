'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
import { getCurrentClub, type ClubFromMembership } from '@/lib/getClub'

interface Booking {
  id: string
  club_id: string
  court_id: string
  slot_start: string
  slot_end: string
  player_name: string
  player_email: string
  player_phone: string
  status: string
  notes: string
  created_at: string
}

interface Court {
  id: string
  name: string
}

export default function ClubBookingsPage() {
  const router = useRouter()
  const [club, setClub] = useState<ClubFromMembership | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedCourt, setSelectedCourt] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [router])

  const loadData = async () => {
    setLoading(true)
    try {
      const { club: userClub, session } = await getCurrentClub()
      
      if (!session) {
        router.push('/club/auth/login')
        return
      }

      if (!userClub) {
        alert('Aucun club associé à votre compte')
        router.push('/club/dashboard')
        return
      }
      
      setClub(userClub)
      const today = new Date().toISOString().split('T')[0]
      setSelectedDate(today)
      await fetchData(userClub.id)
    } catch (err) {
      console.error('Error loading data:', err)
      router.push('/club/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async (clubId: string) => {
    try {
      // 🔒 RLS filtre automatiquement par membership
      const { data: courtsData } = await supabase
        .from('courts')
        .select('id, name')
        .eq('club_id', clubId)
        .eq('is_active', true)

      if (courtsData) setCourts(courtsData)

      // 🔒 RLS filtre automatiquement par membership
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('club_id', clubId)
        .order('slot_start', { ascending: true })

      if (bookingsData) setBookings(bookingsData)
    } catch (err) {
      console.error('Erreur récupération données:', err)
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.slot_start).toISOString().split('T')[0]
    const dateMatch = !selectedDate || bookingDate === selectedDate
    const courtMatch = selectedCourt === 'all' || booking.court_id === selectedCourt
    const statusMatch = selectedStatus === 'all' || booking.status === selectedStatus
    return dateMatch && courtMatch && statusMatch
  })

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCourtName = (courtId: string) => {
    const court = courts.find(c => c.id === courtId)
    return court?.name || 'Court inconnu'
  }

  if (loading || !club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/club/dashboard')}
                className="text-blue-600 hover:text-blue-700 mb-2"
              >
                ← Retour au dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Club - {club.name}</h1>
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Planning des réservations</h2>
            <p className="text-gray-600">Gérez les réservations de vos terrains</p>
          </div>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex gap-4 flex-wrap">
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="confirmed">Confirmé</option>
              <option value="cancelled">Annulé</option>
            </select>
            <select 
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Tous les terrains</option>
              {courts.map((court) => (
                <option key={court.id} value={court.id}>{court.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Liste des réservations ({filteredBookings.length})</h3>
            {club && (
              <button
                onClick={() => fetchData(club.id)}
                className="px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors"
              >
                Rafraîchir
              </button>
            )}
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Chargement des réservations...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Aucune réservation trouvée pour les filtres sélectionnés.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Début</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fin</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joueur</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Terrain</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{formatDateTime(booking.slot_start)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatDateTime(booking.slot_end)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{booking.player_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{booking.player_email || booking.player_phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{getCourtName(booking.court_id)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status === 'confirmed' ? 'Confirmé' : 'Annulé'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
