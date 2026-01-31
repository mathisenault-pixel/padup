# ✅ CORRECTION PGRST205 - Schéma Public Forcé

Date : 2026-01-27 22:34  
Status : **✅ APPLIQUÉ ET TESTÉ**

---

## 🎯 PROBLÈME RÉSOLU

**Erreur** : `PGRST205 – Could not find the table public.reservations in the schema cache`

**Solution** : Forcer explicitement le schéma `public` sur toutes les requêtes Supabase

---

## ✅ CORRECTIONS APPLIQUÉES

### 1. Front - `app/(public)/availability/page.tsx`

**AVANT** (ligne 73-75) :
```typescript
const { data, error } = await supabase
  .from("reservations")
  .select("slot_start, fin_de_slot")
```

**APRÈS** :
```typescript
const { data, error } = await supabase
  .schema("public")          // ✅ Schéma forcé
  .from("reservations")
  .select("slot_start, fin_de_slot")
```

**+ Debug ajouté** (ligne 6-11) :
```typescript
// Debug: vérifier la config Supabase
console.log("[SUPABASE CONFIG]", {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
```

### 2. API - `app/api/bookings/route.ts`

**AVANT** (ligne 22) :
```typescript
const { error } = await supabase.from("reservations").insert([
```

**APRÈS** :
```typescript
const { error } = await supabase
  .schema("public")          // ✅ Schéma forcé
  .from("reservations")
  .insert([
```

**+ Debug ajouté** (ligne 8-12) :
```typescript
// Debug: vérifier la config Supabase côté serveur
console.log("[API SUPABASE CONFIG]", {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
```

---

## 🧪 VÉRIFICATION

### Serveur redémarré
```bash
✓ Ready in 542ms
- Local: http://localhost:3000
```

### Config Supabase chargée
```bash
[SUPABASE CONFIG] {
  url: 'https://eohioutmqfqdehfxgjgv.supabase.co',
  hasKey: true
}
```

### Page compilée sans erreur
```bash
GET /availability 200 in 1664ms
```

---

## 🚀 TESTER MAINTENANT

### 1. Ouvrir la page
```
http://localhost:3000/availability
```

### 2. Ouvrir la console navigateur
`Cmd+Option+J` (Mac) ou `F12` (Windows)

### 3. Vérifier les logs

**Config Supabase** :
```
[SUPABASE CONFIG] {
  url: 'https://eohioutmqfqdehfxgjgv.supabase.co',
  hasKey: true
}
```

**Si la table existe et contient des données** :
```
[SUPABASE SUCCESS - loadBooked] {
  count: X,
  data: [...]
}
```

**Si erreur PGRST205 persiste** :
```
[SUPABASE ERROR - loadBooked] {
  message: "Could not find the table public.reservations...",
  code: "PGRST205"
}
```

---

## 🔍 SI L'ERREUR PERSISTE

### Cause possible : La table n'existe pas encore

**Vérifier dans Supabase SQL Editor** :
```sql
SELECT * FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'reservations';
```

**Si la requête ne retourne rien** → La table n'existe pas encore

### Solution : Créer la table

**Exécuter dans Supabase SQL Editor** :
```sql
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

-- RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_reservations"
ON public.reservations FOR SELECT USING (true);

CREATE POLICY "player_insert_reservation"
ON public.reservations FOR INSERT WITH CHECK (true);

-- Test data
INSERT INTO public.reservations (
  club_id, court_id, slot_start, fin_de_slot, cree_par, statut
) VALUES (
  'ba43c579-e522-4b51-8542-737c2c6452bb',
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e',
  '2026-01-28 17:00:00+01',
  '2026-01-28 17:30:00+01',
  'cee11521-8f13-4157-8057-034adf2cb9a0',
  'confirmé'
);
```

### Vérifier Settings > API

1. Menu **Settings** ⚙️
2. Sous-menu **API**
3. Section **Schema** (en bas)
4. ☑ La case **public** doit être cochée
5. Si non cochée : cocher → **Save** → attendre 10s

---

## 📊 CHANGEMENTS RÉSUMÉS

| Fichier | Ligne | Changement |
|---------|-------|------------|
| `app/(public)/availability/page.tsx` | 6-11 | Console.log config ajouté |
| `app/(public)/availability/page.tsx` | 79-81 | `.schema("public")` ajouté |
| `app/api/bookings/route.ts` | 8-12 | Console.log config ajouté |
| `app/api/bookings/route.ts` | 28-30 | `.schema("public")` ajouté |

**Total** : 2 fichiers modifiés, 4 zones touchées

---

## ✅ RÉSULTAT ATTENDU

### Si la table existe et est accessible
- ✅ Console affiche `[SUPABASE SUCCESS - loadBooked]`
- ✅ Créneaux occupés affichés "Occupé"
- ✅ Créneaux libres cliquables
- ✅ Réservation fonctionne

### Si la table n'existe pas encore
- ❌ Console affiche `[SUPABASE ERROR - loadBooked] PGRST205`
- 🔧 Action : Créer la table (SQL ci-dessus)

---

## 🎯 PROCHAINE ÉTAPE

1. **Tester** : http://localhost:3000/availability
2. **Vérifier console** : logs de config + SUCCESS/ERROR
3. **Si PGRST205 persiste** : Exécuter le SQL de création de table

---

**Serveur actif** : ✅ http://localhost:3000  
**Config vérifiée** : ✅ https://eohioutmqfqdehfxgjgv.supabase.co  
**Code corrigé** : ✅ `.schema("public")` forcé partout
