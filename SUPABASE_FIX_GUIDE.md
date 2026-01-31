# 🔧 GUIDE COMPLET - Corriger l'erreur PGST205

**Erreur actuelle** : `"Could not find table public.reservations (PGST205)"`

---

## ✅ ÉTAPE 1 : EXÉCUTER LE SQL DANS SUPABASE

### Ouvrir Supabase SQL Editor
1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet : `eohioutmqfqdehfxgjgv`
3. Menu gauche → **SQL Editor**
4. Cliquer sur **New query**

### Copier-coller le contenu du fichier
📁 Fichier : `supabase/fix_reservations_table.sql`

Ou copie directement :

```sql
-- 🔧 FIX DÉFINITIF - Table reservations
DROP TABLE IF EXISTS public.reservations CASCADE;

CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL,
  court_id uuid NOT NULL,
  slot_start timestamptz NOT NULL,
  fin_de_slot timestamptz NOT NULL,
  cree_par uuid NOT NULL,
  statut text NOT NULL DEFAULT 'confirmé',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(court_id, slot_start)
);

CREATE INDEX idx_reservations_court_id ON public.reservations(court_id);
CREATE INDEX idx_reservations_slot_start ON public.reservations(slot_start);
CREATE INDEX idx_reservations_club_id ON public.reservations(club_id);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_reservations" ON public.reservations;
DROP POLICY IF EXISTS "player_insert_reservation" ON public.reservations;

CREATE POLICY "public_read_reservations"
ON public.reservations FOR SELECT USING (true);

CREATE POLICY "player_insert_reservation"
ON public.reservations FOR INSERT
WITH CHECK (auth.uid() = cree_par);

INSERT INTO public.reservations (
  club_id, court_id, slot_start, fin_de_slot, cree_par, statut
) VALUES (
  'ba43c579-e522-4b51-8542-737c2c6452bb',
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e',
  '2026-01-28 17:00:00+01',
  '2026-01-28 17:30:00+01',
  'cee11521-8f13-4157-8057-034adf2cb9a0',
  'confirmé'
) ON CONFLICT (court_id, slot_start) DO NOTHING;

SELECT 
  'reservations' as table_name,
  COUNT(*) as total_reservations,
  COUNT(*) FILTER (WHERE slot_start >= NOW()) as futures
FROM public.reservations;
```

### Cliquer sur RUN (bouton en bas à droite)

**Résultat attendu** :
```
| table_name   | total_reservations | futures |
|--------------|-------------------|---------|
| reservations | 1                 | 1       |
```

✅ Si tu vois ça, la table est créée !

---

## ✅ ÉTAPE 2 : VÉRIFIER QUE LE SCHÉMA public EST EXPOSÉ

### Ouvrir Settings > API
1. Menu gauche → **Settings** (icône ⚙️)
2. Sous-menu → **API**
3. Section **Schema** (tout en bas)

### Vérifier
```
Schemas exposed to PostgREST:
☑ public
```

✅ La case `public` DOIT être cochée.

Si elle n'est pas cochée :
1. Coche `public`
2. Clique sur **Save**
3. Attends 10 secondes (refresh du schema cache)

---

## ✅ ÉTAPE 3 : VÉRIFIER LA CONFIGURATION

### Variables d'environnement
📁 Fichier : `.env.local`

**Doit contenir EXACTEMENT** :
```bash
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://eohioutmqfqdehfxgjgv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_DPbd7Ljqm51VX5_Z8ctQLw_vrbgFuX0
```

⚠️ AUCUNE autre ligne demo/fake/test

✅ **Déjà correct dans ton projet !**

---

## ✅ ÉTAPE 4 : VÉRIFIER LE CODE (déjà corrigé)

### `app/(public)/availability/page.tsx`
✅ Utilise maintenant :
```typescript
.from("reservations")
.select("slot_start, fin_de_slot")
.eq("court_id", courtId)  // ← CORRIGÉ (avant: identifiant_du_tribunal)
.eq("statut", "confirmé")
```

### `app/api/bookings/route.ts`
✅ Utilise maintenant :
```typescript
.from("reservations").insert([{
  club_id: clubId,
  court_id: courtId,        // ← CORRIGÉ
  slot_start: slotStart,
  fin_de_slot: slotEnd,
  cree_par: createdBy,      // ← CORRIGÉ (avant: créé_par)
  statut: "confirmé",
}])
```

---

## ✅ ÉTAPE 5 : REDÉMARRER LE SERVEUR

Le serveur a déjà été redémarré automatiquement !

**Vérifier qu'il tourne** :
```bash
lsof -i :3000 | grep LISTEN
# Doit afficher : node ... TCP *:hbci (LISTEN)
```

✅ **Serveur actif sur http://localhost:3000**

---

## ✅ ÉTAPE 6 : TESTER

### 1. Ouvrir la page
```
http://localhost:3000/availability
```

### 2. Ouvrir la console navigateur (DevTools)
`Cmd+Option+J` (Mac) ou `F12` (Windows)

### 3. Résultats attendus

**Console** :
```
[SUPABASE SUCCESS - loadBooked] { count: 1, data: [...] }
```

**UI** :
- Créneau **17:00 - 17:30** : 🔴 **"Occupé"** (grisé, non cliquable)
- Autres créneaux : 🟢 **"Libre"** (cliquables)

### 4. Tester une réservation
Clique sur un créneau libre (ex: 10:00 - 10:30)

**Console** :
```
[SUPABASE SUCCESS - POST /api/bookings] { slotStart: "...", slotEnd: "..." }
```

**UI** : `"Réservation OK ✅"`

### 5. Recharger la page
Le créneau que tu viens de réserver doit maintenant être "Occupé".

---

## 🚨 SI ERREUR PERSISTE

### Erreur : "Could not find table..."

**Vérifier dans Supabase SQL Editor** :
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

La table `reservations` doit apparaître dans la liste.

### Erreur : "new row violates row-level security policy"

**Tu n'es pas authentifié**. Deux solutions :

**Solution rapide (DEV)** : Désactiver temporairement RLS sur INSERT
```sql
DROP POLICY IF EXISTS "player_insert_reservation" ON public.reservations;

CREATE POLICY "player_insert_reservation"
ON public.reservations FOR INSERT
WITH CHECK (true);  -- ← Autorise tout le monde (DEV ONLY)
```

**Solution PROD** : Implémenter l'authentification Supabase et passer `auth.uid()` en tant que `createdBy`.

### Erreur : "column ... does not exist"

Les noms de colonnes ont été corrigés :
- ❌ `identifiant_du_tribunal` → ✅ `court_id`
- ❌ `créé_par` → ✅ `cree_par`

Si tu as encore cette erreur, vérifie que les fichiers ont bien été sauvegardés.

---

## 📊 CHECKLIST FINALE

- [ ] 1️⃣ SQL exécuté dans Supabase (voir résultat `reservations | 1 | 1`)
- [ ] 2️⃣ Schéma `public` exposé dans Settings > API
- [ ] 3️⃣ Variables `.env.local` correctes (déjà OK)
- [ ] 4️⃣ Code corrigé : `court_id`, `cree_par` (déjà OK)
- [ ] 5️⃣ Serveur redémarré (déjà OK)
- [ ] 6️⃣ Page `/availability` testée
- [ ] 7️⃣ Console affiche `[SUPABASE SUCCESS - loadBooked]`
- [ ] 8️⃣ Créneau 17:00-17:30 affiché "Occupé"

---

## 🎯 RÉSULTAT FINAL ATTENDU

✅ Plus aucune erreur PGST205  
✅ Les créneaux réservés s'affichent "Occupé"  
✅ On peut réserver de nouveaux créneaux  
✅ Les logs console sont clairs  

**Status** : Code corrigé ✅ | SQL fourni ✅ | Serveur redémarré ✅

**À faire** : Exécuter le SQL dans Supabase (étape 1)
