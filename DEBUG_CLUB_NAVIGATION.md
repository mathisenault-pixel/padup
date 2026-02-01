# 🐛 DEBUG: Navigation Club - Logs Détaillés

## Date: 2026-01-22

---

## 🎯 Objectif

Identifier l'erreur exacte qui cause le crash lors du clic sur un club.

**Problème :**
- Click sur un club → écran d'erreur global Next.js
- Besoin de voir l'erreur exacte et éviter tout crash

**Solution :**
- ✅ Error boundaries globaux avec logs complets
- ✅ Logs détaillés à chaque étape de la navigation
- ✅ Vérification de `club.id` avant navigation
- ✅ Vérification de `params.id` dans la route
- ✅ `.maybeSingle()` pour ne jamais throw

---

## 🔍 Logs ajoutés

### 1. Error Boundaries

#### `app/error.tsx` (Error Boundary - Niveau Route)

**Logs :**
```javascript
console.error('❌ [ERROR BOUNDARY] Error caught:', error)
console.error('❌ [ERROR BOUNDARY] Error message:', error.message)
console.error('❌ [ERROR BOUNDARY] Error stack:', error.stack)
console.error('❌ [ERROR BOUNDARY] Error digest:', error.digest)
```

**Quand :**
- Une erreur non catchée survient dans une route ou composant
- Erreur dans un useEffect, render, ou handler

---

#### `app/global-error.tsx` (Error Boundary - Niveau App Global)

**Logs :**
```javascript
console.error('❌ [GLOBAL ERROR] Global error caught:', error)
console.error('❌ [GLOBAL ERROR] Error message:', error.message)
console.error('❌ [GLOBAL ERROR] Error stack:', error.stack)
console.error('❌ [GLOBAL ERROR] Error digest:', error.digest)
```

**Quand :**
- Une erreur non catchée survient au niveau global de l'app
- Erreur dans le layout root ou les wrappers globaux

---

### 2. Navigation - Click sur Club

#### `app/player/(authenticated)/accueil/page.tsx`

**Logs au click :**
```javascript
console.log('[CLUB CARD CLICK] ✅ Navigation to:', club.name)
console.log('[CLUB CARD CLICK] club.id:', club.id, 'type:', typeof club.id)
console.log('[CLUB CARD CLICK] URL will be:', `/player/clubs/${club.id}/reserver`)

// Si club.id invalide
console.error('[CLUB CARD CLICK] ❌ WARNING: club.id is undefined/null!')
```

**Quand :**
- L'utilisateur clique sur une carte club (page d'accueil)

---

#### `app/player/(authenticated)/clubs/page.tsx`

**Logs au click :**
```javascript
console.log('[CLUB LIST CLICK] ✅ Navigation to:', club.name)
console.log('[CLUB LIST CLICK] club.id:', club.id, 'type:', typeof club.id)
console.log('[CLUB LIST CLICK] URL will be:', `/player/clubs/${club.id}/reserver`)

// Si club.id invalide
console.error('[CLUB LIST CLICK] ❌ WARNING: club.id is undefined/null!')
```

**Quand :**
- L'utilisateur clique sur un club dans la liste complète

---

### 3. Route Réservation - Réception params

#### `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

**Logs au mount du composant :**
```javascript
// 1. Composant monté
console.log('[RESERVER PAGE] ✅ Component mounted, params (promise):', params)

// 2. Params résolu
console.log('[RESERVER PAGE] ✅ Params resolved:', resolvedParams)

// 3. Extraction clubId
console.log('[RESERVER PAGE] clubId:', clubId, 'type=', typeof clubId)

// 4. Si clubId invalide
console.error('[RESERVER PAGE] ❌ CRITICAL: clubId is undefined/null!')
```

**Logs dans useEffect (redirect) :**
```javascript
console.error('[RESERVER PAGE] ❌ No clubId in params, redirecting to clubs list')
console.error('[RESERVER PAGE] resolvedParams:', resolvedParams)
```

---

### 4. Fetch Supabase - Chargement Club

**Logs au fetch :**
```javascript
// 1. Guard si pas de clubId
console.warn('[CLUB FETCH] Guard: clubId is falsy, skipping fetch')

// 2. Début du fetch
console.log('[CLUB FETCH] 🔍 Starting fetch for clubId:', clubId)
console.log('[CLUB FETCH] Query: from("clubs").select("id, name, city").eq("id", clubId).maybeSingle()')

// 3. Réponse reçue
console.log('[CLUB FETCH] Response received - data:', data, 'error:', error)

// 4. Si erreur ou pas de data
console.error('[CLUB FETCH] ❌ Club fetch failed!')
console.error('[CLUB FETCH] Error object:', error)
console.error('[CLUB FETCH] Data object:', data)
console.error('[CLUB FETCH] clubId used:', clubId)

// 5. Si succès
console.log('[CLUB FETCH] ✅ Club loaded successfully:', data)
```

---

## 🧪 Scénarios de test

### Scénario 1 : Navigation normale (succès)

**Action :**
1. Ouvrir la console (F12)
2. Aller sur `/player/accueil`
3. Cliquer sur un club (ex: "Le Hangar")

**Logs attendus :**
```
[CLUB CARD CLICK] ✅ Navigation to: Le Hangar Sport & Co
[CLUB CARD CLICK] club.id: a1b2c3d4-e5f6-4789-a012-3456789abcde type: string
[CLUB CARD CLICK] URL will be: /player/clubs/a1b2c3d4-e5f6-4789-a012-3456789abcde/reserver
[RESERVER PAGE] ✅ Component mounted, params (promise): Promise {...}
[RESERVER PAGE] ✅ Params resolved: { id: "a1b2c3d4-e5f6-4789-a012-3456789abcde" }
[RESERVER PAGE] clubId: a1b2c3d4-e5f6-4789-a012-3456789abcde type: string
[CLUB FETCH] 🔍 Starting fetch for clubId: a1b2c3d4-e5f6-4789-a012-3456789abcde
[CLUB FETCH] Query: from("clubs").select("id, name, city").eq("id", clubId).maybeSingle()
[CLUB FETCH] Response received - data: { id: "a1b2c3d4-...", name: "Le Hangar Sport & Co", city: "Rochefort-du-Gard" } error: null
[CLUB FETCH] ✅ Club loaded successfully: { id: "a1b2c3d4-...", name: "Le Hangar Sport & Co", city: "Rochefort-du-Gard" }
```

**Résultat :**
- ✅ Page s'affiche normalement
- ✅ Aucune erreur

---

### Scénario 2 : club.id undefined (erreur source)

**Symptôme possible :**
- `club.id` est `undefined` ou `null` dans les données

**Logs attendus :**
```
[CLUB CARD CLICK] ✅ Navigation to: Le Hangar Sport & Co
[CLUB CARD CLICK] club.id: undefined type: undefined
[CLUB CARD CLICK] URL will be: /player/clubs/undefined/reserver
[CLUB CARD CLICK] ❌ WARNING: club.id is undefined/null!
[RESERVER PAGE] ✅ Component mounted, params (promise): Promise {...}
[RESERVER PAGE] ✅ Params resolved: { id: "undefined" }
[RESERVER PAGE] clubId: undefined type: string
[RESERVER PAGE] ❌ CRITICAL: clubId is undefined/null!
[RESERVER PAGE] ❌ No clubId in params, redirecting to clubs list
[RESERVER PAGE] resolvedParams: { id: "undefined" }
```

**Résultat :**
- ⚠️ Redirection vers `/player/clubs`
- ⚠️ Message dans console : "club.id is undefined/null!"

**Action corrective :**
- Vérifier le fetch des clubs dans `/player/accueil` ou `/player/clubs`
- S'assurer que Supabase retourne bien un `id` pour chaque club

---

### Scénario 3 : Club inexistant en DB (UUID valide mais pas trouvé)

**Logs attendus :**
```
[CLUB CARD CLICK] ✅ Navigation to: Club Test
[CLUB CARD CLICK] club.id: 00000000-0000-0000-0000-000000000000 type: string
[CLUB CARD CLICK] URL will be: /player/clubs/00000000-0000-0000-0000-000000000000/reserver
[RESERVER PAGE] ✅ Component mounted, params (promise): Promise {...}
[RESERVER PAGE] ✅ Params resolved: { id: "00000000-0000-0000-0000-000000000000" }
[RESERVER PAGE] clubId: 00000000-0000-0000-0000-000000000000 type: string
[CLUB FETCH] 🔍 Starting fetch for clubId: 00000000-0000-0000-0000-000000000000
[CLUB FETCH] Query: from("clubs").select("id, name, city").eq("id", clubId).maybeSingle()
[CLUB FETCH] Response received - data: null error: null
[CLUB FETCH] ❌ Club fetch failed!
[CLUB FETCH] Error object: null
[CLUB FETCH] Data object: null
[CLUB FETCH] clubId used: 00000000-0000-0000-0000-000000000000
```

**Résultat :**
- ✅ Page affiche "Club introuvable"
- ✅ Bouton "Retour aux clubs"
- ✅ Pas d'écran rouge

---

### Scénario 4 : Erreur Supabase (ex: RLS, réseau)

**Logs attendus :**
```
[CLUB CARD CLICK] ✅ Navigation to: Le Hangar Sport & Co
[CLUB CARD CLICK] club.id: a1b2c3d4-e5f6-4789-a012-3456789abcde type: string
[CLUB CARD CLICK] URL will be: /player/clubs/a1b2c3d4-e5f6-4789-a012-3456789abcde/reserver
[RESERVER PAGE] ✅ Component mounted, params (promise): Promise {...}
[RESERVER PAGE] ✅ Params resolved: { id: "a1b2c3d4-e5f6-4789-a012-3456789abcde" }
[RESERVER PAGE] clubId: a1b2c3d4-e5f6-4789-a012-3456789abcde type: string
[CLUB FETCH] 🔍 Starting fetch for clubId: a1b2c3d4-e5f6-4789-a012-3456789abcde
[CLUB FETCH] Query: from("clubs").select("id, name, city").eq("id", clubId).maybeSingle()
[CLUB FETCH] Response received - data: null error: { message: "...", code: "...", ... }
[CLUB FETCH] ❌ Club fetch failed!
[CLUB FETCH] Error object: { message: "...", code: "...", ... }
[CLUB FETCH] Data object: null
[CLUB FETCH] clubId used: a1b2c3d4-e5f6-4789-a012-3456789abcde
```

**Résultat :**
- ✅ Page affiche "Club introuvable"
- ⚠️ Vérifier l'erreur Supabase dans `[CLUB FETCH] Error object`
- ⚠️ Peut être : RLS, connexion, permissions

---

### Scénario 5 : Erreur non catchée (throw quelque part)

**Logs attendus :**
```
[CLUB CARD CLICK] ✅ Navigation to: Le Hangar Sport & Co
[CLUB CARD CLICK] club.id: a1b2c3d4-e5f6-4789-a012-3456789abcde type: string
[CLUB CARD CLICK] URL will be: /player/clubs/a1b2c3d4-e5f6-4789-a012-3456789abcde/reserver
[RESERVER PAGE] ✅ Component mounted, params (promise): Promise {...}
[RESERVER PAGE] ✅ Params resolved: { id: "a1b2c3d4-e5f6-4789-a012-3456789abcde" }
[RESERVER PAGE] clubId: a1b2c3d4-e5f6-4789-a012-3456789abcde type: string
[CLUB FETCH] 🔍 Starting fetch for clubId: a1b2c3d4-e5f6-4789-a012-3456789abcde
[CLUB FETCH] Query: from("clubs").select("id, name, city").eq("id", clubId).maybeSingle()
❌ [ERROR BOUNDARY] Error caught: Error: ...
❌ [ERROR BOUNDARY] Error message: ...
❌ [ERROR BOUNDARY] Error stack: ...
```

**Résultat :**
- ⚠️ Écran d'erreur de Next.js (avec UI custom)
- ⚠️ Logs `[ERROR BOUNDARY]` ou `[GLOBAL ERROR]`
- ⚠️ Regarder la stack trace pour identifier où ça throw

---

## 📋 Checklist de debug

Quand vous testez le click sur un club, vérifiez dans l'ordre :

### 1. ✅ Logs de click (CLUB CARD CLICK / CLUB LIST CLICK)

- [ ] Le log `[CLUB CARD CLICK]` ou `[CLUB LIST CLICK]` apparaît
- [ ] `club.id` est un **UUID valide** (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- [ ] `typeof club.id` est `"string"`
- [ ] Pas de warning `club.id is undefined/null!`

**Si problème ici :**
- Le problème vient de la source (fetch des clubs)
- Vérifier la query Supabase dans `/player/accueil` ou `/player/clubs`
- S'assurer que `select('id, name, city')` retourne bien l'ID

---

### 2. ✅ Logs de mount (RESERVER PAGE)

- [ ] Le log `[RESERVER PAGE] Component mounted` apparaît
- [ ] `params` est une Promise
- [ ] `resolvedParams` a la structure `{ id: "..." }`
- [ ] `clubId` est extrait correctement
- [ ] Pas d'erreur `clubId is undefined/null!`

**Si problème ici :**
- Problème de routing Next.js
- Vérifier que l'URL est bien `/player/clubs/[UUID]/reserver`
- Vérifier qu'il n'y a pas de redirect ou middleware qui modifie l'URL

---

### 3. ✅ Logs de fetch (CLUB FETCH)

- [ ] Le log `[CLUB FETCH] Starting fetch` apparaît
- [ ] `clubId` utilisé est bien l'UUID du club
- [ ] `[CLUB FETCH] Response received` apparaît
- [ ] Soit `data` est rempli (succès), soit `error` est rempli (échec)

**Si data est null ET error est null :**
- Le club n'existe pas en DB avec cet ID
- Vérifier la table `clubs` dans Supabase
- S'assurer que l'UUID correspond bien

**Si error est rempli :**
- Erreur Supabase (RLS, connexion, permissions)
- Regarder `error.message` et `error.code`
- Vérifier les RLS policies sur la table `clubs`

---

### 4. ✅ Logs d'erreur (ERROR BOUNDARY / GLOBAL ERROR)

- [ ] Vérifier s'il y a des logs `[ERROR BOUNDARY]` ou `[GLOBAL ERROR]`

**Si présent :**
- Une erreur non catchée a été throwée
- Regarder `Error message` et `Error stack`
- Identifier la ligne qui throw dans le stack trace

**Causes fréquentes :**
- Accès à `data.xxx` sans vérifier que `data` existe
- `.single()` au lieu de `.maybeSingle()`
- Erreur dans un `useEffect` ou `handler`

---

## 🔧 Solutions aux problèmes courants

### Problème 1 : `club.id` est `undefined`

**Logs :**
```
[CLUB CARD CLICK] club.id: undefined type: undefined
[CLUB CARD CLICK] ❌ WARNING: club.id is undefined/null!
```

**Cause :**
- Les données des clubs ne contiennent pas l'ID

**Solution :**
```typescript
// Dans /player/accueil/page.tsx ou /player/clubs/page.tsx
const { data, error } = await supabase
  .from('clubs')
  .select('id, name, city')  // ✅ S'assurer que 'id' est dans le select
  .order('created_at', { ascending: false })

console.log('[CLUBS FETCH] Data received:', data)  // ✅ Vérifier que id existe
```

---

### Problème 2 : `params.id` est `"undefined"` (string)

**Logs :**
```
[RESERVER PAGE] clubId: undefined type: string
```

**Cause :**
- `club.id` était `undefined` lors du click
- L'URL générée est `/player/clubs/undefined/reserver`
- Next.js capture "undefined" comme string

**Solution :**
- Corriger le problème #1 (club.id undefined à la source)

---

### Problème 3 : Erreur `"JSON object requested, multiple rows returned"`

**Logs :**
```
[CLUB FETCH] Error object: { message: "JSON object requested, multiple rows returned", ... }
```

**Cause :**
- Utilisation de `.single()` au lieu de `.maybeSingle()`
- Il y a 2+ clubs avec le même ID (ne devrait pas arriver avec UUID)

**Solution :**
```typescript
// ✅ Déjà corrigé dans le code
const { data, error } = await supabase
  .from('clubs')
  .select('id, name, city')
  .eq('id', clubId)
  .maybeSingle()  // ✅ Ne throw jamais
```

---

### Problème 4 : Erreur RLS Supabase

**Logs :**
```
[CLUB FETCH] Error object: { message: "permission denied for table clubs", code: "42501" }
```

**Cause :**
- Row-Level Security bloque la lecture
- L'utilisateur n'a pas la permission de lire la table `clubs`

**Solution :**
```sql
-- Dans Supabase SQL Editor
-- Politique de lecture publique pour la table clubs
CREATE POLICY "mvp_read_clubs" ON public.clubs
FOR SELECT
TO anon, authenticated
USING (true);
```

---

## 🎯 Flow de logs complet (succès)

Voici le flow complet pour une navigation réussie :

```
┌──────────────────────────────────────────────┐
│ 1. USER clicks sur club card                │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ [CLUB CARD CLICK] ✅ Navigation to: Le ...   │
│ [CLUB CARD CLICK] club.id: a1b2c3d4-...     │
│ [CLUB CARD CLICK] URL will be: /player/...  │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ 2. Next.js navigate to /player/clubs/[id]   │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ [RESERVER PAGE] ✅ Component mounted         │
│ [RESERVER PAGE] ✅ Params resolved: {...}    │
│ [RESERVER PAGE] clubId: a1b2c3d4-... string  │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ 3. useEffect triggered → loadClub()         │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ [CLUB FETCH] 🔍 Starting fetch for clubId   │
│ [CLUB FETCH] Query: from("clubs")...        │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ 4. Supabase .maybeSingle()                  │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ [CLUB FETCH] Response received - data: {...}│
│ [CLUB FETCH] ✅ Club loaded successfully    │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ 5. setClubData(club) → UI renders           │
└──────────────────────────────────────────────┘
```

---

## 🚀 Prochaines étapes

### Après avoir identifié l'erreur

1. **Noter les logs exacts** qui apparaissent dans la console
2. **Identifier l'étape** où ça casse (click, mount, fetch, render)
3. **Regarder le message d'erreur** dans `[ERROR BOUNDARY]` si présent
4. **Appliquer la solution** correspondante (voir section "Solutions")
5. **Retester** pour vérifier que l'erreur est résolue

---

## ✅ Résumé

| Aspect | Status | Implémentation |
|--------|--------|----------------|
| Error Boundary global | ✅ OK | `app/error.tsx` + `app/global-error.tsx` |
| Logs click club | ✅ OK | `[CLUB CARD CLICK]` / `[CLUB LIST CLICK]` |
| Logs mount route | ✅ OK | `[RESERVER PAGE]` |
| Logs fetch Supabase | ✅ OK | `[CLUB FETCH]` |
| Vérification club.id | ✅ OK | Warning si undefined |
| Vérification params.id | ✅ OK | Redirect si undefined |
| Fetch sécurisé | ✅ OK | `.maybeSingle()` |
| Pas de throw | ✅ OK | Toutes erreurs catchées |

**Résultat :**
- ✅ Chaque étape loggée avec tag clair
- ✅ Facile d'identifier où ça casse
- ✅ Error boundaries capturent tout ce qui n'est pas catché
- ✅ Build passe sans erreur

---

**Date :** 2026-01-22  
**Commit :** `9d03d5f`  
**Status :** ✅ Logs complets en place  
**Action :** Tester en cliquant sur un club et analyser les logs
