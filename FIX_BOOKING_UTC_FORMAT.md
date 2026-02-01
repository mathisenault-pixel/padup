# ✅ Fix: Format UTC cohérent pour timestamps (booking_90min)

## Problème

**Symptôme:**
```
Erreur: violates check constraint "booking_90min"
MAIS l'UI affiche "Durée calculée: 90 minutes"
```

Malgré l'affichage correct de la durée (90 minutes), l'insert dans `public.bookings` échouait avec une erreur de contrainte.

**Observation critique:**
```typescript
// AVANT (formats mixtes)
slot_start: "2026-01-23T14:00:00"      // ❌ Pas de Z (heure locale)
slot_end: "2026-01-23T15:30:00.000Z"   // ✅ Avec Z (UTC)
```

**Cause racine:**

Format mixte des timestamps:
- `combineDateAndTime()` retournait `"2026-01-23T14:00:00"` (sans Z)
- `calculateSlotEnd()` retournait `"2026-01-23T15:30:00.000Z"` (avec Z)

Quand PostgreSQL compare ces deux timestamps:
- `slot_start` est interprété comme **heure locale du serveur** (peut-être Europe/Paris = UTC+1)
- `slot_end` est interprété comme **UTC explicite**

**Résultat:**
Si le serveur est en UTC+1:
- `slot_start = "2026-01-23T14:00:00"` → interprété comme 14:00 Europe/Paris = 13:00 UTC
- `slot_end = "2026-01-23T15:30:00.000Z"` → 15:30 UTC
- Différence = 15:30 UTC - 13:00 UTC = **2h30 = 150 minutes** ❌

Même si le calcul JavaScript affichait "90 minutes", PostgreSQL calculait une durée différente à cause de l'interprétation timezone.

---

## Solution appliquée

### 1. Modifier `combineDateAndTime()` pour retourner UTC

**AVANT:**
```typescript
function combineDateAndTime(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}`  // ❌ Pas de timezone
}
// Retourne: "2026-01-23T14:00:00"
```

**APRÈS:**
```typescript
function combineDateAndTime(dateStr: string, timeStr: string): string {
  // Créer un Date object en UTC pour éviter les conversions de timezone
  const isoString = `${dateStr}T${timeStr}Z` // Ajouter Z pour forcer UTC
  const date = new Date(isoString)
  return date.toISOString() // Retourne format cohérent avec Z
}
// Retourne: "2026-01-23T14:00:00.000Z"
```

**Avantages:**
- ✅ Format cohérent avec `calculateSlotEnd()`
- ✅ Toujours UTC (pas d'interprétation locale)
- ✅ Suffixe Z présent
- ✅ Compatible avec PostgreSQL timestamptz

---

### 2. Améliorer `validateSlotDuration()` (comparaison en ms)

**AVANT:**
```typescript
function validateSlotDuration(slotStart: string, slotEnd: string) {
  const durationMs = end.getTime() - start.getTime()
  const durationMinutes = Math.round(durationMs / (60 * 1000))  // ❌ Arrondi
  return {
    valid: durationMinutes === 90,  // ❌ Compare minutes arrondies
    durationMinutes
  }
}
```

**APRÈS:**
```typescript
function validateSlotDuration(slotStart: string, slotEnd: string): { 
  valid: boolean
  durationMs: number
  durationMinutes: number 
} {
  const start = new Date(slotStart)
  const end = new Date(slotEnd)
  const durationMs = end.getTime() - start.getTime()
  const expectedMs = 90 * 60 * 1000 // 5400000 ms
  return {
    valid: durationMs === expectedMs,  // ✅ Compare millisecondes exactes
    durationMs,                        // ✅ Retourne ms pour debug
    durationMinutes: durationMs / (60 * 1000)  // Pour affichage
  }
}
```

**Avantages:**
- ✅ Comparaison stricte en millisecondes (pas d'arrondi)
- ✅ Retourne `durationMs` pour debug
- ✅ `durationMinutes` pour affichage lisible

---

### 3. Validation stricte en millisecondes

**AVANT:**
```typescript
if (!durationCheck.valid) {
  // Validation basée sur minutes arrondies
}
```

**APRÈS:**
```typescript
const startDate = new Date(slotStartTimestamp)
const endDate = new Date(slotEndTimestamp)
const diffMs = endDate.getTime() - startDate.getTime()
const diffMinutes = diffMs / (60 * 1000)

// ✅ Guard: Comparaison stricte en millisecondes
if (diffMs !== 90 * 60 * 1000) {
  console.error('[BOOKING DURATION ERROR] ❌ Duration is not EXACTLY 90 minutes')
  console.error('  Expected (ms):', 90 * 60 * 1000)
  console.error('  Actual (ms):', diffMs)
  console.error('  Difference:', diffMs - (90 * 60 * 1000), 'ms')
  alert(`Erreur critique: La durée doit être exactement 90 minutes.\nDurée: ${diffMinutes} minutes (${diffMs} ms).\nAttendu: 90 minutes (${90 * 60 * 1000} ms).`)
  return
}
```

---

### 4. Logs détaillés pour debug format

**Ajout de logs pour tracer le format exact:**

```typescript
console.log('[BOOKING DURATION CHECK] ===== FORMAT & DURÉE =====')
console.log('slot_start:', slotStartTimestamp)
console.log('slot_end:', slotEndTimestamp)
console.log('Format slot_start ends with Z?', slotStartTimestamp.endsWith('Z'))
console.log('Format slot_end ends with Z?', slotEndTimestamp.endsWith('Z'))
console.log('Duration (ms):', durationCheck.durationMs, '← MUST BE', 90 * 60 * 1000)
console.log('Duration (minutes):', durationCheck.durationMinutes, '← MUST BE 90')

console.log('[BOOKING DURATION CHECK] ===== VERIFICATION FINALE =====')
console.log('startDate.toISOString():', startDate.toISOString())
console.log('endDate.toISOString():', endDate.toISOString())
console.log('Diff (getTime):', diffMs, 'ms =', diffMinutes, 'minutes')
console.log('Expected:', 90 * 60 * 1000, 'ms = 90 minutes')
```

**Logs du payload:**

```typescript
console.log('[BOOKING PAYLOAD BEFORE INSERT] ===== TIMESTAMPS FORMAT =====')
console.log('slot_start:', bookingPayload.slot_start)
console.log('  - Has Z suffix?', bookingPayload.slot_start.endsWith('Z'))
console.log('  - Length:', bookingPayload.slot_start.length, '(expected: 24 for ISO with Z)')
console.log('slot_end:', bookingPayload.slot_end)
console.log('  - Has Z suffix?', bookingPayload.slot_end.endsWith('Z'))
console.log('  - Length:', bookingPayload.slot_end.length, '(expected: 24 for ISO with Z)')
console.log('Formats match?', bookingPayload.slot_start.endsWith('Z') && bookingPayload.slot_end.endsWith('Z'))
```

---

### 5. Guards pour vérifier le format UTC

**Bloquer l'insert si les timestamps n'ont pas le suffixe Z:**

```typescript
// ✅ VALIDATION FORMAT: S'assurer que slot_start et slot_end sont au format ISO UTC (avec Z)
if (!bookingPayload.slot_start.endsWith('Z')) {
  console.error('[RESERVE] ❌ CRITICAL: slot_start does not end with Z:', bookingPayload.slot_start)
  alert(`Erreur critique: slot_start n'est pas au format UTC.\nFormat actuel: ${bookingPayload.slot_start}\nFormat attendu: ISO avec suffixe Z`)
  return
}

if (!bookingPayload.slot_end.endsWith('Z')) {
  console.error('[RESERVE] ❌ CRITICAL: slot_end does not end with Z:', bookingPayload.slot_end)
  alert(`Erreur critique: slot_end n'est pas au format UTC.\nFormat actuel: ${bookingPayload.slot_end}\nFormat attendu: ISO avec suffixe Z`)
  return
}

console.log('[RESERVE] ✅ All format validations passed')
```

---

### 6. Message d'erreur amélioré

**Erreur de contrainte DB détaillée:**

```typescript
if (bookingError.code === '23514' || bookingError.message?.includes('90min')) {
  const startHasZ = bookingPayload.slot_start.endsWith('Z')
  const endHasZ = bookingPayload.slot_end.endsWith('Z')
  errorMessage = [
    `❌ Erreur de contrainte: La durée du créneau doit être exactement 90 minutes`,
    ``,
    `ANALYSE DU PROBLÈME:`,
    `Durée calculée (frontend): ${diffMinutes} minutes (${diffMs} ms)`,
    `Durée attendue: 90 minutes (${90 * 60 * 1000} ms)`,
    ``,
    `FORMATS DES TIMESTAMPS:`,
    `slot_start: ${bookingPayload.slot_start}`,
    `  - Format UTC (Z)? ${startHasZ ? '✅ OUI' : '❌ NON'}`,
    `  - Longueur: ${bookingPayload.slot_start.length}`,
    `slot_end: ${bookingPayload.slot_end}`,
    `  - Format UTC (Z)? ${endHasZ ? '✅ OUI' : '❌ NON'}`,
    `  - Longueur: ${bookingPayload.slot_end.length}`,
    ``,
    `FORMATS COHÉRENTS? ${startHasZ && endHasZ ? '✅ OUI' : '❌ NON - PROBLÈME DÉTECTÉ'}`,
    ``,
    `Erreur PostgreSQL:`,
    `${bookingError.message}`,
    ``,
    `⚠️ Veuillez contacter le support technique avec ces informations.`
  ].filter(Boolean).join('\n')
}
```

---

## Exemple complet

### Input

```typescript
selectedDate = new Date("2026-01-23")
selectedSlot = {
  id: 5,
  start_time: "14:00:00",  // TIME depuis time_slots
  end_time: "15:30:00"     // Ignoré dans le nouveau code
}
```

---

### Calcul (nouveau code)

```typescript
// 1. booking_date
const bookingDate = "2026-01-23"  // YYYY-MM-DD

// 2. slot_start (format UTC avec Z)
const slotStartTimestamp = combineDateAndTime(bookingDate, selectedSlot.start_time)
// Implémentation:
//   isoString = "2026-01-23T14:00:00Z"
//   date = new Date(isoString)
//   return date.toISOString()
// Résultat: "2026-01-23T14:00:00.000Z"  ✅ Avec Z

// 3. slot_end (+90 min, format UTC avec Z)
const slotEndTimestamp = calculateSlotEnd(slotStartTimestamp)
// Implémentation:
//   startDate = new Date("2026-01-23T14:00:00.000Z")
//   endDate = new Date(startDate.getTime() + 90 * 60 * 1000)
//   return endDate.toISOString()
// Résultat: "2026-01-23T15:30:00.000Z"  ✅ Avec Z

// 4. Validation (millisecondes)
const startDate = new Date(slotStartTimestamp)  // Date object
const endDate = new Date(slotEndTimestamp)      // Date object
const diffMs = endDate.getTime() - startDate.getTime()
// diffMs = 5400000 ms = 90 minutes ✅

// 5. Guard
if (diffMs !== 90 * 60 * 1000) {
  // ❌ Bloque l'insert
}
// ✅ Passe la validation
```

---

### Payload final

```json
{
  "slot_start": "2026-01-23T14:00:00.000Z",  // ✅ UTC avec Z
  "slot_end": "2026-01-23T15:30:00.000Z",    // ✅ UTC avec Z
  "booking_date": "2026-01-23",
  "slot_id": 5
}
```

---

### PostgreSQL valide

```sql
-- Les deux timestamps sont en UTC explicite
SELECT 
  slot_start,                              -- 2026-01-23 14:00:00+00
  slot_end,                                -- 2026-01-23 15:30:00+00
  EXTRACT(EPOCH FROM (slot_end - slot_start)) AS diff_seconds
FROM bookings
WHERE id = ...;

-- diff_seconds = 5400 = 90 minutes ✅
-- Contrainte CHECK satisfied ✅
```

---

## Logs attendus

### Succès (formats cohérents)

```
[BOOKING DURATION CHECK] ===== FORMAT & DURÉE =====
slot_start: 2026-01-23T14:00:00.000Z
slot_end: 2026-01-23T15:30:00.000Z
Format slot_start ends with Z? true  ✅
Format slot_end ends with Z? true    ✅
Duration (ms): 5400000 ← MUST BE 5400000
Duration (minutes): 90 ← MUST BE 90
Is valid? true

[BOOKING DURATION CHECK] ===== VERIFICATION FINALE =====
startDate.toISOString(): 2026-01-23T14:00:00.000Z
endDate.toISOString(): 2026-01-23T15:30:00.000Z
Diff (getTime): 5400000 ms = 90 minutes
Expected: 5400000 ms = 90 minutes

[BOOKING DURATION CHECK] ✅ Duration is EXACTLY 90 minutes

[BOOKING PAYLOAD BEFORE INSERT] ===== TIMESTAMPS FORMAT =====
slot_start: 2026-01-23T14:00:00.000Z
  - Has Z suffix? true   ✅
  - Length: 24 (expected: 24 for ISO with Z)
slot_end: 2026-01-23T15:30:00.000Z
  - Has Z suffix? true   ✅
  - Length: 24 (expected: 24 for ISO with Z)

[BOOKING PAYLOAD BEFORE INSERT] ===== DURATION VERIFICATION =====
Duration (ms): 5400000 ← MUST BE 5400000
Duration (minutes): 90 ← MUST BE 90
Formats match? true  ✅

[RESERVE] ✅ All format validations passed

[BOOKING INSERT] Calling Supabase insert...
[BOOKING INSERT] ✅✅✅ SUCCESS
```

---

### Erreur (formats mixtes - avant fix)

```
[BOOKING DURATION CHECK] ===== FORMAT & DURÉE =====
slot_start: 2026-01-23T14:00:00          ❌ Pas de Z
slot_end: 2026-01-23T15:30:00.000Z       ✅ Avec Z
Format slot_start ends with Z? false     ❌
Format slot_end ends with Z? true        ✅
Duration (ms): 5400000 ← MUST BE 5400000
Duration (minutes): 90 ← MUST BE 90      ← Frontend calcule 90 min
Is valid? true                           ← Frontend valide OK

[RESERVE] ❌ CRITICAL: slot_start does not end with Z: 2026-01-23T14:00:00

Alert: "Erreur critique: slot_start n'est pas au format UTC.
Format actuel: 2026-01-23T14:00:00
Format attendu: ISO avec suffixe Z"
```

**Ou si le guard n'avait pas bloqué:**

```
[BOOKING INSERT ERROR] ❌❌❌
Code: 23514
Message: violates check constraint "booking_90min"

Alert: "❌ Erreur de contrainte: La durée du créneau doit être exactement 90 minutes

ANALYSE DU PROBLÈME:
Durée calculée (frontend): 90 minutes (5400000 ms)
Durée attendue: 90 minutes (5400000 ms)

FORMATS DES TIMESTAMPS:
slot_start: 2026-01-23T14:00:00
  - Format UTC (Z)? ❌ NON
  - Longueur: 19
slot_end: 2026-01-23T15:30:00.000Z
  - Format UTC (Z)? ✅ OUI
  - Longueur: 24

FORMATS COHÉRENTS? ❌ NON - PROBLÈME DÉTECTÉ

Erreur PostgreSQL:
violates check constraint "booking_90min"

⚠️ Veuillez contacter le support technique avec ces informations."
```

---

## Pourquoi ça échouait avant

### Scénario: Serveur PostgreSQL en Europe/Paris (UTC+1)

**Timestamps envoyés:**
```json
{
  "slot_start": "2026-01-23T14:00:00",      // ❌ Pas de timezone
  "slot_end": "2026-01-23T15:30:00.000Z"    // ✅ UTC explicite
}
```

**Interprétation PostgreSQL:**

```sql
-- slot_start sans timezone → interprété comme heure locale du serveur
slot_start = '2026-01-23T14:00:00'  → '2026-01-23 14:00:00 Europe/Paris'
                                     → '2026-01-23 13:00:00 UTC'

-- slot_end avec Z → interprété comme UTC
slot_end = '2026-01-23T15:30:00.000Z' → '2026-01-23 15:30:00 UTC'

-- Calcul de la différence
diff = slot_end - slot_start
     = 15:30:00 UTC - 13:00:00 UTC
     = 2h30 = 150 minutes  ❌

-- Contrainte CHECK échoue
CHECK (EXTRACT(EPOCH FROM (slot_end - slot_start)) = 5400)  -- 5400 = 90 min
      9000 !== 5400  ❌
```

**Frontend (JavaScript):**

```javascript
// JavaScript interprète aussi selon timezone locale
const start = new Date("2026-01-23T14:00:00")      // Heure locale navigateur
const end = new Date("2026-01-23T15:30:00.000Z")   // UTC

// SI navigateur en Europe/Paris (UTC+1):
start.getTime() // ms pour 2026-01-23 14:00:00 Europe/Paris = 13:00:00 UTC
end.getTime()   // ms pour 2026-01-23 15:30:00 UTC

diff = end.getTime() - start.getTime() = 150 minutes  ❌
// Mais si l'arrondi tombe pile sur 90, validation passe par erreur
```

---

## Résumé des changements

| Aspect | Avant | Après |
|--------|-------|-------|
| **`combineDateAndTime()`** | `"2026-01-23T14:00:00"` (pas de Z) | `"2026-01-23T14:00:00.000Z"` ✅ |
| **Format slot_start** | Heure locale | UTC avec Z ✅ |
| **Format slot_end** | UTC avec Z | UTC avec Z ✅ |
| **Cohérence format** | ❌ Mixte | ✅ Cohérent |
| **Validation durée** | Minutes arrondies | Millisecondes exactes ✅ |
| **Guard format** | ❌ Aucun | ✅ Vérifie suffixe Z |
| **Logs format** | ❌ Pas de détail | ✅ Format tracé |
| **Message erreur** | ❌ Générique | ✅ Analyse format |
| **Interprétation PostgreSQL** | ❌ Dépend du serveur | ✅ Toujours UTC |

---

## Fichiers modifiés

### `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

**Fonctions modifiées:**

1. **`combineDateAndTime()`**
   - Ajoute `Z` au string avant de créer le Date object
   - Retourne `toISOString()` (format avec Z)

2. **`validateSlotDuration()`**
   - Compare en millisecondes (pas de Math.round)
   - Retourne `durationMs` pour debug

3. **`handleFinalConfirmation()`**
   - Calcul de `diffMs` et `diffMinutes` avec getTime()
   - Validation stricte: `diffMs !== 90 * 60 * 1000`
   - Logs détaillés du format
   - Guards pour vérifier suffixe Z
   - Message d'erreur DB avec analyse format

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

- [x] **`combineDateAndTime()` retourne format UTC avec Z**
- [x] **`calculateSlotEnd()` retourne format UTC avec Z**
- [x] **Validation compare millisecondes exactes**
- [x] **Guards vérifient suffixe Z avant insert**
- [x] **Logs tracent format exact des timestamps**
- [x] **Message d'erreur analyse format**
- [x] **Build TypeScript OK**
- [ ] **À TESTER:** Réservation réussit avec formats cohérents
- [ ] **À TESTER:** Guard bloque si pas de suffixe Z
- [ ] **À TESTER:** PostgreSQL accepte la durée

---

## Tests recommandés

### Test 1: Vérifier formats dans console

```
1. Ouvrir DevTools Console
2. Faire une réservation
3. Chercher: [BOOKING DURATION CHECK]
4. Vérifier:
   - slot_start ends with Z? true
   - slot_end ends with Z? true
   - Duration (ms): 5400000
   - Formats match? true
```

---

### Test 2: Vérifier payload

```
1. Chercher: [BOOKING PAYLOAD BEFORE INSERT]
2. Vérifier:
   - slot_start: "2026-...-...T...:...:....000Z"
   - slot_end: "2026-...-...T...:...:....000Z"
   - Has Z suffix? true (pour les deux)
   - Formats match? true
```

---

### Test 3: Réservation réussit

```
1. Sélectionner un créneau
2. Confirmer la réservation
3. Chercher: [BOOKING INSERT] ✅✅✅ SUCCESS
4. Vérifier: Pas d'erreur "booking_90min"
```

---

### Test 4: Vérifier en DB

```sql
SELECT 
  id,
  slot_start,
  slot_end,
  EXTRACT(EPOCH FROM (slot_end - slot_start)) / 60 AS duration_minutes
FROM public.bookings
ORDER BY created_at DESC
LIMIT 1;

-- Vérifier:
-- slot_start: 2026-01-23 14:00:00+00
-- slot_end: 2026-01-23 15:30:00+00
-- duration_minutes: 90.0
```

---

## Prochaines étapes (optionnel)

### 1. Test avec timezone différente

Vérifier que ça fonctionne quel que soit le fuseau horaire:

```javascript
// Simuler timezone différente
process.env.TZ = 'America/New_York'  // UTC-5
// Tester réservation
// Vérifier: slot_start et slot_end ont tous les deux Z
```

---

### 2. Test avec navigateur en timezone différente

```
1. Chrome DevTools → More Tools → Sensors
2. Location: Tokyo (UTC+9)
3. Faire une réservation
4. Vérifier: Les timestamps ont tous le suffixe Z
```

---

### 3. Migrer tous les calculs de date vers UTC

Pour éviter tout problème futur, standardiser:

```typescript
// Toujours utiliser UTC pour les calculs
const nowUTC = new Date().toISOString()  // Avec Z
const dateUTC = new Date(dateString + 'Z').toISOString()  // Forcer UTC

// Éviter:
const dateLocal = new Date(dateString)  // ❌ Timezone locale
```

---

**Date:** 2026-01-22  
**Status:** Fix appliqué, build OK, prêt pour tests  
**Format:** Tous les timestamps en ISO UTC avec suffixe Z ✅
