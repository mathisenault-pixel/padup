# 🔍 DEBUG: "Aucun terrain disponible"

## Date: 2026-01-22
## Commit: `aa0c60f`

---

## Problème

L'écran `/player/clubs/[clubId]/reserver` affiche:

```
⚠️ Aucun terrain disponible
Les réservations ne sont pas disponibles pour ce club actuellement.
```

**Cause possible:**
- Les courts n'existent pas en DB pour ce club
- Erreur lors du chargement des courts (RLS, query, etc.)
- `courts.length === 0` après le fetch

---

## Logs de debug ajoutés

### 1. 🔍 COURTS Loading

**Logs attendus:**
```
🔍 [DEBUG COURTS] START Loading courts from Supabase
🔍 [DEBUG COURTS] Club ID: ba43c579-e522-4b51-8542-737c2c6452bb
🔍 [DEBUG COURTS] Query: from("courts").select("*").eq("club_id", club.id)
✅ [DEBUG COURTS] Query successful
✅ [DEBUG COURTS] Courts count: 2
✅ [DEBUG COURTS] Raw data: [
  {
    "id": "21d09a66-b7db-4966-abf1-cc210f7476c1",
    "club_id": "ba43c579-e522-4b51-8542-737c2c6452bb",
    "name": "Terrain 1",
    "court_type": "Indoor",
    "created_at": "2024-01-01T00:00:00Z"
  },
  {
    "id": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
    "club_id": "ba43c579-e522-4b51-8542-737c2c6452bb",
    "name": "Terrain 2",
    "court_type": "Outdoor",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
✅ [DEBUG COURTS] Court 1: {
  id: "21d09a66-b7db-4966-abf1-cc210f7476c1",
  name: "Terrain 1",
  court_type: "Indoor"
}
✅ [DEBUG COURTS] Court 2: {
  id: "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
  name: "Terrain 2",
  court_type: "Outdoor"
}
✅ [DEBUG COURTS] Formatted courts: 2 courts
✅ [DEBUG COURTS] Auto-selecting first court (terrain id: 1)
```

**Si erreur:**
```
❌ [DEBUG COURTS] Error loading courts: {...}
❌ [DEBUG COURTS] Error message: permission denied for table courts
❌ [DEBUG COURTS] Error details: {...}
```

---

### 2. 🔍 TIME_SLOTS Loading

**Logs attendus:**
```
🔍 [DEBUG SLOTS] START Loading time_slots from Supabase
🔍 [DEBUG SLOTS] Query: from("time_slots").select("*").order("start_time")
✅ [DEBUG SLOTS] Query successful
✅ [DEBUG SLOTS] Time slots count: 10
✅ [DEBUG SLOTS] Raw data (first 3): [
  { id: 1, start_time: "08:00:00", end_time: "09:30:00", duration_minutes: 90, label: "08:00 - 09:30" },
  { id: 2, start_time: "09:30:00", end_time: "11:00:00", duration_minutes: 90, label: "09:30 - 11:00" },
  { id: 3, start_time: "11:00:00", end_time: "12:30:00", duration_minutes: 90, label: "11:00 - 12:30" }
]
✅ [DEBUG SLOTS] Full data: [...]
```

**Si erreur:**
```
❌ [DEBUG SLOTS] Error loading time_slots: {...}
❌ [DEBUG SLOTS] Error message: relation "time_slots" does not exist
❌ [DEBUG SLOTS] Error details: {...}
```

---

### 3. 🔍 BOOKINGS Loading

**Logs attendus:**
```
🔍 [DEBUG BOOKINGS] START Loading bookings
🔍 [DEBUG BOOKINGS] Court IDs: ["21d09a66-b7db-4966-abf1-cc210f7476c1", "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e"]
🔍 [DEBUG BOOKINGS] Booking date: 2026-01-23
🔍 [DEBUG BOOKINGS] Query: from("bookings").select(...).in("court_id", courtIds).eq("booking_date", date).eq("status", "confirmed")
✅ [DEBUG BOOKINGS] Query successful
✅ [DEBUG BOOKINGS] Bookings count: 3
✅ [DEBUG BOOKINGS] Raw data: [
  {
    "id": "booking-uuid-1",
    "court_id": "21d09a66-b7db-4966-abf1-cc210f7476c1",
    "booking_date": "2026-01-23",
    "slot_id": 5,
    "status": "confirmed"
  },
  ...
]
✅ [DEBUG BOOKINGS] Key example: court_id=21d09a66-b7db-4966-abf1-cc210f7476c1, slot_id=5
✅ [DEBUG BOOKINGS] Total booked slots: 3
✅ [DEBUG BOOKINGS] Booked by court: {
  "21d09a66-b7db-4966-abf1-cc210f7476c1": [5, 6],
  "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e": [3]
}
```

**Si aucune réservation (normal):**
```
✅ [DEBUG BOOKINGS] Bookings count: 0
✅ [DEBUG BOOKINGS] Raw data: []
✅ [DEBUG BOOKINGS] Total booked slots: 0
✅ [DEBUG BOOKINGS] Booked by court: {}
```

---

## Message d'erreur amélioré

**Si `courts.length === 0`:**

```
⚠️ Aucun terrain disponible

Aucun terrain n'a été trouvé pour ce club dans la base de données.

🔍 Debug Info:
• Club ID: ba43c579-e522-4b51-8542-737c2c6452bb
• Query: from("courts").eq("club_id", ...)
• Résultat: 0 terrains

→ Vérifier que les courts existent en DB pour ce club
```

---

## Checklist de debugging

### Étape 1: Ouvrir la page et vérifier les logs

1. **Ouvrir:** `http://localhost:3000/player/clubs/ba43c579-e522-4b51-8542-737c2c6452bb/reserver`
2. **Ouvrir DevTools:** F12 → Console
3. **Vérifier les logs de chargement**

**Ce qu'on doit voir:**
- [ ] `🔍 [DEBUG COURTS] START Loading courts`
- [ ] `✅ [DEBUG COURTS] Courts count: X`
- [ ] `🔍 [DEBUG SLOTS] START Loading time_slots`
- [ ] `✅ [DEBUG SLOTS] Time slots count: Y`
- [ ] `🔍 [DEBUG BOOKINGS] START Loading bookings`
- [ ] `✅ [DEBUG BOOKINGS] Bookings count: Z`

---

### Étape 2: Analyser les résultats

#### Cas 1: Courts count = 0

**Symptôme:**
```
✅ [DEBUG COURTS] Courts count: 0
✅ [DEBUG COURTS] Raw data: []
```

**Cause:** Les courts n'existent pas en DB pour ce club.

**Solution:**
1. Vérifier en DB:
   ```sql
   SELECT * FROM public.courts WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb';
   ```

2. Si résultat vide → créer les courts:
   ```sql
   INSERT INTO public.courts (id, club_id, name, court_type, created_at) VALUES
     ('21d09a66-b7db-4966-abf1-cc210f7476c1', 'ba43c579-e522-4b51-8542-737c2c6452bb', 'Terrain 1', 'Indoor', NOW()),
     ('6dceaf95-80dd-4fcf-b401-7d4c937f6e9e', 'ba43c579-e522-4b51-8542-737c2c6452bb', 'Terrain 2', 'Outdoor', NOW());
   ```

3. Rafraîchir la page → vérifier que courts count > 0

---

#### Cas 2: Erreur lors du chargement courts

**Symptôme:**
```
❌ [DEBUG COURTS] Error loading courts: {...}
❌ [DEBUG COURTS] Error message: permission denied for table courts
```

**Cause:** RLS policy manquante ou incorrecte.

**Solution:**
1. Vérifier les RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'courts';
   ```

2. Appliquer migration 019 si manquante:
   ```sql
   -- Migration 019: RLS public read
   CREATE POLICY "mvp_read_courts"
   ON public.courts
   FOR SELECT
   TO anon, authenticated
   USING (true);
   ```

3. Rafraîchir la page → vérifier que l'erreur disparaît

---

#### Cas 3: Time slots count = 0

**Symptôme:**
```
✅ [DEBUG SLOTS] Time slots count: 0
✅ [DEBUG SLOTS] Raw data: []
```

**Cause:** Table `time_slots` vide.

**Solution:**
1. Vérifier en DB:
   ```sql
   SELECT * FROM public.time_slots ORDER BY start_time;
   ```

2. Si vide → exécuter migration 018 (fixed time slots model)

---

#### Cas 4: Tout charge correctement mais affiche "Aucun terrain disponible"

**Symptôme:**
```
✅ [DEBUG COURTS] Courts count: 2
✅ [DEBUG SLOTS] Time slots count: 10
```

**Mais UI affiche:** "Aucun terrain disponible"

**Cause:** Bug dans le code de rendu.

**Solution:**
1. Vérifier que `courts` state est bien mis à jour
2. Ajouter log dans le render:
   ```javascript
   console.log('[RENDER] courts.length:', courts.length)
   console.log('[RENDER] isLoadingCourts:', isLoadingCourts)
   ```

---

## SQL Queries de vérification

### Vérifier les courts du club démo

```sql
SELECT 
  id, 
  club_id, 
  name, 
  court_type,
  created_at
FROM public.courts
WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'
ORDER BY name;
```

**Résultat attendu:**
```
id                                   | club_id                              | name       | court_type | created_at
-------------------------------------|--------------------------------------|------------|------------|---------------------------
21d09a66-b7db-4966-abf1-cc210f7476c1 | ba43c579-e522-4b51-8542-737c2c6452bb | Terrain 1  | Indoor     | 2024-01-01 00:00:00+00
6dceaf95-80dd-4fcf-b401-7d4c937f6e9e | ba43c579-e522-4b51-8542-737c2c6452bb | Terrain 2  | Outdoor    | 2024-01-01 00:00:00+00
```

**Si 0 lignes:**
→ Créer les courts (voir INSERT ci-dessus)

---

### Vérifier les time_slots

```sql
SELECT 
  id, 
  start_time, 
  end_time, 
  duration_minutes,
  label
FROM public.time_slots
ORDER BY start_time
LIMIT 5;
```

**Résultat attendu:**
```
id | start_time | end_time | duration_minutes | label
---|------------|----------|------------------|---------------
 1 | 08:00:00   | 09:30:00 | 90               | 08:00 - 09:30
 2 | 09:30:00   | 11:00:00 | 90               | 09:30 - 11:00
 3 | 11:00:00   | 12:30:00 | 90               | 11:00 - 12:30
 4 | 12:30:00   | 14:00:00 | 90               | 12:30 - 14:00
 5 | 14:00:00   | 15:30:00 | 90               | 14:00 - 15:30
```

**Si 0 lignes:**
→ Exécuter migration 018

---

### Vérifier les RLS policies

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('courts', 'time_slots')
ORDER BY tablename, policyname;
```

**Résultat attendu:**
```
schemaname | tablename  | policyname        | roles                  | cmd    | qual
-----------|------------|-------------------|------------------------|--------|------
public     | courts     | mvp_read_courts   | {anon,authenticated}   | SELECT | true
public     | time_slots | mvp_read_time_slots | {anon,authenticated} | SELECT | true
```

**Si manquant:**
→ Appliquer migration 019

---

## Retirer les logs de debug (après fix)

**Une fois le problème identifié et corrigé:**

1. **Rechercher tous les logs de debug:**
   ```bash
   grep -n "DEBUG COURTS\|DEBUG SLOTS\|DEBUG BOOKINGS" app/player/(authenticated)/clubs/[id]/reserver/page.tsx
   ```

2. **Supprimer ou commenter les lignes avec:**
   - `🔍 [DEBUG ...`
   - `✅ [DEBUG ...`
   - `❌ [DEBUG ...`

3. **Garder uniquement les logs essentiels:**
   - `[COURTS] Loading courts...`
   - `[COURTS] ✅ Loaded: X courts`
   - `[SLOTS] Loaded: Y slots`
   - `[BOOKINGS] fetched count: Z`

4. **Build + commit:**
   ```bash
   npm run build
   git add -A
   git commit -m "chore: remove debug logs for courts/slots/bookings loading"
   ```

---

## Résumé des modifications

### Fichier modifié
`app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

### Changements
1. **Courts loading:**
   - Changé `.select('id, name, court_type')` → `.select('*')`
   - Ajouté logs détaillés avec 🔍, ✅, ❌
   - Ajouté log pour chaque court transformé

2. **Time slots loading:**
   - Ajouté logs détaillés
   - Log des 3 premiers slots en exemple
   - Log de la data complète

3. **Bookings loading:**
   - Ajouté logs pour court IDs et date
   - Log des clés générées (court_id + slot_id)
   - Log du total de slots réservés

4. **Message d'erreur:**
   - Amélioré pour afficher Club ID, query, et résultat
   - Ajouté suggestion de vérifier la DB

---

## Build Status

✅ **Build OK** - Pas d'erreurs TypeScript

---

## Prochaines étapes

1. **Ouvrir la page de réservation**
2. **Vérifier les logs dans la console**
3. **Identifier le problème:**
   - Courts count = 0 → Créer les courts en DB
   - Error message → Fixer RLS policies
   - Slots count = 0 → Exécuter migration 018
4. **Appliquer la solution**
5. **Retirer les logs de debug**
6. **Commit les changements**

---

**Date:** 2026-01-22  
**Status:** Debug logs actifs, prêt pour investigation  
**Commit:** `aa0c60f`
