# ✅ FIX: Schéma réel des bookings avec `slot_start`

## Date: 2026-01-22
## Commit: `83d381c`

---

## Problème résolu

L'implémentation précédente utilisait un schéma incorrect pour la table `bookings` :
- ❌ `booking_date` (DATE) - **n'existe pas en DB**
- ❌ `slot_id` (INTEGER) - **n'existe pas en DB**
- ❌ `slot_end` (timestamptz) - **nom incorrect**
- ❌ `status` (text) - **nom incorrect**

**Schéma réel de la table `bookings` :**
```sql
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id),
  court_id UUID NOT NULL REFERENCES public.courts(id),
  slot_start TIMESTAMPTZ NOT NULL,
  fin_de_slot TIMESTAMPTZ NOT NULL,
  statut TEXT NOT NULL CHECK (statut IN ('confirmed', 'cancelled')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Solution implémentée

### 1. **Type `Booking` mis à jour**

**Avant :**
```typescript
type Booking = {
  id: string
  court_id: string
  booking_date: string // ❌ n'existe pas
  slot_id: number       // ❌ n'existe pas
  status: string        // ❌ mauvais nom
  slot_start?: string
  slot_end?: string     // ❌ mauvais nom
}
```

**Après :**
```typescript
type Booking = {
  id: string
  club_id: string
  court_id: string
  slot_start: string      // ✅ timestamptz (ISO format)
  fin_de_slot: string     // ✅ timestamptz (ISO format)
  statut: string          // ✅ 'confirmed' | 'cancelled'
}
```

---

### 2. **Payload d'insert corrigé**

**Avant :**
```typescript
const bookingPayload = {
  club_id: club.id,
  court_id: courtId,
  booking_date: bookingDate,  // ❌ n'existe pas
  slot_id: selectedSlot.id,   // ❌ n'existe pas
  slot_start: slot_start,
  slot_end: slot_end,         // ❌ mauvais nom
  status: 'confirmed',        // ❌ mauvais nom
  created_by: user.id,
  created_at: new Date().toISOString()
}
```

**Après :**
```typescript
const bookingPayload = {
  club_id: club.id,               // ✅ UUID
  court_id: courtId,              // ✅ UUID
  slot_start: slot_start,         // ✅ timestamptz ISO (2026-01-23T08:00:00.000Z)
  fin_de_slot: slot_end,          // ✅ timestamptz ISO (2026-01-23T09:30:00.000Z)
  statut: 'confirmed',            // ✅ 'confirmed' | 'cancelled'
  created_by: user.id,            // ✅ UUID
  created_at: new Date().toISOString()  // ✅ timestamptz
}
```

---

### 3. **Chargement des bookings refactorisé**

**Avant (INCORRECT) :**
```typescript
const { data } = await supabase
  .from('bookings')
  .select('id, court_id, booking_date, slot_id, status')
  .in('court_id', courtIds)
  .eq('booking_date', bookingDate)  // ❌ booking_date n'existe pas
  .eq('status', 'confirmed')        // ❌ status → statut
```

**Après (CORRECT) :**
```typescript
const dateStr = selectedDate.toISOString().split('T')[0] // YYYY-MM-DD
const startOfDay = `${dateStr}T00:00:00+01:00`
const endOfDay = `${dateStr}T23:59:59+01:00`

const { data } = await supabase
  .from('bookings')
  .select('id, court_id, slot_start, statut')
  .in('court_id', courtIds)
  .gte('slot_start', startOfDay)    // ✅ filtrer par slot_start >= 00:00
  .lt('slot_start', endOfDay)       // ✅ filtrer par slot_start < 23:59
  .eq('statut', 'confirmed')        // ✅ statut (pas status)
```

---

### 4. **Clé de disponibilité changée**

**Avant (INCORRECT) :**
```typescript
// State
const [bookedByCourt, setBookedByCourt] = useState<Record<string, Set<number>>>({})

// Construction de la clé
map[courtId].add(row.slot_id) // ❌ slot_id n'existe pas

// Vérification disponibilité
const isBooked = bookedByCourt[courtId]?.has(slotId)
```

**Après (CORRECT) :**
```typescript
// State
const [bookedByCourt, setBookedByCourt] = useState<Record<string, Set<string>>>({})

// Construction de la clé (ISO string)
let slotStartISO = row.slot_start
if (!slotStartISO.endsWith('Z')) {
  slotStartISO = new Date(slotStartISO).toISOString()
}
map[courtId].add(slotStartISO) // ✅ clé = slot_start en ISO

// Vérification disponibilité
const isSlotAvailable = (courtId: string, slot: TimeSlot): boolean => {
  const dateStr = selectedDate.toISOString().split('T')[0]
  const slotStartISO = `${dateStr}T${slot.start_time}Z` // ex: 2026-01-23T08:00:00Z
  const isBooked = bookedByCourt[courtId]?.has(slotStartISO) ?? false
  return !isBooked
}
```

**Format de clé utilisé :**
- Clé = `${courtId}_${slotStartISO}`
- Exemple : `21d09a66-b7db-4966-abf1-cc210f7476c1` + `2026-01-23T08:00:00.000Z`

---

### 5. **Subscription Realtime mise à jour**

**Avant (INCORRECT) :**
```typescript
.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'bookings',
  filter: `booking_date=eq.${bookingDate}` // ❌ booking_date n'existe pas
}, (payload) => {
  // Utilise slot_id ❌
  map[courtKey].add(payloadNew.slot_id)
})
```

**Après (CORRECT) :**
```typescript
.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'bookings',
  filter: `club_id=eq.${club.id}` // ✅ filtrer par club_id
}, (payload) => {
  // Normaliser slot_start en ISO
  const normalizeSlotStart = (slotStart: string) => {
    if (!slotStart.endsWith('Z')) {
      return new Date(slotStart).toISOString()
    }
    return slotStart
  }
  
  const slotStartISO = normalizeSlotStart(payloadNew.slot_start)
  
  // INSERT
  if (payload.eventType === 'INSERT' && payloadNew.statut === 'confirmed') {
    map[courtKey].add(slotStartISO) // ✅ utilise slot_start
  }
  
  // UPDATE: confirmed → cancelled
  if (payloadNew.statut === 'cancelled' && payloadOld.statut === 'confirmed') {
    map[courtKey].delete(oldSlotStartISO) // ✅ retire slot_start
  }
  
  // DELETE
  if (payload.eventType === 'DELETE') {
    map[courtKey].delete(oldSlotStartISO)
  }
})
```

---

### 6. **Messages d'erreur mis à jour**

**Tous les messages d'erreur et logs ont été mis à jour pour utiliser :**
- `slot_start` au lieu de `booking_date`
- `fin_de_slot` au lieu de `slot_end`
- `statut` au lieu de `status`
- Suppression de toutes les références à `slot_id`

**Exemple de log de debug :**
```
═══════════════════════════════════════════════════════════
[BOOKING INSERT] 🚀 ABOUT TO INSERT INTO bookings TABLE
═══════════════════════════════════════════════════════════
[BOOKING PAYLOAD] Critical fields:
  • club_id: ba43c579-e522-4b51-8542-737c2c6452bb (UUID from clubs)
  • court_id: 21d09a66-b7db-4966-abf1-cc210f7476c1 (UUID from courts - MUST EXIST IN DB)
[BOOKING PAYLOAD] Timestamps:
  • slot_start: 2026-01-23T08:00:00.000Z ← TIMESTAMPTZ ISO UTC
  • fin_de_slot: 2026-01-23T09:30:00.000Z ← TIMESTAMPTZ ISO UTC
  • duration: 90 minutes (MUST BE 90)
[BOOKING PAYLOAD] Other fields:
  • statut: confirmed ← confirmed | cancelled
  • created_by: user-uuid-here ← REQUIRED FOR RLS
═══════════════════════════════════════════════════════════
```

---

## Comportement attendu

### ✅ Affichage des courts

**TOUJOURS afficher les courts si `courts.length > 0`**

- Charger les courts : `SELECT * FROM courts WHERE club_id = '...'`
- Si résultat > 0 → afficher les courts
- Si résultat = 0 → afficher message "Aucun terrain disponible" + debug info

**JAMAIS afficher "Aucun terrain disponible" si les courts existent en DB.**

---

### ✅ Affichage des time_slots

**TOUJOURS afficher les time_slots depuis la table `time_slots`**

- Charger les slots : `SELECT * FROM time_slots ORDER BY start_time`
- Ces slots sont des **templates** (pas de disponibilité)
- La disponibilité est calculée en comparant avec les bookings

---

### ✅ Calcul de disponibilité

Pour un créneau donné (ex: 08:00 - 09:30) sur un terrain donné :

1. **Calculer le `slot_start` attendu :**
   ```typescript
   const dateStr = selectedDate.toISOString().split('T')[0] // 2026-01-23
   const slotStartISO = `${dateStr}T${slot.start_time}Z`     // 2026-01-23T08:00:00Z
   ```

2. **Vérifier si ce slot_start existe dans les bookings :**
   ```typescript
   const isBooked = bookedByCourt[courtId]?.has(slotStartISO) ?? false
   ```

3. **Si `isBooked === false` → disponible (vert)**
4. **Si `isBooked === true` → pris (gris)**

---

### ✅ Insertion d'un booking

**Payload envoyé à Supabase :**
```json
{
  "club_id": "ba43c579-e522-4b51-8542-737c2c6452bb",
  "court_id": "21d09a66-b7db-4966-abf1-cc210f7476c1",
  "slot_start": "2026-01-23T08:00:00.000Z",
  "fin_de_slot": "2026-01-23T09:30:00.000Z",
  "statut": "confirmed",
  "created_by": "user-uuid",
  "created_at": "2026-01-22T10:30:00.000Z"
}
```

**Colonnes insérées :**
- `club_id` (UUID)
- `court_id` (UUID)
- `slot_start` (TIMESTAMPTZ)
- `fin_de_slot` (TIMESTAMPTZ)
- `statut` (TEXT: 'confirmed' | 'cancelled')
- `created_by` (UUID)
- `created_at` (TIMESTAMPTZ)

**Aucune référence à :**
- ❌ `booking_date` (n'existe pas)
- ❌ `slot_id` (n'existe pas)
- ❌ `slot_end` (mauvais nom)
- ❌ `status` (mauvais nom)

---

## Tests à effectuer

### Test 1: Affichage des courts

1. **Ouvrir :** `http://localhost:3000/player/clubs/ba43c579-e522-4b51-8542-737c2c6452bb/reserver`
2. **Vérifier les logs console :**
   ```
   🔍 [DEBUG COURTS] START Loading courts from Supabase
   ✅ [DEBUG COURTS] Courts count: 2
   ✅ [DEBUG COURTS] Raw data: [...]
   ```
3. **Vérifier l'UI :**
   - Les 2 terrains s'affichent : "Terrain 1", "Terrain 2"
   - Chaque terrain a une liste de créneaux (08:00, 09:30, 11:00, ...)
4. **Si courts count = 0 :**
   - Message "Aucun terrain disponible" avec debug info
   - Créer les courts en DB (voir `DEBUG_AUCUN_TERRAIN_DISPONIBLE.md`)

---

### Test 2: Affichage des time_slots

1. **Vérifier les logs console :**
   ```
   🔍 [DEBUG SLOTS] START Loading time_slots from Supabase
   ✅ [DEBUG SLOTS] Time slots count: 10
   ✅ [DEBUG SLOTS] Raw data (first 3): [...]
   ```
2. **Vérifier l'UI :**
   - Les créneaux s'affichent pour chaque terrain
   - Format : "08:00", "09:30", "11:00", etc.
3. **Si time slots count = 0 :**
   - Exécuter migration 018 (fixed time slots model)

---

### Test 3: Chargement des bookings

1. **Sélectionner une date (ex: 23 janvier 2026)**
2. **Vérifier les logs console :**
   ```
   🔍 [DEBUG BOOKINGS] START Loading bookings
   🔍 [DEBUG BOOKINGS] Court IDs: ["21d09a66-...", "6dceaf95-..."]
   🔍 [DEBUG BOOKINGS] Date selected: 2026-01-23
   🔍 [DEBUG BOOKINGS] Range: slot_start >= 2026-01-23T00:00:00+01:00 AND < 2026-01-23T23:59:59+01:00
   ✅ [DEBUG BOOKINGS] Query successful
   ✅ [DEBUG BOOKINGS] Bookings count: 3
   ✅ [DEBUG BOOKINGS] Key example: court_id=21d09a66-..., slot_start=2026-01-23T08:00:00.000Z
   ✅ [DEBUG BOOKINGS] Total booked slots: 3
   ```
3. **Vérifier l'UI :**
   - Les créneaux déjà réservés sont grisés
   - Les créneaux disponibles sont en blanc (cliquables)

---

### Test 4: Créer un booking

1. **Sélectionner un terrain**
2. **Cliquer sur un créneau disponible (ex: 08:00)**
3. **Remplir les joueurs et valider**
4. **Vérifier les logs console :**
   ```
   [BOOKING INSERT] 🚀 ABOUT TO INSERT INTO bookings TABLE
   [BOOKING PAYLOAD] Complete payload:
   {
     "club_id": "ba43c579-...",
     "court_id": "21d09a66-...",
     "slot_start": "2026-01-23T08:00:00.000Z",
     "fin_de_slot": "2026-01-23T09:30:00.000Z",
     "statut": "confirmed",
     "created_by": "user-uuid",
     "created_at": "2026-01-22T10:30:00.000Z"
   }
   [BOOKING INSERT] ✅✅✅ SUCCESS
   ```
5. **Vérifier l'UI :**
   - Le créneau devient grisé immédiatement
   - Message de succès s'affiche
   - Redirect vers "Mes réservations"

---

### Test 5: Realtime sync

1. **Ouvrir 2 onglets sur la page de réservation**
2. **Dans onglet 1 :** Créer une réservation pour 08:00
3. **Dans onglet 2 :** Vérifier que le créneau 08:00 devient grisé en temps réel
4. **Vérifier les logs console (onglet 2) :**
   ```
   [REALTIME bookings] payload: {...}
   [REALTIME] ✅ Slot booked (INSERT): { courtKey: "21d09a66-...", slot_start: "2026-01-23T08:00:00.000Z" }
   ```

---

## SQL de vérification

### Vérifier les bookings pour une date

```sql
SELECT 
  id,
  club_id,
  court_id,
  slot_start,
  fin_de_slot,
  statut,
  created_by,
  created_at
FROM public.bookings
WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'
  AND slot_start >= '2026-01-23T00:00:00+01:00'
  AND slot_start < '2026-01-23T23:59:59+01:00'
ORDER BY slot_start;
```

**Résultat attendu :**
```
id                                   | club_id              | court_id             | slot_start                  | fin_de_slot                 | statut    | created_by | created_at
-------------------------------------|----------------------|----------------------|-----------------------------|----------------------------|-----------|------------|---------------------------
booking-uuid-1                       | ba43c579-...         | 21d09a66-...         | 2026-01-23 08:00:00+01      | 2026-01-23 09:30:00+01     | confirmed | user-uuid  | 2026-01-22 10:30:00+00
booking-uuid-2                       | ba43c579-...         | 21d09a66-...         | 2026-01-23 11:00:00+01      | 2026-01-23 12:30:00+01     | confirmed | user-uuid  | 2026-01-22 10:35:00+00
booking-uuid-3                       | ba43c579-...         | 6dceaf95-...         | 2026-01-23 14:00:00+01      | 2026-01-23 15:30:00+01     | confirmed | user-uuid  | 2026-01-22 10:40:00+00
```

---

### Vérifier les colonnes de la table bookings

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
ORDER BY column_name;
```

**Résultat attendu :**
```
column_name   | data_type
--------------|--------------------------
club_id       | uuid
court_id      | uuid
created_at    | timestamp with time zone
created_by    | uuid
fin_de_slot   | timestamp with time zone
id            | uuid
slot_start    | timestamp with time zone
statut        | text
```

**Colonnes qui NE DOIVENT PAS exister :**
- ❌ `booking_date`
- ❌ `slot_id`
- ❌ `slot_end`
- ❌ `status`

---

## Retirer les logs de debug

**Une fois que tout fonctionne correctement :**

1. **Rechercher les logs de debug :**
   ```bash
   grep -n "DEBUG COURTS\|DEBUG SLOTS\|DEBUG BOOKINGS" app/player/(authenticated)/clubs/[id]/reserver/page.tsx
   ```

2. **Supprimer ou commenter les lignes avec :**
   - `🔍 [DEBUG ...`
   - `✅ [DEBUG ...`
   - `❌ [DEBUG ...`

3. **Garder uniquement les logs essentiels :**
   - Logs de succès (`[BOOKING INSERT] ✅ SUCCESS`)
   - Logs d'erreur (`[BOOKING INSERT ERROR] ❌`)
   - Logs Realtime (`[REALTIME] ✅ Slot booked`)

4. **Build + commit :**
   ```bash
   npm run build
   git add -A
   git commit -m "chore: remove debug logs for courts/slots/bookings"
   ```

---

## Récapitulatif des changements

| Changement | Avant | Après |
|-----------|-------|-------|
| **Type Booking** | `booking_date, slot_id, status, slot_end` | `slot_start, fin_de_slot, statut` |
| **Payload insert** | 8 champs (dont 4 incorrects) | 7 champs (tous corrects) |
| **Chargement bookings** | `.eq('booking_date', date)` | `.gte('slot_start', start).lt('slot_start', end)` |
| **Clé disponibilité** | `Set<number>` (slot_id) | `Set<string>` (slot_start ISO) |
| **isSlotAvailable** | `has(slotId)` | Calcule slot_start + `has(slotStartISO)` |
| **Realtime filter** | `booking_date=eq.${date}` | `club_id=eq.${clubId}` |
| **Realtime keys** | `slot_id` | `slot_start` (ISO) |

---

## Fichiers modifiés

- `app/player/(authenticated)/clubs/[id]/reserver/page.tsx` - refactoring complet

---

## Build Status

✅ **Build OK** - Pas d'erreurs TypeScript

---

## Prochaines étapes

1. ✅ **Tester l'affichage des courts** (voir Test 1)
2. ✅ **Tester l'affichage des time_slots** (voir Test 2)
3. ✅ **Tester le chargement des bookings** (voir Test 3)
4. ✅ **Tester la création d'un booking** (voir Test 4)
5. ✅ **Tester la sync Realtime** (voir Test 5)
6. ⏳ **Retirer les logs de debug** (une fois validé)

---

**Date:** 2026-01-22  
**Status:** Implémentation terminée, prêt pour tests  
**Commit:** `83d381c`
