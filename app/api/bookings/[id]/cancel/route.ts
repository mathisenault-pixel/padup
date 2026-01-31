/**
 * POST /api/bookings/:id/cancel
 * 
 * Annule une réservation.
 * Permissions: user (sa propre réservation) ou staff/owner (n'importe quelle réservation du club)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env vars');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' },
  auth: { persistSession: false },
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id: bookingId } = await context.params;

    // TODO: Récupérer auth.uid() depuis la session
    // Pour MVP, on utilise cancelledBy depuis le body (optionnel)
    const body = await req.json().catch(() => ({}));
    const cancelledBy = body.cancelledBy || 'cee11521-8f13-4157-8057-034adf2cb9a0';

    // Validation: bookingId format UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(bookingId)) {
      return NextResponse.json(
        {
          error: 'Invalid booking ID format',
          hint: 'Must be a valid UUID',
        },
        { status: 400 }
      );
    }

    console.log('[API RPC CALL - cancel_booking]', {
      bookingId,
      cancelledBy,
    });

    // Appeler la RPC cancel_booking
    const { data, error } = await supabase.rpc('cancel_booking', {
      p_booking_id: bookingId,
      p_cancelled_by: cancelledBy,
    });

    if (error) {
      console.error('[RPC ERROR - cancel_booking]', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      // Erreur 1: Réservation introuvable
      if (error.message?.includes('introuvable')) {
        return NextResponse.json(
          {
            error: 'Réservation introuvable',
            code: 'BOOKING_NOT_FOUND',
            bookingId,
          },
          { status: 404 }
        );
      }

      // Erreur 2: Permission refusée
      if (error.message?.includes('Permission refusée')) {
        return NextResponse.json(
          {
            error: 'Permission refusée',
            code: 'FORBIDDEN',
            hint: 'Vous ne pouvez annuler que vos propres réservations',
          },
          { status: 403 }
        );
      }

      // Erreur 3: Déjà annulée
      if (error.message?.includes('déjà annulée')) {
        return NextResponse.json(
          {
            error: 'Réservation déjà annulée',
            code: 'ALREADY_CANCELLED',
          },
          { status: 400 }
        );
      }

      // Erreur 4: Autres erreurs
      return NextResponse.json(
        {
          error: "Erreur lors de l'annulation",
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    console.log('[RPC SUCCESS - cancel_booking]', data);

    // Retour succès
    return NextResponse.json({
      success: true,
      booking: {
        id: data.booking_id,
        status: data.status,
        cancelledAt: data.cancelled_at,
        cancelledBy: data.cancelled_by,
      },
    });
  } catch (e: any) {
    console.error('[API EXCEPTION - POST /api/bookings/:id/cancel]', e);
    return NextResponse.json(
      { error: e?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
