# ✅ SCHÉMA FINAL CONFIRMÉ - Table `bookings`

## Date: 2026-01-22
## Commit: `33cfb28`

---

## 📋 Schéma réel de la table `bookings`

```sql
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id),
  court_id UUID NOT NULL REFERENCES public.courts(id),
  slot_start TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ✅ Colonnes confirmées

| Colonne | Type | Description | Obligatoire |
|---------|------|-------------|-------------|
| `id` | UUID | Identifiant unique de la réservation | ✅ PK |
| `club_id` | UUID | Référence vers `clubs.id` | ✅ FK |
| `court_id` | UUID | Référence vers `courts.id` | ✅ FK |
| `slot_start` | TIMESTAMPTZ | Début du créneau (ex: 2026-01-23T08:00:00.000Z) | ✅ |
| `status` | TEXT | État de la réservation: 'confirmed' ou 'cancelled' | ✅ |
| `created_by` | UUID | Utilisateur qui a créé la réservation | ⏸️ (nullable) |
| `created_at` | TIMESTAMPTZ | Date de création de la réservation | ✅ (auto) |

---

## ❌ Colonnes qui N'EXISTENT PAS

**IMPORTANT:** Les colonnes suivantes **n'existent PAS** dans la table `bookings` :

- ❌ `booking_date` (DATE) - N'existe pas
- ❌ `slot_id` (INTEGER) - N'existe pas
- ❌ `slot_end` (TIMESTAMPTZ) - N'existe pas
- ❌ `fin_de_slot` (TIMESTAMPTZ) - N'existe pas
- ❌ `statut` (TEXT) - Mauvais nom, c'est `status`

---

## 🔄 Gestion de la durée (90 minutes)

### Côté Frontend (React)

**Calcul de la durée :**
```typescript
const slotStartString = `${bookingDate}T${selectedSlot.start_time}Z` // 2026-01-23T08:00:00Z
const start = new Date(slotStartString)
const end = new Date(start.getTime() + 90 * 60 * 1000) // +90 minutes
const slot_start = start.toISOString() // 2026-01-23T08:00:00.000Z
const slot_end = end.toISOString()     // 2026-01-23T09:30:00.000Z
```

**Utilisation de `slot_end` :**
- ✅ Utilisé pour **affichage** dans l'UI (ex: "08:00 - 09:30")
- ✅ Utilisé pour **validation** (durée = 90 min exactement)
- ❌ **PAS envoyé** à la DB (colonne n'existe pas)

---

### Côté Base de données (PostgreSQL)

**Calcul de la fin de créneau :**
```sql
-- Si besoin de calculer slot_end dans une requête
SELECT 
  id,
  slot_start,
  slot_start + interval '90 minutes' AS slot_end
FROM public.bookings;
```

**Ou utiliser `duration_minutes` depuis `time_slots` :**
```sql
SELECT 
  b.id,
  b.slot_start,
  b.slot_start + (ts.duration_minutes || ' minutes')::interval AS slot_end
FROM public.bookings b
JOIN public.time_slots ts ON ts.id = slot_id;  -- Si slot_id existait
```

**Note :** Comme `slot_id` n'existe pas dans `bookings`, la durée est simplement **fixe à 90 minutes**.

---

## 🚀 Payload d'insert correct

### TypeScript (Frontend)

```typescript
const bookingPayload = {
  club_id: "ba43c579-e522-4b51-8542-737c2c6452bb",  // UUID
  court_id: "21d09a66-b7db-4966-abf1-cc210f7476c1", // UUID
  slot_start: "2026-01-23T08:00:00.000Z",           // TIMESTAMPTZ ISO
  status: "confirmed",                               // TEXT ('confirmed' | 'cancelled')
  created_by: "user-uuid-here",                      // UUID
  created_at: "2026-01-22T10:30:00.000Z"            // TIMESTAMPTZ ISO
}

await supabase
  .from('bookings')
  .insert([bookingPayload])
  .select()
  .single()
```

### SQL (équivalent)

```sql
INSERT INTO public.bookings (
  club_id,
  court_id,
  slot_start,
  status,
  created_by,
  created_at
) VALUES (
  'ba43c579-e522-4b51-8542-737c2c6452bb',
  '21d09a66-b7db-4966-abf1-cc210f7476c1',
  '2026-01-23 08:00:00+00'::timestamptz,
  'confirmed',
  'user-uuid-here',
  NOW()
);
```

---

## 🔍 Requête de chargement des bookings

### Pour une date donnée (ex: 23 janvier 2026)

```typescript
const dateStr = selectedDate.toISOString().split('T')[0] // '2026-01-23'
const startOfDay = `${dateStr}T00:00:00+01:00` // 2026-01-23T00:00:00+01:00
const endOfDay = `${dateStr}T23:59:59+01:00`   // 2026-01-23T23:59:59+01:00

const { data } = await supabase
  .from('bookings')
  .select('id, court_id, slot_start, status')
  .in('court_id', courtIds)
  .gte('slot_start', startOfDay)
  .lt('slot_start', endOfDay)
  .eq('status', 'confirmed')
```

### SQL équivalent

```sql
SELECT 
  id,
  court_id,
  slot_start,
  status
FROM public.bookings
WHERE court_id IN ('21d09a66-...', '6dceaf95-...')
  AND slot_start >= '2026-01-23 00:00:00+01'::timestamptz
  AND slot_start < '2026-01-23 23:59:59+01'::timestamptz
  AND status = 'confirmed'
ORDER BY slot_start;
```

---

## 🔑 Clé de disponibilité

**Format de clé utilisé :**
```
${courtId}_${slotStartISO}
```

**Exemple :**
```
21d09a66-b7db-4966-abf1-cc210f7476c1_2026-01-23T08:00:00.000Z
```

### Construction de la Map

```typescript
const bookedByCourt: Record<string, Set<string>> = {}

// Pour chaque booking retourné par Supabase
for (const row of data) {
  const courtKey = String(row.court_id)
  if (!bookedByCourt[courtKey]) bookedByCourt[courtKey] = new Set()
  
  // Normaliser slot_start en ISO
  let slotStartISO = row.slot_start
  if (!slotStartISO.endsWith('Z')) {
    slotStartISO = new Date(slotStartISO).toISOString()
  }
  
  bookedByCourt[courtKey].add(slotStartISO)
}
```

### Vérification de disponibilité

```typescript
const isSlotAvailable = (courtId: string, slot: TimeSlot): boolean => {
  // Calculer le slot_start attendu pour ce créneau
  const dateStr = selectedDate.toISOString().split('T')[0] // '2026-01-23'
  const slotStartISO = `${dateStr}T${slot.start_time}Z`    // '2026-01-23T08:00:00Z'
  
  // Vérifier si ce slot_start existe dans les bookings
  const isBooked = bookedByCourt[courtId]?.has(slotStartISO) ?? false
  
  return !isBooked
}
```

---

## 📡 Subscription Realtime

### Configuration

```typescript
supabase
  .channel(`bookings-${club.id}-${dateStr}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookings',
    filter: `club_id=eq.${club.id}` // ✅ Filtrer par club_id, pas booking_date
  }, (payload) => {
    // Gérer INSERT, UPDATE, DELETE
    handleRealtimeChange(payload)
  })
  .subscribe()
```

### Gestion des événements

```typescript
const normalizeSlotStart = (slotStart: string) => {
  if (!slotStart.endsWith('Z')) {
    return new Date(slotStart).toISOString()
  }
  return slotStart
}

// INSERT
if (payload.eventType === 'INSERT' && payloadNew.status === 'confirmed') {
  const slotStartISO = normalizeSlotStart(payloadNew.slot_start)
  bookedByCourt[courtKey].add(slotStartISO)
}

// UPDATE: confirmed → cancelled
if (payloadNew.status === 'cancelled' && payloadOld.status === 'confirmed') {
  const oldSlotStartISO = normalizeSlotStart(payloadOld.slot_start)
  bookedByCourt[courtKey].delete(oldSlotStartISO)
}

// DELETE
if (payload.eventType === 'DELETE') {
  const oldSlotStartISO = normalizeSlotStart(payloadOld.slot_start)
  bookedByCourt[courtKey].delete(oldSlotStartISO)
}
```

---

## 🧪 Tests SQL de vérification

### 1. Vérifier les colonnes de la table

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
ORDER BY column_name;
```

**Résultat attendu :**
```
column_name  | data_type
-------------|---------------------------
club_id      | uuid
court_id     | uuid
created_at   | timestamp with time zone
created_by   | uuid
id           | uuid
slot_start   | timestamp with time zone
status       | text
```

**Colonnes qui NE DOIVENT PAS apparaître :**
- ❌ `booking_date`
- ❌ `slot_id`
- ❌ `slot_end`
- ❌ `fin_de_slot`
- ❌ `statut`

---

### 2. Vérifier les bookings pour une date

```sql
SELECT 
  id,
  club_id,
  court_id,
  slot_start,
  slot_start + interval '90 minutes' AS slot_end_calculated,
  status,
  created_by,
  created_at
FROM public.bookings
WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'
  AND slot_start >= '2026-01-23 00:00:00+01'::timestamptz
  AND slot_start < '2026-01-24 00:00:00+01'::timestamptz
ORDER BY slot_start;
```

**Exemple de résultat :**
```
id                   | club_id      | court_id     | slot_start               | slot_end_calculated      | status    | created_by | created_at
---------------------|--------------|--------------|--------------------------|--------------------------|-----------|------------|---------------------------
booking-uuid-1       | ba43c579-... | 21d09a66-... | 2026-01-23 08:00:00+01   | 2026-01-23 09:30:00+01   | confirmed | user-uuid  | 2026-01-22 10:30:00+00
booking-uuid-2       | ba43c579-... | 21d09a66-... | 2026-01-23 11:00:00+01   | 2026-01-23 12:30:00+01   | confirmed | user-uuid  | 2026-01-22 10:35:00+00
booking-uuid-3       | ba43c579-... | 6dceaf95-... | 2026-01-23 14:00:00+01   | 2026-01-23 15:30:00+01   | confirmed | user-uuid  | 2026-01-22 10:40:00+00
```

---

### 3. Vérifier les contraintes CHECK

```sql
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.bookings'::regclass
  AND contype = 'c'; -- CHECK constraints
```

**Résultat attendu (si contrainte status existe) :**
```
constraint_name      | constraint_type | constraint_definition
---------------------|-----------------|---------------------------------------
bookings_status_check | c              | CHECK (status = ANY (ARRAY['confirmed'::text, 'cancelled'::text]))
```

---

### 4. Compter les bookings par status

```sql
SELECT 
  status,
  COUNT(*) AS total
FROM public.bookings
GROUP BY status
ORDER BY status;
```

**Résultat attendu :**
```
status     | total
-----------|-------
cancelled  | 5
confirmed  | 42
```

---

## 📊 Résumé des corrections

| Élément | Avant (incorrect) | Après (correct) |
|---------|-------------------|-----------------|
| **Type Booking** | `statut, fin_de_slot` | `status` (pas de fin_de_slot) |
| **Payload insert** | 8 champs (dont 2 incorrects) | 6 champs (tous corrects) |
| **Chargement bookings** | `.eq('statut', ...)` | `.eq('status', ...)` |
| **Realtime events** | `payloadNew.statut` | `payloadNew.status` |
| **Logs** | Références à `fin_de_slot`, `statut` | `status` uniquement |

---

## ✅ Fichiers modifiés

- `app/player/(authenticated)/clubs/[id]/reserver/page.tsx` - Correction complète du schéma

---

## 🎯 Validation finale

### Checklist

- [x] Type `Booking` corrigé (status, pas de fin_de_slot)
- [x] Payload d'insert corrigé (6 champs corrects)
- [x] Requête de chargement corrigée (status)
- [x] Realtime subscription corrigée (status)
- [x] Tous les logs et messages d'erreur mis à jour
- [x] Build OK (pas d'erreurs TypeScript)

---

## 🚀 Build Status

✅ **Build OK** - Pas d'erreurs TypeScript

```
✓ Compiled successfully in 2.9s
✓ Generating static pages (30/30)
```

---

## 📝 Prochaines étapes

1. ✅ Tester l'affichage des courts et time_slots
2. ✅ Tester le chargement des bookings (logs console)
3. ✅ Créer une réservation et vérifier le payload
4. ✅ Vérifier la Realtime sync
5. ⏳ Retirer les logs de debug (une fois validé)

---

**Date:** 2026-01-22  
**Status:** Schéma FINAL confirmé et implémenté  
**Commit:** `33cfb28`

---

## 🔗 Documentation associée

- `DEBUG_AUCUN_TERRAIN_DISPONIBLE.md` - Debug des courts non affichés
- `FIX_REAL_SCHEMA_SLOT_START.md` - Refactoring initial (slot_start vs slot_id)
- `SCHEMA_BOOKINGS_FINAL.md` - **Ce document (schéma final confirmé)**
