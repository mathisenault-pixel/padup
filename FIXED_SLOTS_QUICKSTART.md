# Quick Start: Créneaux fixes 1h30 avec anti double-booking ⚡

## 🎯 Résumé

**Protection anti double-booking au niveau base de données avec créneaux fixes.**

**Contrainte:** `UNIQUE (court_id, booking_date, slot_id)`

→ **Impossible** de réserver 2 fois le même terrain sur le même créneau le même jour.

---

## 📦 Livrables

### 1. Migration SQL

**Fichier:** `supabase/migrations/018_fixed_time_slots_model.sql`

**Contenu:**
- ✅ Table `time_slots` (10 créneaux fixes: 8h-22h30, 1h30 chacun)
- ✅ Modification table `bookings`: ajout `slot_id` + `booking_date`
- ✅ Contrainte `UNIQUE (court_id, booking_date, slot_id)`
- ✅ Fonction RPC `create_booking_fixed_slot()`
- ✅ Fonction RPC `get_availabilities_fixed_slots()`
- ✅ Vue `v_bookings_with_slots`
- ✅ Index pour performance
- ✅ Migration idempotente (safe si relancée)

### 2. Tests SQL

**Fichier:** `supabase/test_fixed_slots_anti_double_booking.sql`

**Tests:**
1. ✅ Première réservation (succès)
2. ✅ Double-booking bloqué (UNIQUE constraint)
3. ✅ Autre créneau même terrain (succès)
4. ✅ Même créneau autre jour (succès)
5. ✅ Disponibilités
6. ✅ Vue enrichie
7. ✅ Réservation passée bloquée
8. ✅ Slot inexistant bloqué

### 3. API Routes Next.js

**Fichiers:**
- `app/api/bookings/fixed-slot/route.ts` - Créer réservation
- `app/api/availabilities/fixed-slots/route.ts` - Récupérer disponibilités

### 4. Documentation

**Fichiers:**
- `FIXED_SLOTS_IMPLEMENTATION.md` - Documentation complète
- `FIXED_SLOTS_QUICKSTART.md` - Ce fichier (quick start)

---

## 🚀 Déploiement

### Étape 1: Appliquer la migration

#### Option A: Via psql

```bash
psql -h db.YOUR_PROJECT.supabase.co \
     -U postgres \
     -d postgres \
     -f supabase/migrations/018_fixed_time_slots_model.sql
```

#### Option B: Via Supabase Dashboard

1. Ouvrir Supabase Dashboard
2. Aller dans **SQL Editor**
3. Coller le contenu de `supabase/migrations/018_fixed_time_slots_model.sql`
4. Cliquer **Run**

**Vérification:**
```sql
-- Vérifier les créneaux créés
SELECT * FROM public.time_slots ORDER BY start_time;

-- Résultat attendu: 10 lignes (8h-22h30, tranches 1h30)
```

### Étape 2: Tester la contrainte unique

```bash
# Exécuter le script de test
psql ... -f supabase/test_fixed_slots_anti_double_booking.sql

# Résultat attendu:
# ========================================
# ✅ TOUS LES TESTS RÉUSSIS !
# ========================================
```

### Étape 3: Build Next.js

```bash
npm run build

# Vérifier que les nouvelles routes sont listées:
# ✓ /api/bookings/fixed-slot
# ✓ /api/availabilities/fixed-slots
```

---

## 💻 Utilisation

### 1. Créer une réservation

**Endpoint:** `POST /api/bookings/fixed-slot`

**Body:**
```json
{
  "clubId": "ba43c579-e522-4b51-8542-737c2c6452bb",
  "courtId": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
  "bookingDate": "2026-02-01",
  "slotId": 1,
  "userId": "cee11521-8f13-4157-8057-034adf2cb9a0",
  "playerName": "Jean Dupont",
  "playerEmail": "jean@example.com",
  "playerPhone": "06 12 34 56 78"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Réservation créée avec succès",
  "booking": {
    "booking_id": "...",
    "slot_label": "08:00 - 09:30",
    "booking_date": "2026-02-01",
    "slot_start": "2026-02-01T08:00:00+00:00",
    "slot_end": "2026-02-01T09:30:00+00:00"
  }
}
```

**Réponse (409 - Conflit):**
```json
{
  "error": "Ce créneau est déjà réservé",
  "code": "SLOT_ALREADY_BOOKED",
  "hint": "Choisissez un autre créneau ou un autre terrain"
}
```

### 2. Obtenir les disponibilités

**Endpoint:** `GET /api/availabilities/fixed-slots?clubId=xxx&date=YYYY-MM-DD`

**Exemple:**
```bash
curl "http://localhost:3000/api/availabilities/fixed-slots?clubId=ba43c579-e522-4b51-8542-737c2c6452bb&date=2026-02-01"
```

**Réponse (200):**
```json
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
          "isAvailable": false
        },
        {
          "slotId": 2,
          "slotLabel": "09:30 - 11:00",
          "startTime": "09:30:00",
          "endTime": "11:00:00",
          "isAvailable": true
        },
        ...
      ]
    },
    ...
  ]
}
```

---

## 🧪 Tests manuels rapides

### Test 1: Vérifier les créneaux

```sql
SELECT * FROM public.time_slots ORDER BY start_time;
```

**Résultat attendu:**
```
id | start_time | end_time | label
---|------------|----------|----------------
1  | 08:00      | 09:30    | 08:00 - 09:30
2  | 09:30      | 11:00    | 09:30 - 11:00
3  | 11:00      | 12:30    | 11:00 - 12:30
...
10 | 21:30      | 23:00    | 21:30 - 23:00
```

### Test 2: Créer une réservation (doit réussir)

```sql
SELECT public.create_booking_fixed_slot(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,  -- club_id
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,  -- court_id
  CURRENT_DATE + INTERVAL '1 day',               -- booking_date (demain)
  1,                                              -- slot_id (08:00-09:30)
  'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid,  -- user_id
  'Test User', 'test@example.com', '06 00 00 00 00'
);
```

**Résultat attendu:**
```json
{
  "success": true,
  "booking_id": "...",
  "slot_label": "08:00 - 09:30",
  ...
}
```

### Test 3: Tenter un double-booking (doit échouer)

```sql
-- Réessayer avec les MÊMES paramètres
SELECT public.create_booking_fixed_slot(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
  CURRENT_DATE + INTERVAL '1 day',
  1,  -- Même slot
  'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid,
  'Autre User', 'autre@example.com', '06 11 22 33 44'
);
```

**Résultat attendu:**
```
ERROR: Créneau déjà réservé
DETAIL: Le créneau 08:00 - 09:30 le 2026-XX-XX est déjà occupé sur ce terrain
HINT: Choisissez un autre créneau ou un autre terrain
```

### Test 4: Disponibilités

```sql
SELECT * FROM public.get_availabilities_fixed_slots(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  CURRENT_DATE + INTERVAL '1 day'
);
```

**Résultat attendu:**
```
court_id | court_name | slot_id | slot_label    | is_available
---------|------------|---------|---------------|-------------
...      | Terrain 1  | 1       | 08:00 - 09:30 | false  ✅ (réservé)
...      | Terrain 1  | 2       | 09:30 - 11:00 | true   ✅ (libre)
...      | Terrain 1  | 3       | 11:00 - 12:30 | true   ✅ (libre)
...
```

---

## 📊 Structure de la base de données

### Table: `time_slots` (nouvelle)

```sql
CREATE TABLE time_slots (
  id SERIAL PRIMARY KEY,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 90,
  label TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  UNIQUE (start_time)
);
```

**Données (seed):**
- 10 créneaux prédéfinis
- 8h00 → 9h30 → 11h00 → ... → 23h00
- Durée fixe: 1h30 (90 minutes)

### Table: `bookings` (modifiée)

**Colonnes ajoutées:**
- `slot_id` INTEGER (FK → time_slots)
- `booking_date` DATE

**Contrainte ajoutée:**
```sql
CONSTRAINT unique_court_booking_slot 
  UNIQUE (court_id, booking_date, slot_id)
```

→ **Protection anti double-booking au niveau DB**

**Colonnes existantes:**
- `slot_start` TIMESTAMPTZ (calculé: booking_date + slot.start_time)
- `slot_end` TIMESTAMPTZ (calculé: booking_date + slot.end_time)

---

## 🔧 Fonctions RPC

### 1. `create_booking_fixed_slot()`

**Rôle:** Créer une réservation avec validation

**Signature:**
```sql
create_booking_fixed_slot(
  p_club_id UUID,
  p_court_id UUID,
  p_booking_date DATE,
  p_slot_id INTEGER,
  p_user_id UUID,
  p_player_name TEXT,
  p_player_email TEXT,
  p_player_phone TEXT
)
RETURNS JSON
```

**Validations:**
1. ✅ `booking_date` ≥ aujourd'hui
2. ✅ `slot_id` existe et est actif
3. ✅ `club_id` et `court_id` existent et actifs
4. ✅ Créneau dans le futur (pas passé)
5. ✅ Contrainte UNIQUE (court_id, booking_date, slot_id)

**Erreurs:**
- `23505` → "Créneau déjà réservé"
- Date passée → "Impossible de réserver dans le passé"
- Slot/court introuvable → "Ressource introuvable ou inactive"

### 2. `get_availabilities_fixed_slots()`

**Rôle:** Obtenir disponibilités pour un club + date

**Signature:**
```sql
get_availabilities_fixed_slots(
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
2. Lister tous les créneaux actifs
3. CROSS JOIN (tous courts × tous slots)
4. LEFT JOIN sur bookings (trouver les réservés)
5. `is_available` = TRUE si aucune réservation

---

## 🎯 Créneaux disponibles

| Slot ID | start_time | end_time | label          | Durée |
|---------|------------|----------|----------------|-------|
| 1       | 08:00      | 09:30    | 08:00 - 09:30  | 1h30  |
| 2       | 09:30      | 11:00    | 09:30 - 11:00  | 1h30  |
| 3       | 11:00      | 12:30    | 11:00 - 12:30  | 1h30  |
| 4       | 12:30      | 14:00    | 12:30 - 14:00  | 1h30  |
| 5       | 14:00      | 15:30    | 14:00 - 15:30  | 1h30  |
| 6       | 15:30      | 17:00    | 15:30 - 17:00  | 1h30  |
| 7       | 17:00      | 18:30    | 17:00 - 18:30  | 1h30  |
| 8       | 18:30      | 20:00    | 18:30 - 20:00  | 1h30  |
| 9       | 20:00      | 21:30    | 20:00 - 21:30  | 1h30  |
| 10      | 21:30      | 23:00    | 21:30 - 23:00  | 1h30  |

**Total: 10 créneaux par jour (8h-23h)**

---

## ✅ Checklist déploiement

### Base de données
- [ ] Appliquer migration `018_fixed_time_slots_model.sql`
- [ ] Vérifier: `SELECT COUNT(*) FROM time_slots;` → 10 créneaux
- [ ] Vérifier: `\d bookings` → colonnes `slot_id` et `booking_date` présentes
- [ ] Vérifier: contrainte `unique_court_booking_slot` créée
- [ ] Exécuter script de test: `test_fixed_slots_anti_double_booking.sql`
- [ ] Vérifier: tous les tests passent ✅

### API
- [ ] Build Next.js: `npm run build`
- [ ] Vérifier routes:
  - [ ] `/api/bookings/fixed-slot`
  - [ ] `/api/availabilities/fixed-slots`
- [ ] Tester création réservation via API
- [ ] Tester double-booking bloqué (409)
- [ ] Tester récupération disponibilités

### Production
- [ ] Variables d'env Supabase configurées
- [ ] RLS activé et policies en place
- [ ] Index créés pour performance
- [ ] Logs/monitoring configurés
- [ ] Tests end-to-end réalisés

---

## 📝 Prochaines étapes (optionnel)

### 1. Ajouter de nouveaux créneaux

```sql
-- Exemple: ajouter un créneau 23:00-00:30
INSERT INTO public.time_slots (start_time, end_time, duration_minutes, label)
VALUES ('23:00'::time, '00:30'::time, 90, '23:00 - 00:30');
```

### 2. Désactiver un créneau

```sql
-- Désactiver le créneau 21:30-23:00
UPDATE public.time_slots 
SET is_active = false 
WHERE id = 10;
```

### 3. Modifier les horaires

```sql
-- Changer l'horaire du premier créneau
UPDATE public.time_slots 
SET start_time = '07:00'::time, 
    end_time = '08:30'::time,
    label = '07:00 - 08:30'
WHERE id = 1;
```

---

## 🆘 Troubleshooting

### Problème: Migration échoue avec "relation already exists"

**Solution:** Migration idempotente, safe de relancer
```bash
# Relancer la migration
psql ... -f supabase/migrations/018_fixed_time_slots_model.sql
```

### Problème: Tests échouent avec "user not found"

**Solution:** Créer un user de test dans Supabase Dashboard
```
1. Dashboard > Authentication > Users
2. Add user
3. Email: test@example.com
4. Password: testpassword123
5. Copier le UUID généré
6. Utiliser cet UUID dans les tests
```

### Problème: API retourne 500 "RPC error"

**Solution:** Vérifier que la migration est appliquée
```sql
-- Vérifier les fonctions RPC
SELECT proname FROM pg_proc 
WHERE proname LIKE '%fixed_slot%';

-- Résultat attendu:
-- create_booking_fixed_slot
-- get_availabilities_fixed_slots
```

### Problème: Double-booking n'est pas bloqué

**Solution:** Vérifier la contrainte UNIQUE
```sql
-- Vérifier les contraintes
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'public.bookings'::regclass;

-- Doit inclure: unique_court_booking_slot (type: u)
```

---

## 📞 Support

**Documentation complète:** `FIXED_SLOTS_IMPLEMENTATION.md`

**Script de test:** `supabase/test_fixed_slots_anti_double_booking.sql`

**Migration SQL:** `supabase/migrations/018_fixed_time_slots_model.sql`

---

## ✅ Résultat final

**Protection garantie:**
- ✅ Impossible de réserver 2 fois le même (court, date, créneau)
- ✅ Contrainte au niveau DB (pas de bypass possible)
- ✅ Créneaux fixes prédéfinis (8h-23h, 1h30)
- ✅ Source de vérité unique (`time_slots`)
- ✅ Tests complets (8 tests SQL)
- ✅ API Next.js prête
- ✅ Documentation complète

**Prêt pour production ! 🚀**
