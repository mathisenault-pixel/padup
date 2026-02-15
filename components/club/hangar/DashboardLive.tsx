"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Booking = {
  id: string;
  club_id: string;
  court_id: string;
  slot_start: string;
  slot_end: string;
  status: string;
  created_at: string;
};

function formatTime(date: string) {
  const d = new Date(date);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function StatusPill({ status }: { status: string }) {
  const label = status === "confirmed" ? "Confirmée" : "Annulée";

  const cls =
    status === "confirmed"
      ? "border-green-400/30 bg-green-400/10 text-green-200"
      : "border-red-400/30 bg-red-400/10 text-red-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${cls}`}>
      {label}
    </span>
  );
}

export default function DashboardLive({
  clubId,
  initialBookings,
}: {
  clubId: string;
  initialBookings: Booking[];
}) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [isLive, setIsLive] = useState(false);

  // Calculer les bornes du jour pour filtrer
  const todayBounds = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, []);

  // Vérifier si un booking est aujourd'hui
  const isToday = (booking: Booking) => {
    const bookingDate = new Date(booking.slot_start);
    return bookingDate >= todayBounds.start && bookingDate <= todayBounds.end;
  };

  // Calculer les KPI
  const confirmed = useMemo(
    () => bookings.filter((b) => b.status === "confirmed").length,
    [bookings]
  );

  const cancelled = useMemo(
    () => bookings.filter((b) => b.status === "cancelled").length,
    [bookings]
  );

  const next = useMemo(
    () => bookings.find((b) => b.status === "confirmed") ?? null,
    [bookings]
  );

  useEffect(() => {
    const channel = supabase
      .channel("hangar-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `club_id=eq.${clubId}`,
        },
        (payload) => {
          console.log("[Realtime] Event reçu:", payload.eventType, payload);

          setBookings((prev) => {
            let updated = [...prev];

            if (payload.eventType === "INSERT") {
              const newBooking = payload.new as Booking;
              // Ajouter seulement si aujourd'hui et pas déjà présent
              if (isToday(newBooking) && !prev.find((b) => b.id === newBooking.id)) {
                updated = [...prev, newBooking];
              }
            } else if (payload.eventType === "UPDATE") {
              const updatedBooking = payload.new as Booking;
              // Mettre à jour si présent, sinon ajouter si aujourd'hui
              const existingIndex = prev.findIndex((b) => b.id === updatedBooking.id);
              if (existingIndex >= 0) {
                updated = prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b));
              } else if (isToday(updatedBooking)) {
                updated = [...prev, updatedBooking];
              }
            } else if (payload.eventType === "DELETE") {
              const deletedId = payload.old.id;
              updated = prev.filter((b) => b.id !== deletedId);
            }

            // Filtrer pour garder seulement aujourd'hui + trier par slot_start
            return updated
              .filter((b) => isToday(b))
              .sort((a, b) => new Date(a.slot_start).getTime() - new Date(b.slot_start).getTime());
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsLive(true);
          console.log("[Realtime] ✅ Subscribed");
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsLive(false);
    };
  }, [clubId, todayBounds]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Le Hangar <span className="text-slate-400">— Dashboard</span>
            </h1>
            <p className="mt-2 text-slate-400">Aujourd'hui</p>
          </div>

          {/* Live Badge */}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                isLive ? "bg-green-500 animate-pulse" : "bg-slate-500"
              }`}
            />
            <span className="text-sm text-slate-300">{isLive ? "Live" : "Hors ligne"}</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Réservations (confirmées)</div>
            <div className="mt-2 text-2xl font-semibold">{confirmed}</div>
            <div className="mt-1 text-sm text-slate-400">Aujourd'hui</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Annulations</div>
            <div className="mt-2 text-2xl font-semibold">{cancelled}</div>
            <div className="mt-1 text-sm text-slate-400">Aujourd'hui</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Prochaine réservation</div>
            <div className="mt-2 text-2xl font-semibold">
              {next ? `${formatTime(next.slot_start)}` : "—"}
            </div>
            <div className="mt-1 text-sm text-slate-400">À venir</div>
          </div>
        </div>

        {/* Planning Table */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold">Planning du jour</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {bookings.length} réservation(s)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase tracking-wider text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="px-5 py-3">Heure</th>
                  <th className="px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-5 py-4 font-medium">
                      {formatTime(b.slot_start)} → {formatTime(b.slot_end)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={b.status} />
                    </td>
                  </tr>
                ))}

                {bookings.length === 0 && (
                  <tr>
                    <td className="px-5 py-10 text-center text-slate-400" colSpan={2}>
                      Aucune réservation aujourd'hui
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
