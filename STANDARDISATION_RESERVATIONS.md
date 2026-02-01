# ✅ Standardisation sur `public.reservations`

## Contexte

**PROBLÈME INITIAL:**
- `public.bookings` contient des lignes avec `booking_date = NULL` et `slot_id = NULL`
- Les vraies réservations sont dans `public.reservations` (avec `slot_start`/`fin_de_slot`)
- L'UI ne peut PAS griser les créneaux car elle cherche des `slot_id` qui n'existent pas

**SOLUTION:**
Standardiser l'application sur `public.reservations` avec comparaison par heure (start_time/end_time) au lieu de `slot_id`.

---

## Changements effectués

### 1️⃣ **Types mis à jour**

```typescript
// AVANT
type BookedSlot = {
  slot_id: number
  court_id: string
  booking_date: string
  status: string
}

// APRÈS
type Reservation = {
  id: string
  court_id: string
  slot_start: string // timestamp ISO
  fin_de_slot: string // timestamp ISO
  statut: string // 'confirmé' | 'annulé' | ...
}
```

### 2️⃣ **Helper functions ajoutées**

```typescript
// Convertir timestamp ISO → HH:MM:SS (timezone locale)
function formatHHMMSS(timestamp: string): string

// Créer clé unique pour créneau: "14:00:00-15:30:00"
function createSlotKey(startTime: string, endTime: string): string

// Obtenir dayStart (00:00:00) et dayEnd (23:59:59) pour filtrer par jour
function getDateBounds(date: Date): { dayStart: Date; dayEnd: Date }

// Combiner date YYYY-MM-DD + heure HH:MM:SS → timestamp ISO
function combineDateAndTime(dateStr: string, timeStr: string): string
```

### 3️⃣ **État mis à jour**

```typescript
// AVANT
const [bookedByCourt, setBookedByCourt] = useState<Record<string, Set<number>>>({})
// Map de court_id → Set<slot_id>

// APRÈS
const [bookedByCourt, setBookedByCourt] = useState<Record<string, Set<string>>>({})
// Map de court_id → Set<slotKey> ex: "14:00:00-15:30:00"
```

### 4️⃣ **Fetch initial (ÉTAPE 2)**

```typescript
// AVANT: Fetch bookings
.from('bookings')
.select('court_id, slot_id, booking_date, status')
.eq('booking_date', bookingDate)
.eq('status', 'confirmed')

// APRÈS: Fetch reservations
const { dayStart, dayEnd } = getDateBounds(selectedDate)

.from('reservations')
.select('id, court_id, slot_start, fin_de_slot, statut')
.in('court_id', courtIds)
.gte('slot_start', dayStart.toISOString())
.lt('slot_start', dayEnd.toISOString())
.eq('statut', 'confirmé')

// Construction des clés
for (const row of data ?? []) {
  const startTime = formatHHMMSS(row.slot_start)
  const endTime = formatHHMMSS(row.fin_de_slot)
  const slotKey = createSlotKey(startTime, endTime) // "14:00:00-15:30:00"
  
  bookedByCourt[courtKey].add(slotKey)
}
```

**Logs ajoutés:**
```typescript
console.log('[RESERVATIONS] fetched count', data?.length)
console.log('[RESERVATIONS] bookedKeys size', totalKeys)
```

### 5️⃣ **Realtime (ÉTAPE 3)**

```typescript
// AVANT: Écoute bookings
.channel(`bookings-${club.id}-${bookingDate}`)
.on('postgres_changes', { table: 'bookings', filter: `booking_date=eq.${bookingDate}` })

// APRÈS: Écoute reservations
.channel(`reservations-${club.id}-${bookingDate}`)
.on('postgres_changes', { table: 'reservations' })

// Dans le callback:
- Filtrage manuel par jour (slot_start entre dayStart et dayEnd)
- Filtrage manuel par court_id (dans la liste des courts du club)
- Comparaison par clé temporelle au lieu de slot_id
```

**Callback logic:**
- **INSERT + statut=confirmé:** `add(slotKey)`
- **UPDATE + statut passe à confirmé:** `add(slotKey)`
- **UPDATE + statut quitte confirmé:** `remove(slotKey)`
- **UPDATE + changement de créneau:** `remove(oldKey) + add(newKey)`
- **DELETE:** `remove(slotKey)`

**Logs ajoutés:**
```typescript
console.log('[REALTIME reservations] payload', payload)
```

### 6️⃣ **Fonction `isSlotAvailable`**

```typescript
// AVANT: Compare par slot_id (number)
const isSlotAvailable = (courtId: string, slotId: number): boolean => {
  return !(bookedByCourt[courtId]?.has(slotId))
}

// APRÈS: Compare par clé temporelle (string)
const isSlotAvailable = (courtId: string, slot: TimeSlot): boolean => {
  const slotKey = createSlotKey(slot.start_time, slot.end_time)
  return !(bookedByCourt[courtId]?.has(slotKey))
}
```

### 7️⃣ **Insertion dans `handleFinalConfirmation`**

```typescript
// AVANT: Insert dans public.bookings
const bookingPayload = {
  club_id: club.id,
  court_id: courtId,
  booking_date: bookingDate,      // YYYY-MM-DD
  slot_id: selectedSlot.id,       // number
  status: 'confirmed'
}

await supabase.from('bookings').insert([bookingPayload])

// APRÈS: Insert dans public.reservations
const slotStartTimestamp = combineDateAndTime(bookingDate, selectedSlot.start_time)
const finDeSlotTimestamp = combineDateAndTime(bookingDate, selectedSlot.end_time)

const reservationPayload = {
  club_id: club.id,
  court_id: courtId,
  slot_start: slotStartTimestamp,   // "2026-01-23T14:00:00"
  fin_de_slot: finDeSlotTimestamp,  // "2026-01-23T15:30:00"
  statut: 'confirmé',
  cree_par: null                    // TODO: auth.uid()
}

await supabase.from('reservations').insert([reservationPayload])
```

**Logs ajoutés:**
```typescript
console.log('[RESERVATION INSERT PAYLOAD]', JSON.stringify(payload, null, 2))
console.log('[RESERVATION INSERT PAYLOAD - Types]', { ... })
console.log('[RESERVATION INSERT] ✅ Success:', data)
```

### 8️⃣ **Appels à `isSlotAvailable` mis à jour**

```typescript
// AVANT
isSlotAvailable(courtKey, slot.id)

// APRÈS
isSlotAvailable(courtKey, slot) // Passe le slot complet
```

---

## Structure finale

### Flux de données

```
1. FETCH INITIAL (au chargement + changement de date)
   ↓
   public.reservations (slot_start/fin_de_slot + statut='confirmé')
   ↓
   Conversion en clés temporelles: "HH:MM:SS-HH:MM:SS"
   ↓
   bookedByCourt: { court_id → Set<slotKey> }

2. REALTIME (temps réel)
   ↓
   Écoute INSERT/UPDATE/DELETE sur public.reservations
   ↓
   Filtrage manuel par jour + court_id
   ↓
   Mise à jour bookedByCourt (add/remove slotKey)
   ↓
   UI grise instantanément

3. INSERTION (réservation)
   ↓
   Insert dans public.reservations avec slot_start/fin_de_slot
   ↓
   Realtime déclenche → UI grise automatiquement
```

### Avantages

✅ **Plus de dépendance à `slot_id`** (qui peut être NULL)  
✅ **Comparaison robuste par heure** (start_time/end_time)  
✅ **Fonctionne avec les vraies données** de `public.reservations`  
✅ **Realtime opérationnel** pour tous les onglets/navigateurs  
✅ **Logging complet** pour debug

---

## Test du flux complet

### 1. Ouvrir 2 onglets sur `/player/clubs/1/reserver`

### 2. Dans l'onglet 1, cliquer sur un créneau disponible

**Console logs attendus:**
```
[SLOTS] Loading time_slots from Supabase...
[SLOTS] Loaded: [10 slots]
[RESERVATIONS] Loading for all courts: { courtIds: [...], dayStart: "...", dayEnd: "..." }
[RESERVATIONS] fetched count 5
[RESERVATIONS] bookedKeys size 5
[REALTIME] Subscribing to reservations for club: { clubId: "1", ... }
```

### 3. Confirmer la réservation

**Console logs attendus:**
```
[RESERVATION INSERT PAYLOAD] {
  "club_id": "1",
  "court_id": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
  "slot_start": "2026-01-23T14:00:00",
  "fin_de_slot": "2026-01-23T15:30:00",
  "statut": "confirmé",
  "cree_par": null
}

[RESERVATION INSERT PAYLOAD - Types] {
  club_id: "string",
  court_id: "string",
  slot_start: "string",
  fin_de_slot: "string",
  statut: "string"
}

[RESERVATION INSERT] ✅ Success: { id: "...", ... }
```

### 4. Dans l'onglet 2 (sans refresh)

**Console logs attendus:**
```
[REALTIME reservations] payload { eventType: 'INSERT', new: { ... } }
[REALTIME] ✅ Slot booked (INSERT): { courtKey: "...", slotKey: "14:00:00-15:30:00" }
```

**Résultat visible:**
- ✅ Le créneau 14:00-15:30 devient **gris** dans l'onglet 1
- ✅ Le créneau 14:00-15:30 devient **gris** dans l'onglet 2 **SANS REFRESH**

---

## Notes importantes

### ⚠️ Table `bookings` non utilisée

- La table `public.bookings` n'est **PAS** utilisée dans la page de réservation
- Toute la logique utilise maintenant `public.reservations`
- L'ancien endpoint `/api/bookings/route.ts` existe encore mais n'est plus appelé

### ⚠️ Champ `cree_par`

```typescript
cree_par: null  // TODO: remplacer par auth.uid() quand auth sera en place
```

Si la colonne `cree_par` n'est **PAS nullable** en DB, vous devez soit:
1. La rendre nullable temporairement
2. Ou mettre un UUID fixe temporaire

### ⚠️ Timezone

Les fonctions `formatHHMMSS` et `combineDateAndTime` utilisent la **timezone locale du navigateur**.

Si vous avez besoin de forcer `Europe/Paris`:
```typescript
function formatHHMMSS(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('fr-FR', { 
    timeZone: 'Europe/Paris',
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false
  })
}
```

---

## Checklist de vérification

- [x] Types `Reservation` définis
- [x] Helper functions créées
- [x] État `bookedByCourt` mis à jour
- [x] Fetch initial utilise `reservations`
- [x] Realtime écoute `reservations`
- [x] `isSlotAvailable` compare par clé temporelle
- [x] `handleFinalConfirmation` insère dans `reservations`
- [x] Logs ajoutés partout
- [x] Build OK
- [ ] **À TESTER:** Réservation dans onglet 1 grise onglet 2

---

**Date:** 2026-01-22  
**Commit:** (à venir)
