## Implémentation: Créneaux fixes 1h30 avec anti double-booking (Modèle A) ✅

### 🎯 Objectif

Verrouiller l'anti double-booking avec des créneaux fixes de 1h30 (modèle A).

**Protection:** `UNIQUE (court_id, booking_date, slot_id)`

---

## 📊 Architecture du modèle

### Avant (Modèle dynamique - créneaux 30min)

```sql
bookings (
  court_id UUID,
  slot_start TIMESTAMPTZ,  -- Ex: 2026-01-25 14:00:00+00
  slot_end TIMESTAMPTZ,    -- Ex: 2026-01-25 14:30:00+00
  UNIQUE (court_id, slot_start)  -- Protège contre le double-booking
)
```

**Problème:**
- Créneaux dynamiques = difficulté à aligner
- Pas de "source de vérité" pour les créneaux disponibles
- Validation côté client/API, pas côté DB

### Après (Modèle A - créneaux fixes 1h30)

```sql
time_slots (
  id SERIAL PRIMARY KEY,
  start_time TIME,          -- Ex: 08:00, 09:30, 11:00...
  end_time TIME,            -- Ex: 09:30, 11:00, 12:30...
  duration_minutes INTEGER, -- 90
  label TEXT                -- "08:00 - 09:30"
)

bookings (
  court_id UUID,
  booking_date DATE,        -- Ex: 2026-01-25
  slot_id INTEGER,          -- Ex: 1 (08:00-09:30), 2 (09:30-11:00)...
  slot_start TIMESTAMPTZ,   -- Calculé: booking_date + time_slots.start_time
  slot_end TIMESTAMPTZ,     -- Calculé: booking_date + time_slots.end_time
  
  UNIQUE (court_id, booking_date, slot_id)  -- Protection anti double-booking
)
```

**Avantages:**
- ✅ Créneaux fixes prédéfinis (8h-22h30, tranches 1h30)
- ✅ Contrainte UNIQUE au niveau DB (impossible de contourner)
- ✅ Séparation date/créneau (plus flexible)
- ✅ Source de vérité: `time_slots` table
- ✅ Validation côté DB (pas besoin de check côté API)

---

## 📁 Fichiers créés/modifiés

### 1. Migration SQL

**`supabase/migrations/018_fixed_time_slots_model.sql`**

Contenu:
1. ✅ Création table `time_slots` avec créneaux fixes
2. ✅ Seed des 10 créneaux (8h-22h30, tranches 1h30)
3. ✅ Modification table `bookings`: ajout `slot_id` + `booking_date`
4. ✅ Contrainte `UNIQUE (court_id, booking_date, slot_id)`
5. ✅ Fonction RPC `create_booking_fixed_slot()`
6. ✅ Fonction RPC `get_availabilities_fixed_slots()`
7. ✅ Vue `v_bookings_with_slots`
8. ✅ Index pour performance

**Idempotence:** Safe si relancée (checks `IF NOT EXISTS`, `DO $$` blocks)

### 2. Script de test SQL

**`supabase/test_fixed_slots_anti_double_booking.sql`**

Tests:
- ✅ TEST 1: Première réservation (doit réussir)
- ✅ TEST 2: Double-booking sur même (court, date, slot) - doit échouer
- ✅ TEST 3: Autre créneau sur même terrain - doit réussir
- ✅ TEST 4: Même créneau sur autre jour - doit réussir
- ✅ TEST 5: Disponibilités
- ✅ TEST 6: Vue `v_bookings_with_slots`
- ✅ TEST 7: Réservation dans le passé - doit échouer
- ✅ TEST 8: Slot inexistant - doit échouer

### 3. Routes API Next.js

**`app/api/bookings/fixed-slot/route.ts`**

```typescript
POST /api/bookings/fixed-slot
Body: {
  clubId: string (UUID)
  courtId: string (UUID)
  bookingDate: string (YYYY-MM-DD)
  slotId: number (1-10)
  userId: string (UUID)
  playerName?: string
  playerEmail?: string
  playerPhone?: string
}

Response:
- 201: Réservation créée
- 409: Créneau déjà réservé (SLOT_ALREADY_BOOKED)
- 400: Date passée, format invalide, etc.
- 404: Club/court/slot introuvable
- 500: Erreur serveur
```

**`app/api/availabilities/fixed-slots/route.ts`**

```typescript
GET /api/availabilities/fixed-slots?clubId=xxx&date=YYYY-MM-DD

Response: {
  success: true,
  clubId: string,
  date: string,
  courts: [
    {
      courtId: string,
      courtName: string,
      slots: [
        {
          slotId: number,
          slotLabel: string,
          startTime: string,
          endTime: string,
          isAvailable: boolean  // ✅ false si déjà réservé
        },
        ...
      ]
    },
    ...
  ]
}
```

---

## 🔧 Utilisation

### 1. Appliquer la migration

```bash
# Exécuter la migration dans Supabase
psql -h db.YOUR_PROJECT.supabase.co \
     -U postgres \
     -d postgres \
     -f supabase/migrations/018_fixed_time_slots_model.sql
```

Ou via Supabase Dashboard:
1. SQL Editor
2. Coller le contenu de `018_fixed_time_slots_model.sql`
3. Run

**Vérification:**
```sql
-- Vérifier les créneaux créés
SELECT * FROM public.time_slots ORDER BY start_time;

-- Output attendu: 10 créneaux (8h-22h30)
```

### 2. Tester la contrainte unique

```bash
# Exécuter le script de test
psql ... -f supabase/test_fixed_slots_anti_double_booking.sql

# Résultat attendu: ✅ TOUS LES TESTS RÉUSSIS !
```

### 3. Créer une réservation (API)

```bash
curl -X POST http://localhost:3000/api/bookings/fixed-slot \
  -H "Content-Type: application/json" \
  -d '{
    "clubId": "ba43c579-e522-4b51-8542-737c2c6452bb",
    "courtId": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
    "bookingDate": "2026-02-01",
    "slotId": 1,
    "userId": "cee11521-8f13-4157-8057-034adf2cb9a0",
    "playerName": "Jean Dupont",
    "playerEmail": "jean@example.com",
    "playerPhone": "06 12 34 56 78"
  }'

# Response 201:
{
  "success": true,
  "message": "Réservation créée avec succès",
  "booking": {
    "success": true,
    "booking_id": "...",
    "club_id": "...",
    "court_id": "...",
    "booking_date": "2026-02-01",
    "slot_id": 1,
    "slot_label": "08:00 - 09:30",
    "slot_start": "2026-02-01T08:00:00+00:00",
    "slot_end": "2026-02-01T09:30:00+00:00",
    "duration_minutes": 90,
    "created_by": "..."
  }
}
```

### 4. Tenter un double-booking (doit échouer)

```bash
# Réessayer avec les MÊMES paramètres
curl -X POST http://localhost:3000/api/bookings/fixed-slot \
  -H "Content-Type: application/json" \
  -d '{ ... même body ... }'

# Response 409:
{
  "error": "Ce créneau est déjà réservé",
  "code": "SLOT_ALREADY_BOOKED",
  "hint": "Choisissez un autre créneau ou un autre terrain",
  "details": "Le créneau 08:00 - 09:30 le 2026-02-01 est déjà occupé sur ce terrain"
}
```

### 5. Obtenir les disponibilités (API)

```bash
curl "http://localhost:3000/api/availabilities/fixed-slots?clubId=ba43c579-e522-4b51-8542-737c2c6452bb&date=2026-02-01"

# Response 200:
{
  "success": true,
  "clubId": "ba43c579-e522-4b51-8542-737c2c6452bb",
  "date": "2026-02-01",
  "courts": [
    {
      "courtId": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
      "courtName": "Terrain 1",
      "slots": [
        {
          "slotId": 1,
          "slotLabel": "08:00 - 09:30",
          "startTime": "08:00:00",
          "endTime": "09:30:00",
          "isAvailable": false  // ✅ Réservé (TEST ci-dessus)
        },
        {
          "slotId": 2,
          "slotLabel": "09:30 - 11:00",
          "startTime": "09:30:00",
          "endTime": "11:00:00",
          "isAvailable": true  // ✅ Libre
        },
        ...
      ]
    },
    ...
  ]
}
```

---

## 🧪 Tests de validation

### Test 1: Contrainte UNIQUE fonctionne

```sql
-- Réserver (doit réussir)
SELECT public.create_booking_fixed_slot(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
  '2026-02-01'::date,
  1,  -- slot_id
  'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid,
  'Test User', 'test@example.com', '06 00 00 00 00'
);
-- ✅ Résultat: {"success": true, ...}

-- Réessayer MÊME (court, date, slot) - doit échouer
SELECT public.create_booking_fixed_slot(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,  -- Même court
  '2026-02-01'::date,                              -- Même date
  1,                                                -- Même slot
  'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid,
  'Autre User', 'autre@example.com', '06 11 22 33 44'
);
-- ❌ Erreur: "Créneau déjà réservé"
```

### Test 2: Autre créneau sur même terrain (OK)

```sql
-- Réserver slot_id=2 sur même terrain (doit réussir)
SELECT public.create_booking_fixed_slot(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,  -- Même court
  '2026-02-01'::date,                              -- Même date
  2,                                                -- Slot différent ✅
  'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid,
  'User 2', 'user2@example.com', '06 22 33 44 55'
);
-- ✅ Résultat: {"success": true, ...}
```

### Test 3: Même slot sur autre jour (OK)

```sql
-- Réserver slot_id=1 pour un autre jour (doit réussir)
SELECT public.create_booking_fixed_slot(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,  -- Même court
  '2026-02-02'::date,                              -- Jour différent ✅
  1,                                                -- Même slot
  'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid,
  'User 3', 'user3@example.com', '06 33 44 55 66'
);
-- ✅ Résultat: {"success": true, ...}
```

### Test 4: Disponibilités après réservations

```sql
SELECT * FROM public.get_availabilities_fixed_slots(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  '2026-02-01'::date
);

-- Résultat attendu:
-- court_id | slot_id | slot_label      | is_available
-- ---------|---------|-----------------|-------------
-- ...      | 1       | 08:00 - 09:30   | false  ✅ (réservé)
-- ...      | 2       | 09:30 - 11:00   | false  ✅ (réservé)
-- ...      | 3       | 11:00 - 12:30   | true   ✅ (libre)
-- ...      | ...     | ...             | ...
```

---

## 📊 Schéma de la base de données

### Table: `time_slots`

| Colonne            | Type    | Description                          |
|--------------------|---------|--------------------------------------|
| `id`               | SERIAL  | PK, auto-increment (1, 2, 3...)      |
| `start_time`       | TIME    | Heure de début (ex: 08:00, 09:30)    |
| `end_time`         | TIME    | Heure de fin (ex: 09:30, 11:00)      |
| `duration_minutes` | INTEGER | Durée en minutes (toujours 90)       |
| `label`            | TEXT    | Label lisible ("08:00 - 09:30")      |
| `is_active`        | BOOLEAN | Actif/inactif (pour désactiver slots)|
| `created_at`       | TIMESTAMPTZ | Date de création                |

**Contraintes:**
- `UNIQUE (start_time)` - Pas de doublons
- `CHECK (end_time > start_time)` - end_time après start_time
- `CHECK (duration_minutes = 90)` - Durée fixe 1h30

**Seed (10 créneaux):**
```
id | start_time | end_time | label
---|------------|----------|----------------
1  | 08:00      | 09:30    | 08:00 - 09:30
2  | 09:30      | 11:00    | 09:30 - 11:00
3  | 11:00      | 12:30    | 11:00 - 12:30
4  | 12:30      | 14:00    | 12:30 - 14:00
5  | 14:00      | 15:30    | 14:00 - 15:30
6  | 15:30      | 17:00    | 15:30 - 17:00
7  | 17:00      | 18:30    | 17:00 - 18:30
8  | 18:30      | 20:00    | 18:30 - 20:00
9  | 20:00      | 21:30    | 20:00 - 21:30
10 | 21:30      | 23:00    | 21:30 - 23:00
```

### Table: `bookings` (modifiée)

| Colonne         | Type        | Description                                |
|-----------------|-------------|--------------------------------------------|
| `id`            | UUID        | PK                                         |
| `club_id`       | UUID        | FK → clubs(id)                             |
| `court_id`      | UUID        | FK → courts(id)                            |
| `slot_id`       | INTEGER     | **NOUVEAU** - FK → time_slots(id)          |
| `booking_date`  | DATE        | **NOUVEAU** - Date locale (ex: 2026-02-01) |
| `slot_start`    | TIMESTAMPTZ | Calculé: booking_date + slot.start_time    |
| `slot_end`      | TIMESTAMPTZ | Calculé: booking_date + slot.end_time      |
| `created_by`    | UUID        | FK → auth.users(id)                        |
| `player_name`   | TEXT        | Nom du joueur (optionnel)                  |
| `player_email`  | TEXT        | Email du joueur                            |
| `player_phone`  | TEXT        | Téléphone du joueur                        |
| `status`        | ENUM        | 'confirmed', 'cancelled', 'pending'        |
| `created_at`    | TIMESTAMPTZ | Date de création                           |
| `updated_at`    | TIMESTAMPTZ | Date de mise à jour                        |

**Contrainte anti double-booking:**
```sql
CONSTRAINT unique_court_booking_slot 
  UNIQUE (court_id, booking_date, slot_id)
```

→ **Protection au niveau DB** : impossible d'insérer 2 fois le même (court, date, slot)

**Index:**
```sql
CREATE INDEX idx_bookings_slot_id ON bookings (slot_id);
CREATE INDEX idx_bookings_booking_date ON bookings (booking_date);
CREATE INDEX idx_bookings_court_date_slot ON bookings (court_id, booking_date, slot_id);
```

---

## 🔧 Fonctions RPC

### 1. `create_booking_fixed_slot()`

**Signature:**
```sql
public.create_booking_fixed_slot(
  p_club_id UUID,
  p_court_id UUID,
  p_booking_date DATE,
  p_slot_id INTEGER,
  p_user_id UUID,
  p_player_name TEXT DEFAULT NULL,
  p_player_email TEXT DEFAULT NULL,
  p_player_phone TEXT DEFAULT NULL
)
RETURNS JSON
```

**Logique:**
1. Valider `booking_date` ≥ CURRENT_DATE
2. Vérifier que `slot_id` existe et est actif
3. Vérifier que `club_id` et `court_id` existent
4. Calculer `slot_start` et `slot_end` (timestamptz)
5. Vérifier que `slot_start` > now()
6. INSERT dans `bookings`
   - Si conflit UNIQUE → Exception "Créneau déjà réservé"
   - Si succès → Retourner JSON avec détails

**Retour (succès):**
```json
{
  "success": true,
  "booking_id": "...",
  "club_id": "...",
  "court_id": "...",
  "booking_date": "2026-02-01",
  "slot_id": 1,
  "slot_label": "08:00 - 09:30",
  "slot_start": "2026-02-01T08:00:00+00:00",
  "slot_end": "2026-02-01T09:30:00+00:00",
  "duration_minutes": 90,
  "created_by": "..."
}
```

**Erreurs:**
- `23505` (unique_violation) → "Créneau déjà réservé"
- Autres → Message d'erreur spécifique

### 2. `get_availabilities_fixed_slots()`

**Signature:**
```sql
public.get_availabilities_fixed_slots(
  p_club_id UUID,
  p_booking_date DATE
)
RETURNS TABLE (
  court_id UUID,
  court_name TEXT,
  slot_id INTEGER,
  slot_label TEXT,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN
)
```

**Logique:**
1. Lister tous les terrains actifs du club
2. Lister tous les créneaux actifs (`time_slots`)
3. CROSS JOIN (tous les courts × tous les slots)
4. LEFT JOIN sur `bookings` (court_id, booking_date, slot_id)
5. `is_available` = `TRUE` si aucune réservation trouvée

**Retour:**
```
court_id | court_name | slot_id | slot_label    | start_time | end_time | is_available
---------|------------|---------|---------------|------------|----------|-------------
uuid1    | Terrain 1  | 1       | 08:00 - 09:30 | 08:00      | 09:30    | false
uuid1    | Terrain 1  | 2       | 09:30 - 11:00 | 09:30      | 11:00    | true
uuid1    | Terrain 1  | 3       | 11:00 - 12:30 | 11:00      | 12:30    | true
...
```

---

## 🎯 Vue: `v_bookings_with_slots`

**Objectif:** Vue enrichie des réservations avec infos des créneaux fixes

**Définition:**
```sql
CREATE VIEW public.v_bookings_with_slots AS
SELECT 
  b.id AS booking_id,
  b.club_id,
  cl.name AS club_name,
  b.court_id,
  co.name AS court_name,
  b.booking_date,
  b.slot_id,
  ts.label AS slot_label,
  ts.start_time,
  ts.end_time,
  b.slot_start,
  b.slot_end,
  b.status,
  b.created_by,
  b.player_name,
  b.player_email,
  b.created_at
FROM public.bookings b
JOIN public.clubs cl ON cl.id = b.club_id
JOIN public.courts co ON co.id = b.court_id
LEFT JOIN public.time_slots ts ON ts.id = b.slot_id
ORDER BY b.booking_date DESC, ts.start_time DESC;
```

**Utilisation:**
```sql
-- Voir toutes les réservations avec créneaux
SELECT * FROM public.v_bookings_with_slots
WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'
  AND booking_date = '2026-02-01'
ORDER BY start_time;
```

---

## 🚀 Intégration frontend

### Exemple: Composant de réservation

```typescript
// components/BookingForm.tsx
import { useState } from 'react'

type Slot = {
  slotId: number
  slotLabel: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

export function BookingForm({ clubId, courtId }: { clubId: string, courtId: string }) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availabilities, setAvailabilities] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)

  // Charger les disponibilités
  const loadAvailabilities = async (date: string) => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/availabilities/fixed-slots?clubId=${clubId}&date=${date}`
      )
      const data = await res.json()
      
      // Trouver le court
      const court = data.courts.find((c: any) => c.courtId === courtId)
      setAvailabilities(court?.slots || [])
    } catch (error) {
      console.error('Erreur chargement disponibilités:', error)
    } finally {
      setLoading(false)
    }
  }

  // Réserver un créneau
  const bookSlot = async (slotId: number) => {
    try {
      const res = await fetch('/api/bookings/fixed-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId,
          courtId,
          bookingDate: selectedDate,
          slotId,
          userId: 'USER_ID',  // Remplacer par auth.uid()
          playerName: 'Jean Dupont',
          playerEmail: 'jean@example.com',
          playerPhone: '06 12 34 56 78'
        })
      })

      const data = await res.json()

      if (res.ok) {
        alert('✅ Réservation confirmée !')
        // Recharger les disponibilités
        loadAvailabilities(selectedDate)
      } else {
        if (data.code === 'SLOT_ALREADY_BOOKED') {
          alert('❌ Ce créneau est déjà réservé. Choisissez-en un autre.')
        } else {
          alert(`❌ Erreur: ${data.error}`)
        }
      }
    } catch (error) {
      console.error('Erreur réservation:', error)
      alert('❌ Erreur lors de la réservation')
    }
  }

  return (
    <div>
      <h2>Réserver un créneau</h2>
      
      {/* Sélection date */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value)
          loadAvailabilities(e.target.value)
        }}
        min={new Date().toISOString().split('T')[0]}
      />

      {/* Liste des créneaux */}
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div>
          {availabilities.map((slot) => (
            <button
              key={slot.slotId}
              onClick={() => bookSlot(slot.slotId)}
              disabled={!slot.isAvailable}
              style={{
                background: slot.isAvailable ? 'green' : 'gray',
                color: 'white',
                padding: '10px',
                margin: '5px',
                cursor: slot.isAvailable ? 'pointer' : 'not-allowed'
              }}
            >
              {slot.slotLabel} - {slot.isAvailable ? '✅ Disponible' : '❌ Réservé'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## ✅ Checklist de validation

### Migration
- [x] ✅ Table `time_slots` créée
- [x] ✅ 10 créneaux seeded (8h-22h30, tranches 1h30)
- [x] ✅ Colonne `slot_id` ajoutée à `bookings`
- [x] ✅ Colonne `booking_date` ajoutée à `bookings`
- [x] ✅ Contrainte `UNIQUE (court_id, booking_date, slot_id)` créée
- [x] ✅ Index créés pour performance
- [x] ✅ Migration idempotente (safe si relancée)

### Fonctions RPC
- [x] ✅ `create_booking_fixed_slot()` créée
- [x] ✅ Validation: date future, slot existant, court actif
- [x] ✅ Gestion erreur `unique_violation` (23505)
- [x] ✅ `get_availabilities_fixed_slots()` créée
- [x] ✅ Retourne `is_available` pour chaque (court, slot)

### API Routes
- [x] ✅ `POST /api/bookings/fixed-slot` créée
- [x] ✅ Validation: clubId, courtId, bookingDate, slotId, userId
- [x] ✅ Gestion erreurs: 409 (conflit), 400 (validation), 404, 500
- [x] ✅ `GET /api/availabilities/fixed-slots` créée
- [x] ✅ Retour structuré: `courts[]` avec `slots[]`

### Tests
- [x] ✅ Script de test SQL créé
- [x] ✅ TEST: Double-booking bloqué (UNIQUE constraint)
- [x] ✅ TEST: Autre créneau OK
- [x] ✅ TEST: Autre jour OK
- [x] ✅ TEST: Disponibilités OK
- [x] ✅ TEST: Date passée bloquée
- [x] ✅ TEST: Slot inexistant bloqué

---

## 📝 Documentation

### Fichiers créés
1. `supabase/migrations/018_fixed_time_slots_model.sql` - Migration complète
2. `supabase/test_fixed_slots_anti_double_booking.sql` - Tests
3. `app/api/bookings/fixed-slot/route.ts` - API créer réservation
4. `app/api/availabilities/fixed-slots/route.ts` - API disponibilités
5. `FIXED_SLOTS_IMPLEMENTATION.md` - Ce fichier (documentation)

---

## 🎯 Résumé

**Ce qui a été livré:**
- ✅ Table `time_slots` avec 10 créneaux fixes (8h-22h30, 1h30)
- ✅ Modification `bookings`: ajout `slot_id` + `booking_date`
- ✅ Contrainte `UNIQUE (court_id, booking_date, slot_id)` → **Anti double-booking au niveau DB**
- ✅ Migration SQL idempotente (safe si relancée)
- ✅ Fonction RPC `create_booking_fixed_slot()` avec validation
- ✅ Fonction RPC `get_availabilities_fixed_slots()` pour disponibilités
- ✅ Route API POST `/api/bookings/fixed-slot` (créer réservation)
- ✅ Route API GET `/api/availabilities/fixed-slots` (récupérer disponibilités)
- ✅ Script de test SQL complet (8 tests)
- ✅ Vue `v_bookings_with_slots` pour requêtes enrichies
- ✅ Documentation complète avec exemples

**Protection garantie:**
- ✅ Impossible de réserver 2 fois le même (court, date, créneau) → Contrainte DB
- ✅ Validation côté DB (pas besoin de check côté API)
- ✅ Source de vérité: table `time_slots`
- ✅ Créneaux fixes, pas de dérive temporelle

**Prêt pour production ! 🚀**
