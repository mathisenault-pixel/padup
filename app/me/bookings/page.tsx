/**
 * Page Mes Réservations (Joueur)
 * 
 * Affiche toutes les réservations de l'utilisateur connecté.
 * Permet d'annuler une réservation.
 */

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Booking = {
  identifiant: string;
  club_id: string;
  court_id: string;
  slot_start: string;
  fin_de_slot: string;
  statut: string;
  cree_a: string;
  clubs: { name: string } | null;
  courts: { name: string } | null;
};

export default function MyBookingsPage() {
  // TODO: Récupérer l'user depuis la session
  const userId = "cee11521-8f13-4157-8057-034adf2cb9a0";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "cancelled">("upcoming");

  // Modal d'annulation
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Toast notifications
  const { toast, showToast, hideToast, ToastComponent } = useToast();

  // Protection contre les appels concurrents
  const [isLoadingRef, setIsLoadingRef] = useState(false);

  /**
   * Charger les réservations de l'utilisateur
   */
  async function loadBookings() {
    // Empêcher les appels concurrents
    if (isLoadingRef) {
      console.log("[LOAD BOOKINGS] Déjà en cours, ignoré");
      return;
    }

    setIsLoadingRef(true);
    setLoading(true);

    console.log("[LOAD BOOKINGS]", {
      userId,
      filter,
    });

    try {
      let query = supabase
        .from("reservations")
        .select(
          `
          identifiant,
          club_id,
          court_id,
          slot_start,
          fin_de_slot,
          statut,
          cree_a,
          clubs (
            name
          ),
          courts (
            name
          )
        `
        )
        .eq("cree_par", userId)
        .order("slot_start", { ascending: false });

      // Filtrer par statut
      if (filter === "upcoming") {
        query = query
          .eq("statut", "confirmed")
          .gte("slot_start", new Date().toISOString());
      } else if (filter === "past") {
        query = query.lt("slot_start", new Date().toISOString());
      } else if (filter === "cancelled") {
        query = query.eq("statut", "cancelled");
      }

      const { data, error } = await query;

      if (error) {
        console.error("[SUPABASE ERROR - loadBookings]", error);
        showToast(`Erreur: ${error.message}`, "error");
        setLoading(false);
        return;
      }

      console.log("[BOOKINGS LOADED]", {
        count: data?.length || 0,
      });

      const normalizedBookings: Booking[] = (data ?? []).map((b: any) => ({
        ...b,
        clubs: b?.clubs ?? null,
        courts: b?.courts ?? null,
      }));

      setBookings(normalizedBookings);
    } catch (e: any) {
      console.error("[FETCH ERROR - bookings]", e);
      showToast(`Erreur réseau: ${e.message}`, "error");
    } finally {
      setLoading(false);
      setIsLoadingRef(false);
    }
  }

  /**
   * Ouvrir la modal d'annulation
   */
  function openCancelModal(booking: Booking) {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  }

  /**
   * Fermer la modal d'annulation
   */
  function closeCancelModal() {
    if (!isCancelling) {
      setIsCancelModalOpen(false);
      setBookingToCancel(null);
    }
  }

  /**
   * Confirmer l'annulation
   */
  async function confirmCancel() {
    if (!bookingToCancel) return;

    setIsCancelling(true);

    console.log("[CANCEL BOOKING]", {
      bookingId: bookingToCancel.identifiant,
    });

    try {
      const res = await fetch(`/api/bookings/${bookingToCancel.identifiant}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cancelledBy: userId,
        }),
      });

      // Erreur 404: réservation introuvable
      if (res.status === 404) {
        showToast("Réservation introuvable.", "error");
        setIsCancelling(false);
        closeCancelModal();
        return;
      }

      // Erreur 403: permission refusée
      if (res.status === 403) {
        showToast("Vous n'avez pas la permission d'annuler cette réservation.", "error");
        setIsCancelling(false);
        closeCancelModal();
        return;
      }

      // Erreur 400: déjà annulée
      if (res.status === 400) {
        showToast("Cette réservation est déjà annulée.", "warning");
        setIsCancelling(false);
        closeCancelModal();
        await loadBookings();
        return;
      }

      // Autre erreur
      if (!res.ok) {
        const error = await res.json().catch(() => null);
        console.error("[API ERROR - cancel booking]", {
          status: res.status,
          error,
        });
        showToast(`Erreur: ${error?.error || res.statusText}`, "error");
        setIsCancelling(false);
        closeCancelModal();
        return;
      }

      // Succès
      const result = await res.json();
      console.log("[CANCEL SUCCESS]", result);

      showToast("✅ Réservation annulée avec succès.", "success");

      setIsCancelling(false);
      closeCancelModal();

      // Refresh la liste
      await loadBookings();
    } catch (e: any) {
      console.error("[FETCH ERROR - cancel booking]", e);
      showToast(`Erreur réseau: ${e.message}`, "error");

      setIsCancelling(false);
      closeCancelModal();
    }
  }

  /**
   * Charger les réservations au montage et quand le filtre change
   */
  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  /**
   * Formater une date
   */
  function formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  /**
   * Formater une heure
   */
  function formatTime(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Vérifier si une réservation est annulable
   */
  function isCancellable(booking: Booking): boolean {
    // Seulement si status = confirmed et date dans le futur
    if (booking.statut !== "confirmed") return false;
    const slotStart = new Date(booking.slot_start);
    return slotStart > new Date();
  }

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <a href="/" style={{ display: "inline-block", marginBottom: 16 }}>
        ← Retour
      </a>

      <h1>Mes réservations</h1>

      {/* Filtres */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setFilter("upcoming")}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            backgroundColor: filter === "upcoming" ? "#007bff" : "white",
            color: filter === "upcoming" ? "white" : "black",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: filter === "upcoming" ? 600 : 400,
            opacity: loading ? 0.6 : 1,
          }}
        >
          À venir
        </button>
        <button
          onClick={() => setFilter("past")}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            backgroundColor: filter === "past" ? "#007bff" : "white",
            color: filter === "past" ? "white" : "black",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: filter === "past" ? 600 : 400,
            opacity: loading ? 0.6 : 1,
          }}
        >
          Passées
        </button>
        <button
          onClick={() => setFilter("cancelled")}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            backgroundColor: filter === "cancelled" ? "#007bff" : "white",
            color: filter === "cancelled" ? "white" : "black",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: filter === "cancelled" ? 600 : 400,
            opacity: loading ? 0.6 : 1,
          }}
        >
          Annulées
        </button>
        <button
          onClick={() => setFilter("all")}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            backgroundColor: filter === "all" ? "#007bff" : "white",
            color: filter === "all" ? "white" : "black",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: filter === "all" ? 600 : 400,
            opacity: loading ? 0.6 : 1,
          }}
        >
          Toutes
        </button>

        <button
          onClick={loadBookings}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            backgroundColor: "white",
            cursor: loading ? "not-allowed" : "pointer",
            marginLeft: "auto",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "⏳ Chargement..." : "🔄 Rafraîchir"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div
          style={{
            padding: 48,
            textAlign: "center",
            border: "1px solid #ddd",
            borderRadius: 12,
            backgroundColor: "#f8f9fa",
          }}
        >
          <div
            style={{
              fontSize: 48,
              marginBottom: 16,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          >
            ⏳
          </div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            Chargement des réservations...
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Empty state */}
      {!loading && bookings.length === 0 && (
        <div
          style={{
            padding: 48,
            textAlign: "center",
            border: "1px solid #ddd",
            borderRadius: 12,
            backgroundColor: "#f8f9fa",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            Aucune réservation
          </div>
          <div style={{ fontSize: 14, color: "#666" }}>
            {filter === "upcoming" && "Vous n'avez pas de réservation à venir."}
            {filter === "past" && "Vous n'avez pas de réservation passée."}
            {filter === "cancelled" && "Vous n'avez pas de réservation annulée."}
            {filter === "all" && "Vous n'avez pas encore fait de réservation."}
          </div>
        </div>
      )}

      {/* Liste des réservations */}
      {!loading && bookings.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {bookings.map((booking) => {
            const isPast = new Date(booking.slot_start) < new Date();
            const isCancelled = booking.statut === "cancelled";
            const canCancel = isCancellable(booking);

            return (
              <div
                key={booking.identifiant}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  padding: 20,
                  backgroundColor: isCancelled ? "#f8f9fa" : "white",
                  opacity: isCancelled ? 0.7 : 1,
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                      {booking.clubs?.name || "Club inconnu"}
                    </h3>
                    <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
                      {booking.courts?.name || "Terrain inconnu"}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div
                    style={{
                      padding: "4px 12px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: isCancelled
                        ? "#f8d7da"
                        : isPast
                          ? "#e2e3e5"
                          : "#d4edda",
                      color: isCancelled
                        ? "#721c24"
                        : isPast
                          ? "#383d41"
                          : "#155724",
                    }}
                  >
                    {isCancelled ? "Annulée" : isPast ? "Passée" : "Confirmée"}
                  </div>
                </div>

                {/* Date & Time */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
                    📅 {formatDate(booking.slot_start)}
                  </div>
                  <div style={{ fontSize: 15, color: "#666" }}>
                    🕐 {formatTime(booking.slot_start)} - {formatTime(booking.fin_de_slot)}
                    <span style={{ marginLeft: 8, fontSize: 13, color: "#999" }}>
                      (1h30)
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {canCancel && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #eee" }}>
                    <button
                      onClick={() => openCancelModal(booking)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "1px solid #dc3545",
                        backgroundColor: "white",
                        color: "#dc3545",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      Annuler la réservation
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal d'annulation */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={closeCancelModal}
        title="Annuler la réservation"
        footer={
          <>
            <button
              onClick={closeCancelModal}
              disabled={isCancelling}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                backgroundColor: "white",
                cursor: isCancelling ? "not-allowed" : "pointer",
                opacity: isCancelling ? 0.6 : 1,
              }}
            >
              Non, garder
            </button>
            <button
              onClick={confirmCancel}
              disabled={isCancelling}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#dc3545",
                color: "white",
                cursor: isCancelling ? "not-allowed" : "pointer",
                opacity: isCancelling ? 0.6 : 1,
              }}
            >
              {isCancelling ? "Annulation..." : "Oui, annuler"}
            </button>
          </>
        }
      >
        {bookingToCancel && (
          <div>
            <p style={{ marginBottom: 16, fontSize: 15 }}>
              Êtes-vous sûr de vouloir annuler cette réservation ?
            </p>
            <div
              style={{
                padding: 16,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
                {bookingToCancel.clubs?.name || "Club inconnu"}
              </div>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                {bookingToCancel.courts?.name || "Terrain inconnu"}
              </div>
              <div style={{ fontSize: 14, color: "#666" }}>
                📅 {formatDate(bookingToCancel.slot_start)}
              </div>
              <div style={{ fontSize: 14, color: "#666" }}>
                🕐 {formatTime(bookingToCancel.slot_start)} -{" "}
                {formatTime(bookingToCancel.fin_de_slot)} (1h30)
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#dc3545", margin: 0, fontWeight: 500 }}>
              ⚠️ Cette action est irréversible. Le créneau sera libéré et disponible pour d'autres joueurs.
            </p>
          </div>
        )}
      </Modal>

      {/* Toast notifications */}
      {ToastComponent}
    </main>
  );
}
