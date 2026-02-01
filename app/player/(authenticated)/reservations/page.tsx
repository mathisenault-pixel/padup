'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabaseClient'

type Reservation = {
  id: string
  court_id: string
  slot_start: string
  fin_de_slot: string
  statut: string  // ✅ Correct: 'statut' en DB (pas 'status')
  cree_a: string  // ✅ Correct: 'cree_a' en DB (pas 'created_at')
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadReservations() {
      try {
        setLoading(true)
        setError(null)

        // TODO: Filtrer par user_id une fois l'auth implémentée
        const { data, error: queryError } = await supabase
          .from('reservations')
          .select('*')
          .order('slot_start', { ascending: true })

        if (queryError) {
          console.error('[SUPABASE ERROR - reservations]', {
            table: 'reservations',
            query: 'select * order by slot_start',
            error: queryError,
            message: queryError.message,
            code: queryError.code,
            details: queryError.details,
            hint: queryError.hint
          })
          setError(`${queryError.message} (code: ${queryError.code || 'N/A'})`)
        } else {
          console.log('[SUPABASE SUCCESS - reservations]', { count: data?.length || 0 })
          setReservations(data || [])
        }
      } catch (err: any) {
        console.error('[ERROR - reservations]', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadReservations()
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
        {reservations.length} réservation{reservations.length !== 1 ? 's' : ''}
      </p>

      {reservations.length === 0 ? (
        <p style={{ padding: 16, background: '#f0f9ff', borderRadius: 8 }}>
          Aucune réservation pour le moment
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {reservations.map((res) => (
            <li
              key={res.id}
              style={{
                padding: 16,
                marginBottom: 12,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                {new Date(res.slot_start).toLocaleString('fr-FR')}
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>
                Statut: {res.statut}
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                Créée: {new Date(res.cree_a).toLocaleString('fr-FR')}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
