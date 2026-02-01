'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabaseClient'

type Booking = {
  id: string
  court_id: string
  booking_date: string
  slot_id: number
  slot_start: string
  slot_end: string
  status: string  // 'confirmed' | 'pending' | 'cancelled'
  created_at: string
}

export default function ReservationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true)
        setError(null)

        // TODO: Filtrer par created_by une fois l'auth implémentée
        const { data, error: queryError } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false })

        if (queryError) {
          console.error('[SUPABASE ERROR - bookings]', {
            table: 'bookings',
            query: 'select * order by created_at desc',
            error: queryError,
            message: queryError.message,
            code: queryError.code,
            details: queryError.details,
            hint: queryError.hint
          })
          setError(`${queryError.message} (code: ${queryError.code || 'N/A'})`)
        } else {
          console.log('[SUPABASE SUCCESS - bookings]', { count: data?.length || 0 })
          setBookings(data || [])
        }
      } catch (err: any) {
        console.error('[ERROR - bookings]', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Mes réservations</h1>
        <p>Chargement...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Mes réservations</h1>
        <div style={{ padding: 16, background: '#fee', borderRadius: 8, marginTop: 16 }}>
          <strong>Erreur Supabase :</strong> {error}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Mes réservations</h1>
      <p style={{ marginBottom: 16, color: '#666' }}>
        {bookings.length} réservation{bookings.length !== 1 ? 's' : ''}
      </p>

      {bookings.length === 0 ? (
        <p style={{ padding: 16, background: '#f0f9ff', borderRadius: 8 }}>
          Aucune réservation pour le moment
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {bookings.map((booking) => (
            <li
              key={booking.id}
              style={{
                padding: 16,
                marginBottom: 12,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                {new Date(booking.slot_start).toLocaleString('fr-FR')}
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>
                Date: {booking.booking_date} | Slot #{booking.slot_id}
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>
                Statut: {booking.status}
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                Créée: {new Date(booking.created_at).toLocaleString('fr-FR')}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
