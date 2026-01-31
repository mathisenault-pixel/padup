/**
 * Page Disponibilités (Joueur)
 * 
 * SYSTÈME DE LOCK INTER-ONGLETS AVEC OWNERSHIP
 * - Chaque onglet a un tabId unique (sessionStorage)
 * - Lock stocké dans localStorage : { slotId, ownerTabId, ts }
 * - Seul l'onglet propriétaire peut annuler
 * - slotId basé sur slot.start_at ISO normalisé
 * - CLÉ REACT = slotId
 */

"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { getTodayDateString, type AvailabilitySlot } from "@/lib/slots";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

// =====================================================
// SYSTÈME DE LOCK INTER-ONGLETS AVEC OWNERSHIP
// =====================================================
const TAB_KEY = "padup:tabId";
const LOCK_KEY = "padup:slotLock";

type SlotLock = {
  slotId: string;
  ownerTabId: string;
  ts: number;
};

// =====================================================
// FONCTION UNIQUE : slotId basé sur start_at ISO normalisé
// =====================================================
function buildSlotId({ courtId, startISO }: { 
  courtId: string; 
  startISO: string; 
}): string {
  // Normaliser à la minute : YYYY-MM-DDTHH:MM
  const normalized = new Date(startISO).toISOString().slice(0, 16);
  return `${courtId}_${normalized}`;
}

export default function AvailabilityPage() {
  const clubId = "ba43c579-e522-4b51-8542-737c2c6452bb";
  const courtId = "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e";
  const createdBy = "cee11521-8f13-4157-8057-034adf2cb9a0";

  const [dateStr, setDateStr] = useState(getTodayDateString());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  
  // =====================================================
  // ÉTAT LOCAL : tabId + lock (initialisés côté client uniquement)
  // =====================================================
  const [tabId, setTabId] = useState<string | null>(null);
  const [slotLock, setSlotLock] = useState<SlotLock | null>(null);
  
  // Dérivé : slotId réservé (pour comparaison simple)
  const reservedSlotId = slotLock?.slotId ?? null;
  
  // Est-ce que cet onglet est propriétaire du lock ?
  const isOwner = tabId ? slotLock?.ownerTabId === tabId : false;

  // Modal de confirmation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Toast notifications
  const { showToast, ToastComponent } = useToast();

  /**
   * 1. Initialiser tabId + lock côté client uniquement (après hydratation)
   */
  useEffect(() => {
    // Générer ou récupérer tabId depuis sessionStorage
    let id = sessionStorage.getItem(TAB_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(TAB_KEY, id);
    }
    setTabId(id);
    console.log("[INIT TAB ID]", id);

    // Charger le lock depuis localStorage
    const raw = localStorage.getItem(LOCK_KEY);
    if (raw) {
      try {
        const lock = JSON.parse(raw) as SlotLock;
        console.log("[INIT LOCK]", lock);
        setSlotLock(lock);
      } catch (e) {
        console.error("[INIT LOCK ERROR]", e);
      }
    }
  }, []);

  /**
   * 2. Écouter les changements inter-onglets (storage event)
   */
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === LOCK_KEY) {
        const raw = localStorage.getItem(LOCK_KEY);
        const lock = raw ? (JSON.parse(raw) as SlotLock) : null;
        console.log("[STORAGE EVENT - LOCK]", {
          oldValue: e.oldValue,
          newValue: e.newValue,
          parsedLock: lock,
        });
        setSlotLock(lock);
      }
    }
    
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /**
   * Charger les disponibilités depuis l'API
   */
  async function loadAvailability() {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/clubs/${clubId}/courts/${courtId}/availability?date=${dateStr}`
      );

      if (!res.ok) {
        // Lire le body en texte brut pour voir l'erreur réelle
        const text = await res.text();
        console.error("[AVAILABILITY ERROR]", {
          status: res.status,
          statusText: res.statusText,
          body: text,
        });
        
        // Essayer de parser en JSON, sinon afficher le texte brut
        let errorMsg = text;
        try {
          const json = JSON.parse(text);
          errorMsg = json.error || json.message || text;
        } catch {
          // Garder le texte brut
        }
        
        showToast(`❌ Erreur ${res.status}: ${errorMsg}`, "error");
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("[AVAILABILITY SUCCESS]", {
        totalSlots: data.slots?.length,
        debug: data.debug,
      });
      setSlots(data.slots);
    } catch (e: any) {
      console.error("[AVAILABILITY FETCH ERROR]", e);
      showToast(`❌ Erreur réseau: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Ouvrir la modal de confirmation
   */
  function openBookingModal(slot: AvailabilitySlot) {
    // =====================================================
    // GUARD : tabId doit être initialisé
    // =====================================================
    if (!tabId) {
      showToast("⏳ Initialisation en cours...", "info");
      return;
    }

    // =====================================================
    // Construire slotId à partir de start_at ISO
    // =====================================================
    const slotId = buildSlotId({ courtId, startISO: slot.start_at });
    
    console.log("[CLICK]", slotId);

    // Vérifier si déjà réservé (DB ou local)
    if (slot.status === "reserved" || slotId === reservedSlotId) {
      showToast("Ce créneau est déjà réservé.", "warning");
      return;
    }

    setSelectedSlot(slot);
    setIsModalOpen(true);
  }

  /**
   * Fermer la modal
   */
  function closeBookingModal() {
    if (!isBooking) {
      setIsModalOpen(false);
      setSelectedSlot(null);
    }
  }

  /**
   * Confirmer la réservation
   */
  async function confirmBooking() {
    if (!selectedSlot) return;

    // =====================================================
    // GUARD : tabId doit être initialisé
    // =====================================================
    if (!tabId) {
      showToast("⏳ Initialisation en cours...", "info");
      return;
    }

    // =====================================================
    // Construire slotId à partir de start_at ISO
    // =====================================================
    const slotId = buildSlotId({ courtId, startISO: selectedSlot.start_at });
    
    const payload = {
      clubId,
      courtId,
      slotStart: selectedSlot.start_at,
      createdBy,
    };
    
    console.log("[BOOK] click", { slotId, tabId, payload });

    // =====================================================
    // VÉRIFIER SI DÉJÀ LOCKÉ PAR UN AUTRE ONGLET
    // =====================================================
    const rawLock = localStorage.getItem(LOCK_KEY);
    if (rawLock) {
      try {
        const existingLock = JSON.parse(rawLock) as SlotLock;
        if (existingLock.slotId === slotId && existingLock.ownerTabId !== tabId) {
          showToast("⚠️ Déjà réservé dans un autre onglet.", "warning");
          closeBookingModal();
          return;
        }
      } catch (e) {
        console.error("[PARSE LOCK ERROR]", e);
      }
    }

    // =====================================================
    // ÉCRIRE LE LOCK AVEC OWNERSHIP (synchro inter-onglets)
    // =====================================================
    const newLock: SlotLock = {
      slotId,
      ownerTabId: tabId,
      ts: Date.now(),
    };
    localStorage.setItem(LOCK_KEY, JSON.stringify(newLock));
    setSlotLock(newLock);
    setIsBooking(true);

    // =====================================================
    // APPEL API RÉEL AVEC ANTI DOUBLE-BOOKING DB
    // =====================================================
    try {
      console.log("[BOOK] request", { url: "/api/bookings", method: "POST" });
      
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[BOOK] response", { status: res.status, ok: res.ok });

      // Conflit (déjà réservé) - Anti double-booking DB
      if (res.status === 409) {
        showToast("⚠️ Trop tard : quelqu'un vient de réserver ce créneau.", "warning");
        
        // Rollback du lock local
        localStorage.removeItem(LOCK_KEY);
        setSlotLock(null);
        
        // Refresh pour voir l'état réel
        await loadAvailability();
        return;
      }

      // Autre erreur
      if (!res.ok) {
        // Lire le body en texte brut pour voir l'erreur réelle
        const text = await res.text();
        console.error("[BOOK] error", {
          status: res.status,
          body: text,
        });
        
        showToast(`❌ Erreur ${res.status}: ${text}`, "error");
        
        // Rollback : retirer le lock
        localStorage.removeItem(LOCK_KEY);
        setSlotLock(null);
        return;
      }

      // Succès
      const result = await res.json();
      console.log("[BOOK] success", result);
      
      showToast("✅ Réservation confirmée !", "success");
      
      // Refresh après succès pour synchroniser avec DB
      setTimeout(() => {
        loadAvailability();
      }, 500);
    } catch (e: any) {
      console.error("[BOOK] error", e);
      showToast(`❌ Erreur réseau: ${e.message}`, "error");
      
      // Rollback : retirer le lock
      localStorage.removeItem(LOCK_KEY);
      setSlotLock(null);
    } finally {
      // ✅ TOUJOURS désactiver le loading
      setIsBooking(false);
      closeBookingModal();
    }
  }

  /**
   * BOUTON DEBUG : Annuler la réservation (seulement si owner)
   */
  function cancelReservationDebug() {
    // GUARD : tabId doit être initialisé
    if (!tabId) {
      showToast("⏳ Initialisation en cours...", "info");
      return;
    }

    const rawLock = localStorage.getItem(LOCK_KEY);
    if (!rawLock) {
      showToast("Aucune réservation active.", "info");
      return;
    }
    
    try {
      const lock = JSON.parse(rawLock) as SlotLock;
      
      // Vérifier ownership
      if (lock.ownerTabId !== tabId) {
        showToast("❌ Impossible : réservé depuis un autre onglet.", "warning");
        return;
      }
      
      console.log("[DEBUG] Annulation réservation", { lock, tabId });
      localStorage.removeItem(LOCK_KEY);
      setSlotLock(null);
      showToast("🔓 Réservation annulée (debug)", "info");
    } catch (e) {
      console.error("[PARSE LOCK ERROR]", e);
      showToast("Erreur lors de la lecture du lock.", "error");
    }
  }

  /**
   * Charger les disponibilités au montage et quand la date change
   */
  useEffect(() => {
    loadAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr]);

  /**
   * Realtime: synchronisation automatique entre onglets
   */
  useEffect(() => {
    const channel = supabase
      .channel("reservations-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reservations",
          filter: `court_id=eq.${courtId}`,
        },
        () => {
          // Refresh les disponibilités
          loadAvailability();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courtId]);

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <a href="/" style={{ display: "inline-block", marginBottom: 16 }}>
        ← Retour
      </a>

      <h1>Réserver — Terrain 2</h1>

      {/* Message d'initialisation si tabId pas encore chargé */}
      {!tabId && (
        <div
          style={{
            padding: 12,
            backgroundColor: "#fff3cd",
            borderRadius: 8,
            marginBottom: 12,
            fontSize: 14,
            border: "1px solid #ffc107",
          }}
        >
          ⏳ <strong>Initialisation en cours...</strong> Veuillez patienter.
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          margin: "12px 0",
        }}
      >
        <label>
          Date :
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            style={{ marginLeft: 8 }}
          />
        </label>

        <button onClick={loadAvailability} disabled={loading}>
          {loading ? "Chargement..." : "Rafraîchir"}
        </button>

        {/* Bouton annulation : visible seulement pour le propriétaire */}
        {slotLock && isOwner && (
          <button
            onClick={cancelReservationDebug}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            🔓 Annuler ma réservation (debug)
          </button>
        )}
      </div>

      {/* Affichage de l'état du lock */}
      {slotLock && tabId && (
        <div
          style={{
            padding: 12,
            backgroundColor: isOwner ? "#e7f3ff" : "#fff3cd",
            borderRadius: 8,
            marginBottom: 12,
            fontSize: 14,
            border: isOwner ? "1px solid #007bff" : "1px solid #ffc107",
          }}
        >
          <strong>{isOwner ? "📌 Votre réservation" : "🔒 Réservé (autre onglet)"} :</strong>{" "}
          <code style={{ fontSize: 12, color: "#666" }}>{slotLock.slotId}</code>
          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
            Owner: {slotLock.ownerTabId.slice(0, 8)}... | 
            Vous: {tabId.slice(0, 8)}... {isOwner && "✓"}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ padding: 24, textAlign: "center" }}>
          Chargement des disponibilités...
        </div>
      )}

      {!loading && slots.length === 0 && (
        <div style={{ padding: 24, textAlign: "center", color: "#666" }}>
          Aucun créneau disponible pour cette date.
        </div>
      )}

      {!loading && slots.length > 0 && (
        <>
          <div style={{ marginBottom: 12, fontSize: 14, color: "#666" }}>
            {slots.filter((s) => s.status === "free").length} créneaux
            disponibles sur {slots.length}
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}
          >
            {slots.map((slot) => {
              // =====================================================
              // Construire slotId à partir de start_at ISO
              // =====================================================
              const slotId = buildSlotId({ courtId, startISO: slot.start_at });
              const isReserved = slotId === reservedSlotId;
              const isBooked = slot.status === "reserved";
              
              // =====================================================
              // GRISAGE : UNIQUEMENT SI isReserved OU isBooked OU tabId pas initialisé
              // =====================================================
              const isDisabled = !tabId || isReserved || isBooked;

              // Texte du statut selon ownership
              let statusText = "Libre";
              let statusIcon = "";
              if (isReserved) {
                statusText = isOwner ? "Votre réservation" : "Réservé (autre onglet)";
                statusIcon = isOwner ? "🔒" : "🚫";
              } else if (isBooked) {
                statusText = "Occupé";
                statusIcon = "";
              }

              // ✅ CLÉ REACT = slotId
              return (
                <button
                  key={slotId}
                  onClick={() => openBookingModal(slot)}
                  disabled={isDisabled}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: isReserved
                      ? isOwner
                        ? "2px solid #007bff"
                        : "2px solid #ffc107"
                      : "1px solid #ddd",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.6 : 1,
                    textAlign: "left",
                    backgroundColor: isReserved
                      ? isOwner
                        ? "#e7f3ff"
                        : "#fff3cd"
                      : isBooked
                      ? "#f5f5f5"
                      : "white",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{slot.label}</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    {statusIcon} {statusText}
                  </div>
                  {/* DEBUG: afficher slotId */}
                  <div style={{ 
                    fontSize: 8, 
                    color: '#666', 
                    marginTop: 4,
                    fontFamily: 'monospace',
                    wordBreak: 'break-all'
                  }}>
                    {slotId}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Modal de confirmation */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeBookingModal}
        title="Confirmer votre réservation"
        footer={
          <>
            <button
              type="button"
              onClick={closeBookingModal}
              disabled={isBooking}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                backgroundColor: "white",
                cursor: isBooking ? "not-allowed" : "pointer",
                opacity: isBooking ? 0.6 : 1,
              }}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={confirmBooking}
              disabled={isBooking}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#007bff",
                color: "white",
                cursor: isBooking ? "not-allowed" : "pointer",
                opacity: isBooking ? 0.6 : 1,
              }}
            >
              {isBooking ? "⏳ Réservation..." : "✅ Confirmer"}
            </button>
          </>
        }
      >
        {selectedSlot && (
          <div>
            <p style={{ marginBottom: 16, fontSize: 15 }}>
              Vous êtes sur le point de réserver le créneau suivant :
            </p>
            <div
              style={{
                padding: 16,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
                {selectedSlot.label}
              </div>
              <div style={{ fontSize: 14, color: "#666" }}>
                Durée : 1h30 (90 minutes)
              </div>
              <div style={{ fontSize: 14, color: "#666" }}>
                Terrain 2
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
              En confirmant, ce créneau sera réservé à votre nom.
            </p>
          </div>
        )}
      </Modal>

      {/* Toast notifications */}
      {ToastComponent}
    </main>
  );
}
