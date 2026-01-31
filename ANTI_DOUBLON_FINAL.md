# ✅ Anti-doublon de réservation - Configuration finale

## Objectif

Empêcher définitivement les doublons de réservation sur un même terrain et créneau horaire.

---

## 1. Contrainte base de données

### Fichier de migration : `supabase/migrations/012_ensure_unique_constraint.sql`

**Contrainte créée :**
```sql
ALTER TABLE public.reservations
ADD CONSTRAINT reservations_unique_slot
UNIQUE (court_id, slot_start, fin_de_slot);
```

**Effet :**
- PostgreSQL refuse tout insert/update qui créerait un doublon
- Retourne l'erreur code `23505` (unique_violation)
- Garantie au niveau base de données (incontournable)

**Exécuter dans Supabase SQL Editor :**
```sql
-- Copier le contenu de supabase/migrations/012_ensure_unique_constraint.sql
-- Ou directement :
ALTER TABLE public.reservations
ADD CONSTRAINT reservations_unique_slot
UNIQUE (court_id, slot_start, fin_de_slot);
```

---

## 2. API Backend : `app/api/bookings/route.ts`

### Insert avec colonnes correctes
```typescript
const { data, error } = await supabase
  .schema("public")
  .from("reservations")
  .insert([{
    club_id: clubId,       ✅
    court_id: courtId,     ✅
    slot_start: slotStart, ✅
    fin_de_slot: slotEnd,  ✅
    cree_par: createdBy,   ✅
    statut: "confirmé",    ✅
  }])
  .select();
```

### Gestion de la contrainte unique
```typescript
if (error) {
  // Doublon détecté (code Postgres 23505)
  if (error.code === "23505") {
    console.warn("[BOOKING CONFLICT]", {
      courtId,
      slotStart,
      message: "Tentative de réservation sur un créneau déjà pris",
    });
    return NextResponse.json(
      { error: "Ce créneau est déjà réservé." },
      { status: 409 }  // ← Conflict
    );
  }
  
  // Autres erreurs
  return NextResponse.json({ error: {...} }, { status: 500 });
}
```

### Réponses API

**Succès (200) :**
```json
{
  "ok": true,
  "reservation": {
    "identifiant": "uuid",
    "court_id": "uuid",
    "slot_start": "2026-01-28T09:00:00Z",
    "fin_de_slot": "2026-01-28T09:30:00Z",
    "statut": "confirmé"
  }
}
```

**Doublon (409) :**
```json
{
  "error": "Ce créneau est déjà réservé."
}
```

**Champs manquants (400) :**
```json
{
  "error": "Missing required fields"
}
```

**Erreur serveur (500) :**
```json
{
  "error": {
    "message": "...",
    "code": "...",
    "details": "...",
    "hint": "..."
  }
}
```

---

## 3. Frontend : `app/(public)/availability/page.tsx`

### Gestion du 409 Conflict
```typescript
const res = await fetch("/api/bookings", {
  method: "POST",
  body: JSON.stringify({
    clubId,
    courtId,
    slotStart: toISOWithOffset(slotStart),
    slotEnd: toISOWithOffset(slotEnd),
    createdBy,
  }),
});

if (res.status === 409) {
  setMsg("Trop tard : quelqu'un vient de réserver ce créneau.");
  await loadBooked();  // ✅ Rafraîchit la liste des créneaux
  return;
}
```

**Résultat UI :**
- Message affiché : "Trop tard : quelqu'un vient de réserver ce créneau."
- Le créneau passe à "Occupé" après rafraîchissement
- L'utilisateur voit l'état réel de la disponibilité

---

## 4. Logs serveur

### Doublon détecté (log minimal)
```
[BOOKING CONFLICT] {
  courtId: "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
  slotStart: "2026-01-28T09:00:00.000Z",
  message: "Tentative de réservation sur un créneau déjà pris"
}
```

### Succès
```
[SUPABASE SUCCESS - POST /api/bookings] {
  slotStart: "2026-01-28T09:00:00.000Z",
  slotEnd: "2026-01-28T09:30:00.000Z",
  reservationId: "uuid"
}
```

### Autres erreurs (log complet)
```
[SUPABASE ERROR - POST /api/bookings] Details: {
  message: "...",
  code: "...",
  details: "...",
  hint: "..."
}
```

---

## 5. Tests de vérification

### Test 1 : Réservation normale
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "clubId": "ba43c579-e522-4b51-8542-737c2c6452bb",
    "courtId": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
    "slotStart": "2026-01-28T10:00:00.000Z",
    "slotEnd": "2026-01-28T10:30:00.000Z",
    "createdBy": "cee11521-8f13-4157-8057-034adf2cb9a0"
  }'
```

**Résultat attendu :** `200 OK` avec `{ ok: true, reservation: {...} }`

### Test 2 : Doublon (même créneau)
Répéter exactement la même requête.

**Résultat attendu :** `409 Conflict` avec `{ error: "Ce créneau est déjà réservé." }`

### Test 3 : UI
1. Ouvrir `/availability`
2. Cliquer sur un créneau libre → "Réservation OK ✅"
3. Recharger la page → le créneau est "Occupé"
4. Cliquer à nouveau sur ce créneau → "Déjà réservé." (vérif locale)
5. Si on force l'API (curl) → "Trop tard..." (vérif serveur)

---

## 6. Vérification DB

### Vérifier la contrainte existe
```sql
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.reservations'::regclass
AND conname = 'reservations_unique_slot';
```

**Résultat attendu :**
```
constraint_name          | definition
-------------------------|----------------------------------
reservations_unique_slot | UNIQUE (court_id, slot_start, fin_de_slot)
```

### Tester manuellement le doublon
```sql
-- Insérer une réservation
INSERT INTO public.reservations (club_id, court_id, slot_start, fin_de_slot, cree_par, statut)
VALUES (
  'ba43c579-e522-4b51-8542-737c2c6452bb',
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e',
  '2026-01-28 11:00:00+00',
  '2026-01-28 11:30:00+00',
  'cee11521-8f13-4157-8057-034adf2cb9a0',
  'confirmé'
);

-- Tenter le doublon
INSERT INTO public.reservations (club_id, court_id, slot_start, fin_de_slot, cree_par, statut)
VALUES (
  'ba43c579-e522-4b51-8542-737c2c6452bb',
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e',
  '2026-01-28 11:00:00+00',
  '2026-01-28 11:30:00+00',
  'cee11521-8f13-4157-8057-034adf2cb9a0',
  'confirmé'
);
```

**Résultat attendu :**
```
ERROR: duplicate key value violates unique constraint "reservations_unique_slot"
DETAIL: Key (court_id, slot_start, fin_de_slot)=(6dceaf95-..., 2026-01-28 11:00:00+00, 2026-01-28 11:30:00+00) already exists.
```

---

## 7. Schéma final de la table

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
  
  -- ✅ Anti double-booking
  CONSTRAINT reservations_unique_slot 
    UNIQUE (court_id, slot_start, fin_de_slot)
);

-- Index pour performance
CREATE INDEX idx_reservations_court_slot 
ON public.reservations(court_id, slot_start, fin_de_slot);

CREATE INDEX idx_reservations_court_id 
ON public.reservations(court_id);
```

---

## 8. Résumé des protections

| Niveau | Protection | Effet |
|--------|------------|-------|
| **Base de données** | Contrainte UNIQUE | ✅ Bloque les doublons (incontournable) |
| **API Backend** | Détection code 23505 | ✅ Retourne 409 avec message clair |
| **Frontend** | Gestion du 409 | ✅ Affiche message + rafraîchit |
| **Frontend** | Vérification locale | ✅ Désactive bouton si déjà réservé |

---

## ✅ Checklist finale

- [x] Contrainte unique `reservations_unique_slot` créée en DB
- [x] API détecte l'erreur 23505 et renvoie 409
- [x] Frontend gère le 409 avec message et refresh
- [x] Logs minimal pour les conflits (pas de spam)
- [x] Logs complets pour les autres erreurs
- [x] Insert avec toutes les colonnes correctes
- [x] Pas d'upsert silencieux
- [x] Tests validés (insert normal + doublon)

**Les doublons de réservation sont impossibles !** 🎯
