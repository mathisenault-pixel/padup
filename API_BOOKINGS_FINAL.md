# ✅ API /api/bookings - Configuration finale

## Fichier : `app/api/bookings/route.ts`

### Fonctionnalités implémentées

#### 1. **Insert Supabase avec colonnes correctes**
```typescript
{
  club_id: clubId,       // ✅
  court_id: courtId,     // ✅
  slot_start: slotStart, // ✅
  fin_de_slot: slotEnd,  // ✅
  cree_par: createdBy,   // ✅
  statut: "confirmé",    // ✅
}
```

#### 2. **Gestion des doublons (409 Conflict)**
```typescript
// Détecte la contrainte unique PostgreSQL
if (error.code === "23505") {
  return NextResponse.json(
    { error: "Ce créneau est déjà réservé." },
    { status: 409 }
  );
}
```

#### 3. **Logs complets**
```typescript
// Succès
console.log("[SUPABASE SUCCESS - POST /api/bookings]", {
  slotStart,
  slotEnd,
  reservationId: data?.[0]?.identifiant || data?.[0]?.id,
});

// Erreur
console.error("[SUPABASE ERROR - POST /api/bookings] Full error:", error);
console.error("[SUPABASE ERROR - POST /api/bookings] Details:", {
  message: error.message,
  details: error.details,
  hint: error.hint,
  code: error.code,
  statusCode: error.statusCode,
  name: error.name,
  body: { clubId, courtId, slotStart, slotEnd, createdBy },
});
```

#### 4. **Retour de données**
```typescript
// Succès (200)
{
  ok: true,
  reservation: { /* données de la réservation créée */ }
}

// Doublon (409)
{
  error: "Ce créneau est déjà réservé."
}

// Erreur serveur (500)
{
  error: {
    message: "...",
    code: "...",
    details: "...",
    hint: "..."
  }
}
```

---

## Frontend : `app/(public)/availability/page.tsx`

### Gestion du 409
```typescript
if (res.status === 409) {
  setMsg("Trop tard : quelqu'un vient de réserver ce créneau.");
  await loadBooked();  // ✅ Rafraîchit la liste
  return;
}
```

### Gestion des autres erreurs
```typescript
if (!res.ok) {
  const j = await res.json().catch(() => null);
  const errorMsg = j?.error?.message || j?.error || res.statusText;
  const errorCode = j?.error?.code || '';
  setMsg(`❌ Erreur réservation: ${errorMsg}${errorCode ? ` (code: ${errorCode})` : ''}`);
  return;
}
```

### Succès
```typescript
setMsg("Réservation OK ✅");
await loadBooked();  // ✅ Rafraîchit la liste
```

---

## Contrainte unique à ajouter (SQL)

Si pas déjà en place, exécuter dans Supabase :

```sql
-- Contrainte unique pour éviter les doublons
ALTER TABLE public.reservations
ADD CONSTRAINT unique_court_slot
UNIQUE (court_id, slot_start, fin_de_slot);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_reservations_court_slot
ON public.reservations(court_id, slot_start);
```

---

## Tests

### 1. Réservation normale
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "clubId": "ba43c579-e522-4b51-8542-737c2c6452bb",
    "courtId": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
    "slotStart": "2026-01-28T09:00:00.000Z",
    "slotEnd": "2026-01-28T09:30:00.000Z",
    "createdBy": "cee11521-8f13-4157-8057-034adf2cb9a0"
  }'
```

**Résultat attendu :**
```json
{
  "ok": true,
  "reservation": {
    "identifiant": "...",
    "club_id": "...",
    "court_id": "...",
    "slot_start": "...",
    "fin_de_slot": "...",
    "statut": "confirmé"
  }
}
```

### 2. Doublon (même créneau)
Répéter la même requête immédiatement.

**Résultat attendu :**
```json
{
  "error": "Ce créneau est déjà réservé."
}
```
**Status :** `409 Conflict`

### 3. UI
- **Succès :** Message "Réservation OK ✅" + créneau devient "Occupé"
- **Doublon :** Message "Trop tard : quelqu'un vient de réserver ce créneau." + refresh
- **Erreur :** Message "❌ Erreur réservation: [détails]"

---

## Schéma DB

```sql
CREATE TABLE public.reservations (
  identifiant uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL,
  court_id uuid NOT NULL,
  slot_start timestamptz NOT NULL,
  fin_de_slot timestamptz NOT NULL,
  cree_par uuid NOT NULL,
  statut text NOT NULL DEFAULT 'confirmé',
  cree_a timestamptz DEFAULT now(),
  
  -- Anti double-booking
  CONSTRAINT unique_court_slot 
    UNIQUE (court_id, slot_start, fin_de_slot)
);

CREATE INDEX idx_reservations_court_slot 
ON public.reservations(court_id, slot_start);
```

---

## Codes d'erreur Supabase gérés

| Code | Description | Status HTTP | Message |
|------|-------------|-------------|---------|
| `23505` | Unique violation (doublon) | 409 | "Ce créneau est déjà réservé." |
| `42703` | Column does not exist | 500 | Détails complets de l'erreur |
| Autre | Erreur générique | 500 | Détails complets de l'erreur |

---

## Résultat final

✅ **Insert correct** avec tous les champs  
✅ **Gestion des doublons** (409 + message clair)  
✅ **Logs complets** (succès + erreur)  
✅ **Frontend rafraîchit** automatiquement  
✅ **Retour de données** de la réservation créée

**Le système de réservation est opérationnel !** 🎯
