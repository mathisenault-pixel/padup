# ✅ Fix: booking_date et slot_id NULL dans public.bookings

## Problème identifié

**Bug critique:** Après insertion dans `public.bookings`, les lignes ont:
- ✅ `club_id` OK (UUID)
- ✅ `court_id` OK (UUID)
- ✅ `status` OK ('confirmed')
- ❌ `booking_date` = **NULL**
- ❌ `slot_id` = **NULL**

**Impact:** Le système Realtime ne peut pas griser les créneaux réservés car il se base sur `booking_date` et `slot_id` pour identifier les slots occupés.

---

## Cause possible

1. **Champs non envoyés dans le payload**
   - Le payload ne contenait pas `booking_date` ou `slot_id`
   - Ou les noms de champs ne correspondaient pas à la DB (camelCase vs snake_case)

2. **Valeurs null/undefined**
   - `selectedDate` était null/undefined
   - `selectedSlot` était null/undefined
   - `selectedSlot.id` était null/undefined

3. **Guards insuffisants**
   - Pas de vérification avant construction du payload
   - Pas de validation après construction du payload
   - Pas de logs pour diagnostiquer

---

## Solution appliquée

### 1. **Guards critiques AVANT construction du payload**

```typescript
// ✅ GUARDS CRITIQUES : Vérifier TOUS les champs obligatoires
if (!selectedDate) {
  console.error('[RESERVE] ❌ CRITICAL: selectedDate is null/undefined')
  alert('Erreur critique: Date non sélectionnée')
  return
}

if (!selectedSlot) {
  console.error('[RESERVE] ❌ CRITICAL: selectedSlot is null/undefined')
  alert('Erreur critique: Créneau non sélectionné')
  return
}

if (!selectedSlot.id) {
  console.error('[RESERVE] ❌ CRITICAL: selectedSlot.id is null/undefined', selectedSlot)
  alert('Erreur critique: ID du créneau manquant')
  return
}

if (!selectedTerrain) {
  console.error('[RESERVE] ❌ CRITICAL: selectedTerrain is null/undefined')
  alert('Erreur critique: Terrain non sélectionné')
  return
}
```

**Pourquoi:**
- Empêche la construction du payload si les données source sont invalides
- Alerte immédiate si un champ critique est manquant
- Évite les inserts avec NULL

---

### 2. **Noms de champs en snake_case (correspondance DB)**

```typescript
const bookingPayload = {
  club_id: club.id,                       // ✅ snake_case
  court_id: courtId,                      // ✅ snake_case
  booking_date: bookingDate,              // ✅ snake_case (pas bookingDate en camelCase)
  slot_id: selectedSlot.id,               // ✅ snake_case (pas slotId en camelCase)
  slot_start: slotStartTimestamp,         // ✅ snake_case
  slot_end: slotEndTimestamp,             // ✅ snake_case
  status: 'confirmed' as const,
  created_by: null,
  created_at: new Date().toISOString()    // ✅ snake_case
}
```

**Vérification:** Les colonnes en DB sont:
- `booking_date` (DATE NOT NULL)
- `slot_id` (INTEGER NOT NULL)

**Pas:**
- ❌ `bookingDate` (camelCase n'existe pas en DB)
- ❌ `slotId` (camelCase n'existe pas en DB)

---

### 3. **Logging complet du payload AVANT insert**

```typescript
// ✅ LOGGING COMPLET DU PAYLOAD AVANT INSERT
console.log('[BOOKING PAYLOAD BEFORE INSERT] ===== FULL PAYLOAD =====')
console.log(JSON.stringify(bookingPayload, null, 2))
console.log('[BOOKING PAYLOAD BEFORE INSERT] ===== CRITICAL FIELDS =====')
console.log('booking_date:', bookingPayload.booking_date, '(type:', typeof bookingPayload.booking_date, ')')
console.log('slot_id:', bookingPayload.slot_id, '(type:', typeof bookingPayload.slot_id, ')')
console.log('club_id:', bookingPayload.club_id, '(type:', typeof bookingPayload.club_id, ')')
console.log('court_id:', bookingPayload.court_id, '(type:', typeof bookingPayload.court_id, ')')
console.log('status:', bookingPayload.status, '(type:', typeof bookingPayload.status, ')')
```

**Output attendu:**
```
[BOOKING PAYLOAD BEFORE INSERT] ===== FULL PAYLOAD =====
{
  "club_id": "ba43c579-e522-4b51-8542-737c2c6452bb",
  "court_id": "21d9a066-b7db-4966-abf1-cc210f7476c1",
  "booking_date": "2026-02-01",
  "slot_id": 5,
  "slot_start": "2026-02-01T14:00:00",
  "slot_end": "2026-02-01T15:30:00",
  "status": "confirmed",
  "created_by": null,
  "created_at": "2026-02-01T10:30:00.000Z"
}

[BOOKING PAYLOAD BEFORE INSERT] ===== CRITICAL FIELDS =====
booking_date: 2026-02-01 (type: string)
slot_id: 5 (type: number)
club_id: ba43c579-e522-4b51-8542-737c2c6452bb (type: string)
court_id: 21d9a066-b7db-4966-abf1-cc210f7476c1 (type: string)
status: confirmed (type: string)
```

**Si NULL apparaît ici, le bug est AVANT l'insert.**

---

### 4. **Validation finale AVANT insert**

```typescript
// ✅ VALIDATION FINALE : S'assurer qu'aucun champ critique n'est null/undefined
if (!bookingPayload.booking_date) {
  console.error('[RESERVE] ❌ CRITICAL: bookingPayload.booking_date is falsy:', bookingPayload.booking_date)
  alert('Erreur critique: booking_date est vide')
  setIsSubmitting(false)
  return
}

if (!bookingPayload.slot_id && bookingPayload.slot_id !== 0) {
  console.error('[RESERVE] ❌ CRITICAL: bookingPayload.slot_id is falsy:', bookingPayload.slot_id)
  alert('Erreur critique: slot_id est vide')
  setIsSubmitting(false)
  return
}
```

**Pourquoi:**
- Dernière ligne de défense avant l'insert
- Si le payload est invalide, l'insert est bloqué
- Alerte l'utilisateur immédiatement

---

### 5. **Logging complet APRÈS insert (vérification DB)**

```typescript
// ✅ LOGGING SUCCÈS AVEC DONNÉES COMPLÈTES
console.log('[BOOKING INSERT] ✅✅✅ SUCCESS')
console.log('[BOOKING INSERT] ✅ Data returned from DB:', JSON.stringify(bookingData, null, 2))
console.log('[BOOKING INSERT] ✅ Vérification champs critiques:')
console.log('  - id:', bookingData.id)
console.log('  - club_id:', bookingData.club_id)
console.log('  - court_id:', bookingData.court_id)
console.log('  - booking_date:', bookingData.booking_date, '(should NOT be NULL)')
console.log('  - slot_id:', bookingData.slot_id, '(should NOT be NULL)')
console.log('  - status:', bookingData.status)

// ✅ VÉRIFICATION POST-INSERT : booking_date et slot_id ne doivent PAS être NULL
if (!bookingData.booking_date) {
  console.error('[BOOKING INSERT] ⚠️⚠️⚠️ WARNING: booking_date is NULL in DB!')
  alert('ATTENTION: La réservation a été créée mais booking_date est NULL en base!')
}

if (!bookingData.slot_id && bookingData.slot_id !== 0) {
  console.error('[BOOKING INSERT] ⚠️⚠️⚠️ WARNING: slot_id is NULL in DB!')
  alert('ATTENTION: La réservation a été créée mais slot_id est NULL en base!')
}
```

**Output attendu:**
```
[BOOKING INSERT] ✅✅✅ SUCCESS
[BOOKING INSERT] ✅ Data returned from DB: {
  "id": "uuid-de-la-reservation",
  "club_id": "ba43c579-e522-4b51-8542-737c2c6452bb",
  "court_id": "21d9a066-b7db-4966-abf1-cc210f7476c1",
  "booking_date": "2026-02-01",   ✅ NOT NULL
  "slot_id": 5,                   ✅ NOT NULL
  "status": "confirmed",
  "created_at": "2026-02-01T10:30:00.000Z"
}

[BOOKING INSERT] ✅ Vérification champs critiques:
  - id: uuid-de-la-reservation
  - club_id: ba43c579-e522-4b51-8542-737c2c6452bb
  - court_id: 21d9a066-b7db-4966-abf1-cc210f7476c1
  - booking_date: 2026-02-01 (should NOT be NULL)  ✅ OK
  - slot_id: 5 (should NOT be NULL)                ✅ OK
  - status: confirmed
```

**Si NULL apparaît ici, le bug est DANS Supabase ou la DB (constraint manquant, trigger, etc.).**

---

## Vérification en base de données

### Requête SQL pour vérifier les contraintes

```sql
-- 1. Vérifier les contraintes NOT NULL
SELECT 
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
  AND column_name IN ('booking_date', 'slot_id');
```

**Résultat attendu:**
```
column_name   | is_nullable | data_type
--------------+-------------+-----------
booking_date  | NO          | date
slot_id       | NO          | integer
```

**Si `is_nullable = YES`, les contraintes NOT NULL sont manquantes !**

---

### Requête SQL pour ajouter les contraintes (si manquantes)

```sql
-- 2. Ajouter les contraintes NOT NULL si elles n'existent pas
ALTER TABLE public.bookings
  ALTER COLUMN booking_date SET NOT NULL,
  ALTER COLUMN slot_id SET NOT NULL;
```

---

### Requête SQL pour vérifier les données existantes

```sql
-- 3. Trouver les rows avec booking_date ou slot_id NULL
SELECT 
  id,
  club_id,
  court_id,
  booking_date,
  slot_id,
  status,
  created_at
FROM public.bookings
WHERE booking_date IS NULL 
   OR slot_id IS NULL
ORDER BY created_at DESC;
```

**Si des lignes apparaissent, il faut:**
1. Les supprimer (si données test)
2. Les corriger manuellement (si données réelles)

```sql
-- Supprimer les lignes avec NULL (données test)
DELETE FROM public.bookings
WHERE booking_date IS NULL OR slot_id IS NULL;
```

---

## Checklist de test

### Avant de tester
- [ ] Build OK (`npm run build`)
- [ ] Console ouverte dans le navigateur
- [ ] Onglet Network ouvert (filtrer sur "bookings")

### Test de réservation

1. **Aller sur la page reserver**
   ```
   /player/clubs/ba43c579-e522-4b51-8542-737c2c6452bb/reserver
   ```

2. **Sélectionner un créneau**
   - Choisir une date
   - Choisir un terrain
   - Cliquer sur un créneau libre
   - Choisir les joueurs
   - Confirmer

3. **Vérifier les logs dans la console**

   **Logs attendus (ordre):**
   ```
   [BOOKING PAYLOAD BEFORE INSERT] ===== FULL PAYLOAD =====
   {
     "club_id": "ba43c579-...",
     "court_id": "21d9a066-...",
     "booking_date": "2026-02-01",   ✅ PAS NULL
     "slot_id": 5,                   ✅ PAS NULL
     ...
   }
   
   [BOOKING PAYLOAD BEFORE INSERT] ===== CRITICAL FIELDS =====
   booking_date: 2026-02-01 (type: string)   ✅
   slot_id: 5 (type: number)                 ✅
   
   [BOOKING INSERT] Calling Supabase insert...
   
   [BOOKING INSERT] ✅✅✅ SUCCESS
   [BOOKING INSERT] ✅ Data returned from DB: {...}
   [BOOKING INSERT] ✅ Vérification champs critiques:
     - booking_date: 2026-02-01 (should NOT be NULL)  ✅
     - slot_id: 5 (should NOT be NULL)                ✅
   ```

4. **Vérifier en base de données**

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
   ORDER BY created_at DESC
   LIMIT 1;
   ```

   **Résultat attendu:**
   ```
   id         | uuid-de-la-reservation
   club_id    | ba43c579-e522-4b51-8542-737c2c6452bb  ✅
   court_id   | 21d9a066-b7db-4966-abf1-cc210f7476c1  ✅
   booking_date | 2026-02-01                           ✅ NOT NULL
   slot_id    | 5                                      ✅ NOT NULL
   status     | confirmed                              ✅
   created_at | 2026-02-01T10:30:00.000Z               ✅
   ```

5. **Vérifier le grisage inter-onglets**
   - Ouvrir 2 onglets sur la même page
   - Réserver dans onglet 1
   - Le créneau doit se griser instantanément dans onglet 2

---

## Diagnostics possibles

### Cas 1: booking_date ou slot_id NULL dans les logs AVANT insert

**Symptôme:**
```
[BOOKING PAYLOAD BEFORE INSERT] ===== CRITICAL FIELDS =====
booking_date: null (type: object)   ❌
slot_id: undefined (type: undefined) ❌
```

**Cause:** Les guards ont été contournés ou les valeurs sont perdues entre le guard et la construction du payload.

**Solution:** Vérifier que:
- `selectedDate` n'est pas réassigné à null
- `selectedSlot.id` existe bien sur l'objet `selectedSlot`

---

### Cas 2: booking_date ou slot_id OK dans payload AVANT mais NULL APRÈS insert

**Symptôme:**
```
[BOOKING PAYLOAD BEFORE INSERT]
booking_date: 2026-02-01 (type: string)   ✅

[BOOKING INSERT] ✅ Data returned from DB:
booking_date: null  ❌
```

**Cause:** Problème Supabase ou DB:
- Trigger DB qui override les valeurs
- RLS policy qui filtre les colonnes
- Contraintes NOT NULL manquantes (DB accepte NULL)

**Solution:**
1. Vérifier les triggers:
   ```sql
   SELECT * FROM pg_trigger WHERE tgrelid = 'public.bookings'::regclass;
   ```

2. Vérifier les RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'bookings';
   ```

3. Ajouter les contraintes NOT NULL (voir section ci-dessus)

---

### Cas 3: Erreur lors de l'insert

**Symptôme:**
```
[BOOKING INSERT ERROR] ❌❌❌
Message: column "booking_date" violates not-null constraint
```

**Cause:** Les contraintes NOT NULL existent en DB mais le payload est invalide.

**Solution:** Les guards devraient empêcher cela. Si ça arrive:
1. Vérifier les logs AVANT insert
2. Vérifier que `booking_date` n'est pas une string vide `""`

---

## Résumé des changements

**Fichier:** `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

**Modifications:**
1. ✅ Guards critiques pour `selectedDate`, `selectedSlot`, `selectedSlot.id`, `selectedTerrain`
2. ✅ Noms de champs en snake_case (`booking_date`, `slot_id`)
3. ✅ Logging complet du payload AVANT insert
4. ✅ Validation finale du payload AVANT insert
5. ✅ Logging complet des données APRÈS insert
6. ✅ Vérification post-insert avec alertes si NULL

**Aucun autre fichier ne fait d'insert dans `bookings`.**

---

## Status

- [x] Code modifié
- [x] Guards ajoutés
- [x] Logs ajoutés
- [x] Build OK
- [ ] **À TESTER:** Réservation complète
- [ ] **À VÉRIFIER:** booking_date et slot_id NON NULL en DB
- [ ] **À VÉRIFIER:** Grisage inter-onglets fonctionne

---

**Date:** 2026-02-01  
**Status:** Fix appliqué, prêt pour tests
