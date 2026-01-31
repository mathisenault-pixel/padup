import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env vars')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' },
  auth: { persistSession: false },
})

/**
 * GET /api/availabilities/fixed-slots
 * Récupérer les disponibilités pour un club et une date donnés
 * Query params: ?clubId=xxx&date=YYYY-MM-DD
 * 
 * Retourne pour chaque (terrain, créneau): is_available (true/false)
 */
export async function GET(req: Request) {
  try {
    console.log('[API /availabilities/fixed-slots GET] Start')

    const { searchParams } = new URL(req.url)
    const clubId = searchParams.get('clubId')
    const date = searchParams.get('date')

    // ✅ Validation des paramètres requis
    if (!clubId || !date) {
      console.error('[API /availabilities/fixed-slots GET] Missing parameters')
      return NextResponse.json(
        {
          error: 'Paramètres requis manquants',
          code: 'MISSING_PARAMS',
          required: ['clubId', 'date'],
        },
        { status: 400 }
      )
    }

    // ✅ Validation format date (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      console.error('[API /availabilities/fixed-slots GET] Invalid date format:', date)
      return NextResponse.json(
        {
          error: 'Format de date invalide',
          code: 'INVALID_DATE_FORMAT',
          hint: 'Utilisez le format YYYY-MM-DD',
        },
        { status: 400 }
      )
    }

    console.log('[API /availabilities/fixed-slots GET] Calling RPC get_availabilities_fixed_slots', {
      clubId,
      date,
    })

    // ✅ Appeler la fonction RPC Supabase
    const { data, error } = await supabase.rpc('get_availabilities_fixed_slots', {
      p_club_id: clubId,
      p_booking_date: date,
    })

    if (error) {
      console.error('[API /availabilities/fixed-slots GET] RPC error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })

      return NextResponse.json(
        {
          error: 'Erreur lors de la récupération des disponibilités',
          code: 'RPC_ERROR',
          details: error.message,
        },
        { status: 500 }
      )
    }

    console.log('[API /availabilities/fixed-slots GET] Success - returned', data?.length || 0, 'slots')

    // ✅ Structurer la réponse
    // Grouper par terrain pour faciliter l'utilisation côté frontend
    const groupedByCourtBySlot: Record<string, {
      courtId: string
      courtName: string
      slots: Array<{
        slotId: number
        slotLabel: string
        startTime: string
        endTime: string
        isAvailable: boolean
      }>
    }> = {}

    data?.forEach((row: any) => {
      if (!groupedByCourtBySlot[row.court_id]) {
        groupedByCourtBySlot[row.court_id] = {
          courtId: row.court_id,
          courtName: row.court_name,
          slots: [],
        }
      }

      groupedByCourtBySlot[row.court_id].slots.push({
        slotId: row.slot_id,
        slotLabel: row.slot_label,
        startTime: row.start_time,
        endTime: row.end_time,
        isAvailable: row.is_available,
      })
    })

    const courts = Object.values(groupedByCourtBySlot)

    // ✅ Retourner les disponibilités
    return NextResponse.json(
      {
        success: true,
        clubId,
        date,
        courts,
        raw: data, // Inclure aussi le format raw pour flexibilité
      },
      { status: 200 }
    )
  } catch (e: any) {
    console.error('[API /availabilities/fixed-slots GET] Unhandled exception:', e)
    return NextResponse.json(
      {
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR',
        details: e.message,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/availabilities/fixed-slots
 * (Optionnel) Version POST si on veut passer les paramètres dans le body
 * Body: { clubId, date }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { clubId, date } = body

    if (!clubId || !date) {
      return NextResponse.json(
        {
          error: 'Paramètres requis manquants',
          code: 'MISSING_PARAMS',
          required: ['clubId', 'date'],
        },
        { status: 400 }
      )
    }

    // Validation date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        {
          error: 'Format de date invalide',
          code: 'INVALID_DATE_FORMAT',
          hint: 'Utilisez le format YYYY-MM-DD',
        },
        { status: 400 }
      )
    }

    console.log('[API /availabilities/fixed-slots POST] Calling RPC', { clubId, date })

    const { data, error } = await supabase.rpc('get_availabilities_fixed_slots', {
      p_club_id: clubId,
      p_booking_date: date,
    })

    if (error) {
      console.error('[API /availabilities/fixed-slots POST] RPC error:', error)
      return NextResponse.json(
        {
          error: 'Erreur lors de la récupération des disponibilités',
          code: 'RPC_ERROR',
          details: error.message,
        },
        { status: 500 }
      )
    }

    // Grouper par terrain
    const groupedByCourtBySlot: Record<string, any> = {}
    data?.forEach((row: any) => {
      if (!groupedByCourtBySlot[row.court_id]) {
        groupedByCourtBySlot[row.court_id] = {
          courtId: row.court_id,
          courtName: row.court_name,
          slots: [],
        }
      }
      groupedByCourtBySlot[row.court_id].slots.push({
        slotId: row.slot_id,
        slotLabel: row.slot_label,
        startTime: row.start_time,
        endTime: row.end_time,
        isAvailable: row.is_available,
      })
    })

    const courts = Object.values(groupedByCourtBySlot)

    return NextResponse.json(
      {
        success: true,
        clubId,
        date,
        courts,
        raw: data,
      },
      { status: 200 }
    )
  } catch (e: any) {
    console.error('[API /availabilities/fixed-slots POST] Exception:', e)
    return NextResponse.json(
      {
        error: 'Erreur interne',
        code: 'INTERNAL_ERROR',
        details: e.message,
      },
      { status: 500 }
    )
  }
}
