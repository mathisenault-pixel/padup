import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase env vars");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: "public" },
  auth: { persistSession: false },
});

export async function POST(req: Request) {
  try {
    console.log("[API /bookings POST] Start");
    
    const body = await req.json();

    const { clubId, courtId, slotStart, createdBy, status } = body;

    if (!clubId || !courtId || !slotStart || !createdBy) {
      console.log("[API /bookings POST] Validation error - missing fields");
      return NextResponse.json(
        { 
          error: "Missing required fields: clubId, courtId, slotStart, createdBy",
          code: "MISSING_FIELDS"
        },
        { status: 400 }
      );
    }

    console.log("[API INSERT - bookings]", {
      clubId,
      courtId,
      slotStart,
      createdBy,
    });

    // =====================================================
    // Calculer slot_start et slot_end (timestamptz)
    // =====================================================
    const slotStartDate = new Date(slotStart);
    const slotEndDate = new Date(slotStartDate.getTime() + 90 * 60 * 1000); // +90 minutes
    
    const slotStartISO = slotStartDate.toISOString();
    const slotEndISO = slotEndDate.toISOString();

    console.log("[SLOT CALCULATION]", {
      slotStart: slotStartISO,
      slotEnd: slotEndISO,
    });

    // =====================================================
    // INSERT direct dans bookings
    // Colonnes: club_id, court_id, slot_start, slot_end, created_by, status
    // Protection anti-double-booking via UNIQUE INDEX
    // =====================================================
    const { data, error } = await supabase
      .from("bookings")
      .insert([{
        club_id: clubId,
        court_id: courtId,
        slot_start: slotStartISO,
        slot_end: slotEndISO,
        created_by: createdBy,
        status: status || 'confirmed',
      }])
      .select()
      .single();

    if (error) {
      console.error("[INSERT ERROR - bookings]", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      // Erreur 23505 : Contrainte unique violée (créneau déjà réservé)
      if (error.code === "23505") {
        console.warn("[BOOKING CONFLICT - UNIQUE CONSTRAINT]", {
          courtId,
          slotStart: slotStartISO,
          message: "Créneau déjà réservé par quelqu'un d'autre",
        });
        return NextResponse.json(
          { 
            error: "Ce créneau est déjà réservé.",
            code: "SLOT_ALREADY_BOOKED",
            hint: "Choisissez un autre créneau"
          },
          { status: 409 }
        );
      }

      // Autres erreurs
      return NextResponse.json(
        { 
          error: "Erreur lors de la création de la réservation",
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        }, 
        { status: 500 }
      );
    }

    console.log("[INSERT SUCCESS - bookings]", data);
    console.log("[API /bookings POST] Success");

    return NextResponse.json({ 
      success: true,
      booking: data,
      bookingId: data.id,
      clubId: data.club_id,
      courtId: data.court_id,
      createdBy: data.created_by,
      slotStart: data.slot_start,
      slotEnd: data.slot_end,
      status: data.status,
      durationMinutes: 90
    });
  } catch (e: any) {
    console.error("[API EXCEPTION - POST /api/bookings]", e);
    console.error("[API /bookings POST] Unhandled exception", {
      message: e?.message,
      stack: e?.stack,
      name: e?.name,
    });
    
    // ✅ TOUJOURS renvoyer du JSON même en cas d'exception
    return NextResponse.json(
      { 
        error: e?.message ?? "Internal server error",
        code: "INTERNAL_ERROR",
        details: process.env.NODE_ENV === "development" ? e?.stack : undefined
      },
      { status: 500 }
    );
  }
}
