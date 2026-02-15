"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardLive({
  clubId,
  initialBookings,
}: {
  clubId: string;
  initialBookings: any[];
}) {
  const [bookings, setBookings] = useState(initialBookings);

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
          setBookings((prev) => {
            if (payload.eventType === "INSERT") {
              return [...prev, payload.new];
            }

            if (payload.eventType === "UPDATE") {
              return prev.map((b) =>
                b.id === payload.new.id ? payload.new : b
              );
            }

            if (payload.eventType === "DELETE") {
              return prev.filter((b) => b.id !== payload.old.id);
            }

            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clubId]);

  return null; // on utilise juste pour le live, l'affichage reste côté page
}
