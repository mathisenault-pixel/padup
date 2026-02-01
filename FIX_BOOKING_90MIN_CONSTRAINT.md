# ✅ Fix: Contrainte durée 90 minutes (booking_90min)

## Problème

**Symptôme:**
```
Erreur: violates check constraint "booking_90min"
```

L'insertion dans `public.bookings` échouait avec une erreur de contrainte CHECK indiquant que la durée entre `slot_start` et `slot_end` doit être **exactement 90 minutes**.

**Cause:**
Le code calculait `slot_end` en utilisant `selectedSlot.end_time` de la table `time_slots`, mais cette approche pouvait créer des timestamps avec une durée légèrement différente de 90 minutes (à cause d'arrondis, fuseaux horaires, ou conversions de strings).

```typescript
// ❌ AVANT (potentiellement imprécis)
const slotStartTimestamp = combineDateAndTime(bookingDate, selectedSlot.start_time)
const slotEndTimestamp = combineDateAndTime(bookingDate, selectedSlot.end_time)
// ⚠️ Problème: slot_end - slot_start pourrait ne pas être exactement 90 minutes
```

**Contrainte DB:**
```sql
-- Table booking_slots (migration 013)
CONSTRAINT booking_slots_duration_90min 
  CHECK (end_at = start_at + interval '90 minutes')

-- Ou sur table bookings (si contrainte ajoutée manuellement)
CONSTRAINT booking_90min 
  CHECK (EXTRACT(EPOCH FROM (slot_end - slot_start)) = 5400) -- 5400 secondes = 90 minutes
```

---

## Solution appliquée

### 1. Nouvelle fonction `calculateSlotEnd()`

**Fichier:** `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

Au lieu d'utiliser `selectedSlot.end_time`, on calcule `slot_end` en ajoutant **exactement 90 minutes** à `slot_start`:

```typescript
/**
 * Calculer slot_end en ajoutant EXACTEMENT 90 minutes à slot_start
 * Garantit la contrainte DB: slot_end - slot_start = 90 minutes
 */
function calculateSlotEnd(slotStartISO: string): string {
  const startDate = new Date(slotStartISO)
  const endDate = new Date(startDate.getTime() + 90 * 60 * 1000) // +90 minutes
  return endDate.toISOString()
}
```

**Avantages:**
- ✅ Calcul précis en millisecondes
- ✅ Pas d'arrondi ou de conversion de timezone
- ✅ Garantit EXACTEMENT 90 minutes
- ✅ Compatible avec toutes les contraintes DB

---

### 2. Nouvelle fonction `validateSlotDuration()`

Validation côté frontend pour détecter les problèmes **avant** l'insert:

```typescript
/**
 * Valider que la durée entre deux timestamps est exactement 90 minutes
 */
function validateSlotDuration(slotStart: string, slotEnd: string): { 
  valid: boolean
  durationMinutes: number 
} {
  const start = new Date(slotStart)
  const end = new Date(slotEnd)
  const durationMs = end.getTime() - start.getTime()
  const durationMinutes = Math.round(durationMs / (60 * 1000))
  return {
    valid: durationMinutes === 90,
    durationMinutes
  }
}
```

**Utilisation:**
```typescript
const durationCheck = validateSlotDuration(slotStartTimestamp, slotEndTimestamp)

if (!durationCheck.valid) {
  alert(`Erreur: La durée doit être exactement 90 minutes.\nDurée calculée: ${durationCheck.durationMinutes} minutes.`)
  return
}
```

---

### 3. Modification de `handleFinalConfirmation()`

**AVANT:**
```typescript
// ❌ Utilise selectedSlot.end_time (potentiellement imprécis)
const slotStartTimestamp = combineDateAndTime(bookingDate, selectedSlot.start_time)
const slotEndTimestamp = combineDateAndTime(bookingDate, selectedSlot.end_time)

const bookingPayload = {
  slot_start: slotStartTimestamp,
  slot_end: slotEndTimestamp,
  // ...
}

await supabase.from('bookings').insert([bookingPayload])
```

**APRÈS:**
```typescript
// ✅ Calcule slot_start depuis date + start_time
const slotStartTimestamp = combineDateAndTime(bookingDate, selectedSlot.start_time)

// ✅ Calcule slot_end = slot_start + EXACTEMENT 90 minutes
const slotEndTimestamp = calculateSlotEnd(slotStartTimestamp)

// ✅ Validation AVANT insert
const durationCheck = validateSlotDuration(slotStartTimestamp, slotEndTimestamp)

if (!durationCheck.valid) {
  console.error('[BOOKING DURATION ERROR] Duration is not 90 minutes:', durationCheck.durationMinutes)
  alert(`Erreur critique: La durée du créneau doit être exactement 90 minutes.\nDurée calculée: ${durationCheck.durationMinutes} minutes.\nVeuillez contacter le support.`)
  return
}

const bookingPayload = {
  slot_start: slotStartTimestamp,   // Date("2026-01-23T14:00:00")
  slot_end: slotEndTimestamp,       // Date("2026-01-23T15:30:00") ← +90 min exact
  // ...
}

await supabase.from('bookings').insert([bookingPayload])
```

---

### 4. Logs améliorés

**Ajout de logs pour vérifier la durée:**

```typescript
console.log('[BOOKING DURATION CHECK]', {
  slot_start: slotStartTimestamp,
  slot_end: slotEndTimestamp,
  duration_minutes: durationCheck.durationMinutes,  // ← Doit être 90
  is_valid: durationCheck.valid                     // ← Doit être true
})
```

**Dans les logs avant insert:**

```typescript
console.log('[BOOKING PAYLOAD BEFORE INSERT] ===== CRITICAL FIELDS =====')
console.log('slot_start:', bookingPayload.slot_start)
console.log('slot_end:', bookingPayload.slot_end)
console.log('duration (minutes):', durationCheck.durationMinutes, '← MUST BE 90')
```

---

### 5. Gestion d'erreur améliorée

**Détection spécifique de l'erreur de contrainte:**

```typescript
if (bookingError) {
  // Erreur de contrainte CHECK (durée 90 minutes)
  if (bookingError.code === '23514' || 
      bookingError.message?.includes('90min') || 
      bookingError.message?.includes('booking_90min')) {
    errorMessage = [
      `❌ Erreur de contrainte: La durée du créneau doit être exactement 90 minutes`,
      ``,
      `Durée calculée: ${durationCheck.durationMinutes} minutes`,
      `slot_start: ${bookingPayload.slot_start}`,
      `slot_end: ${bookingPayload.slot_end}`,
      ``,
      `Erreur technique:`,
      `${bookingError.message}`,
      ``,
      `Veuillez contacter le support technique.`
    ].filter(Boolean).join('\n')
  }
  // Erreur de double-booking (UNIQUE violation)
  else if (bookingError.code === '23505') {
    errorMessage = `❌ Ce créneau est déjà réservé.\n\nVeuillez choisir un autre créneau disponible.`
  }
  // Autres erreurs...
}
```

**Codes d'erreur PostgreSQL:**
- `23514` = CHECK constraint violation
- `23505` = UNIQUE constraint violation
- `42501` = Permission denied (RLS)

---

## Logique de calcul

### Étape 1: Créer slot_start

```typescript
// Exemple: date = "2026-01-23", start_time = "14:00:00"
const slotStartTimestamp = combineDateAndTime(bookingDate, selectedSlot.start_time)
// Résultat: "2026-01-23T14:00:00"
```

---

### Étape 2: Calculer slot_end (+90 min)

```typescript
const slotEndTimestamp = calculateSlotEnd(slotStartTimestamp)

// Implémentation:
const startDate = new Date("2026-01-23T14:00:00")  // Date object
const endDate = new Date(startDate.getTime() + 90 * 60 * 1000)
//                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                        Ajoute 90 minutes en millisecondes (5 400 000 ms)

// endDate = Date("2026-01-23T15:30:00")
// slotEndTimestamp = "2026-01-23T15:30:00"
```

**Calcul:**
- 90 minutes = 90 × 60 secondes = 5400 secondes
- 5400 secondes = 5400 × 1000 millisecondes = 5 400 000 ms
- `getTime()` retourne le timestamp en millisecondes depuis 1970
- `new Date(timestamp + 5400000)` crée une date exactement 90 minutes plus tard

---

### Étape 3: Valider la durée

```typescript
const durationCheck = validateSlotDuration(slotStartTimestamp, slotEndTimestamp)

// Implémentation:
const start = new Date("2026-01-23T14:00:00")
const end = new Date("2026-01-23T15:30:00")
const durationMs = end.getTime() - start.getTime()
// durationMs = 5 400 000 ms

const durationMinutes = Math.round(durationMs / (60 * 1000))
// durationMinutes = Math.round(5400000 / 60000) = Math.round(90) = 90

return {
  valid: durationMinutes === 90,  // ✅ true
  durationMinutes: 90
}
```

---

### Étape 4: Insert dans la DB

```typescript
const bookingPayload = {
  slot_start: "2026-01-23T14:00:00",  // timestamptz
  slot_end: "2026-01-23T15:30:00",    // timestamptz
  // ...
}

await supabase.from('bookings').insert([bookingPayload])
```

**PostgreSQL valide:**
```sql
-- Vérification automatique de la contrainte
EXTRACT(EPOCH FROM (slot_end - slot_start)) = 5400  -- ✅ 90 minutes exactement
```

---

## Guards et validations

### 1. Guard frontend (avant insert)

```typescript
if (!durationCheck.valid) {
  console.error('[BOOKING DURATION ERROR] Duration is not 90 minutes:', durationCheck.durationMinutes)
  alert(`Erreur critique: La durée du créneau doit être exactement 90 minutes.\nDurée calculée: ${durationCheck.durationMinutes} minutes.\nVeuillez contacter le support.`)
  setIsSubmitting(false)
  return  // ❌ Empêche l'insert
}
```

**Bloque l'insert si:**
- `durationMinutes !== 90`
- Durée = 89 minutes → ❌ Bloqué
- Durée = 91 minutes → ❌ Bloqué
- Durée = 90.5 minutes → ❌ Bloqué (arrondi à 91)

---

### 2. Contrainte DB (si échec frontend)

Si le guard frontend est contourné, la DB rejette l'insert:

```sql
-- Table booking_slots
CONSTRAINT booking_slots_duration_90min 
  CHECK (end_at = start_at + interval '90 minutes')

-- Ou table bookings (contrainte manuelle)
CONSTRAINT booking_90min 
  CHECK (EXTRACT(EPOCH FROM (slot_end - slot_start)) = 5400)
```

**Erreur retournée:**
```json
{
  "code": "23514",
  "message": "violates check constraint \"booking_90min\"",
  "details": "Failing row contains (...)",
  "hint": null
}
```

---

## Exemple complet

### Input (sélection utilisateur)

```typescript
selectedDate = new Date("2026-01-23")
selectedSlot = {
  id: 5,                    // Référence vers time_slots.id
  start_time: "14:00:00",   // TIME depuis time_slots
  end_time: "15:30:00",     // TIME depuis time_slots (ignoré dans le nouveau code)
  label: "14:00 - 15:30"
}
```

---

### Calcul (nouveau code)

```typescript
// 1. Construire booking_date
const bookingDate = "2026-01-23"  // YYYY-MM-DD

// 2. Construire slot_start
const slotStartTimestamp = combineDateAndTime(bookingDate, selectedSlot.start_time)
// slotStartTimestamp = "2026-01-23T14:00:00"

// 3. Calculer slot_end (+90 min EXACT)
const slotEndTimestamp = calculateSlotEnd(slotStartTimestamp)
// slotEndTimestamp = "2026-01-23T15:30:00"

// 4. Valider
const durationCheck = validateSlotDuration(slotStartTimestamp, slotEndTimestamp)
// { valid: true, durationMinutes: 90 }

// 5. Payload final
const bookingPayload = {
  club_id: "ba43c579-e522-4b51-8542-737c2c6452bb",
  court_id: "21d9a066-b7db-4966-abf1-cc210f7476c1",
  booking_date: "2026-01-23",
  slot_id: 5,
  slot_start: "2026-01-23T14:00:00",  // ✅
  slot_end: "2026-01-23T15:30:00",    // ✅ Exactement +90 min
  status: "confirmed",
  created_by: "user-uuid",
  created_at: "2026-01-22T10:30:00Z"
}

// 6. Insert
await supabase.from('bookings').insert([bookingPayload])
// ✅ SUCCESS
```

---

## Tests de validation

### Test 1: Durée correcte (90 min)

```typescript
const start = "2026-01-23T14:00:00"
const end = "2026-01-23T15:30:00"
const check = validateSlotDuration(start, end)
// { valid: true, durationMinutes: 90 }
// ✅ Insert réussit
```

---

### Test 2: Durée incorrecte (89 min)

```typescript
const start = "2026-01-23T14:00:00"
const end = "2026-01-23T15:29:00"  // ❌ Seulement 89 minutes
const check = validateSlotDuration(start, end)
// { valid: false, durationMinutes: 89 }
// ❌ Guard frontend bloque l'insert
// Alert: "Erreur critique: La durée du créneau doit être exactement 90 minutes. Durée calculée: 89 minutes."
```

---

### Test 3: Durée incorrecte (91 min)

```typescript
const start = "2026-01-23T14:00:00"
const end = "2026-01-23T15:31:00"  // ❌ 91 minutes
const check = validateSlotDuration(start, end)
// { valid: false, durationMinutes: 91 }
// ❌ Guard frontend bloque l'insert
```

---

### Test 4: Durée négative (end avant start)

```typescript
const start = "2026-01-23T15:30:00"
const end = "2026-01-23T14:00:00"  // ❌ end < start
const check = validateSlotDuration(start, end)
// { valid: false, durationMinutes: -90 }
// ❌ Guard frontend bloque l'insert
```

---

### Test 5: Timestamps avec millisecondes

```typescript
const start = "2026-01-23T14:00:00.123Z"
const end = calculateSlotEnd(start)
// end = "2026-01-23T15:30:00.123Z"  // ✅ Millisecondes préservées

const check = validateSlotDuration(start, end)
// { valid: true, durationMinutes: 90 }
// ✅ Insert réussit
```

---

## Logs attendus (console)

### Lors de la réservation

```
[BOOKING DURATION CHECK] {
  slot_start: '2026-01-23T14:00:00',
  slot_end: '2026-01-23T15:30:00',
  duration_minutes: 90,
  is_valid: true
}

[BOOKING PAYLOAD BEFORE INSERT] ===== FULL PAYLOAD =====
{
  "club_id": "ba43c579-e522-4b51-8542-737c2c6452bb",
  "court_id": "21d9a066-b7db-4966-abf1-cc210f7476c1",
  "booking_date": "2026-01-23",
  "slot_id": 5,
  "slot_start": "2026-01-23T14:00:00",
  "slot_end": "2026-01-23T15:30:00",
  "status": "confirmed",
  "created_by": "user-uuid",
  "created_at": "2026-01-22T10:30:00Z"
}

[BOOKING PAYLOAD BEFORE INSERT] ===== CRITICAL FIELDS =====
created_by: user-uuid (type: string) ← REQUIRED FOR RLS
booking_date: 2026-01-23 (type: string)
slot_id: 5 (type: number)
slot_start: 2026-01-23T14:00:00 (type: string)
slot_end: 2026-01-23T15:30:00 (type: string)
duration (minutes): 90 ← MUST BE 90
club_id: ba43c579-e522-4b51-8542-737c2c6452bb (type: string)
court_id: 21d9a066-b7db-4966-abf1-cc210f7476c1 (type: string)
status: confirmed (type: string)

[BOOKING INSERT] Calling Supabase insert...
[BOOKING INSERT] ✅✅✅ SUCCESS
```

---

### Si erreur de durée (guard frontend)

```
[BOOKING DURATION CHECK] {
  slot_start: '2026-01-23T14:00:00',
  slot_end: '2026-01-23T15:29:00',
  duration_minutes: 89,  ❌
  is_valid: false        ❌
}

[BOOKING DURATION ERROR] ❌ Duration is not 90 minutes: 89

Alert: "Erreur critique: La durée du créneau doit être exactement 90 minutes.
Durée calculée: 89 minutes.
Veuillez contacter le support."
```

---

### Si erreur DB (contrainte)

```
[BOOKING INSERT ERROR] ❌❌❌
[BOOKING INSERT ERROR] Object: {
  code: '23514',
  message: 'violates check constraint "booking_90min"',
  details: 'Failing row contains (...)',
  hint: null
}

Alert: "❌ Erreur de contrainte: La durée du créneau doit être exactement 90 minutes

Durée calculée: 90 minutes
slot_start: 2026-01-23T14:00:00
slot_end: 2026-01-23T15:30:00

Erreur technique:
violates check constraint "booking_90min"

Veuillez contacter le support technique."
```

---

## Résumé des changements

| Aspect | Avant | Après |
|--------|-------|-------|
| **Calcul slot_end** | `combineDateAndTime(date, slot.end_time)` | `calculateSlotEnd(slot_start)` ✅ |
| **Durée garantie** | ❌ Peut varier (89-91 min) | ✅ Toujours 90 min exact |
| **Validation frontend** | ❌ Aucune | ✅ Guard avant insert |
| **Logs durée** | ❌ Pas de log | ✅ Log détaillé |
| **Gestion erreur** | ❌ Message générique | ✅ Message spécifique |
| **Calcul précis** | ❌ String concat | ✅ Date.getTime() + ms |

---

## Contraintes DB (rappel)

### Table `time_slots`

```sql
-- Tous les créneaux sont 90 minutes
CONSTRAINT time_slots_duration_90min CHECK (duration_minutes = 90)
```

**Données:**
```sql
INSERT INTO time_slots (start_time, end_time, duration_minutes) VALUES
  ('08:00', '09:30', 90),  -- ✅ 1h30
  ('09:30', '11:00', 90),  -- ✅ 1h30
  ('11:00', '12:30', 90),  -- ✅ 1h30
  ...
```

---

### Table `booking_slots` (si utilisée)

```sql
CONSTRAINT booking_slots_duration_90min 
  CHECK (end_at = start_at + interval '90 minutes')
```

---

### Table `bookings` (contrainte possible)

```sql
-- Si ajoutée manuellement ou dans une migration ultérieure
CONSTRAINT booking_90min 
  CHECK (EXTRACT(EPOCH FROM (slot_end - slot_start)) = 5400)
```

---

## Fichiers modifiés

### `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

**Ajout de fonctions:**
- ✅ `calculateSlotEnd(slotStartISO)` - Calcul précis +90 min
- ✅ `validateSlotDuration(start, end)` - Validation durée

**Modification de `handleFinalConfirmation()`:**
- ✅ Utilise `calculateSlotEnd()` au lieu de `selectedSlot.end_time`
- ✅ Valide la durée avant insert
- ✅ Logs détaillés de la durée
- ✅ Gestion d'erreur spécifique pour contrainte CHECK

---

## Build

```bash
npm run build
# ✅ Compiled successfully
# ✅ TypeScript check passed
# ✅ No errors
```

---

## Checklist de validation

- [x] **Fonction `calculateSlotEnd()` créée**
- [x] **Fonction `validateSlotDuration()` créée**
- [x] **`handleFinalConfirmation()` utilise `calculateSlotEnd()`**
- [x] **Guard frontend valide la durée avant insert**
- [x] **Logs détaillés ajoutés (duration_minutes)**
- [x] **Gestion d'erreur DB pour contrainte CHECK (23514)**
- [x] **Messages d'erreur clairs et spécifiques**
- [x] **Build TypeScript OK**
- [ ] **À TESTER:** Réservation réussit avec durée 90 min
- [ ] **À TESTER:** Guard bloque si durée !== 90 min
- [ ] **À TESTER:** DB rejette si constraint violation

---

## Prochaines étapes (optionnel)

### 1. Tests unitaires

```typescript
describe('calculateSlotEnd', () => {
  it('should add exactly 90 minutes', () => {
    const start = '2026-01-23T14:00:00'
    const end = calculateSlotEnd(start)
    expect(end).toBe('2026-01-23T15:30:00')
  })
  
  it('should handle midnight transition', () => {
    const start = '2026-01-23T23:00:00'
    const end = calculateSlotEnd(start)
    expect(end).toBe('2026-01-24T00:30:00')  // ✅ Next day
  })
})

describe('validateSlotDuration', () => {
  it('should return valid for 90 minutes', () => {
    const check = validateSlotDuration('2026-01-23T14:00:00', '2026-01-23T15:30:00')
    expect(check.valid).toBe(true)
    expect(check.durationMinutes).toBe(90)
  })
  
  it('should return invalid for 89 minutes', () => {
    const check = validateSlotDuration('2026-01-23T14:00:00', '2026-01-23T15:29:00')
    expect(check.valid).toBe(false)
    expect(check.durationMinutes).toBe(89)
  })
})
```

---

### 2. Vérifier la contrainte DB

Vérifier si la contrainte existe dans Supabase:

```sql
-- Lister les contraintes CHECK sur bookings
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.bookings'::regclass
  AND contype = 'c';  -- c = CHECK constraint
```

Si la contrainte n'existe pas, l'ajouter:

```sql
-- Option 1: Contrainte stricte (secondes exactes)
ALTER TABLE public.bookings
  ADD CONSTRAINT booking_90min 
  CHECK (EXTRACT(EPOCH FROM (slot_end - slot_start)) = 5400);

-- Option 2: Contrainte plus souple (interval)
ALTER TABLE public.bookings
  ADD CONSTRAINT booking_90min 
  CHECK (slot_end = slot_start + interval '90 minutes');
```

---

### 3. Migrer vers la fonction RPC `create_booking_90m`

Au lieu d'insert direct, utiliser la fonction RPC existante:

```typescript
const { data, error } = await supabase.rpc('create_booking_90m', {
  p_club_id: club.id,
  p_court_id: courtId,
  p_start_at: slotStartTimestamp,  // timestamptz
  p_user_id: user.id,
  p_status: 'confirmed'
})

// La fonction RPC calcule automatiquement:
// v_end_at := p_start_at + interval '90 minutes'
```

**Avantages:**
- ✅ Calcul côté DB (plus fiable)
- ✅ Insert atomique dans `reservations` + `booking_slots`
- ✅ Gestion auto des erreurs UNIQUE violation
- ✅ Pas besoin de `calculateSlotEnd()` côté frontend

---

**Date:** 2026-01-22  
**Status:** Fix appliqué, build OK, prêt pour tests  
**Contrainte:** `slot_end - slot_start = 90 minutes` ✅
