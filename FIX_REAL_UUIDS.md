# ✅ Fix: Utilisation des UUIDs réels depuis Supabase

## Contexte

**Problème:** Le code utilisait des IDs fake ('1', '2', '3', '4') et des mappings artificiels (CLUB_ID_MAP, COURT_ID_MAP) au lieu d'utiliser directement les vrais UUIDs depuis la base de données Supabase.

**Objectif:** Nettoyer complètement le code pour utiliser UNIQUEMENT les UUIDs réels depuis `public.clubs` et `public.courts`, sans aucun mapping artificiel.

---

## UUIDs réels depuis Supabase

### Club
- **Nom:** Club Démo Pad'up
- **UUID:** `ba43c579-e522-4b51-8542-737c2c6452bb`

### Courts
- **Terrain 1:** `21d9a066-b7db-4966-abf1-cc210f7476c1`
- **Terrain 2:** `6dceaf95-80dd-4fcf-b401-7d4c937f6e9e`

---

## Changements effectués

### 1. `/app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

#### ❌ AVANT (IDs fake + mappings)
```typescript
const clubs: Club[] = [
  { id: '1', nom: 'Le Hangar Sport & Co', ... },
  { id: '2', nom: 'Paul & Louis Sport', ... },
  { id: '3', nom: 'ZE Padel', ... },
  { id: '4', nom: 'QG Padel Club', ... }
]

const CLUB_ID_MAP: Record<string, string> = {
  '1': 'a1b2c3d4-...',  // Fake UUID
  '2': 'b2c3d4e5-...',  // Fake UUID
  '3': 'c3d4e5f6-...',  // Fake UUID
  '4': 'd4e5f6a7-...'   // Fake UUID
}

const COURT_ID_MAP: Record<string, Record<number, string>> = {
  '1': { 1: 'uuid1', 2: 'uuid2', ... },
  '2': { 1: 'uuid3', 2: 'uuid4', ... },
  ...
}

// Dans handleFinalConfirmation:
const clubUuid = CLUB_ID_MAP[club.id]  // ❌ Mapping artificiel
const courtId = COURT_ID_MAP[club.id]?.[selectedTerrain]  // ❌ Mapping artificiel
```

#### ✅ APRÈS (UUIDs réels directs)
```typescript
const clubs: Club[] = [
  {
    id: 'ba43c579-e522-4b51-8542-737c2c6452bb',  // ✅ UUID réel
    nom: 'Club Démo Pad\'up',
    ville: 'Avignon',
    nombreTerrains: 2,
    ...
  }
]

const COURT_UUIDS: Record<number, string> = {
  1: '21d9a066-b7db-4966-abf1-cc210f7476c1',  // ✅ UUID réel Terrain 1
  2: '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e',  // ✅ UUID réel Terrain 2
}

// Dans handleFinalConfirmation:
const courtId = COURT_UUIDS[selectedTerrain]  // ✅ Direct, pas de mapping

const bookingPayload = {
  club_id: club.id,        // ✅ UUID réel directement
  court_id: courtId,       // ✅ UUID réel directement
  booking_date: bookingDate,
  slot_id: selectedSlot.id,  // ✅ INTEGER (référence time_slots.id)
  ...
}
```

**Simplifications:**
- ❌ Supprimé: `CLUB_ID_MAP` (mapping artificiel)
- ❌ Supprimé: `COURT_ID_MAP` (mapping double niveau)
- ❌ Supprimé: Validations UUID regex redondantes
- ✅ Ajouté: `COURT_UUIDS` simple (terrain_id → UUID)
- ✅ Simplifié: Logs plus concis et lisibles

**Code nettoyé:**
- Fetch bookings: utilise `COURT_UUIDS[t.id]` au lieu de `COURT_ID_MAP[club.id]?.[t.id]`
- Realtime: utilise `COURT_UUIDS[t.id]` directement
- handleSlotClick: utilise `COURT_UUIDS[terrainId]` directement
- Render terrain: utilise `COURT_UUIDS[terrain.id]` directement

---

### 2. `/app/player/(authenticated)/clubs/page.tsx`

#### ❌ AVANT
```typescript
type Club = {
  id: number  // ❌ ID numérique
  ...
}

const [clubs, setClubs] = useState<Club[]>([
  { id: 1, nom: 'Le Hangar Sport & Co', ... },
  { id: 2, nom: 'Paul & Louis Sport', ... },
  { id: 3, nom: 'ZE Padel', ... },
  { id: 4, nom: 'QG Padel Club', ... }
])

const toggleFavoris = useCallback((clubId: number) => { ... }, [])
```

#### ✅ APRÈS
```typescript
type Club = {
  id: string  // ✅ UUID string
  ...
}

const [clubs, setClubs] = useState<Club[]>([
  {
    id: 'ba43c579-e522-4b51-8542-737c2c6452bb',  // ✅ UUID réel
    nom: 'Club Démo Pad\'up',
    ville: 'Avignon',
    nombreTerrains: 2,
    ...
  }
])

const toggleFavoris = useCallback((clubId: string) => { ... }, [])
```

**Impact:**
- Le lien `href={/player/clubs/${club.id}/reserver}` utilise maintenant l'UUID réel
- Navigation: `/player/clubs/ba43c579-e522-4b51-8542-737c2c6452bb/reserver` (fonctionne car le club dans reserver/page.tsx a le même UUID)

---

### 3. `/lib/demoData.ts`

#### ❌ AVANT
```typescript
export const demoClubs = [
  { id: '1', name: 'Le Hangar Sport & Co', ... },
  { id: '2', name: 'Paul & Louis Sport', ... },
  { id: '3', name: 'ZE Padel', ... },
  { id: '4', name: 'QG Padel Club', ... }
]

export const demoCourts = [
  { id: '1', club_id: '1', name: 'Court Central 1', ... },
  { id: '2', club_id: '1', name: 'Court Central 2', ... },
  { id: '3', club_id: '2', name: 'Court Extérieur 1', ... },
  { id: '4', club_id: '3', name: 'Court Premium', ... }
]
```

#### ✅ APRÈS
```typescript
export const demoClubs = [
  {
    id: 'ba43c579-e522-4b51-8542-737c2c6452bb',  // ✅ UUID réel
    name: 'Club Démo Pad\'up',
    city: 'Avignon',
    ...
  }
]

export const demoCourts = [
  {
    id: '21d9a066-b7db-4966-abf1-cc210f7476c1',  // ✅ UUID réel Terrain 1
    club_id: 'ba43c579-e522-4b51-8542-737c2c6452bb',
    name: 'Terrain 1',
    ...
  },
  {
    id: '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e',  // ✅ UUID réel Terrain 2
    club_id: 'ba43c579-e522-4b51-8542-737c2c6452bb',
    name: 'Terrain 2',
    ...
  }
]
```

**Impact:** Le mode démo (si activé) utilisera maintenant les vrais UUIDs.

---

## Vérification du payload d'insertion

### Payload `bookings` (exemple)

```json
{
  "club_id": "ba43c579-e522-4b51-8542-737c2c6452bb",   // ✅ UUID valide
  "court_id": "21d9a066-b7db-4966-abf1-cc210f7476c1", // ✅ UUID valide
  "booking_date": "2026-01-23",                       // ✅ DATE YYYY-MM-DD
  "slot_id": 5,                                       // ✅ INTEGER (time_slots.id)
  "status": "confirmed",                              // ✅ TEXT enum
  "slot_start": "2026-01-23T14:00:00",               // ✅ TIMESTAMPTZ
  "slot_end": "2026-01-23T15:30:00"                  // ✅ TIMESTAMPTZ
}
```

**Validation:**
- ✅ `club_id` est un UUID valide (pas '1' ou un index)
- ✅ `court_id` est un UUID valide (pas '1' ou un index)
- ✅ `slot_id` est un INTEGER (référence `time_slots.id`)
- ✅ Aucun champ UUID ne reçoit de valeur numérique ou string '1', '2', etc.

---

## Console logs attendus

### Au moment de l'insertion

```
[BOOKING INSERT] {
  club_id: 'ba43c579-e522-4b51-8542-737c2c6452bb',
  court_id: '21d9a066-b7db-4966-abf1-cc210f7476c1',
  booking_date: '2026-01-23',
  slot_id: 5,
  status: 'confirmed'
}
```

**Aucune erreur 22P02 ne devrait apparaître.**

---

## Bénéfices du fix

### 1. Simplicité
- ❌ Avant: 3 niveaux de mapping (club.id → CLUB_ID_MAP → UUID, club.id + terrain.id → COURT_ID_MAP → UUID)
- ✅ Après: Accès direct aux UUIDs (club.id = UUID, COURT_UUIDS[terrain.id] = UUID)

### 2. Lisibilité
- Code plus court et plus facile à comprendre
- Moins de variables intermédiaires
- Logs plus concis

### 3. Maintenabilité
- Pas de risque de désynchronisation entre les mappings
- Modification d'un UUID = 1 seul endroit à changer
- Pas de fake data qui pourrait être confondue avec la vraie data

### 4. Sécurité
- Pas de validations regex inutiles (les UUIDs sont déjà validés en DB)
- Impossible d'insérer un ID fake par erreur

---

## Checklist de validation

- [x] Build OK (`npm run build`)
- [x] Tous les mappings artificiels supprimés (CLUB_ID_MAP, COURT_ID_MAP)
- [x] Club utilise l'UUID réel: `ba43c579-e522-4b51-8542-737c2c6452bb`
- [x] Terrains utilisent les UUIDs réels (Terrain 1 et 2)
- [x] Payload d'insertion `bookings` utilise uniquement des UUIDs réels
- [x] `slot_id` reste un INTEGER (référence `time_slots.id`)
- [x] Page clubs/page.tsx mise à jour
- [x] demoData.ts mis à jour (mode démo)
- [x] Code nettoyé et simplifié
- [ ] **À TESTER:** Réservation fonctionne sans erreur 22P02
- [ ] **À TESTER:** Slots se grisent correctement après réservation
- [ ] **À TESTER:** Realtime fonctionne entre onglets

---

## Prochaines étapes

1. ✅ **Tester une réservation:**
   - Aller sur `/player/clubs/ba43c579-e522-4b51-8542-737c2c6452bb/reserver`
   - Sélectionner un créneau
   - Vérifier les logs: `[BOOKING INSERT]` doit montrer les UUIDs réels
   - Vérifier qu'aucune erreur 22P02 n'apparaît

2. ✅ **Vérifier le grisage inter-onglets:**
   - Ouvrir 2 onglets sur la page reserver
   - Réserver un créneau dans l'onglet 1
   - Vérifier que le créneau se grise immédiatement dans l'onglet 2

3. ✅ **Vérifier en DB:**
   ```sql
   SELECT 
     id,
     club_id,
     court_id,
     booking_date,
     slot_id,
     status
   FROM public.bookings
   ORDER BY created_at DESC
   LIMIT 5;
   ```
   - Vérifier que `club_id` = `ba43c579-e522-4b51-8542-737c2c6452bb`
   - Vérifier que `court_id` est `21d9a066-...` ou `6dceaf95-...`
   - Vérifier que `slot_id` est un INTEGER (1, 2, 3, ..., 10)
   - Vérifier que `booking_date` et `slot_id` ne sont PAS NULL

---

## Résumé

**Le problème était:** Le code utilisait des IDs fake ('1', '2', etc.) et des mappings artificiels (CLUB_ID_MAP, COURT_ID_MAP) qui ajoutaient de la complexité et des risques d'erreur.

**Le fix est:** Utiliser directement les UUIDs réels depuis Supabase dans toutes les parties du code:
- ✅ Club: UUID direct dans l'array `clubs`
- ✅ Terrains: Structure simple `COURT_UUIDS` (terrain_id → UUID)
- ✅ Insertion: Utilisation directe de `club.id` et `COURT_UUIDS[selectedTerrain]`
- ✅ Pas de validations regex inutiles
- ✅ Code plus simple, plus lisible, plus maintenable

**Status:** Fix appliqué, build OK, prêt pour les tests.

---

**Date:** 2026-01-22  
**Commit:** "feat: use real UUIDs from Supabase, remove all fake mappings"
