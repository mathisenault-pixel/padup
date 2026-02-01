# 🧪 Test du Realtime avec `public.bookings`

## ⚠️ Prérequis CRITIQUES

### 1. Vérifier que la table `bookings` existe

```sql
-- Dans Supabase SQL Editor
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'bookings'
ORDER BY ordinal_position;
```

**Résultat attendu:**
```
column_name   | data_type           | is_nullable
--------------|---------------------|-------------
id            | uuid                | NO
club_id       | uuid                | YES/NO
court_id      | uuid                | YES/NO
booking_date  | date                | NO          ← CRITICAL
slot_id       | integer             | NO          ← CRITICAL
slot_start    | timestamp with tz   | YES
slot_end      | timestamp with tz   | YES
status        | text                | YES
created_by    | uuid                | YES
created_at    | timestamp with tz   | YES
```

**Si la table n'existe PAS:**
```sql
-- Créer la table bookings (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID,
  court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  slot_id INTEGER NOT NULL REFERENCES public.time_slots(id) ON DELETE RESTRICT,
  slot_start TIMESTAMPTZ,
  slot_end TIMESTAMPTZ,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index unique partiel (anti double-booking)
CREATE UNIQUE INDEX unique_court_booking_slot_active
ON public.bookings (court_id, booking_date, slot_id)
WHERE status IN ('confirmed', 'pending');
```

### 2. Nettoyer les données NULL (si existantes)

```sql
-- Afficher les lignes problématiques
SELECT id, club_id, court_id, booking_date, slot_id, status
FROM public.bookings
WHERE booking_date IS NULL OR slot_id IS NULL;

-- Supprimer les lignes invalides
DELETE FROM public.bookings
WHERE booking_date IS NULL OR slot_id IS NULL;
```

---

## 🚀 Test du flux complet

### Étape 1: Ouvrir 2 onglets

1. **Onglet 1:** `http://localhost:3000/player/clubs/1/reserver`
2. **Onglet 2:** `http://localhost:3000/player/clubs/1/reserver`
3. Ouvrir la console (F12) dans les deux onglets

### Étape 2: Logs au chargement

**Console (Onglet 1 et 2):**

```
[SLOTS] Loading time_slots from Supabase...
[SLOTS] Loaded: [10 slots]

[BOOKINGS] Loading for all courts: {
  courtIds: ["6dceaf95-80dd-4fcf-b401-7d4c937f6e9e", ...],
  bookingDate: "2026-01-23"
}
[BOOKINGS] fetched count 0  // (ou le nombre de réservations existantes)
[BOOKINGS] bookedSlots size 0

[REALTIME] Subscribing to bookings for club: {
  clubId: "1",
  bookingDate: "2026-01-23"
}
```

✅ **Vérification:** Tous les créneaux apparaissent en **blanc** (disponibles)

### Étape 3: Réserver dans Onglet 1

1. **Onglet 1:** Cliquer sur le créneau **14:00 → 15:30**
2. Sélectionner des joueurs
3. Confirmer la réservation

**Console (Onglet 1) - LOGS CRITIQUES:**

```
[SLOT CLICK] { terrainId: 1, slot: { id: 5, start_time: "14:00:00", ... } }

[PLAYERS CONTINUE] { players: [...], emails: 2 }

[BOOKING INSERT PAYLOAD] {
  "club_id": "1",
  "court_id": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
  "booking_date": "2026-01-23",
  "slot_id": 5,
  "slot_start": "2026-01-23T14:00:00",
  "slot_end": "2026-01-23T15:30:00",
  "status": "confirmed",
  "created_by": null,
  "created_at": "2026-01-23T10:30:00.000Z"
}

[BOOKING INSERT PAYLOAD - Types] {
  club_id: "string",
  court_id: "string",
  booking_date: "string",  ← ✅ "2026-01-23" (pas NULL)
  slot_id: "number",        ← ✅ 5 (pas NULL)
  status: "string"
}

[BOOKING INSERT] ✅ Success: {
  id: "abc-123-def-456",
  club_id: "1",
  court_id: "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
  booking_date: "2026-01-23",
  slot_id: 5,
  status: "confirmed",
  ...
}

[BOOKING INSERT] ✅ Success - ID: abc-123-def-456
```

### Étape 4: Vérifier le Realtime (Onglet 2)

**⚠️ NE PAS RAFRAÎCHIR L'ONGLET 2**

**Console (Onglet 2) - IMMÉDIATEMENT après la réservation:**

```
[REALTIME bookings] payload {
  eventType: "INSERT",
  new: {
    id: "abc-123-def-456",
    club_id: "1",
    court_id: "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
    booking_date: "2026-01-23",
    slot_id: 5,
    status: "confirmed",
    ...
  },
  old: null
}

[REALTIME] ✅ Slot booked (INSERT): {
  courtKey: "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
  slotId: 5
}
```

**✅ Vérification visuelle (Onglet 2):**
- Le créneau **14:00 → 15:30** du **Terrain 1** devient **GRIS**
- Le texte "Réservé" apparaît
- Le bouton est `disabled`
- **TOUT CELA SANS REFRESH !**

### Étape 5: Vérifier en DB

```sql
SELECT 
  id,
  club_id,
  court_id,
  booking_date,
  slot_id,
  status,
  created_at
FROM public.bookings
WHERE club_id = '1'
  AND booking_date = CURRENT_DATE
ORDER BY created_at DESC;
```

**✅ Résultat attendu:**

| id | club_id | court_id | booking_date | slot_id | status | created_at |
|----|---------|----------|--------------|---------|--------|------------|
| abc-123... | 1 | 6dceaf95... | 2026-01-23 | 5 | confirmed | 2026-01-23 10:30:00 |

**✅ AUCUNE valeur NULL pour `booking_date` ou `slot_id` !**

---

## ❌ Erreurs possibles et solutions

### Erreur 1: Table `bookings` n'existe pas

**Symptôme:**
```
[BOOKINGS] Error: {
  message: "relation \"public.bookings\" does not exist",
  code: "42P01"
}
```

**Solution:** Exécuter la migration 018 ou créer la table manuellement (voir Prérequis section 1)

### Erreur 2: Column `booking_date` ou `slot_id` n'existe pas

**Symptôme:**
```
[BOOKING INSERT ERROR] {
  message: "column \"booking_date\" does not exist",
  code: "42703"
}
```

**Solution:**
```sql
ALTER TABLE public.bookings ADD COLUMN booking_date DATE;
ALTER TABLE public.bookings ADD COLUMN slot_id INTEGER REFERENCES public.time_slots(id);
```

### Erreur 3: NOT NULL constraint violation

**Symptôme:**
```
[BOOKING INSERT ERROR] {
  message: "null value in column \"booking_date\" violates not-null constraint",
  code: "23502"
}
```

**Solution:** Vérifier le payload dans la console. `booking_date` et `slot_id` doivent avoir des valeurs.

### Erreur 4: Unique constraint violation

**Symptôme:**
```
[BOOKING INSERT ERROR] {
  message: "duplicate key value violates unique constraint",
  code: "23505"
}
```

**Cause:** Le slot est déjà réservé (NORMAL si vous testez 2 fois le même slot)

**Solution:** ✅ C'est voulu ! L'index unique protège contre le double-booking.

### Erreur 5: Realtime ne déclenche pas

**Symptôme:** Onglet 2 ne reçoit pas `[REALTIME bookings] payload`

**Causes possibles:**
1. Realtime pas activé dans Supabase
2. RLS (Row Level Security) bloque les events
3. Channel déconnecté

**Vérification:**
```typescript
// Ajouter dans le useEffect Realtime:
.subscribe((status, err) => {
  console.log('[REALTIME] Subscription status:', status, err)
})
```

**Status attendu:** `SUBSCRIBED`

---

## 🎯 Checklist de validation

- [ ] Table `bookings` existe avec les bonnes colonnes
- [ ] `booking_date NOT NULL` et `slot_id NOT NULL`
- [ ] Index unique `unique_court_booking_slot_active` existe
- [ ] Onglet 1 affiche: `[BOOKING INSERT] ✅ Success`
- [ ] Onglet 2 affiche: `[REALTIME bookings] payload { eventType: 'INSERT' }`
- [ ] Créneau devient GRIS dans Onglet 2 sans refresh
- [ ] Ligne en DB avec `booking_date` et `slot_id` NON NULL
- [ ] Tentative de double-booking bloquée (erreur 23505)

---

## 🚨 Si ça ne marche TOUJOURS PAS

### 1. Vérifier les UUIDs dans `COURT_ID_MAP`

```typescript
// Dans reserver/page.tsx
const COURT_ID_MAP: Record<string, Record<number, string>> = {
  '1': {
    1: '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e',  // ← Vérifier que c'est le bon UUID
    // ...
  }
}
```

**Vérifier en DB:**
```sql
SELECT id, club_id, name FROM public.courts WHERE club_id = '1';
```

Si les UUIDs ne correspondent pas, corriger `COURT_ID_MAP`.

### 2. Vérifier que `time_slots` existe

```sql
SELECT * FROM public.time_slots ORDER BY start_time;
```

**Résultat attendu:** 10 slots (08:00-09:30, 09:30-11:00, ..., 21:30-23:00)

### 3. Activer Realtime dans Supabase

1. Aller dans Supabase Dashboard
2. Database → Replication
3. Cocher la table `bookings`
4. Sauvegarder

---

**Date:** 2026-01-22  
**Status:** Prêt pour test
