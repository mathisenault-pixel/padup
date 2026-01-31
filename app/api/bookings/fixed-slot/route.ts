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
 * POST /api/bookings/fixed-slot
 * Créer une réservation avec créneau fixe (modèle A)
 * Body: { clubId, courtId, bookingDate, slotId, userId, playerName?, playerEmail?, playerPhone? }
 */
export async function POST(req: Request) {
  try {
    console.log('[API /bookings/fixed-slot POST] Start')

    const body = await req.json()
    const { clubId, courtId, bookingDate, slotId, userId, playerName, playerEmail, playerPhone } = body

    // ✅ Validation des champs requis
    if (!clubId || !courtId || !bookingDate || !slotId || !userId) {
      console.error('[API /bookings/fixed-slot POST] Validation error - missing required fields')
      return NextResponse.json(
        {
          error: 'Champs requis manquants',
          code: 'MISSING_FIELDS',
          required: ['clubId', 'courtId', 'bookingDate', 'slotId', 'userId'],
        },
        { status: 400 }
      )
    }

    // ✅ Validation format date (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(bookingDate)) {
      console.error('[API /bookings/fixed-slot POST] Invalid date format:', bookingDate)
      return NextResponse.json(
        {
          error: 'Format de date invalide',
          code: 'INVALID_DATE_FORMAT',
          hint: 'Utilisez le format YYYY-MM-DD',
        },
        { status: 400 }
      )
    }

    // ✅ Validation slotId (doit être un entier positif)
    const slotIdNum = parseInt(slotId)
    if (isNaN(slotIdNum) || slotIdNum <= 0) {
      console.error('[API /bookings/fixed-slot POST] Invalid slotId:', slotId)
      return NextResponse.json(
        {
          error: 'slotId invalide',
          code: 'INVALID_SLOT_ID',
          hint: 'slotId doit être un entier positif',
        },
        { status: 400 }
      )
    }

    console.log('[API /bookings/fixed-slot POST] Calling RPC create_booking_fixed_slot', {
      clubId,
      courtId,
      bookingDate,
      slotId: slotIdNum,
      userId,
      playerName,
      playerEmail,
      playerPhone,
    })

    // ✅ Appeler la fonction RPC Supabase
    const { data, error } = await supabase.rpc('create_booking_fixed_slot', {
      p_club_id: clubId,
      p_court_id: courtId,
      p_booking_date: bookingDate,
      p_slot_id: slotIdNum,
      p_user_id: userId,
      p_player_name: playerName || null,
      p_player_email: playerEmail || null,
      p_player_phone: playerPhone || null,
    })

    if (error) {
      console.error('[API /bookings/fixed-slot POST] RPC error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })

      // ✅ Gestion spécifique: unique_violation (23505)
      if (error.code === '23505' || error.message?.includes('déjà réservé')) {
        return NextResponse.json(
          {
            error: 'Ce créneau est déjà réservé',
            code: 'SLOT_ALREADY_BOOKED',
            hint: 'Choisissez un autre créneau ou un autre terrain',
            details: error.message,
          },
          { status: 409 } // Conflict
        )
      }

      // ✅ Gestion spécifique: créneau dans le passé
      if (error.message?.includes('futur') || error.message?.includes('passé')) {
        return NextResponse.json(
          {
            error: 'Impossible de réserver dans le passé',
            code: 'PAST_BOOKING',
            hint: 'Choisissez une date future',
            details: error.message,
          },
          { status: 400 }
        )
      }

      // ✅ Gestion spécifique: créneau ou terrain introuvable
      if (error.message?.includes('introuvable') || error.message?.includes('inactif')) {
        return NextResponse.json(
          {
            error: 'Ressource introuvable ou inactive',
            code: 'RESOURCE_NOT_FOUND',
            hint: 'Vérifiez que le club, le terrain et le créneau existent',
            details: error.message,
          },
          { status: 404 }
        )
      }

      // ✅ Autres erreurs
      return NextResponse.json(
        {
          error: 'Erreur lors de la création de la réservation',
          code: 'BOOKING_ERROR',
          details: error.message,
        },
        { status: 500 }
      )
    }

    // ✅ Succès
    console.log('[API /bookings/fixed-slot POST] Success:', data)

    return NextResponse.json(
      {
        success: true,
        message: 'Réservation créée avec succès',
        booking: data,
      },
      { status: 201 }
    )
  } catch (e: any) {
    console.error('[API /bookings/fixed-slot POST] Unhandled exception:', e)
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
 * GET /api/bookings/fixed-slot
 * (Optionnel) Récupérer les réservations avec créneaux fixes
 * Query params: ?clubId=xxx&date=YYYY-MM-DD
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const clubId = searchParams.get('clubId')
    const date = searchParams.get('date')

    if (!clubId) {
      return NextResponse.json(
        { error: 'clubId requis', code: 'MISSING_CLUB_ID' },
        { status: 400 }
      )
    }

    // Construire la requête
    let query = supabase
      .from('v_bookings_with_slots')
      .select('*')
      .eq('club_id', clubId)
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true })

    // Filtrer par date si fournie
    if (date) {
      query = query.eq('booking_date', date)
    }

    const { data, error } = await query

    if (error) {
      console.error('[API /bookings/fixed-slot GET] Error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des réservations', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ bookings: data }, { status: 200 })
  } catch (e: any) {
    console.error('[API /bookings/fixed-slot GET] Exception:', e)
    return NextResponse.json(
      { error: 'Erreur interne', details: e.message },
      { status: 500 }
    )
  }
}
