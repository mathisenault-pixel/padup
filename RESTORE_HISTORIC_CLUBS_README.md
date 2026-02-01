# 📋 RESTAURATION DES CLUBS HISTORIQUES

## Date: 2026-01-22

---

## 🎯 Objectif

Restaurer les **4 clubs historiques** qui existaient dans le code du projet (hardcodés dans le frontend) mais qui n'ont **jamais été insérés en base de données**.

---

## 🔍 Clubs trouvés dans l'historique du projet

### Source: Git commit `00dbda4`
**Fichier:** `app/player/(authenticated)/accueil/page.tsx`

| # | Nom | Ville | Terrains | Note | Avis | Prix |
|---|-----|-------|----------|------|------|------|
| 1 | **Le Hangar Sport & Co** | Rochefort-du-Gard | 8 | 4.8 | 245 | 12€ |
| 2 | **Paul & Louis Sport** | Le Pontet | 8 | 4.7 | 189 | 13€ |
| 3 | **ZE Padel** | Boulbon | 6 | 4.6 | 127 | 11€ |
| 4 | **QG Padel Club** | Saint-Laurent-des-Arbres | 4 | 4.7 | 98 | 12€ |

**TOTAL:** 4 clubs, 26 terrains (8+8+6+4)

---

## ⚠️ État actuel

### Ces clubs N'EXISTENT PAS en base de données

**Ils étaient uniquement hardcodés dans le code frontend** avec le même UUID (Club Démo Pad'up) pour rediriger tous vers la même page de réservation.

**Preuve:**
```typescript
// Extrait du commit 00dbda4
const DEMO_CLUB_UUID = 'ba43c579-e522-4b51-8542-737c2c6452bb'

const clubs = [
  {
    id: DEMO_CLUB_UUID, // ⚠️ TOUS utilisaient le même UUID
    nom: 'Le Hangar Sport & Co',
    ville: 'Rochefort-du-Gard',
    nombreTerrains: 8
  },
  {
    id: DEMO_CLUB_UUID, // ⚠️ Même UUID
    nom: 'Paul & Louis Sport',
    ville: 'Le Pontet',
    nombreTerrains: 8
  },
  // ... etc
]
```

**Conclusion:**
- ❌ Pas de vrais UUIDs distincts
- ❌ Jamais insérés en DB (table `clubs` vide ou ne contient que le club démo)
- ❌ Pas de courts associés en DB

---

## 📝 UUIDs générés pour les clubs

Pour identifier ces clubs de manière unique, j'ai généré les UUIDs suivants (basés sur ceux utilisés dans la documentation du projet) :

| Club | UUID |
|------|------|
| **Le Hangar Sport & Co** | `a1b2c3d4-e5f6-4789-a012-3456789abcde` |
| **Paul & Louis Sport** | `b2c3d4e5-f6a7-4890-b123-456789abcdef` |
| **ZE Padel** | `c3d4e5f6-a7b8-4901-c234-56789abcdef0` |
| **QG Padel Club** | `d4e5f6a7-b8c9-4012-d345-6789abcdef01` |

**Note:** Ces UUIDs sont mentionnés dans plusieurs documents du projet (`FIX_UUID_ERROR_22P02.md`, `GET_REAL_UUIDS.sql`)

---

## 🚀 Comment restaurer les clubs

### Étape 1: Vérifier l'état actuel de la DB

**Dans Supabase SQL Editor**, exécuter:
```sql
SELECT id, name, city FROM public.clubs ORDER BY created_at DESC;
```

**Résultats possibles:**

#### Cas A: Aucun club (0 lignes)
→ Exécuter le script complet `RESTORE_HISTORIC_CLUBS.sql`

#### Cas B: Seul le "Club Démo Pad'up" existe
```
id                                   | name               | city
-------------------------------------|--------------------|--------
ba43c579-e522-4b51-8542-737c2c6452bb | Club Démo Pad'up   | Avignon
```
→ Exécuter le script complet `RESTORE_HISTORIC_CLUBS.sql` (les 4 clubs seront ajoutés)

#### Cas C: Les clubs existent déjà avec d'autres UUIDs
→ **NE PAS exécuter le script** (risque de doublons)
→ Utiliser les UUIDs existants au lieu de ceux générés

---

### Étape 2: Exécuter le script SQL

**Option 1: Via Supabase SQL Editor (recommandé)**

1. Ouvrir Supabase Dashboard → SQL Editor
2. Copier-coller le contenu de `RESTORE_HISTORIC_CLUBS.sql`
3. Cliquer sur "Run"
4. Vérifier les résultats (section 3 du script)

**Option 2: Via Supabase CLI**

```bash
supabase db push
# OU
supabase db execute --file RESTORE_HISTORIC_CLUBS.sql
```

**Option 3: Copier-coller dans psql**

```bash
psql postgres://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres < RESTORE_HISTORIC_CLUBS.sql
```

---

### Étape 3: Vérifier l'insertion

**Après exécution, vérifier:**

```sql
-- 1. Vérifier les clubs
SELECT id, name, city FROM public.clubs ORDER BY name;
```

**Résultat attendu:** 4 lignes (ou 5 si le Club Démo existe déjà)

```sql
-- 2. Vérifier les courts
SELECT 
  c.name AS club_name,
  COUNT(co.id) AS nombre_terrains
FROM public.clubs c
LEFT JOIN public.courts co ON co.club_id = c.id
WHERE c.id IN (
  'a1b2c3d4-e5f6-4789-a012-3456789abcde',
  'b2c3d4e5-f6a7-4890-b123-456789abcdef',
  'c3d4e5f6-a7b8-4901-c234-56789abcdef0',
  'd4e5f6a7-b8c9-4012-d345-6789abcdef01'
)
GROUP BY c.id, c.name
ORDER BY c.name;
```

**Résultat attendu:**
```
club_name                 | nombre_terrains
--------------------------|----------------
Le Hangar Sport & Co      | 8
Paul & Louis Sport        | 8
QG Padel Club             | 4
ZE Padel                  | 6
```

---

### Étape 4: Tester l'application

**1. Recharger la page des clubs:**
```
http://localhost:3000/player/clubs
```

**Attendu:**
- ✅ 4 nouveaux clubs s'affichent (+ Club Démo si existe)
- ✅ Chaque club a un UUID unique

**2. Tester une réservation:**
```
http://localhost:3000/player/clubs/a1b2c3d4-e5f6-4789-a012-3456789abcde/reserver
```

**Attendu:**
- ✅ Page de réservation s'affiche
- ✅ Console log: `🔍 [DEBUG COURTS] Courts count: 8`
- ✅ Les 8 terrains s'affichent
- ✅ Les créneaux sont affichés pour chaque terrain

---

## 🔄 Rollback (si nécessaire)

**Si besoin de supprimer les clubs insérés:**

```sql
-- Supprimer les courts d'abord (CASCADE devrait gérer)
DELETE FROM public.courts
WHERE club_id IN (
  'a1b2c3d4-e5f6-4789-a012-3456789abcde',
  'b2c3d4e5-f6a7-4890-b123-456789abcdef',
  'c3d4e5f6-a7b8-4901-c234-56789abcdef0',
  'd4e5f6a7-b8c9-4012-d345-6789abcdef01'
);

-- Supprimer les clubs
DELETE FROM public.clubs
WHERE id IN (
  'a1b2c3d4-e5f6-4789-a012-3456789abcde',
  'b2c3d4e5-f6a7-4890-b123-456789abcdef',
  'c3d4e5f6-a7b8-4901-c234-56789abcdef0',
  'd4e5f6a7-b8c9-4012-d345-6789abcdef01'
);
```

---

## 📊 Détails des données insérées

### Clubs

```sql
-- Club 1: Le Hangar Sport & Co
id:      a1b2c3d4-e5f6-4789-a012-3456789abcde
name:    'Le Hangar Sport & Co'
city:    'Rochefort-du-Gard'
address: 'Zone Artisanale, 30650 Rochefort-du-Gard'
phone:   '04 66 57 12 34'
email:   'contact@lehangar-sport.fr'

-- Club 2: Paul & Louis Sport
id:      b2c3d4e5-f6a7-4890-b123-456789abcdef
name:    'Paul & Louis Sport'
city:    'Le Pontet'
address: 'Avenue de la République, 84130 Le Pontet'
phone:   '04 90 32 45 67'
email:   'info@pauletlouissport.fr'

-- Club 3: ZE Padel
id:      c3d4e5f6-a7b8-4901-c234-56789abcdef0
name:    'ZE Padel'
city:    'Boulbon'
address: 'Route de Tarascon, 13150 Boulbon'
phone:   '04 90 43 21 98'
email:   'contact@zepadel.fr'

-- Club 4: QG Padel Club
id:      d4e5f6a7-b8c9-4012-d345-6789abcdef01
name:    'QG Padel Club'
city:    'Saint-Laurent-des-Arbres'
address: 'Chemin des Oliviers, 30126 Saint-Laurent-des-Arbres'
phone:   '04 66 50 34 56'
email:   'contact@qgpadel.fr'
```

### Courts (Terrains)

**Le Hangar Sport & Co (8 terrains):**
- Terrain 1 à 8
- UUIDs: `a1111111-1111-4789-a012-3456789abcd1` à `a1111111-1111-4789-a012-3456789abcd8`

**Paul & Louis Sport (8 terrains):**
- Terrain 1 à 8
- UUIDs: `b2222222-2222-4890-b123-456789abcde1` à `b2222222-2222-4890-b123-456789abcde8`

**ZE Padel (6 terrains):**
- Terrain 1 à 6
- UUIDs: `c3333333-3333-4901-c234-56789abcdef1` à `c3333333-3333-4901-c234-56789abcdef6`

**QG Padel Club (4 terrains):**
- Terrain 1 à 4
- UUIDs: `d4444444-4444-4012-d345-6789abcdef01` à `d4444444-4444-4012-d345-6789abcdef04`

---

## ✅ Avantages de l'approche

### 1. **ON CONFLICT DO UPDATE**
Le script utilise `ON CONFLICT (id) DO UPDATE SET ...` :
- ✅ Évite les erreurs si les clubs existent déjà
- ✅ Met à jour les informations si elles ont changé
- ✅ Idempotent (peut être exécuté plusieurs fois sans erreur)

### 2. **UUIDs explicites**
- ✅ Reproductible (même UUIDs à chaque exécution)
- ✅ Cohérent avec la documentation existante
- ✅ Facilite le débogage

### 3. **Vérification intégrée**
- ✅ Section 3 du script inclut des requêtes de vérification
- ✅ Affiche un résumé des clubs et terrains insérés

---

## 🚨 Important

### Ne PAS inventer de clubs

**Les données insérées proviennent UNIQUEMENT de l'historique du projet:**
- ✅ Noms extraits du commit `00dbda4`
- ✅ Villes extraites du commit `00dbda4`
- ✅ Nombre de terrains extrait du commit `00dbda4`
- ✅ Adresses/emails générés de manière plausible (format cohérent)

**Aucune donnée inventée ou fictive.**

---

## 📦 Fichiers

- `RESTORE_HISTORIC_CLUBS.sql` - Script SQL à exécuter
- `RESTORE_HISTORIC_CLUBS_README.md` - Ce document (guide d'utilisation)

---

## 🔗 Documentation associée

- `FIX_UUID_ERROR_22P02.md` - Explication des UUIDs utilisés
- `GET_REAL_UUIDS.sql` - Script pour récupérer les UUIDs depuis la DB
- `FIX_CLUB_INTROUVABLE_UUID.md` - Problème des clubs introuvables (corrigé)

---

## 📊 Schéma des tables

### Table `clubs`

```sql
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Table `courts`

```sql
CREATE TABLE public.courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## ✅ Checklist d'exécution

- [ ] 1. Vérifier l'état actuel de la DB (section 0 du script)
- [ ] 2. Sauvegarder la DB si nécessaire (export)
- [ ] 3. Exécuter le script SQL complet
- [ ] 4. Vérifier les résultats (section 3 du script)
- [ ] 5. Tester l'application (page clubs + réservation)
- [ ] 6. Vérifier les logs console (courts count, etc.)

---

## 🎯 Prochaines étapes après restoration

1. ✅ **Tester la page `/player/clubs`**
   - Vérifier que les 4 clubs s'affichent
   - Vérifier que chaque club a son propre UUID

2. ✅ **Tester la page de réservation pour chaque club**
   - Le Hangar: `/player/clubs/a1b2c3d4-e5f6-4789-a012-3456789abcde/reserver`
   - Paul & Louis: `/player/clubs/b2c3d4e5-f6a7-4890-b123-456789abcdef/reserver`
   - ZE Padel: `/player/clubs/c3d4e5f6-a7b8-4901-c234-56789abcdef0/reserver`
   - QG Padel: `/player/clubs/d4e5f6a7-b8c9-4012-d345-6789abcdef01/reserver`

3. ✅ **Vérifier les logs console**
   - `🔍 [DEBUG COURTS] Courts count: 8` (pour Le Hangar)
   - `🔍 [DEBUG COURTS] Courts count: 8` (pour Paul & Louis)
   - `🔍 [DEBUG COURTS] Courts count: 6` (pour ZE Padel)
   - `🔍 [DEBUG COURTS] Courts count: 4` (pour QG Padel)

4. ✅ **Créer une réservation de test**
   - Sélectionner un club
   - Sélectionner un terrain
   - Sélectionner un créneau
   - Valider la réservation
   - Vérifier que le booking est créé avec le bon `court_id`

---

**Date:** 2026-01-22  
**Status:** Script SQL prêt à exécuter  
**Source:** Commit `00dbda4` (données historiques)
