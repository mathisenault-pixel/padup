# 🔍 DEBUG: bookings_court_id_fkey Error

## Date: 2026-01-22
## Commit: `dcf219f`

---

## Erreur PostgreSQL

```
Error: insert or update on table "bookings" violates foreign key constraint "bookings_court_id_fkey"
DETAIL: Key (court_id)=(...) is not present in table "courts".
```

**Cause:** Le `court_id` envoyé dans l'insert `bookings` n'existe pas dans la table `public.courts`.

---

## Logs de debug ajoutés

### 1. Payload exact envoyé à Supabase

**Location:** `app/player/(authenticated)/clubs/[id]/reserver/page.tsx` (ligne ~783)

**JUSTE AVANT:**
```typescript
const { data, error } = await supabase
  .from('bookings')
  .insert([bookingPayload])
```

**Log ajouté:**
```javascript
console.log('[BOOKING_PAYLOAD]', {
  club_id: bookingPayload.club_id,
  court_id: bookingPayload.court_id,        // ← CLEF ÉTRANGÈRE
  booking_date: bookingPayload.booking_date,
  slot_id: bookingPayload.slot_id,
  slot_start: bookingPayload.slot_start,
  slot_end: bookingPayload.slot_end,
  status: bookingPayload.status,
  created_by: bookingPayload.created_by,
  durationMinutes: (new Date(bookingPayload.slot_end).getTime() - new Date(bookingPayload.slot_start).getTime()) / 60000,
})
```

---

### 2. Validations avant insert

**Validation 1: court_id non null/undefined**
```typescript
if (!bookingPayload.court_id) {
  console.error('[BOOKING] ❌❌❌ CRITICAL: court_id is NULL/UNDEFINED')
  console.error('[BOOKING] This will cause foreign key error: bookings_court_id_fkey')
  alert('Erreur critique: court_id manquant.')
  return // ← Bloque l'insert
}
```

**Validation 2: court_id est un UUID valide**
```typescript
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
if (!uuidRegex.test(bookingPayload.court_id)) {
  console.error('[BOOKING] ❌❌❌ CRITICAL: court_id is not a valid UUID format')
  console.error('[BOOKING] court_id received:', bookingPayload.court_id)
  alert(`Erreur critique: court_id invalide (${bookingPayload.court_id})`)
  return // ← Bloque l'insert
}
```

---

## Console logs attendus

### ✅ CAS NORMAL (court_id valide)

```
[BOOKING_PAYLOAD] {
  club_id: 'ba43c579-e522-4b51-8542-737c2c6452bb',
  court_id: '21d09a66-b7db-4966-abf1-cc210f7476c1',  ← UUID valide
  booking_date: '2026-01-23',
  slot_id: 5,
  slot_start: '2026-01-23T14:00:00.000Z',
  slot_end: '2026-01-23T15:30:00.000Z',
  status: 'confirmed',
  created_by: 'abc-123-user-uuid',
  durationMinutes: 90  ← Doit être exactement 90
}
[BOOKING] ✅ court_id validation passed: 21d09a66-b7db-4966-abf1-cc210f7476c1
[BOOKING] ✅ court_id is valid UUID format
[BOOKING INSERT] Calling Supabase insert...
[BOOKING INSERT] ✅✅✅ SUCCESS
```

---

### ❌ CAS ERREUR 1: court_id NULL

```
[BOOKING_PAYLOAD] {
  club_id: 'ba43c579-e522-4b51-8542-737c2c6452bb',
  court_id: null,  ← Problème détecté
  booking_date: '2026-01-23',
  slot_id: 5,
  ...
}
[BOOKING] ❌❌❌ CRITICAL: court_id is NULL/UNDEFINED
[BOOKING] This will cause foreign key error: bookings_court_id_fkey
→ Alert: "Erreur critique: court_id manquant"
→ Insert BLOQUÉ
```

**Causes possibles:**
1. Courts non chargés depuis Supabase (`courts.length === 0`)
2. Terrain sélectionné n'a pas de `courtId`
3. `selectedTerrainData` est undefined

**Solution:** Le fallback MVP devrait s'activer (voir commit `f1aacb1`).

---

### ❌ CAS ERREUR 2: court_id pas UUID

```
[BOOKING_PAYLOAD] {
  club_id: 'ba43c579-e522-4b51-8542-737c2c6452bb',
  court_id: '1',  ← Pas un UUID
  booking_date: '2026-01-23',
  slot_id: 5,
  ...
}
[BOOKING] ❌❌❌ CRITICAL: court_id is not a valid UUID format
[BOOKING] court_id received: 1
[BOOKING] Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
→ Alert: "Erreur critique: court_id invalide (1)"
→ Insert BLOQUÉ
```

**Causes possibles:**
1. Utilisation d'un ancien mapping numérique (1, 2, 3...)
2. `COURT_UUIDS` hardcodé utilisé avec une mauvaise clé
3. Index UI (`terrain.id`) utilisé au lieu de `terrain.courtId`

**Solution:** Utiliser `terrain.courtId` au lieu de `COURT_UUIDS[terrain.id]`.

---

### ❌ CAS ERREUR 3: court_id UUID valide mais n'existe pas en DB

```
[BOOKING_PAYLOAD] {
  club_id: 'ba43c579-e522-4b51-8542-737c2c6452bb',
  court_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',  ← UUID valide mais n'existe pas
  booking_date: '2026-01-23',
  slot_id: 5,
  ...
}
[BOOKING] ✅ court_id validation passed: aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
[BOOKING] ✅ court_id is valid UUID format
[BOOKING INSERT] Calling Supabase insert...
[BOOKING INSERT ERROR] ❌❌❌
Error: insert or update on table "bookings" violates foreign key constraint "bookings_court_id_fkey"
DETAIL: Key (court_id)=(aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee) is not present in table "courts".
```

**Causes possibles:**
1. UUID hardcodé incorrect (typo dans le fallback)
2. Court supprimé de la DB
3. UUID chargé depuis Supabase ne correspond pas à un court existant

**Solution:** Vérifier que le court existe en DB.

---

## Checklist de debugging

### Étape 1: Vérifier que les courts se chargent

1. Ouvrir `http://localhost:3000/player/clubs/ba43c579-.../reserver`
2. Ouvrir DevTools Console
3. Chercher:
   ```
   [COURTS] Loading courts from Supabase for club: ba43c579-...
   [COURTS] ✅ Loaded: X courts
   [COURTS] Data: [...]
   ```

**Vérifications:**
- [ ] `X courts` doit être >= 1
- [ ] Chaque court doit avoir un `id` (UUID)
- [ ] Les UUIDs doivent correspondre aux UUIDs en DB

---

### Étape 2: Vérifier les terrains dans l'UI

1. Ouvrir la console
2. Taper:
   ```javascript
   // Dans la console React DevTools
   // Ou inspecter l'élément et chercher "terrains"
   ```
3. Vérifier que `terrains` contient des objets avec `courtId`:
   ```javascript
   [
     { id: 1, courtId: '21d09a66-...', name: 'Terrain 1', type: 'Indoor' },
     { id: 2, courtId: '6dceaf95-...', name: 'Terrain 2', type: 'Outdoor' }
   ]
   ```

**Vérifications:**
- [ ] `courtId` n'est pas `undefined`
- [ ] `courtId` est un UUID valide
- [ ] `courtId` correspond à un court en DB

---

### Étape 3: Faire une réservation et vérifier les logs

1. Sélectionner date + terrain + créneau
2. Confirmer la réservation
3. **IMMÉDIATEMENT** vérifier la console

**Logs attendus:**
```
[BOOKING_PAYLOAD] {
  club_id: 'ba43c579-...',
  court_id: '21d09a66-...',  ← Vérifier cet UUID
  booking_date: '2026-01-23',
  slot_id: 5,
  slot_start: '2026-01-23T14:00:00.000Z',
  slot_end: '2026-01-23T15:30:00.000Z',
  status: 'confirmed',
  created_by: '...',
  durationMinutes: 90  ← DOIT être 90
}
```

**Vérifications:**
- [ ] `court_id` n'est pas `null`
- [ ] `court_id` est un UUID valide (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- [ ] `durationMinutes` est exactement `90`
- [ ] `slot_start` et `slot_end` se terminent par `Z` (ISO UTC)

---

### Étape 4: Vérifier que le court existe en DB

**Query SQL dans Supabase SQL Editor:**
```sql
SELECT id, name, court_type, club_id
FROM public.courts
WHERE id = '21d09a66-b7db-4966-abf1-cc210f7476c1';  -- ← UUID du log [BOOKING_PAYLOAD]
```

**Résultat attendu:**
```
id                                   | name       | court_type | club_id
-------------------------------------|------------|------------|--------------------------------------
21d09a66-b7db-4966-abf1-cc210f7476c1 | Terrain 1  | Indoor     | ba43c579-e522-4b51-8542-737c2c6452bb
```

**Vérifications:**
- [ ] Query retourne 1 ligne (court existe)
- [ ] `club_id` correspond au club sélectionné
- [ ] `id` correspond au `court_id` du log `[BOOKING_PAYLOAD]`

**Si query retourne 0 lignes:**
→ Le court n'existe pas en DB
→ Créer le court manuellement:
```sql
INSERT INTO public.courts (id, club_id, name, court_type) VALUES
  ('21d09a66-b7db-4966-abf1-cc210f7476c1', 'ba43c579-e522-4b51-8542-737c2c6452bb', 'Terrain 1', 'Indoor');
```

---

## Scénarios et solutions

### Scénario 1: Courts ne se chargent pas depuis Supabase

**Symptômes:**
```
[COURTS] Loading courts from Supabase for club: ba43c579-...
[COURTS] ✅ Loaded: 0 courts
```

**Solution:**
1. Vérifier RLS policies sur `public.courts` (migration 019)
2. Vérifier que les courts existent en DB
3. Si courts n'existent pas → les créer
4. Si RLS policy manquante → appliquer migration 019

**Résultat attendu après fix:**
```
[COURTS] ✅ Loaded: 2 courts
[COURTS] Data: [
  { id: '21d09a66-...', name: 'Terrain 1', court_type: 'Indoor' },
  { id: '6dceaf95-...', name: 'Terrain 2', court_type: 'Outdoor' }
]
```

---

### Scénario 2: Fallback MVP activé

**Symptômes:**
```
═══════════════════════════════════════════════════════════
[RESERVE] ⚠️⚠️⚠️ MVP FALLBACK ACTIVÉ
[RESERVE] ⚠️ Court UUID manquant pour terrain: { id: 1, courtId: undefined, ... }
[RESERVE] ⚠️ FALLBACK court_id: 21d09a66-b7db-4966-abf1-cc210f7476c1
═══════════════════════════════════════════════════════════
```

**Cause:** `courtId` est `undefined` (courts non chargés)

**Solution temporaire (MVP):**
- Le fallback force `court_id = '21d09a66-b7db-4966-abf1-cc210f7476c1'`
- Toutes les réservations iront sur Terrain 1

**Solution permanente:**
- Fixer le chargement des courts depuis Supabase
- Retirer le fallback (voir `PATCH_MVP_FALLBACK_COURT.md`)

---

### Scénario 3: court_id invalide (pas UUID)

**Symptômes:**
```
[BOOKING_PAYLOAD] {
  court_id: '1',  ← Pas un UUID
  ...
}
[BOOKING] ❌❌❌ CRITICAL: court_id is not a valid UUID format
```

**Cause:** Ancien code utilise des IDs numériques (1, 2, 3...)

**Solution:**
- Vérifier que `terrain.courtId` est utilisé (pas `COURT_UUIDS[terrain.id]`)
- Vérifier que les courts sont chargés depuis Supabase
- Vérifier que `terrains.map()` utilise `court.id` (UUID) et non un index

---

### Scénario 4: court_id UUID valide mais n'existe pas

**Symptômes:**
```
[BOOKING_PAYLOAD] {
  court_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  ...
}
[BOOKING] ✅ court_id validation passed
[BOOKING INSERT ERROR] ❌❌❌
Error: violates foreign key constraint "bookings_court_id_fkey"
```

**Cause:** UUID valide mais court n'existe pas en DB

**Solution:**
1. Vérifier en DB:
   ```sql
   SELECT * FROM public.courts WHERE id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
   ```
2. Si court n'existe pas → créer le court
3. Si typo dans fallback MVP → corriger l'UUID

---

## UUIDs de référence (MVP)

### Club Démo
```
ba43c579-e522-4b51-8542-737c2c6452bb
```

### Courts
```
21d09a66-b7db-4966-abf1-cc210f7476c1  → Terrain 1 (Indoor)
6dceaf95-80dd-4fcf-b401-7d4c937f6e9e  → Terrain 2 (Outdoor)
```

**⚠️ IMPORTANT:** Ces UUIDs doivent correspondre EXACTEMENT aux UUIDs en DB.

---

## Query pour vérifier les courts en DB

```sql
-- Lister tous les courts du club démo
SELECT id, name, court_type, club_id, is_active
FROM public.courts
WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'
ORDER BY name;
```

**Résultat attendu:**
```
id                                   | name       | court_type | club_id                              | is_active
-------------------------------------|------------|------------|--------------------------------------|----------
21d09a66-b7db-4966-abf1-cc210f7476c1 | Terrain 1  | Indoor     | ba43c579-e522-4b51-8542-737c2c6452bb | true
6dceaf95-80dd-4fcf-b401-7d4c937f6e9e | Terrain 2  | Outdoor    | ba43c579-e522-4b51-8542-737c2c6452bb | true
```

**Si vide, créer les courts:**
```sql
INSERT INTO public.courts (id, club_id, name, court_type, is_active) VALUES
  ('21d09a66-b7db-4966-abf1-cc210f7476c1', 'ba43c579-e522-4b51-8542-737c2c6452bb', 'Terrain 1', 'Indoor', true),
  ('6dceaf95-80dd-4fcf-b401-7d4c937f6e9e', 'ba43c579-e522-4b51-8542-737c2c6452bb', 'Terrain 2', 'Outdoor', true);
```

---

## Résumé

| Check | Status | Action si KO |
|-------|--------|--------------|
| Courts chargent depuis DB | ⏳ À vérifier | Appliquer migration 019 |
| `terrains[0].courtId` existe | ⏳ À vérifier | Fixer chargement courts |
| `court_id` dans log est UUID | ⏳ À vérifier | Utiliser `terrain.courtId` |
| `court_id` existe en DB | ⏳ À vérifier | Créer le court |
| `durationMinutes` = 90 | ⏳ À vérifier | Vérifier calcul 90 min |

---

**Prochaine étape:** Faire une réservation et copier-coller les logs de la console ici.
