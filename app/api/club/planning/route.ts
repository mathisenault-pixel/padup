/**
 * GET /api/club/planning?clubId=...&date=YYYY-MM-DD&view=day|week
 * 
 * Retourne le planning complet d'un club (tous les terrains).
 * Nécessite authentification + membership staff/owner.
 * 
 * Créneaux fixes : 90 minutes (1h30)
 * Format : { courts: [...], bookings: [...], slots: [...] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  generate90mSlots,
  getDayBoundaries,
  getWeekBoundaries,
  buildSlotId,
  type AvailabilitySlot,
} from '@/lib/slots';

// Supabase client (server-side, with service_role for auth bypass if needed)
// Note: For MVP, we use anon key + RLS policies
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clubId = searchParams.get('clubId');
    const dateParam = searchParams.get('date');
    const view = searchParams.get('view') || 'day'; // 'day' | 'week'

    // Validation : clubId required
    if (!clubId) {
      return NextResponse.json(
        {
          error: 'Missing required parameter: clubId',
        },
        { status: 400 }
      );
    }

    // Validation : date required
    if (!dateParam) {
      return NextResponse.json(
        {
          error: 'Missing required parameter: date',
          hint: 'Provide date as YYYY-MM-DD',
        },
        { status: 400 }
      );
    }

    // Validation : date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateParam)) {
      return NextResponse.json(
        {
          error: 'Invalid date format',
          hint: 'Date must be YYYY-MM-DD',
        },
        { status: 400 }
      );
    }

    // Validation : view
    if (!['day', 'week'].includes(view)) {
      return NextResponse.json(
        {
          error: 'Invalid view parameter',
          hint: 'view must be "day" or "week"',
        },
        { status: 400 }
      );
    }

    console.log('[API CLUB PLANNING]', {
      clubId,
      date: dateParam,
      view,
    });

    // TODO: Vérifier l'authentification et le membership
    // Pour MVP : on skip la vérification auth côté API
    // (la policy RLS bloquera si l'user n'est pas staff/owner)
    
    // Option : récupérer auth.uid() depuis le header Authorization
    // const authHeader = req.headers.get('authorization');
    // const token = authHeader?.split('Bearer ')[1];
    // if (!token) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    // Option : vérifier membership via RPC is_club_staff(clubId, auth.uid())
    // const { data: isStaff } = await supabase.rpc('is_club_staff', {
    //   p_club_id: clubId,
    //   p_user_id: userId,
    // });
    // if (!isStaff) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // Étape 1 : Récupérer les terrains du club
    const { data: courts, error: courtsError } = await supabase
      .from('courts')
      .select('id, name, club_id')
      .eq('club_id', clubId)
      .order('name', { ascending: true });

    if (courtsError) {
      console.error('[SUPABASE ERROR - courts]', courtsError);
      return NextResponse.json(
        {
          error: 'Failed to fetch courts',
          message: courtsError.message,
        },
        { status: 500 }
      );
    }

    if (!courts || courts.length === 0) {
      return NextResponse.json(
        {
          error: 'No courts found for this club',
          clubId,
        },
        { status: 404 }
      );
    }

    console.log('[COURTS FETCHED]', {
      count: courts.length,
      courts: courts.map((c) => ({ id: c.id, name: c.name })),
    });

    // Étape 2 : Déterminer les bornes temporelles
    let startBoundary: string;
    let endBoundary: string;

    if (view === 'day') {
      const { dayStart, dayEnd } = getDayBoundaries(dateParam, 9, 23);
      startBoundary = dayStart;
      endBoundary = dayEnd;
    } else {
      const { weekStart, weekEnd } = getWeekBoundaries(dateParam);
      startBoundary = weekStart;
      endBoundary = weekEnd;
    }

    console.log('[TIME BOUNDARIES]', {
      view,
      startBoundary,
      endBoundary,
    });

    // Étape 3 : Récupérer toutes les réservations (booking_slots + bookings + user info)
    const courtIds = courts.map((c) => c.id);

    const { data: bookings, error: bookingsError } = await supabase
      .from('booking_slots')
      .select(
        `
        id,
        booking_id,
        club_id,
        court_id,
        start_at,
        end_at,
        bookings:booking_id (
          identifiant,
          statut,
          cree_par,
          cree_a
        )
      `
      )
      .in('court_id', courtIds)
      .gte('start_at', startBoundary)
      .lt('start_at', endBoundary)
      .order('start_at', { ascending: true });

    if (bookingsError) {
      console.error('[SUPABASE ERROR - booking_slots]', bookingsError);
      return NextResponse.json(
        {
          error: 'Failed to fetch bookings',
          message: bookingsError.message,
        },
        { status: 500 }
      );
    }

    console.log('[BOOKINGS FETCHED]', {
      count: bookings?.length || 0,
    });

    // Étape 4 : Organiser les données par terrain
    const planningByCourtId = new Map<string, any[]>();

    courts.forEach((court) => {
      // Générer tous les slots de la journée pour ce terrain
      const allSlots = generate90mSlots(dateParam, 9, 23, clubId, court.id);

      // Filtrer les bookings pour ce terrain
      const courtBookings = (bookings || []).filter(
        (b) => b.court_id === court.id
      );

      // Créer un Map des slots réservés
      const bookedSlotMap = new Map(
        courtBookings.map((b) => {
          const startISO = new Date(b.start_at).toISOString();
          const endISO = new Date(b.end_at).toISOString();
          const slotId = buildSlotId(clubId, court.id, startISO, endISO);
          return [
            slotId,
            {
              booking_id: b.booking_id,
              slot_id: b.id,
              start_at: b.start_at,
              end_at: b.end_at,
              status: (b.bookings as any)?.statut || 'confirmé',
              created_by: (b.bookings as any)?.cree_par,
              created_at: (b.bookings as any)?.cree_a,
            },
          ];
        })
      );

      // Marquer chaque slot comme free ou reserved
      const availability: AvailabilitySlot[] = allSlots.map((slot) => {
        const booking = bookedSlotMap.get(slot.slot_id);

        if (booking) {
          return {
            ...slot,
            status: 'reserved' as const,
            booking_id: booking.booking_id,
            created_by: booking.created_by,
          };
        }

        return {
          ...slot,
          status: 'free' as const,
        };
      });

      planningByCourtId.set(court.id, availability);
    });

    // Étape 5 : Construire la réponse
    const planning = courts.map((court) => ({
      court_id: court.id,
      court_name: court.name,
      slots: planningByCourtId.get(court.id) || [],
      meta: {
        totalSlots: planningByCourtId.get(court.id)?.length || 0,
        freeSlots:
          planningByCourtId.get(court.id)?.filter((s) => s.status === 'free')
            .length || 0,
        reservedSlots:
          planningByCourtId.get(court.id)?.filter((s) => s.status === 'reserved')
            .length || 0,
      },
    }));

    // Résumé global
    const totalSlots = planning.reduce((sum, c) => sum + c.meta.totalSlots, 0);
    const totalFreeSlots = planning.reduce(
      (sum, c) => sum + c.meta.freeSlots,
      0
    );
    const totalReservedSlots = planning.reduce(
      (sum, c) => sum + c.meta.reservedSlots,
      0
    );

    console.log('[PLANNING RESULT]', {
      courts: courts.length,
      totalSlots,
      totalFreeSlots,
      totalReservedSlots,
    });

    return NextResponse.json({
      clubId,
      date: dateParam,
      view,
      courts: planning,
      meta: {
        totalCourts: courts.length,
        totalSlots,
        totalFreeSlots,
        totalReservedSlots,
        slotDuration: 90,
        openingHour: 9,
        closingHour: 23,
      },
    });
  } catch (e: any) {
    console.error('[API EXCEPTION - GET club planning]', e);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: e?.message ?? 'Unknown error',
      },
      { status: 500 }
    );
  }
}
