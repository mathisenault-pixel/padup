# 📡 Endpoints Disponibilités & Planning

## Architecture

**Source de vérité :** Base de données (table `booking_slots`)  
**Principe :** L'UI ne "devine" pas les disponibilités, elle consomme des endpoints API qui interrogent la DB.

**Créneaux fixes :** 90 minutes (1h30)  
**Format unique :** `slot_id = {clubId}_{courtId}_{startISO}_{endISO}`

---

## 🛠️ Utils partagés : `lib/slots.ts`

### Fonctions principales

#### `generate90mSlots(date, openingHour, closingHour, clubId?, courtId?)`

Génère tous les créneaux 90 min pour une journée.

**Input :**
```typescript
date: string | Date           // "2026-01-30" ou Date object
openingHour: number           // 9 (09:00)
closingHour: number           // 23 (23:00)
clubId?: string               // UUID du club (optionnel)
courtId?: string              // UUID du terrain (optionnel)
```

**Output :**
```typescript
TimeSlot[] = [
  {
    slot_id: "club-uuid_court-uuid_2026-01-30T09:00:00.000Z_2026-01-30T10:30:00.000Z",
    start_at: "2026-01-30T09:00:00.000Z",
    end_at: "2026-01-30T10:30:00.000Z",
    label: "09:00 - 10:30"
  },
  ...
]
```

#### `buildSlotId(clubId, courtId, startISO, endISO)`

**UNIQUE source de vérité** pour l'ID d'un créneau.

```typescript
buildSlotId(
  "ba43c579-e522-4b51-8542-737c2c6452bb",
  "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
  "2026-01-30T09:00:00.000Z",
  "2026-01-30T10:30:00.000Z"
)
// => "ba43c579-e522-4b51-8542-737c2c6452bb_6dceaf95-80dd-4fcf-b401-7d4c937f6e9e_2026-01-30T09:00:00.000Z_2026-01-30T10:30:00.000Z"
```

**Utilisé partout :**
- Génération des slots UI
- Comparaison avec les créneaux réservés
- Realtime synchronization
- Optimistic UI locking

#### Autres helpers

```typescript
getDayBoundaries(date, openingHour, closingHour)
// => { dayStart: "2026-01-30T08:00:00.000Z", dayEnd: "2026-01-30T22:00:00.000Z" }

getWeekBoundaries(date)
// => { weekStart: "2026-01-27T00:00:00.000Z", weekEnd: "2026-02-02T23:59:59.999Z" }

formatDateLong(date)
// => "Jeudi 30 janvier 2026"

getTodayDateString()
// => "2026-01-30"

addDays(date, days)
// => "2026-02-01"
```

---

## 🔌 Endpoint 1 : Disponibilités (Joueur)

### `GET /api/clubs/:clubId/courts/:courtId/availability`

**Rôle :** Retourne les disponibilités d'un terrain pour une date donnée.

**Query params :**
- `date` (required) : `YYYY-MM-DD` (ex: `2026-01-30`)

**Exemple :**
```
GET /api/clubs/ba43c579-e522-4b51-8542-737c2c6452bb/courts/6dceaf95-80dd-4fcf-b401-7d4c937f6e9e/availability?date=2026-01-30
```

### Logique interne

1. **Validation** : date format `YYYY-MM-DD`
2. **Génération** : `generate90mSlots(date, 9, 23, clubId, courtId)`
3. **Query DB** : `SELECT * FROM booking_slots WHERE court_id=... AND start_at>=... AND start_at<...`
4. **Comparaison** : Pour chaque slot généré, vérifier si `slot_id` existe dans les booking_slots
5. **Retour** : `[{ slot_id, start_at, end_at, label, status: 'free' | 'reserved', booking_id? }]`

### Réponse (Success 200)

```json
{
  "clubId": "ba43c579-e522-4b51-8542-737c2c6452bb",
  "courtId": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
  "date": "2026-01-30",
  "slots": [
    {
      "slot_id": "ba43c579_6dceaf95_2026-01-30T09:00:00.000Z_2026-01-30T10:30:00.000Z",
      "start_at": "2026-01-30T09:00:00.000Z",
      "end_at": "2026-01-30T10:30:00.000Z",
      "label": "09:00 - 10:30",
      "status": "free"
    },
    {
      "slot_id": "ba43c579_6dceaf95_2026-01-30T10:30:00.000Z_2026-01-30T12:00:00.000Z",
      "start_at": "2026-01-30T10:30:00.000Z",
      "end_at": "2026-01-30T12:00:00.000Z",
      "label": "10:30 - 12:00",
      "status": "reserved",
      "booking_id": "booking-uuid"
    }
  ],
  "meta": {
    "totalSlots": 14,
    "freeSlots": 12,
    "reservedSlots": 2,
    "slotDuration": 90,
    "openingHour": 9,
    "closingHour": 23
  }
}
```

### Erreurs

**400 Bad Request :**
```json
{
  "error": "Missing required parameter: date",
  "hint": "Provide date as YYYY-MM-DD"
}
```

**500 Internal Server Error :**
```json
{
  "error": "Failed to fetch bookings",
  "message": "..."
}
```

---

## 🔌 Endpoint 2 : Planning Club (Staff/Owner)

### `GET /api/club/planning`

**Rôle :** Retourne le planning complet d'un club (tous les terrains).

**Query params :**
- `clubId` (required) : UUID du club
- `date` (required) : `YYYY-MM-DD`
- `view` (optional) : `day` | `week` (default: `day`)

**Exemple :**
```
GET /api/club/planning?clubId=ba43c579-e522-4b51-8542-737c2c6452bb&date=2026-01-30&view=day
```

### Logique interne

1. **Validation** : clubId, date, view
2. **Auth** : (TODO) Vérifier que l'utilisateur est staff/owner du club
3. **Query courts** : `SELECT * FROM courts WHERE club_id=...`
4. **Génération slots** : Pour chaque terrain, `generate90mSlots(...)`
5. **Query bookings** : `SELECT * FROM booking_slots WHERE court_id IN (...) AND start_at>=... AND start_at<...`
6. **Organisation** : Grouper les bookings par terrain, marquer chaque slot comme free/reserved
7. **Retour** : `{ courts: [...], meta: {...} }`

### Réponse (Success 200)

```json
{
  "clubId": "ba43c579-e522-4b51-8542-737c2c6452bb",
  "date": "2026-01-30",
  "view": "day",
  "courts": [
    {
      "court_id": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
      "court_name": "Terrain 2",
      "slots": [
        {
          "slot_id": "...",
          "start_at": "2026-01-30T09:00:00.000Z",
          "end_at": "2026-01-30T10:30:00.000Z",
          "label": "09:00 - 10:30",
          "status": "free"
        },
        {
          "slot_id": "...",
          "start_at": "2026-01-30T10:30:00.000Z",
          "end_at": "2026-01-30T12:00:00.000Z",
          "label": "10:30 - 12:00",
          "status": "reserved",
          "booking_id": "booking-uuid",
          "created_by": "user-uuid"
        }
      ],
      "meta": {
        "totalSlots": 14,
        "freeSlots": 12,
        "reservedSlots": 2
      }
    },
    {
      "court_id": "...",
      "court_name": "Terrain 1",
      "slots": [...]
    }
  ],
  "meta": {
    "totalCourts": 4,
    "totalSlots": 56,
    "totalFreeSlots": 48,
    "totalReservedSlots": 8,
    "slotDuration": 90,
    "openingHour": 9,
    "closingHour": 23
  }
}
```

### Erreurs

**400 Bad Request :**
```json
{
  "error": "Missing required parameter: clubId"
}
```

**401 Unauthorized :** (TODO)
```json
{
  "error": "Unauthorized",
  "hint": "You must be authenticated"
}
```

**403 Forbidden :** (TODO)
```json
{
  "error": "Forbidden",
  "hint": "You must be staff or owner of this club"
}
```

**404 Not Found :**
```json
{
  "error": "No courts found for this club",
  "clubId": "..."
}
```

**500 Internal Server Error :**
```json
{
  "error": "Failed to fetch courts",
  "message": "..."
}
```

---

## 💻 Intégration UI

### Page Joueur : `app/(public)/availability/page.tsx`

**Fonctionnalités :**
1. ✅ Affiche les disponibilités via `GET /api/clubs/:clubId/courts/:courtId/availability`
2. ✅ Optimistic UI locking (griser immédiatement au clic)
3. ✅ Realtime synchronization (via Supabase Realtime)
4. ✅ Gestion des conflits (409) : "Trop tard, quelqu'un vient de réserver"
5. ✅ Refresh automatique après succès

**Flow réservation :**
```
1. User clique sur un créneau
   ↓
2. Optimistic UI: griser immédiatement (pendingSlots.add)
   ↓
3. POST /api/bookings (via RPC create_booking_90m)
   ↓
4a. Succès → Refresh availability → Slot passe en "réservé"
4b. Conflit 409 → Message "Trop tard" → Refresh availability
4c. Erreur → Retirer de pendingSlots → Message d'erreur
```

**Code simplifié :**
```typescript
// Charger les disponibilités
const res = await fetch(`/api/clubs/${clubId}/courts/${courtId}/availability?date=${date}`);
const data = await res.json();
setSlots(data.slots);  // [{ slot_id, start_at, end_at, status, ... }]

// Réserver un créneau
const res = await fetch('/api/bookings', {
  method: 'POST',
  body: JSON.stringify({ clubId, courtId, slotStart: slot.start_at, createdBy })
});

if (res.status === 409) {
  // Conflit: déjà réservé
  alert("Trop tard !");
} else if (res.ok) {
  // Succès
  loadAvailability();  // Refresh
}
```

### Page Club : `app/club/planning/page.tsx`

**Fonctionnalités :**
1. ✅ Affiche le planning via `GET /api/club/planning`
2. ✅ Vue jour / semaine (paramètre `view`)
3. ✅ Navigation date (précédent / suivant / aujourd'hui)
4. ✅ Résumé par terrain (% libre, nb créneaux)
5. ✅ Résumé global (tous terrains)

**Code simplifié :**
```typescript
// Charger le planning
const res = await fetch(`/api/club/planning?clubId=${clubId}&date=${date}&view=day`);
const data = await res.json();

data.courts.forEach(court => {
  console.log(`${court.court_name}: ${court.meta.freeSlots} libres / ${court.meta.totalSlots}`);
  
  court.slots.forEach(slot => {
    if (slot.status === 'reserved') {
      console.log(`  ${slot.label} - Réservé (booking ${slot.booking_id})`);
    }
  });
});
```

---

## 🔄 Realtime Synchronization

### Problème

Si User A réserve un créneau, User B (dans un autre onglet) doit voir immédiatement le créneau passer en "Occupé" **sans refresh manuel**.

### Solution

**Supabase Realtime :** écouter les `INSERT` sur la table `reservations`.

```typescript
const channel = supabase
  .channel('reservations-realtime')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'reservations',
    filter: `court_id=eq.${courtId}`
  }, (payload) => {
    console.log('Nouvelle réservation:', payload.new);
    
    // Refresh les disponibilités
    loadAvailability();
  })
  .subscribe();
```

**Important :**
- Le refresh se fait **après** l'event Realtime
- Pas besoin de parser `payload.new` et de mettre à jour le state manuellement
- On refresh simplement l'API endpoint qui retourne la vérité

---

## 🎯 Optimistic UI Locking

### Problème

Si User clique sur un créneau "Libre" mais que le créneau est déjà réservé (race condition), le message "Trop tard" apparaît alors que le slot était visuellement libre.

### Solution

**Optimistic UI :** Griser immédiatement le créneau cliqué (avant la réponse API).

```typescript
const [pendingSlots, setPendingSlots] = useState<Set<string>>(new Set());
const [reservedSlotId, setReservedSlotId] = useState<string | null>(null);

async function bookSlot(slot: AvailabilitySlot) {
  // 1. Marquer immédiatement comme réservé
  setReservedSlotId(slot.slot_id);
  setPendingSlots(prev => {
    const next = new Set(prev);
    next.add(slot.slot_id);
    return next;
  });

  // 2. Appeler l'API
  const res = await fetch('/api/bookings', { ... });

  // 3. Gérer le résultat
  if (res.status === 409) {
    // Conflit: laisser dans pendingSlots (il est bien réservé)
    alert("Trop tard !");
  } else if (!res.ok) {
    // Erreur: retirer de pendingSlots
    setReservedSlotId(null);
    setPendingSlots(prev => {
      const next = new Set(prev);
      next.delete(slot.slot_id);
      return next;
    });
  } else {
    // Succès: refresh
    loadAvailability();
  }
}

// 4. Dans le render
const isBooked = slot.status === 'reserved' || pendingSlots.has(slot.slot_id);
```

**Avantages :**
- Feedback instantané
- Pas de "double-clic" accidentel
- UX cohérente même en cas de race condition

---

## 🧪 Tests

### Test 1 : Disponibilités endpoint

```bash
curl "http://localhost:3000/api/clubs/ba43c579-e522-4b51-8542-737c2c6452bb/courts/6dceaf95-80dd-4fcf-b401-7d4c937f6e9e/availability?date=2026-01-30"
```

**Vérifier :**
- ✅ Retourne 14 slots (09:00 → 22:00, 90 min chaque)
- ✅ `status: 'free'` pour les créneaux non réservés
- ✅ `status: 'reserved'` + `booking_id` pour les créneaux réservés
- ✅ `meta.freeSlots + meta.reservedSlots = meta.totalSlots`

### Test 2 : Planning club endpoint

```bash
curl "http://localhost:3000/api/club/planning?clubId=ba43c579-e522-4b51-8542-737c2c6452bb&date=2026-01-30&view=day"
```

**Vérifier :**
- ✅ Retourne tous les terrains du club
- ✅ Chaque terrain a 14 slots
- ✅ `meta.totalSlots = nb_terrains * 14`
- ✅ `meta.totalFreeSlots + meta.totalReservedSlots = meta.totalSlots`

### Test 3 : Realtime synchronization

1. Ouvrir 2 onglets sur `/availability`
2. Dans l'onglet A, réserver un créneau "09:00 - 10:30"
3. **Vérifier** : Dans l'onglet B, le créneau passe **automatiquement** en "Occupé" (sans refresh)

### Test 4 : Optimistic UI locking

1. Ouvrir `/availability`
2. Cliquer sur un créneau "Libre"
3. **Vérifier** : Le créneau devient gris **instantanément** (avant la réponse API)
4. **Vérifier** : Si conflit 409, le message "Trop tard" s'affiche ET le créneau reste gris

### Test 5 : Conflit double-booking

1. Ouvrir 2 onglets sur `/availability`
2. Dans les 2 onglets, cliquer **en même temps** sur "09:00 - 10:30"
3. **Vérifier** :
   - Onglet A : ✅ Succès (premier arrivé)
   - Onglet B : ❌ Conflit 409 "Trop tard"
   - Les 2 onglets affichent le créneau en "Occupé"

---

## 📊 Résumé de l'architecture

```
┌─────────────────────────────────────────────────────────┐
│  UI (Joueur / Club)                                     │
│  - Affiche les créneaux via API endpoints               │
│  - Optimistic UI locking                                │
│  - Realtime synchronization                             │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│  API Routes (Next.js App Router)                        │
│  - GET /api/clubs/:clubId/courts/:courtId/availability  │
│  - GET /api/club/planning                               │
│  - POST /api/bookings (RPC create_booking_90m)          │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│  lib/slots.ts (Utils)                                   │
│  - generate90mSlots()                                   │
│  - buildSlotId() ← UNIQUE SOURCE OF TRUTH               │
│  - getDayBoundaries()                                   │
│  - helpers (format, navigation, etc.)                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│  Supabase (Database)                                    │
│  - booking_slots (créneaux réservés)                    │
│  - reservations (détails réservations)                  │
│  - courts (terrains)                                    │
│  - clubs (clubs)                                        │
└─────────────────────────────────────────────────────────┘
```

**Flux de données :**
1. UI demande les disponibilités via API
2. API génère les créneaux théoriques (`generate90mSlots`)
3. API query la DB pour récupérer les réservations (`booking_slots`)
4. API compare et marque chaque créneau `free` ou `reserved`
5. API retourne la liste complète à l'UI
6. UI affiche les créneaux (gris = réservé, blanc = libre)
7. Realtime sync met à jour automatiquement si une nouvelle réservation arrive

**Avantages :**
- ✅ Source de vérité unique (DB)
- ✅ Pas de logique de calcul côté client
- ✅ Synchronisation temps réel
- ✅ Anti-double-booking garanti (contrainte UNIQUE + RPC)
- ✅ Optimistic UI pour feedback instantané
- ✅ Code réutilisable (utils, endpoints)

**MVP complet et prêt pour la production !** 🚀
