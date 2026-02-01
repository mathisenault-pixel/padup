# 🧪 Test du flux Réservations avec Realtime

## Préparation

### 1. Vérifier que les colonnes existent en DB

**Dans Supabase SQL Editor:**

```sql
-- Vérifier la structure de public.reservations
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'reservations'
ORDER BY ordinal_position;
```

**Colonnes attendues:**
- `id` (uuid, NOT NULL)
- `club_id` (text/uuid)
- `court_id` (uuid)
- `slot_start` (timestamptz, NOT NULL)
- `fin_de_slot` (timestamptz, NOT NULL)
- `statut` (text/enum) → doit accepter 'confirmé'
- `cree_par` (uuid, **nullable** pour l'instant)
- `created_at` (timestamptz)

⚠️ **Si `cree_par` est NOT NULL**, vous devez soit:
1. La rendre nullable temporairement
2. Ou modifier le code pour mettre un UUID fixe

```sql
-- Rendre cree_par nullable (si nécessaire)
ALTER TABLE public.reservations 
ALTER COLUMN cree_par DROP NOT NULL;
```

### 2. Nettoyer les anciennes données de test (optionnel)

```sql
-- Voir les réservations existantes
SELECT id, club_id, court_id, slot_start, fin_de_slot, statut, created_at
FROM public.reservations
WHERE club_id = '1'
ORDER BY created_at DESC
LIMIT 20;

-- Supprimer toutes les réservations de test (optionnel)
DELETE FROM public.reservations WHERE club_id = '1';
```

---

## Test du flux complet

### Étape 1: Ouvrir 2 onglets

1. Ouvrir `http://localhost:3000/player/clubs/1/reserver` dans **Onglet 1**
2. Ouvrir `http://localhost:3000/player/clubs/1/reserver` dans **Onglet 2**
3. Ouvrir la console (F12) dans les deux onglets

### Étape 2: Logs au chargement de la page

**Console (Onglet 1 et 2):**

```
[SLOTS] Loading time_slots from Supabase...
[SLOTS] Loaded: [
  { id: 1, start_time: "08:00:00", end_time: "09:30:00", ... },
  { id: 2, start_time: "09:30:00", end_time: "11:00:00", ... },
  ...
]
[RESERVATIONS] Loading for all courts: {
  courtIds: [
    "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
    "6dceaf95-80dd-4fcf-b401-7d4c937f6e9f",
    ...
  ],
  dayStart: "2026-01-23T00:00:00.000Z",
  dayEnd: "2026-01-23T23:59:59.999Z"
}
[RESERVATIONS] fetched count 0  // (ou le nombre de réservations existantes)
[RESERVATIONS] bookedKeys size 0
[REALTIME] Subscribing to reservations for club: {
  clubId: "1",
  dayStart: "2026-01-23T00:00:00.000Z",
  dayEnd: "2026-01-23T23:59:59.999Z"
}
```

✅ **Vérification:** Tous les créneaux doivent apparaître en blanc (disponibles)

### Étape 3: Cliquer sur un créneau (Onglet 1)

1. Dans **Onglet 1**, cliquer sur le créneau **14:00 → 15:30**
2. La modal de sélection des joueurs s'ouvre

**Console (Onglet 1):**

```
[SLOT CLICK] {
  terrainId: 1,
  slot: { id: 5, start_time: "14:00:00", end_time: "15:30:00", ... },
  isSubmitting: false
}
[SLOT CLICK] Opening player modal
```

### Étape 4: Sélectionner des joueurs et confirmer

1. Sélectionner 3 joueurs (vous + 2 autres)
2. Optionnel: Entrer des emails pour invitation
3. Cliquer sur "Continuer"
4. (Optionnel) Dans la modal Premium, cliquer sur "Continuer sans Pad'up +"

**Console (Onglet 1) - LOGS CRITIQUES:**

```
[PLAYERS CONTINUE] {
  players: ["Joueur 1", "Joueur 2"],
  emails: 2,
  showPremium: false,
  isSubmitting: false
}

[RESERVE] START - handleFinalConfirmation {
  withPremium: false,
  isSubmitting: false,
  invitedEmails: 2
}

[RESERVATION INSERT PAYLOAD] {
  "club_id": "1",
  "court_id": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
  "slot_start": "2026-01-23T14:00:00",
  "fin_de_slot": "2026-01-23T15:30:00",
  "statut": "confirmé",
  "cree_par": null,
  "created_at": "2026-01-23T10:30:00.000Z"
}

[RESERVATION INSERT PAYLOAD - Types] {
  club_id: "string",
  court_id: "string",
  slot_start: "string",
  fin_de_slot: "string",
  statut: "string"
}

[RESERVATION INSERT] ✅ Success: {
  id: "abc-123-def-456",
  club_id: "1",
  court_id: "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
  slot_start: "2026-01-23T14:00:00+00:00",
  fin_de_slot: "2026-01-23T15:30:00+00:00",
  statut: "confirmé",
  ...
}

[RESERVATION INSERT] ✅ Success - ID: abc-123-def-456

[RESERVE] Saved successfully
[RESERVE] Navigating to /player/reservations
```

### Étape 5: Vérifier le Realtime (Onglet 2)

**⚠️ NE PAS RAFRAÎCHIR L'ONGLET 2**

**Console (Onglet 2) - IMMÉDIATEMENT après la réservation:**

```
[REALTIME reservations] payload {
  eventType: "INSERT",
  new: {
    id: "abc-123-def-456",
    club_id: "1",
    court_id: "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
    slot_start: "2026-01-23T14:00:00+00:00",
    fin_de_slot: "2026-01-23T15:30:00+00:00",
    statut: "confirmé",
    ...
  },
  old: null
}

[REALTIME] ✅ Slot booked (INSERT): {
  courtKey: "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
  slotKey: "14:00:00-15:30:00"
}
```

✅ **Vérification visuelle:**
- Le créneau **14:00 → 15:30** du **Terrain 1** devient **GRIS** dans l'Onglet 2
- Le texte "Réservé" apparaît sous le créneau
- Le bouton est `disabled`

### Étape 6: Vérifier en DB

**Dans Supabase SQL Editor:**

```sql
SELECT 
  id,
  club_id,
  court_id,
  slot_start AT TIME ZONE 'Europe/Paris' as slot_start_local,
  fin_de_slot AT TIME ZONE 'Europe/Paris' as fin_de_slot_local,
  statut,
  cree_par,
  created_at
FROM public.reservations
WHERE club_id = '1'
  AND slot_start::date = CURRENT_DATE
ORDER BY slot_start;
```

✅ **Résultat attendu:**

| id | club_id | court_id | slot_start_local | fin_de_slot_local | statut | cree_par | created_at |
|----|---------|----------|------------------|-------------------|--------|----------|------------|
| abc-123... | 1 | 6dceaf95... | 2026-01-23 14:00:00 | 2026-01-23 15:30:00 | confirmé | NULL | 2026-01-23 10:30:00 |

---

## Scénarios de test supplémentaires

### Test 2: Réservation multi-terrains

1. **Onglet 1:** Réserver Terrain 1, 14:00-15:30
2. **Onglet 2:** Réserver Terrain 2, 14:00-15:30

✅ **Résultat attendu:**
- Terrain 1, 14:00-15:30 → GRIS
- Terrain 2, 14:00-15:30 → GRIS
- Terrain 3, 14:00-15:30 → BLANC (disponible)

### Test 3: Changement de date

1. **Onglet 1:** Réserver aujourd'hui, 14:00-15:30
2. **Onglet 1:** Changer la date pour demain

✅ **Résultat attendu:**
- Nouveau fetch: `[RESERVATIONS] Loading for all courts`
- Nouveau Realtime: `[REALTIME] Subscribing to reservations`
- Tous les créneaux de demain sont disponibles (blancs)

### Test 4: Double-booking (doit échouer)

1. **Onglet 1:** Réserver Terrain 1, 14:00-15:30 → ✅ Success
2. **Onglet 2:** Attendre que le créneau soit grisé
3. **Onglet 2:** Le créneau est grisé, impossible de cliquer → ✅ Protection UI

Si vous forcez un double-booking en DB:
```sql
-- NE PAS FAIRE ÇA en prod, juste pour tester
INSERT INTO public.reservations (club_id, court_id, slot_start, fin_de_slot, statut)
VALUES ('1', '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e', '2026-01-23T14:00:00', '2026-01-23T15:30:00', 'confirmé');
```

✅ **Si index unique existe sur (court_id, slot_start, fin_de_slot):**
```
ERROR: duplicate key value violates unique constraint
```

---

## Debugging

### Problème: Aucun log `[REALTIME reservations]` dans Onglet 2

**Causes possibles:**
1. Realtime n'est pas activé dans Supabase
2. RLS (Row Level Security) bloque les events
3. Le channel ne s'est pas connecté

**Solution:**

```typescript
// Dans le useEffect Realtime, ajouter:
.subscribe((status, err) => {
  console.log('[REALTIME] Subscription status:', status, err)
})
```

Status attendu: `SUBSCRIBED`

### Problème: Erreur lors de l'insert

**Erreur: `column "cree_par" of relation "reservations" violates not-null constraint`**

**Solution:** Rendre la colonne nullable ou mettre un UUID fixe

```sql
ALTER TABLE public.reservations ALTER COLUMN cree_par DROP NOT NULL;
```

**Erreur: `invalid input syntax for type timestamptz`**

**Cause:** Format de timestamp incorrect

**Solution:** Vérifier que `combineDateAndTime` retourne bien `"YYYY-MM-DDTHH:MM:SS"`

```typescript
console.log('[DEBUG] slot_start:', slotStartTimestamp)
// Attendu: "2026-01-23T14:00:00"
```

### Problème: Le créneau ne se grise pas

**1. Vérifier que le Realtime a bien reçu l'event:**

```
[REALTIME reservations] payload { eventType: 'INSERT', ... }
```

**2. Vérifier que la clé est correcte:**

```typescript
console.log('[DEBUG] slotKey:', createSlotKey(slot.start_time, slot.end_time))
// Attendu: "14:00:00-15:30:00"

console.log('[DEBUG] bookedByCourt:', bookedByCourt)
// Attendu: { "6dceaf95-...": Set(1) { "14:00:00-15:30:00" } }
```

**3. Vérifier le format des heures dans time_slots:**

```sql
SELECT id, start_time, end_time FROM public.time_slots ORDER BY start_time;
```

Attendu: `08:00:00`, `09:30:00`, etc. (format HH:MM:SS)

Si le format est différent (ex: `08:00`, `8:00:00`), adapter `createSlotKey`.

---

## Checklist de validation

- [ ] Page charge sans erreur
- [ ] Logs `[RESERVATIONS] fetched count` apparaissent
- [ ] Logs `[REALTIME] Subscribing` apparaissent
- [ ] Click sur créneau ouvre la modal
- [ ] Confirmation affiche `[RESERVATION INSERT PAYLOAD]`
- [ ] Insert réussit: `[RESERVATION INSERT] ✅ Success`
- [ ] Onglet 2 reçoit `[REALTIME reservations] payload`
- [ ] Créneau devient GRIS dans Onglet 2 **sans refresh**
- [ ] Ligne apparaît en DB avec `statut='confirmé'`
- [ ] Changement de date déclenche nouveau fetch + Realtime

---

**Date:** 2026-01-22  
**Status:** Prêt pour test
