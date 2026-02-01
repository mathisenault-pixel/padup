# ✅ MVP SIMPLE - Schéma confirmé avec `booking_date` + `slot_id`

## Date: 2026-01-22
## Commit: `c7a01f9`

---

## 📋 Schéma DB confirmé (FINAL)

```sql
-- Courts
CREATE TABLE public.courts (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time_slots (templates)
CREATE TABLE public.time_slots (
  id BIGINT PRIMARY KEY,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER,
  label TEXT
);

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id),
  court_id UUID NOT NULL REFERENCES courts(id),
  booking_date DATE NOT NULL,
  slot_id BIGINT NOT NULL REFERENCES time_slots(id),
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔑 Clé de disponibilité MVP

**Format :** `${courtId}_${slotId}`

**Exemple :**
```
21d09a66-b7db-4966-abf1-cc210f7476c1_5
```

**Structure de données :**
```typescript
const bookedByCourt: Record<string, Set<number>> = {
  '21d09a66-b7db-4966-abf1-cc210f7476c1': new Set([5, 6, 7]), // Terrain 1: slots 5, 6, 7 pris
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e': new Set([3, 8])     // Terrain 2: slots 3, 8 pris
}
```

---

## 🚀 Implémentation MVP

### 1. **Courts - TOUJOURS afficher**

```typescript
const { data: courts } = await supabase
  .from('courts')
  .select('*')
  .eq('club_id', clubId)
  .order('name', { ascending: true })
```

**Logique :**
- Si `courts.length === 0` → Afficher "Aucun terrain disponible"
- Si `courts.length > 0` → Afficher la grille de réservation

**JAMAIS afficher "Les réservations ne sont pas disponibles..." si courts existent.**

---

### 2. **Time_slots - TOUJOURS afficher**

```typescript
const { data: timeSlots } = await supabase
  .from('time_slots')
  .select('*')
  .order('start_time', { ascending: true })
```

**Logique :**
- Les time_slots sont des **templates** (pas de disponibilité dedans)
- Affichés pour **chaque court**
- La disponibilité est calculée via les bookings

---

### 3. **Bookings - Charger par date**

```typescript
const bookingDate = selectedDate.toISOString().split('T')[0] // YYYY-MM-DD

const { data: bookings } = await supabase
  .from('bookings')
  .select('court_id, slot_id, status')
  .eq('club_id', clubId)
  .eq('booking_date', bookingDate)
  .eq('status', 'confirmed')
```

**Construction de bookedByCourt :**
```typescript
const map: Record<string, Set<number>> = {}

for (const row of bookings) {
  const courtKey = String(row.court_id)
  if (!map[courtKey]) map[courtKey] = new Set()
  map[courtKey].add(row.slot_id)
}
```

---

### 4. **isSlotAvailable - Vérification simple**

```typescript
const isSlotAvailable = (courtId: string, slotId: number): boolean => {
  return !(bookedByCourt[courtId]?.has(slotId))
}
```

**Utilisation :**
```typescript
const available = isSlotAvailable(courtId, slot.id)
```

---

### 5. **Payload d'insert complet**

```typescript
const bookingPayload = {
  club_id: "ba43c579-e522-4b51-8542-737c2c6452bb",  // UUID
  court_id: "21d09a66-b7db-4966-abf1-cc210f7476c1", // UUID
  booking_date: "2026-01-23",                        // DATE (YYYY-MM-DD)
  slot_id: 5,                                        // BIGINT (time_slots.id)
  slot_start: "2026-01-23T08:00:00.000Z",           // TIMESTAMPTZ
  slot_end: "2026-01-23T09:30:00.000Z",             // TIMESTAMPTZ
  status: "confirmed",                               // ENUM
  created_by: "user-uuid",                           // UUID
  created_at: "2026-01-22T10:30:00.000Z"            // TIMESTAMPTZ
}

await supabase
  .from('bookings')
  .insert([bookingPayload])
  .select()
  .single()
```

---

### 6. **Realtime subscription**

```typescript
supabase
  .channel(`bookings-${clubId}-${bookingDate}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookings',
    filter: `booking_date=eq.${bookingDate}` // ✅ Filtrer par booking_date
  }, (payload) => {
    const { new: payloadNew, old: payloadOld } = payload
    const courtKey = String(payloadNew?.court_id ?? payloadOld?.court_id)
    
    // INSERT
    if (payload.eventType === 'INSERT' && payloadNew.status === 'confirmed') {
      bookedByCourt[courtKey].add(payloadNew.slot_id)
    }
    
    // UPDATE: confirmed → cancelled
    if (payloadNew.status === 'cancelled' && payloadOld.status === 'confirmed') {
      bookedByCourt[courtKey].delete(payloadOld.slot_id)
    }
    
    // DELETE
    if (payload.eventType === 'DELETE') {
      bookedByCourt[courtKey].delete(payloadOld.slot_id)
    }
  })
  .subscribe()
```

---

## 🎨 Rendu UI

### Grille de réservation

```tsx
{terrains.map((terrain) => {
  const courtId = terrain.courtId // UUID réel depuis Supabase
  
  return (
    <div key={terrain.id}>
      <h3>{terrain.name}</h3>
      
      <div className="grid">
        {timeSlots.map((slot) => {
          const available = isSlotAvailable(courtId, slot.id)
          
          return (
            <button
              key={slot.id}
              disabled={!available}
              className={available ? 'bg-white' : 'bg-gray-300'}
              onClick={() => handleSlotClick(terrain.id, slot)}
            >
              {slot.label}
            </button>
          )
        })}
      </div>
    </div>
  )
})}
```

---

## 📊 Exemple complet

### Données

**Courts :**
```json
[
  {
    "id": "21d09a66-b7db-4966-abf1-cc210f7476c1",
    "club_id": "ba43c579-e522-4b51-8542-737c2c6452bb",
    "name": "Terrain 1"
  },
  {
    "id": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
    "club_id": "ba43c579-e522-4b51-8542-737c2c6452bb",
    "name": "Terrain 2"
  }
]
```

**Time_slots :**
```json
[
  { "id": 1, "start_time": "08:00:00", "end_time": "09:30:00", "duration_minutes": 90, "label": "08:00 - 09:30" },
  { "id": 2, "start_time": "09:30:00", "end_time": "11:00:00", "duration_minutes": 90, "label": "09:30 - 11:00" },
  { "id": 3, "start_time": "11:00:00", "end_time": "12:30:00", "duration_minutes": 90, "label": "11:00 - 12:30" }
]
```

**Bookings (2026-01-23) :**
```json
[
  {
    "court_id": "21d09a66-b7db-4966-abf1-cc210f7476c1",
    "slot_id": 1,
    "status": "confirmed"
  },
  {
    "court_id": "21d09a66-b7db-4966-abf1-cc210f7476c1",
    "slot_id": 2,
    "status": "confirmed"
  },
  {
    "court_id": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
    "slot_id": 3,
    "status": "confirmed"
  }
]
```

---

### Résultat attendu

**Terrain 1** (21d09a66-...) :
- ❌ 08:00 - 09:30 (slot_id 1) → Grisé
- ❌ 09:30 - 11:00 (slot_id 2) → Grisé
- ✅ 11:00 - 12:30 (slot_id 3) → Disponible

**Terrain 2** (6dceaf95-...) :
- ✅ 08:00 - 09:30 (slot_id 1) → Disponible
- ✅ 09:30 - 11:00 (slot_id 2) → Disponible
- ❌ 11:00 - 12:30 (slot_id 3) → Grisé

---

## 🧪 Tests SQL de vérification

### 1. Vérifier les courts pour un club

```sql
SELECT 
  id,
  club_id,
  name,
  created_at
FROM public.courts
WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'
ORDER BY name;
```

**Résultat attendu :** 2 lignes (Terrain 1, Terrain 2)

---

### 2. Vérifier les time_slots

```sql
SELECT 
  id,
  start_time,
  end_time,
  duration_minutes,
  label
FROM public.time_slots
ORDER BY start_time;
```

**Résultat attendu :** 10 lignes (créneaux de 08:00 à 20:30)

---

### 3. Vérifier les bookings pour une date

```sql
SELECT 
  b.id,
  b.club_id,
  c.name AS court_name,
  b.booking_date,
  ts.label AS slot_label,
  b.slot_id,
  b.slot_start,
  b.slot_end,
  b.status
FROM public.bookings b
JOIN public.courts c ON c.id = b.court_id
JOIN public.time_slots ts ON ts.id = b.slot_id
WHERE b.club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'
  AND b.booking_date = '2026-01-23'
ORDER BY c.name, ts.start_time;
```

**Résultat attendu :**
```
id         | club_id      | court_name | booking_date | slot_label      | slot_id | slot_start               | slot_end                 | status
-----------|--------------|------------|--------------|-----------------|---------|--------------------------|--------------------------|----------
booking-1  | ba43c579-... | Terrain 1  | 2026-01-23   | 08:00 - 09:30   | 1       | 2026-01-23 08:00:00+01   | 2026-01-23 09:30:00+01   | confirmed
booking-2  | ba43c579-... | Terrain 1  | 2026-01-23   | 09:30 - 11:00   | 2       | 2026-01-23 09:30:00+01   | 2026-01-23 11:00:00+01   | confirmed
booking-3  | ba43c579-... | Terrain 2  | 2026-01-23   | 11:00 - 12:30   | 3       | 2026-01-23 11:00:00+01   | 2026-01-23 12:30:00+01   | confirmed
```

---

### 4. Vérifier les colonnes de bookings

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
--------------|---------------------------
booking_date  | date                      ✅
club_id       | uuid
court_id      | uuid
created_at    | timestamp with time zone
created_by    | uuid
id            | uuid
slot_end      | timestamp with time zone  ✅
slot_id       | bigint                    ✅
slot_start    | timestamp with time zone  ✅
status        | text                      ✅
```

---

## 🎯 Validation checklist

- [x] Type `Booking` inclut: booking_date, slot_id, slot_start, slot_end, status
- [x] Courts chargés avec .eq('club_id', clubId)
- [x] Time_slots chargés avec .order('start_time')
- [x] Bookings chargés avec .eq('booking_date', date)
- [x] bookedByCourt: Record<string, Set<number>> (slot_id)
- [x] isSlotAvailable prend (courtId, slotId)
- [x] Payload d'insert inclut booking_date + slot_id
- [x] Realtime filtre par booking_date
- [x] Realtime gère slot_id (pas slot_start)
- [x] Build OK

---

## ✅ Comportement attendu

### Affichage des courts

- **TOUJOURS** afficher les courts si `courts.length > 0`
- Si `courts.length === 0` → Message "Aucun terrain disponible" + debug info
- **JAMAIS** afficher "Les réservations ne sont pas disponibles pour ce club" si les courts existent

### Affichage des time_slots

- **TOUJOURS** afficher les time_slots (templates)
- Affichés pour **chaque court**
- Pas de message "Aucun créneau disponible" si time_slots existent

### Disponibilité

- **Griser** uniquement les slots réservés (status = 'confirmed')
- Clé = `${courtId}_${slotId}`
- Vérification simple: `bookedByCourt[courtId]?.has(slotId)`

---

## 📦 Fichiers modifiés

- `app/player/(authenticated)/clubs/[id]/reserver/page.tsx` - Implémentation MVP complète

---

## 🚀 Build Status

✅ **Build OK** - Pas d'erreurs TypeScript

```
✓ Compiled successfully in 2.7s
✓ Generating static pages (30/30)
```

---

## 📝 Prochaines étapes

1. ✅ Tester l'affichage des courts (logs console)
2. ✅ Tester l'affichage des time_slots (logs console)
3. ✅ Tester le chargement des bookings (logs console)
4. ✅ Vérifier la clé de disponibilité (`${courtId}_${slotId}`)
5. ✅ Créer une réservation et vérifier le payload
6. ✅ Vérifier la Realtime sync
7. ⏳ Retirer les logs de debug (une fois validé)

---

**Date:** 2026-01-22  
**Status:** MVP SIMPLE implémenté et validé  
**Commit:** `c7a01f9`

---

## 🔗 Documentation associée

- `DEBUG_AUCUN_TERRAIN_DISPONIBLE.md` - Debug des courts non affichés
- `SCHEMA_BOOKINGS_FINAL.md` - Schéma précédent (obsolète)
- `MVP_SIMPLE_BOOKING_DATE_SLOT_ID.md` - **Ce document (schéma MVP confirmé)**
