'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'

type Booking = {
  id: string
  court_id: string
  booking_date: string
  slot_id: number
  slot_start: string
  slot_end: string
  status: string  // 'confirmed' | 'cancelled'
  created_at: string
}

export default function ReservationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

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

  // ============================================
  // ANNULER UNE RÉSERVATION
  // ============================================
  const cancelBooking = async (bookingId: string) => {
    // Confirmation avant annulation
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return
    }

    setCancellingId(bookingId)
    console.log('[CANCEL] Cancelling booking:', bookingId)

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)

      if (error) {
        console.error('[CANCEL] Error:', error)
        alert(`Erreur lors de l'annulation: ${error.message}`)
      } else {
        console.log('[CANCEL] ✅ Booking cancelled successfully')
        // Mettre à jour l'UI localement
        setBookings(prev => 
          prev.map(b => 
            b.id === bookingId ? { ...b, status: 'cancelled' } : b
          )
        )
        alert('Réservation annulée avec succès !')
      }
    } catch (err: any) {
      console.error('[CANCEL] Exception:', err)
      alert(`Erreur: ${err.message}`)
    } finally {
      setCancellingId(null)
    }
  }

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
                opacity: booking.status === 'cancelled' ? 0.6 : 1
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                {new Date(booking.slot_start).toLocaleString('fr-FR')}
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>
                Date: {booking.booking_date} | Slot #{booking.slot_id}
              </div>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                Statut: <span style={{ 
                  fontWeight: 600,
                  color: booking.status === 'confirmed' ? '#16a34a' : booking.status === 'cancelled' ? '#dc2626' : '#6b7280'
                }}>
                  {booking.status === 'confirmed' ? '✅ Confirmée' : booking.status === 'cancelled' ? '❌ Annulée' : booking.status}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
                Créée: {new Date(booking.created_at).toLocaleString('fr-FR')}
              </div>
              
              {/* Bouton Annuler */}
              {booking.status === 'confirmed' && (
                <button
                  onClick={() => cancelBooking(booking.id)}
                  disabled={cancellingId === booking.id}
                  style={{
                    padding: '8px 16px',
                    background: cancellingId === booking.id ? '#9ca3af' : '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: cancellingId === booking.id ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (cancellingId !== booking.id) {
                      e.currentTarget.style.background = '#b91c1c'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (cancellingId !== booking.id) {
                      e.currentTarget.style.background = '#dc2626'
                    }
                  }}
                >
                  {cancellingId === booking.id ? 'Annulation...' : 'Annuler la réservation'}
                </button>
              )}
              
              {booking.status === 'cancelled' && (
                <div style={{ 
                  padding: '8px 12px',
                  background: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600
                }}>
                  Cette réservation a été annulée
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
