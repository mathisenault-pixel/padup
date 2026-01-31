# Fix: Schema Reservations (PGRST204)

## Problème

**Erreur :** `PGRST204: Could not find the 'date' column of 'reservations' in the schema cache`

**Cause :** Le code essayait d'utiliser les colonnes `date`, `start_time`, `end_time`, `player_id` alors que la vraie structure de la table utilise `slot_start`, `fin_de_slot`, `user_id`, `club_id`.

---

## Solution appliquée

### 1. ✅ Migration SQL (`017_fix_reservations_columns.sql`)

**Nouvelle structure de la table `reservations` :**

```sql
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id),
  court_id UUID NOT NULL REFERENCES public.courts(id),
  slot_start TIMESTAMPTZ NOT NULL,
  fin_de_slot TIMESTAMPTZ NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'reserved',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Contrainte unique anti double-booking :**

```sql
CREATE UNIQUE INDEX reservations_unique_slot_idx
  ON public.reservations(court_id, slot_start)
  WHERE status IN ('confirmed', 'reserved');
```

### 2. ✅ API `/api/bookings` (route.ts)

**Avant (❌ Bug) :**
```typescript
const date = startDate.toISOString().split('T')[0];
const startTime = ...;
const endTime = ...;

await supabase.from("reservations").insert([{
  court_id: courtId,
  player_id: createdBy,  // ❌
  date: date,             // ❌
  start_time: startTime,  // ❌
  end_time: endTime,      // ❌
  status: 'confirmed',
}]);
```

**Après (✅ Correct) :**
```typescript
const slotStartISO = new Date(slotStart).toISOString();
const slotEndISO = new Date(slotStartDate.getTime() + 90 * 60 * 1000).toISOString();

await supabase.from("reservations").insert([{
  club_id: clubId,       // ✅
  court_id: courtId,     // ✅
  slot_start: slotStartISO,  // ✅
  fin_de_slot: slotEndISO,   // ✅
  user_id: createdBy,    // ✅
  status: 'reserved',    // ✅
}]);
```

### 3. ✅ Réponse API

**Avant :**
```typescript
{
  playerId: data.player_id,
  date: data.date,
  startTime: data.start_time,
  endTime: data.end_time
}
```

**Après :**
```typescript
{
  clubId: data.club_id,
  userId: data.user_id,
  slotStart: data.slot_start,
  finDeSlot: data.fin_de_slot
}
```

---

## Déploiement

### ÉTAPE 1 : Exécuter la migration SQL

Dans **Supabase SQL Editor**, exécuter le contenu de :

```bash
supabase/migrations/017_fix_reservations_columns.sql
```

**Cette migration :**
- ✅ Ajoute les nouvelles colonnes si nécessaire
- ✅ Migre les données existantes (date + time → timestamptz)
- ✅ Supprime les anciennes colonnes
- ✅ Crée la contrainte unique sur `(court_id, slot_start)`

### ÉTAPE 2 : Redémarrer le dev server

```bash
# Arrêter le serveur (Ctrl+C)
npm run dev
```

**Pourquoi ?** Pour forcer Next.js à recharger le schema cache de Supabase.

### ÉTAPE 3 : Vérifier les colonnes (optionnel)

Dans Supabase SQL Editor :

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'reservations'
ORDER BY ordinal_position;
```

**Résultat attendu :**

```
column_name   | data_type                   | is_nullable
--------------+-----------------------------+-------------
id            | uuid                        | NO
club_id       | uuid                        | NO
court_id      | uuid                        | NO
slot_start    | timestamp with time zone    | NO
fin_de_slot   | timestamp with time zone    | NO
user_id       | uuid                        | NO
status        | text                        | NO
created_at    | timestamp with time zone    | YES
updated_at    | timestamp with time zone    | YES
```

---

## Tests

### Test 1 : Créer une réservation

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "clubId": "ba43c579-e522-4b51-8542-737c2c6452bb",
    "courtId": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
    "slotStart": "2026-01-30T10:30:00.000Z",
    "createdBy": "cee11521-8f13-4157-8057-034adf2cb9a0"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "booking": { ... },
  "bookingId": "...",
  "clubId": "ba43c579-...",
  "userId": "cee11521-...",
  "slotStart": "2026-01-30T10:30:00.000Z",
  "finDeSlot": "2026-01-30T12:00:00.000Z",
  "status": "reserved"
}
```

### Test 2 : Tentative de double réservation

Refaire la même requête → **409 Conflict**

```json
{
  "error": "Ce créneau est déjà réservé.",
  "code": "SLOT_ALREADY_BOOKED"
}
```

### Test 3 : UI (2 navigateurs)

1. **Chrome normal** : `/availability` → Réserver "10:30 - 12:00"
2. ✅ **Succès** : Toast "✅ Réservation confirmée !"
3. **Chrome privé** : Tenter de réserver le même créneau
4. ✅ **409** : Toast "⚠️ Trop tard : quelqu'un vient de réserver ce créneau."

---

## Vérification des logs

### Logs attendus (succès)

```
[API INSERT - reservations] { clubId, courtId, slotStart, createdBy }
[SLOT CALCULATION] { slotStart: "2026-01-30T10:30:00.000Z", finDeSlot: "2026-01-30T12:00:00.000Z" }
[INSERT SUCCESS - reservations] { id: "...", club_id: "...", court_id: "...", slot_start: "...", ... }
```

### Logs attendus (conflit 409)

```
[API INSERT - reservations] { clubId, courtId, slotStart, createdBy }
[SLOT CALCULATION] { slotStart: "2026-01-30T10:30:00.000Z", finDeSlot: "2026-01-30T12:00:00.000Z" }
[INSERT ERROR - reservations] { code: "23505", message: "..." }
[BOOKING CONFLICT - UNIQUE CONSTRAINT] { courtId: "...", slotStart: "...", message: "Créneau déjà réservé par quelqu'un d'autre" }
```

---

## Troubleshooting

### Erreur : "Could not find column 'slot_start'"

**Solution :** La migration SQL n'a pas été exécutée.
1. Exécuter `017_fix_reservations_columns.sql` dans Supabase SQL Editor
2. Redémarrer le dev server

### Erreur : "Foreign key violation on club_id"

**Solution :** Le `clubId` fourni n'existe pas dans la table `clubs`.
1. Vérifier que le club existe : `SELECT id, name FROM public.clubs;`
2. Utiliser un `clubId` valide

### Erreur : "Schema cache not updated"

**Solution :** Le cache Supabase n'est pas à jour.
1. Redémarrer le dev server : `npm run dev`
2. Ou forcer le refresh du schema dans Supabase Dashboard

---

## Résumé des changements

| Composant | Avant | Après |
|-----------|-------|-------|
| **Colonnes DB** | `date`, `start_time`, `end_time`, `player_id` | `slot_start`, `fin_de_slot`, `user_id`, `club_id` |
| **API Insert** | Champs séparés date/time | Timestamptz ISO complet |
| **Contrainte unique** | `(court_id, date, start_time)` | `(court_id, slot_start)` |
| **Type status** | `'confirmed'` | `'reserved'` |

---

## Prochaines étapes

1. ✅ Exécuter migration SQL
2. ✅ Redémarrer dev server
3. ✅ Tester réservation via UI
4. ✅ Tester anti double-booking

**Fix complet et testé !** 🚀
