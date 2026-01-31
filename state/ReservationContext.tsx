/**
 * Context global pour l'état de réservation
 * Partage reservedSlotId entre tous les composants de l'app
 */

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ReservationContextType {
  reservedSlotId: string | null;
  setReservedSlotId: (slotId: string | null) => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(
  undefined
);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [reservedSlotId, setReservedSlotId] = useState<string | null>(null);

  return (
    <ReservationContext.Provider value={{ reservedSlotId, setReservedSlotId }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error(
      "useReservation must be used within a ReservationProvider"
    );
  }
  return context;
}
