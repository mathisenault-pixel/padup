/**
 * GET /api/clubs/:clubId/courts/:courtId/availability?date=YYYY-MM-DD
 * 
 * Retourne les disponibilités d'un terrain pour une date donnée.
 * Source de vérité : table booking_slots (DB)
 * 
 * Créneaux fixes : 90 minutes (1h30)
 * Format : { start_at, end_at, status: 'free' | 'reserved', booking_id? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  generate90mSlots,
  getDayBoundaries,
  buildSlotId,
  type AvailabilitySlot,
} from '@/lib/slots';

// Supabase client (public access, RLS enabled)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Diagnostic : vérifier les env vars (sans exposer les valeurs)
console.log('[ENV VARS CHECK]', {
  SUPABASE_URL: SUPABASE_URL ? `✅ présent (${SUPABASE_URL.slice(0, 30)}...)` : '❌ manquant',
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? '✅ présent' : '❌ manquant',
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type RouteContext = {
  params: Promise<{
    clubId: string;
    courtId: string;
  }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { clubId, courtId } = await context.params;
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

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

    console.log('[API AVAILABILITY]', {
      clubId,
      courtId,
      date: dateParam,
    });

    // Étape 1 : Générer tous les slots 90 min de la journée
    const allSlots = generate90mSlots(dateParam, 9, 23, clubId, courtId);

    console.log('[SLOTS GENERATED]', {
      count: allSlots.length,
      first: allSlots[0],
      last: allSlots[allSlots.length - 1],
    });

    // Étape 2 : Récupérer les réservations existantes depuis booking_slots
    const { dayStart, dayEnd } = getDayBoundaries(dateParam, 9, 23);

    // Étape 2 : Récupérer les réservations existantes depuis booking_slots (avec fallback)
    let bookedSlots: any[] = [];
    let bookingsFetchFailed = false;
    let bookingsFetchError: string | null = null;

    try {
      const { data, error: supabaseError } = await supabase
        .from('booking_slots')
        .select('id, booking_id, court_id, start_at, end_at')
        .eq('court_id', courtId)
        .gte('start_at', dayStart)
        .lt('start_at', dayEnd)
        .order('start_at', { ascending: true });

      if (supabaseError) {
        // LOG détaillé de l'erreur Supabase
        console.error('[SUPABASE ERROR - booking_slots]', {
          code: supabaseError.code,
          message: supabaseError.message,
          details: supabaseError.details,
          hint: supabaseError.hint,
        });

        // Mode FALLBACK : on continue avec des slots vides
        bookingsFetchFailed = true;
        bookingsFetchError = `${supabaseError.code}: ${supabaseError.message}`;
      } else {
        bookedSlots = data || [];
      }
    } catch (err: any) {
      // Erreur de fetch réseau ou autre
      console.error('[FETCH ERROR - booking_slots]', {
        message: err?.message,
        stack: err?.stack,
      });

      // Mode FALLBACK : on continue avec des slots vides
      bookingsFetchFailed = true;
      bookingsFetchError = err?.message || 'Unknown error';
    }

    console.log('[BOOKED SLOTS FROM DB]', {
      count: bookedSlots?.length || 0,
      slots: bookedSlots,
    });

    // Étape 3 : Créer un Set des slot_id réservés (pour lookup O(1))
    const bookedSlotIds = new Set(
      (bookedSlots || []).map((b) => {
        // Normaliser les timestamps DB vers le même format que generate90mSlots
        const startISO = new Date(b.start_at).toISOString();
        const endISO = new Date(b.end_at).toISOString();
        return buildSlotId(clubId, courtId, startISO, endISO);
      })
    );

    // Map pour récupérer le booking_id si réservé
    const bookedSlotMap = new Map(
      (bookedSlots || []).map((b) => {
        const startISO = new Date(b.start_at).toISOString();
        const endISO = new Date(b.end_at).toISOString();
        const slotId = buildSlotId(clubId, courtId, startISO, endISO);
        return [slotId, b.booking_id];
      })
    );

    // Étape 4 : Marquer chaque slot comme free ou reserved
    const availability: AvailabilitySlot[] = allSlots.map((slot) => {
      const isReserved = bookedSlotIds.has(slot.slot_id);
      const bookingId = bookedSlotMap.get(slot.slot_id);

      return {
        ...slot,
        status: isReserved ? 'reserved' : 'free',
        ...(bookingId && { booking_id: bookingId }),
      };
    });

    console.log('[AVAILABILITY RESULT]', {
      totalSlots: availability.length,
      freeSlots: availability.filter((s) => s.status === 'free').length,
      reservedSlots: availability.filter((s) => s.status === 'reserved').length,
    });

    // Retour (avec debug info si bookings fetch a échoué)
    return NextResponse.json({
      clubId,
      courtId,
      date: dateParam,
      slots: availability,
      meta: {
        totalSlots: availability.length,
        freeSlots: availability.filter((s) => s.status === 'free').length,
        reservedSlots: availability.filter((s) => s.status === 'reserved')
          .length,
        slotDuration: 90,
        openingHour: 9,
        closingHour: 23,
      },
      ...(bookingsFetchFailed && {
        debug: {
          bookingsFetchFailed: true,
          error: bookingsFetchError,
          warning: 'All slots shown as "free" - bookings could not be loaded',
        },
      }),
    });
  } catch (e: any) {
    console.error('[API EXCEPTION - GET availability]', e);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: e?.message ?? 'Unknown error',
      },
      { status: 500 }
    );
  }
}
