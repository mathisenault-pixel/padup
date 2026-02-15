/**
 * Page Planning Club (Staff/Owner)
 * 
 * Affiche le planning complet d'un club (tous les terrains).
 * Source de vérité : API /api/club/planning
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTodayDateString, addDays, formatDateLong, type AvailabilitySlot } from "@/lib/slots";
import { getCurrentClub } from "@/lib/getClub";

type CourtPlanning = {
  court_id: string;
  court_name: string;
  slots: AvailabilitySlot[];
  meta: {
    totalSlots: number;
    freeSlots: number;
    reservedSlots: number;
  };
};

type PlanningResponse = {
  clubId: string;
  date: string;
  view: string;
  courts: CourtPlanning[];
  meta: {
    totalCourts: number;
    totalSlots: number;
    totalFreeSlots: number;
    totalReservedSlots: number;
    slotDuration: number;
    openingHour: number;
    closingHour: number;
  };
};

export default function ClubPlanningPage() {
  const router = useRouter();
  const [club, setClub] = useState<any>(null);
  const [clubId, setClubId] = useState<string | null>(null);

  const [dateStr, setDateStr] = useState(getTodayDateString());
  const [view, setView] = useState<"day" | "week">("day");
  const [planning, setPlanning] = useState<PlanningResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier la connexion au montage
  useEffect(() => {
    const loadData = async () => {
      const { club: userClub, session } = await getCurrentClub();
      
      if (!session) {
        router.replace('/club');
        return;
      }

      if (!userClub) {
        alert('Aucun club associé');
        router.replace('/club/dashboard');
        return;
      }

      setClub(userClub);
      setClubId(userClub.id);
    };

    loadData();
  }, [router]);

  /**
   * Charger le planning depuis l'API
   */
  async function loadPlanning() {
    if (!clubId) return;
    setLoading(true);
    setError(null);

    console.log("[LOAD PLANNING]", {
      clubId,
      date: dateStr,
      view,
    });

    try {
      const res = await fetch(
        `/api/club/planning?clubId=${clubId}&date=${dateStr}&view=${view}`
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("[API ERROR - planning]", {
          status: res.status,
          error: errorData,
        });
        setError(`Erreur: ${errorData?.error || res.statusText}`);
        setLoading(false);
        return;
      }

      const data: PlanningResponse = await res.json();

      console.log("[PLANNING LOADED]", {
        courts: data.meta.totalCourts,
        totalSlots: data.meta.totalSlots,
        freeSlots: data.meta.totalFreeSlots,
        reservedSlots: data.meta.totalReservedSlots,
      });

      setPlanning(data);
    } catch (e: any) {
      console.error("[FETCH ERROR - planning]", e);
      setError(`Erreur réseau: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Charger le planning au montage et quand les paramètres changent
   */
  useEffect(() => {
    if (clubId) {
      loadPlanning();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr, view, clubId]);

  /**
   * Navigation de date
   */
  function goToPreviousDay() {
    setDateStr(addDays(dateStr, -1));
  }

  function goToNextDay() {
    setDateStr(addDays(dateStr, 1));
  }

  function goToToday() {
    setDateStr(getTodayDateString());
  }

  if (!club) return null;

  return (
    <main style={{ padding: 24, maxWidth: 1200 }}>
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => router.push('/club/dashboard')}
          style={{ color: '#007bff', marginBottom: 8 }}
        >
          ← Retour au dashboard
        </button>
        <h1>Planning Club - {club.name}</h1>
      </div>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Date selector */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={goToPreviousDay} disabled={loading}>
            ← Jour précédent
          </button>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
          />
          <button onClick={goToNextDay} disabled={loading}>
            Jour suivant →
          </button>
          <button onClick={goToToday} disabled={loading}>
            Aujourd'hui
          </button>
        </div>

        {/* View selector */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setView("day")}
            disabled={view === "day" || loading}
            style={{
              fontWeight: view === "day" ? "bold" : "normal",
              backgroundColor: view === "day" ? "#007bff" : "white",
              color: view === "day" ? "white" : "black",
            }}
          >
            Jour
          </button>
          <button
            onClick={() => setView("week")}
            disabled={view === "week" || loading}
            style={{
              fontWeight: view === "week" ? "bold" : "normal",
              backgroundColor: view === "week" ? "#007bff" : "white",
              color: view === "week" ? "white" : "black",
            }}
          >
            Semaine
          </button>
        </div>

        <button onClick={loadPlanning} disabled={loading}>
          {loading ? "Chargement..." : "Rafraîchir"}
        </button>
      </div>

      {/* Date actuelle */}
      {planning && (
        <div
          style={{
            marginBottom: 24,
            padding: 12,
            backgroundColor: "#f8f9fa",
            borderRadius: 8,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            {formatDateLong(planning.date)}
          </div>
          <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
            {planning.meta.totalCourts} terrains • {planning.meta.totalSlots}{" "}
            créneaux au total
          </div>
          <div style={{ fontSize: 14, color: "#666" }}>
            {planning.meta.totalFreeSlots} créneaux libres •{" "}
            {planning.meta.totalReservedSlots} réservations
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: 12,
            border: "1px solid #dc3545",
            borderRadius: 8,
            marginBottom: 24,
            backgroundColor: "#f8d7da",
            color: "#721c24",
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: 24, textAlign: "center" }}>
          Chargement du planning...
        </div>
      )}

      {/* Planning */}
      {!loading && planning && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {planning.courts.map((court) => (
            <div
              key={court.court_id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
              }}
            >
              {/* Court header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottom: "2px solid #007bff",
                }}
              >
                <div>
                  <h3 style={{ margin: 0 }}>{court.court_name}</h3>
                  <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
                    {court.meta.freeSlots} libres • {court.meta.reservedSlots}{" "}
                    réservés
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color:
                      court.meta.freeSlots === 0
                        ? "#dc3545"
                        : court.meta.freeSlots < 5
                        ? "#ffc107"
                        : "#28a745",
                  }}
                >
                  {Math.round(
                    (court.meta.freeSlots / court.meta.totalSlots) * 100
                  )}
                  % libre
                </div>
              </div>

              {/* Slots grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: 8,
                }}
              >
                {court.slots.map((slot) => {
                  const isFree = slot.status === "free";
                  return (
                    <div
                      key={slot.slot_id}
                      style={{
                        padding: 8,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        backgroundColor: isFree ? "#d4edda" : "#f8d7da",
                        textAlign: "center",
                        fontSize: 12,
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{slot.label}</div>
                      <div style={{ fontSize: 10, marginTop: 4, color: "#666" }}>
                        {isFree ? "Libre" : "Réservé"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !planning && !error && (
        <div style={{ padding: 24, textAlign: "center", color: "#666" }}>
          Aucune donnée disponible.
        </div>
      )}
    </main>
  );
}
