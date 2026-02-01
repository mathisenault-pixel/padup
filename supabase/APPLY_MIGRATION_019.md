# Application de la Migration 019 - RLS Public Read Policies

## Migration créée

**Fichier:** `supabase/migrations/019_mvp_public_read_policies.sql`

**Objectif:** Permettre la lecture publique (anon et authenticated) des tables:
- `public.clubs`
- `public.courts`
- `public.time_slots`

---

## Option 1: SQL Editor Supabase (RECOMMANDÉ)

### Étapes

1. **Aller sur le Dashboard Supabase:**
   ```
   https://supabase.com/dashboard/project/eohioutmqfqdehfxgjgv
   ```

2. **Ouvrir le SQL Editor:**
   - Menu latéral gauche: `SQL Editor`
   - Ou: `https://supabase.com/dashboard/project/eohioutmqfqdehfxgjgv/sql/new`

3. **Copier-coller le contenu de `019_mvp_public_read_policies.sql`:**

```sql
-- ===== MVP : lecture publique clubs / courts / time_slots =====

-- CLUBS
alter table public.clubs enable row level security;
drop policy if exists "mvp_read_clubs" on public.clubs;
create policy "mvp_read_clubs"
on public.clubs
for select
to anon, authenticated
using (true);

-- COURTS
alter table public.courts enable row level security;
drop policy if exists "mvp_read_courts" on public.courts;
create policy "mvp_read_courts"
on public.courts
for select
to anon, authenticated
using (true);

-- TIME SLOTS
alter table public.time_slots enable row level security;
drop policy if exists "mvp_read_time_slots" on public.time_slots;
create policy "mvp_read_time_slots"
on public.time_slots
for select
to anon, authenticated
using (true);
```

4. **Cliquer sur "Run" (en bas à droite)**

5. **Vérifier le succès:**
   - Résultat: "Success. No rows returned"
   - Ou: "3 statements executed successfully"

---

## Option 2: Supabase CLI (AVANCÉ)

### Prérequis

```bash
npm install -g supabase
```

### Étapes

1. **Lier le projet Supabase:**

```bash
cd /Users/mathisenault/Desktop/padup.one
supabase link --project-ref eohioutmqfqdehfxgjgv
```

Vous serez invité à entrer votre Database Password Supabase.

2. **Appliquer les migrations:**

```bash
supabase db push
```

3. **Vérifier:**

```bash
supabase db diff
```

Si tout est appliqué, la sortie devrait être vide.

---

## Option 3: Script Node.js (ALTERNATIF)

### Créer `scripts/apply-migration-019.js`

```javascript
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ Service role key required

const supabase = createClient(supabaseUrl, supabaseKey)

const migrationPath = path.join(__dirname, '../supabase/migrations/019_mvp_public_read_policies.sql')
const sql = fs.readFileSync(migrationPath, 'utf8')

async function applyMigration() {
  console.log('Applying migration 019...')
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
  
  if (error) {
    console.error('❌ Error applying migration:', error)
    process.exit(1)
  }
  
  console.log('✅ Migration 019 applied successfully')
}

applyMigration()
```

**⚠️ Note:** Cette option nécessite la `SUPABASE_SERVICE_ROLE_KEY` (clé admin).

---

## Vérification des Policies

### Via SQL Editor

Après avoir appliqué la migration, exécuter:

```sql
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  roles, 
  cmd, 
  qual
FROM pg_policies
WHERE tablename IN ('clubs', 'courts', 'time_slots')
ORDER BY tablename, policyname;
```

**Résultat attendu:**

| schemaname | tablename | policyname | roles | cmd | qual |
|------------|-----------|------------|-------|-----|------|
| public | clubs | mvp_read_clubs | {anon,authenticated} | SELECT | true |
| public | courts | mvp_read_courts | {anon,authenticated} | SELECT | true |
| public | time_slots | mvp_read_time_slots | {anon,authenticated} | SELECT | true |

---

### Via Dashboard Supabase

1. **Aller sur Authentication > Policies:**
   ```
   https://supabase.com/dashboard/project/eohioutmqfqdehfxgjgv/auth/policies
   ```

2. **Vérifier que les policies suivantes existent:**
   - Table `clubs`: Policy `mvp_read_clubs` (SELECT, anon + authenticated)
   - Table `courts`: Policy `mvp_read_courts` (SELECT, anon + authenticated)
   - Table `time_slots`: Policy `mvp_read_time_slots` (SELECT, anon + authenticated)

---

## Test de Vérification

### Test 1: Lecture publique clubs (anon)

**Requête dans SQL Editor:**

```sql
-- Simuler anon role
SET ROLE anon;

SELECT id, name, city 
FROM public.clubs 
ORDER BY created_at DESC;

-- Reset role
RESET ROLE;
```

**Résultat attendu:**
```
id                                   | name              | city
-------------------------------------|-------------------|----------
ba43c579-e522-4b51-8542-737c2c6452bb | Club Démo Pad'up  | Avignon
```

---

### Test 2: Lecture publique courts (anon)

```sql
SET ROLE anon;

SELECT id, name, club_id
FROM public.courts
WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'
ORDER BY name;

RESET ROLE;
```

**Résultat attendu:**
```
id                                   | name       | club_id
-------------------------------------|------------|--------------------------------------
21d9a066-b7db-4966-abf1-cc210f7476c1 | Terrain 1  | ba43c579-e522-4b51-8542-737c2c6452bb
6dceaf95-80dd-4fcf-b401-7d4c937f6e9e | Terrain 2  | ba43c579-e522-4b51-8542-737c2c6452bb
```

---

### Test 3: Lecture publique time_slots (anon)

```sql
SET ROLE anon;

SELECT id, start_time, end_time, duration_minutes
FROM public.time_slots
ORDER BY start_time
LIMIT 3;

RESET ROLE;
```

**Résultat attendu:**
```
id | start_time | end_time | duration_minutes
---|------------|----------|------------------
 1 | 08:00:00   | 09:30:00 | 90
 2 | 09:30:00   | 11:00:00 | 90
 3 | 11:00:00   | 12:30:00 | 90
```

---

### Test 4: Via API REST (Postman / curl)

**Sans authentification (anon):**

```bash
curl https://eohioutmqfqdehfxgjgv.supabase.co/rest/v1/clubs?select=id,name,city \
  -H "apikey: sb_publishable_DPbd7Ljqm51VX5_Z8ctQLw_vrbgFuX0" \
  -H "Authorization: Bearer sb_publishable_DPbd7Ljqm51VX5_Z8ctQLw_vrbgFuX0"
```

**Résultat attendu:**
```json
[
  {
    "id": "ba43c579-e522-4b51-8542-737c2c6452bb",
    "name": "Club Démo Pad'up",
    "city": "Avignon"
  }
]
```

**Vérification:** Status `200 OK` (pas `403 Forbidden`)

---

### Test 5: Frontend (Navigation privée)

1. **Ouvrir mode privé / incognito**
2. **Aller sur:** `http://localhost:3000/player/clubs`
3. **Ouvrir DevTools Console**
4. **Chercher:** `[CLUBS] ✅ Clubs loaded: 1 clubs`

**Résultat attendu:**
- ✅ Pas d'erreur `403` dans Network
- ✅ Logs `[CLUBS] ✅ Clubs loaded: 1 clubs`
- ✅ Le club s'affiche dans l'UI

---

## Anciennes Policies (Nettoyage)

### Vérifier si anciennes policies existent

```sql
SELECT policyname 
FROM pg_policies 
WHERE tablename IN ('clubs', 'courts', 'time_slots')
  AND policyname NOT LIKE 'mvp_%';
```

Si des policies anciennes existent (ex: `public_read_clubs` de migration 014), elles seront remplacées par les nouvelles `mvp_*` policies.

---

### Supprimer manuellement si besoin

```sql
-- Si anciennes policies existent encore
DROP POLICY IF EXISTS "public_read_clubs" ON public.clubs;
DROP POLICY IF EXISTS "public_read_courts" ON public.courts;
DROP POLICY IF EXISTS "public_read_time_slots" ON public.time_slots;
```

(Ces `DROP POLICY IF EXISTS` sont déjà dans la migration 019, donc normalement pas nécessaire.)

---

## Impact sur l'Application

### Avant (si RLS bloquait)

**Erreur possible:**
```
Error loading clubs: {
  code: "42501",
  message: "new row violates row-level security policy for table 'clubs'"
}
```

**Console Frontend:**
```
[CLUBS] Error loading clubs: {...}
[CLUBS] ✅ Clubs loaded: 0 clubs
```

---

### Après (RLS public activé)

**Console Frontend:**
```
[CLUBS] Loading clubs from Supabase...
[CLUBS] Query: from("clubs").select("id,name,city").order("created_at",{ascending:false})
[CLUBS] ✅ Clubs loaded: 1 clubs
[CLUBS] Data: [
  {
    id: 'ba43c579-e522-4b51-8542-737c2c6452bb',
    name: 'Club Démo Pad\'up',
    city: 'Avignon'
  }
]
```

**UI:**
- ✅ Affichage de la liste des clubs
- ✅ Pas de message "Aucun club trouvé"
- ✅ Même résultat connecté ou déconnecté

---

## Troubleshooting

### Erreur: "permission denied for table clubs"

**Cause:** RLS est activé mais aucune policy ne permet la lecture.

**Solution:** Appliquer la migration 019.

---

### Erreur: "policy already exists"

**Cause:** Policy avec le même nom existe déjà.

**Solution:** La migration utilise `DROP POLICY IF EXISTS` avant `CREATE POLICY`, donc cette erreur ne devrait pas arriver. Si elle arrive quand même:

```sql
DROP POLICY "mvp_read_clubs" ON public.clubs;
DROP POLICY "mvp_read_courts" ON public.courts;
DROP POLICY "mvp_read_time_slots" ON public.time_slots;
```

Puis ré-exécuter la migration.

---

### Vérifier si RLS est activé

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('clubs', 'courts', 'time_slots');
```

**Résultat attendu:**

| schemaname | tablename | rowsecurity |
|------------|-----------|-------------|
| public | clubs | true |
| public | courts | true |
| public | time_slots | true |

---

## Rollback (si nécessaire)

### Désactiver les policies

```sql
DROP POLICY IF EXISTS "mvp_read_clubs" ON public.clubs;
DROP POLICY IF EXISTS "mvp_read_courts" ON public.courts;
DROP POLICY IF EXISTS "mvp_read_time_slots" ON public.time_slots;
```

### Désactiver RLS complètement (⚠️ NON RECOMMANDÉ EN PROD)

```sql
ALTER TABLE public.clubs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots DISABLE ROW LEVEL SECURITY;
```

**⚠️ Attention:** Désactiver RLS expose toutes les données. À utiliser uniquement en développement local.

---

## Prochaines Étapes (Sécurité Future)

### Pour INSERT/UPDATE/DELETE sur clubs (gestion club)

```sql
-- Exemple: Seul le propriétaire peut modifier son club
CREATE POLICY "owner_update_club"
ON public.clubs
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);
```

### Pour bookings (réservations)

**Lecture publique** (pour griser créneaux):
```sql
CREATE POLICY "public_read_bookings"
ON public.bookings
FOR SELECT
TO anon, authenticated
USING (true);
```

**Création** (seulement authenticated):
```sql
CREATE POLICY "authenticated_create_booking"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);
```

---

## Commit de la Migration

La migration est déjà commitée dans:

```
supabase/migrations/019_mvp_public_read_policies.sql
```

Pour l'appliquer en production, utiliser **Option 1** (SQL Editor) ou **Option 2** (CLI).

---

**Date:** 2026-01-22  
**Status:** Migration créée, prête à appliquer  
**Recommandation:** Utiliser **Option 1 (SQL Editor)** pour application immédiate
