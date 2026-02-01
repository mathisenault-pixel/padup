# ✅ Standardisation définitive sur `public.bookings`

## Objectif

Corriger définitivement la réservation + grisage inter-onglets en utilisant **UNE SEULE source de vérité: `public.bookings`**.

---

## Problème initial

- L'UI lisait/écrivait dans `public.reservations` (avec `slot_start`, `fin_de_slot`, `statut`, `cree_a`)
- Mais la DB a une table `public.bookings` avec `booking_date`, `slot_id`, `status`, `created_at`
- Résultat: les créneaux ne se grisaient pas car les 2 tables n'étaient pas synchronisées
- Certaines lignes dans `bookings` avaient `booking_date = NULL` et `slot_id = NULL`

---

## Solution

Standardiser **TOUT** sur `public.bookings` avec comparaison par `slot_id` (entier) au lieu de comparaison par heure.

---

## Structure de `public.bookings`

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | uuid | PRIMARY KEY | ID unique de la réservation |
| `club_id` | uuid | NOT NULL | ID du club |
| `court_id` | uuid | NOT NULL | ID du terrain |
| `booking_date` | DATE | NOT NULL | Date de réservation (YYYY-MM-DD) |
| `slot_id` | INTEGER | NOT NULL | Référence vers `time_slots.id` |
| `slot_start` | timestamptz | | Début du créneau (calculé) |
| `slot_end` | timestamptz | | Fin du créneau (calculé) |
| `status` | text | | 'confirmed', 'pending', 'cancelled' |
| `created_by` | uuid | | ID de l'utilisateur (nullable pour l'instant) |
| `created_at` | timestamptz | DEFAULT now() | Date de création |

**Index unique partiel (anti double-booking):**
```sql
CREATE UNIQUE INDEX unique_court_booking_slot_active
ON public.bookings (court_id, booking_date, slot_id)
WHERE status IN ('confirmed', 'pending');
```

---

## Changements effectués

### 1. `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

#### Types

**AVANT:**
```typescript
type Reservation = {
  id: string
  court_id: string
  slot_start: string
  fin_de_slot: string
  statut: string
}
```

**APRÈS:**
```typescript
type Booking = {
  id: string
  court_id: string
  booking_date: string  // DATE YYYY-MM-DD
  slot_id: number       // référence vers time_slots.id
  status: string        // 'confirmed' | 'pending' | 'cancelled'
  slot_start?: string   // timestamp ISO (optionnel)
  slot_end?: string     // timestamp ISO (optionnel)
}
```

#### State

**AVANT:**
```typescript
const [bookedByCourt, setBookedByCourt] = useState<Record<string, Set<string>>>({})
// Map de court_id → Set<slotKey> ex: "14:00:00-15:30:00"
```

**APRÈS:**
```typescript
const [bookedByCourt, setBookedByCourt] = useState<Record<string, Set<number>>>({})
// Map de court_id → Set<slot_id>
```

#### Fetch initial (ÉTAPE 2)

**AVANT:**
```typescript
.from('reservations')
.select('id, court_id, slot_start, fin_de_slot, statut')
.gte('slot_start', dayStart.toISOString())
.lt('slot_start', dayEnd.toISOString())
.eq('statut', 'confirmé')

// Construire slotKey = "HH:MM:SS-HH:MM:SS"
```

**APRÈS:**
```typescript
.from('bookings')
.select('id, court_id, booking_date, slot_id, status')
.in('court_id', courtIds)
.eq('booking_date', bookingDate)
.in('status', ['confirmed', 'pending'])

// Construire Set<slot_id> directement
```

#### Realtime (ÉTAPE 3)

**AVANT:**
```typescript
.channel(`reservations-${club.id}-${bookingDate}`)
.on('postgres_changes', { table: 'reservations' })

// Filtrer manuellement par slot_start dans [dayStart, dayEnd]
// Comparer par clé temporelle "HH:MM:SS-HH:MM:SS"
```

**APRÈS:**
```typescript
.channel(`bookings-${club.id}-${bookingDate}`)
.on('postgres_changes', { 
  table: 'bookings',
  filter: `booking_date=eq.${bookingDate}`
})

// Comparer directement par slot_id (entier)
```

#### `isSlotAvailable`

**AVANT:**
```typescript
const isSlotAvailable = (courtId: string, slot: TimeSlot): boolean => {
  const slotKey = createSlotKey(slot.start_time, slot.end_time)
  return !(bookedByCourt[courtId]?.has(slotKey))
}
```

**APRÈS:**
```typescript
const isSlotAvailable = (courtId: string, slotId: number): boolean => {
  return !(bookedByCourt[courtId]?.has(slotId))
}
```

#### `handleFinalConfirmation` (Insert)

**AVANT:**
```typescript
const reservationPayload = {
  club_id: club.id,
  court_id: courtId,
  slot_start: "2026-01-23T14:00:00",
  fin_de_slot: "2026-01-23T15:30:00",
  statut: 'confirmé',
  cree_par: null,
  cree_a: new Date().toISOString()
}

await supabase.from('reservations').insert([reservationPayload])
```

**APRÈS:**
```typescript
const bookingPayload = {
  club_id: club.id,
  court_id: courtId,
  booking_date: "2026-01-23",        // ✅ DATE (YYYY-MM-DD)
  slot_id: selectedSlot.id,           // ✅ INTEGER NOT NULL
  slot_start: "2026-01-23T14:00:00",  // ✅ timestamptz
  slot_end: "2026-01-23T15:30:00",    // ✅ timestamptz
  status: 'confirmed',                // ✅ 'confirmed' | 'pending' | 'cancelled'
  created_by: null,
  created_at: new Date().toISOString()
}

await supabase.from('bookings').insert([bookingPayload])
```

#### Helper functions supprimées

- ❌ `formatHHMMSS(timestamp)` - plus nécessaire
- ❌ `createSlotKey(start, end)` - plus nécessaire
- ❌ `getDateBounds(date)` - plus nécessaire
- ✅ `combineDateAndTime(date, time)` - toujours utilisée

---

### 2. `app/player/(authenticated)/reservations/page.tsx`

#### Types

**AVANT:**
```typescript
type Reservation = {
  id: string
  court_id: string
  slot_start: string
  fin_de_slot: string
  statut: string
  cree_a: string
}
```

**APRÈS:**
```typescript
type Booking = {
  id: string
  court_id: string
  booking_date: string
  slot_id: number
  slot_start: string
  slot_end: string
  status: string
  created_at: string
}
```

#### Fetch

**AVANT:**
```typescript
.from('reservations')
.select('*')
.order('slot_start', { ascending: true })
```

**APRÈS:**
```typescript
.from('bookings')
.select('*')
.order('created_at', { ascending: false })
```

#### Affichage

**AVANT:**
```typescript
<div>Date: {new Date(res.slot_start).toLocaleString('fr-FR')}</div>
<div>Statut: {res.statut}</div>
<div>Créée: {new Date(res.cree_a).toLocaleString('fr-FR')}</div>
```

**APRÈS:**
```typescript
<div>Date: {new Date(booking.slot_start).toLocaleString('fr-FR')}</div>
<div>Date: {booking.booking_date} | Slot #{booking.slot_id}</div>
<div>Statut: {booking.status}</div>
<div>Créée: {new Date(booking.created_at).toLocaleString('fr-FR')}</div>
```

---

## Avantages

### ✅ Comparaison simple par `slot_id` (entier)
- Plus rapide (O(1) lookup dans Set)
- Plus robuste (pas de problème de format d'heure)
- Pas besoin de convertir timestamp → heure

### ✅ Filtrage simple par `booking_date` (DATE)
- Requête SQL simplifiée: `.eq('booking_date', '2026-01-23')`
- Pas besoin de `gte/lt` avec `slot_start`
- Filtre Realtime direct: `filter: booking_date=eq.${bookingDate}`

### ✅ Index unique partiel efficace
- Protection anti double-booking au niveau DB
- N'affecte que les statuts `confirmed` et `pending`
- Les `cancelled` libèrent le slot automatiquement

### ✅ Colonnes `NOT NULL`
- `booking_date NOT NULL` → impossible d'insérer NULL
- `slot_id NOT NULL` → impossible d'insérer NULL
- Plus de lignes invalides dans la DB

---

## Flux de données complet

```
1. CHARGEMENT PAGE
   ↓
   Fetch time_slots (affichage des créneaux)
   +
   Fetch bookings (slot_id pour ce club + date)
   ↓
   bookedByCourt: { court_id → Set<slot_id> }
   ↓
   UI affiche créneaux (grisés si slot_id ∈ Set)

2. RÉSERVATION (Onglet 1)
   ↓
   User clique sur créneau + confirme
   ↓
   Insert dans public.bookings:
     - club_id, court_id
     - booking_date (YYYY-MM-DD)
     - slot_id (ex: 5)
     - slot_start, slot_end (timestamps)
     - status = 'confirmed'
   ↓
   Realtime déclenche → Onglet 1 et Onglet 2 reçoivent l'event
   ↓
   UI grise instantanément dans TOUS les onglets

3. CHANGEMENT DE DATE
   ↓
   Nouveau fetch bookings pour la nouvelle date
   +
   Nouveau channel Realtime pour la nouvelle date
   ↓
   UI mise à jour
```

---

## Tests attendus

### Test 1: Insertion réussie

**Console logs:**
```
[BOOKING INSERT PAYLOAD] {
  "club_id": "1",
  "court_id": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
  "booking_date": "2026-01-23",
  "slot_id": 5,
  "slot_start": "2026-01-23T14:00:00",
  "slot_end": "2026-01-23T15:30:00",
  "status": "confirmed",
  "created_by": null,
  "created_at": "2026-01-23T10:30:00.000Z"
}

[BOOKING INSERT] ✅ Success: { id: "...", ... }
```

**DB:**
```sql
SELECT * FROM public.bookings ORDER BY created_at DESC LIMIT 1;
```

**Résultat attendu:**
```
id         | club_id | court_id | booking_date | slot_id | status    | created_at
abc-123... | 1       | 6dceaf95 | 2026-01-23   | 5       | confirmed | 2026-01-23 10:30:00
```

### Test 2: Realtime inter-onglets

1. **Onglet 1:** Ouvrir `/player/clubs/1/reserver`
2. **Onglet 2:** Ouvrir `/player/clubs/1/reserver`
3. **Onglet 1:** Réserver le slot 14:00-15:30 (slot_id=5)

**Onglet 2 console logs:**
```
[REALTIME bookings] payload { eventType: 'INSERT', new: { slot_id: 5, ... } }
[REALTIME] ✅ Slot booked (INSERT): { courtKey: "...", slotId: 5 }
```

**Onglet 2 UI:**
- ✅ Le créneau 14:00-15:30 devient **GRIS** (sans refresh)
- ✅ Le texte "Réservé" apparaît

### Test 3: Tentative de double-booking

1. **Onglet 1:** Réserver le slot 14:00-15:30 → ✅ Success
2. **Onglet 2:** Le slot est déjà grisé, impossible de cliquer → ✅ Protection UI
3. Si on force un insert manuel en DB:
   ```sql
   INSERT INTO public.bookings (club_id, court_id, booking_date, slot_id, status)
   VALUES ('1', '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e', '2026-01-23', 5, 'confirmed');
   ```
   **Résultat:** `ERROR: duplicate key value violates unique constraint` ✅

---

## Nettoyage des anciennes données

### Supprimer les bookings avec NULL

```sql
-- Afficher les lignes problématiques
SELECT * FROM public.bookings 
WHERE booking_date IS NULL OR slot_id IS NULL;

-- Supprimer
DELETE FROM public.bookings 
WHERE booking_date IS NULL OR slot_id IS NULL;
```

### Vérifier les contraintes NOT NULL

```sql
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookings'
  AND column_name IN ('booking_date', 'slot_id');
```

**Résultat attendu:**
```
column_name  | is_nullable
-------------|-------------
booking_date | NO
slot_id      | NO
```

---

## Checklist de validation

- [x] Types mis à jour (Booking au lieu de Reservation)
- [x] State mis à jour (Set<number> au lieu de Set<string>)
- [x] Fetch initial lit `bookings` avec `booking_date` et `slot_id`
- [x] Realtime écoute `bookings` avec filtre `booking_date`
- [x] `isSlotAvailable` compare par `slot_id` (entier)
- [x] `handleFinalConfirmation` insère dans `bookings` avec tous les champs requis
- [x] Helper functions inutiles supprimées
- [x] Page "Mes réservations" lit `bookings`
- [x] Build OK
- [ ] **À TESTER:** Insertion réussie (pas d'erreur PGRST)
- [ ] **À TESTER:** Realtime inter-onglets fonctionne
- [ ] **À TESTER:** Double-booking bloqué (erreur 23505)

---

## Notes importantes

### Table `reservations` toujours présente

La table `public.reservations` existe toujours en DB mais **n'est plus utilisée** par le frontend.

Si d'autres parties de l'app utilisent `reservations`:
- Les migrer vers `bookings`
- Ou créer une vue/trigger pour synchroniser les 2 tables

### Migration future possible

Si vous voulez supprimer `reservations` complètement:
1. Vérifier qu'aucun code n'y fait référence
2. Migrer les données existantes vers `bookings`
3. Supprimer la table

---

**Date:** 2026-01-22  
**Commit:** (à venir)
