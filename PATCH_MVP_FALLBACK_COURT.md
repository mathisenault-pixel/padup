# 🚨 PATCH MVP TEMPORAIRE - Fallback court_id

## ⚠️ IMPORTANT: PATCH TEMPORAIRE À RETIRER APRÈS DEBUG

**Date:** 2026-01-22  
**Commit:** `f1aacb1`  
**Status:** ACTIF (À RETIRER DÈS QUE POSSIBLE)

---

## Problème

Si les courts ne se chargent pas depuis Supabase (`courts.length === 0`), le `courtId` est `undefined` et la réservation échoue avec:
```
❌ CRITICAL: No court UUID for terrain
Erreur: Terrain sans UUID (court not loaded from DB)
```

---

## Solution temporaire (MVP)

**Fallback hardcodé vers Terrain 1:**
- UUID: `21d09a66-b7db-4966-abf1-cc210f7476c1`
- Utilisé UNIQUEMENT si `selectedTerrainData.courtId` est `null` ou `undefined`
- Logs détaillés quand le fallback est activé

---

## Code ajouté

**Fichier:** `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

**Ligne ~641-656:**

```typescript
let courtId = selectedTerrainData.courtId

// ============================================
// 🚨 PATCH MVP TEMPORAIRE - FALLBACK COURT_ID
// ============================================
// TODO: RETIRER CE FALLBACK APRÈS DEBUG DU CHARGEMENT DES COURTS
// Si aucun court chargé depuis DB ou court_id invalide, forcer Terrain 1 (MVP)
if (!courtId) {
  const FALLBACK_COURT_ID = '21d09a66-b7db-4966-abf1-cc210f7476c1' // Terrain 1 (MVP hardcodé)
  console.warn('═══════════════════════════════════════════════════════════')
  console.warn('[RESERVE] ⚠️⚠️⚠️ MVP FALLBACK ACTIVÉ')
  console.warn('[RESERVE] ⚠️ Court UUID manquant pour terrain:', selectedTerrainData)
  console.warn('[RESERVE] ⚠️ Utilisation du fallback hardcodé (Terrain 1)')
  console.warn('[RESERVE] ⚠️ FALLBACK court_id:', FALLBACK_COURT_ID)
  console.warn('[RESERVE] ⚠️ TODO: Retirer ce fallback après debug du chargement courts')
  console.warn('═══════════════════════════════════════════════════════════')
  courtId = FALLBACK_COURT_ID
}
// ============================================
```

---

## Logs console quand le fallback est activé

```
═══════════════════════════════════════════════════════════
[RESERVE] ⚠️⚠️⚠️ MVP FALLBACK ACTIVÉ
[RESERVE] ⚠️ Court UUID manquant pour terrain: {
  id: 1,
  courtId: undefined,
  name: "Terrain 1",
  type: "Intérieur"
}
[RESERVE] ⚠️ Utilisation du fallback hardcodé (Terrain 1)
[RESERVE] ⚠️ FALLBACK court_id: 21d09a66-b7db-4966-abf1-cc210f7476c1
[RESERVE] ⚠️ TODO: Retirer ce fallback après debug du chargement courts
═══════════════════════════════════════════════════════════
[RESERVE] ✅ Court ID (UUID): 21d09a66-b7db-4966-abf1-cc210f7476c1
[RESERVE] ✅ Terrain: Terrain 1
```

---

## Quand retirer ce patch

### Conditions pour retirer le fallback:

1. ✅ **Les courts se chargent correctement depuis Supabase**
   ```
   [COURTS] ✅ Loaded: 2 courts
   [COURTS] Data: [
     { id: '21d09a66-...', name: 'Terrain 1', court_type: 'Indoor' },
     { id: '6dceaf95-...', name: 'Terrain 2', court_type: 'Outdoor' }
   ]
   ```

2. ✅ **Les terrains ont un `courtId` valide**
   ```typescript
   terrains = [
     { id: 1, courtId: '21d09a66-...', name: 'Terrain 1', type: 'Indoor' },
     { id: 2, courtId: '6dceaf95-...', name: 'Terrain 2', type: 'Outdoor' }
   ]
   ```

3. ✅ **Aucun log de fallback dans la console lors d'une réservation**
   ```
   [RESERVE] ✅ Court ID (UUID): 21d09a66-...
   [RESERVE] ✅ Terrain: Terrain 1
   // ⚠️ SANS le warning "MVP FALLBACK ACTIVÉ"
   ```

---

## Comment retirer le patch

### Étape 1: Vérifier que les courts se chargent

1. Ouvrir `http://localhost:3000/player/clubs/ba43c579-.../reserver`
2. Ouvrir DevTools Console
3. Chercher:
   ```
   [COURTS] ✅ Loaded: 2 courts
   ```
4. Vérifier que `terrains` dans la console contient des `courtId` valides

---

### Étape 2: Tester une réservation SANS fallback

1. Sélectionner date + terrain + créneau
2. Confirmer la réservation
3. **Vérifier dans la console:**
   - ✅ Pas de log `⚠️⚠️⚠️ MVP FALLBACK ACTIVÉ`
   - ✅ Log `[RESERVE] ✅ Court ID (UUID): 21d09a66-...`
   - ✅ Réservation réussie

---

### Étape 3: Retirer le code du fallback

**Fichier:** `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

**SUPPRIMER les lignes ~641-656:**

```typescript
// AVANT (AVEC FALLBACK)
let courtId = selectedTerrainData.courtId

// ============================================
// 🚨 PATCH MVP TEMPORAIRE - FALLBACK COURT_ID
// ============================================
// TODO: RETIRER CE FALLBACK APRÈS DEBUG DU CHARGEMENT DES COURTS
if (!courtId) {
  const FALLBACK_COURT_ID = '21d09a66-b7db-4966-abf1-cc210f7476c1'
  console.warn('═══════════════════════════════════════════════════════════')
  console.warn('[RESERVE] ⚠️⚠️⚠️ MVP FALLBACK ACTIVÉ')
  // ... logs
  courtId = FALLBACK_COURT_ID
}
// ============================================

console.log('[RESERVE] ✅ Court ID (UUID):', courtId)
```

**REMPLACER PAR (SANS FALLBACK):**

```typescript
// APRÈS (SANS FALLBACK)
const courtId = selectedTerrainData.courtId
if (!courtId) {
  console.error('[RESERVE] ❌ CRITICAL: No court UUID for terrain:', selectedTerrainData)
  alert('Erreur: Terrain sans UUID (court not loaded from DB)')
  setIsSubmitting(false)
  return
}

console.log('[RESERVE] ✅ Court ID (UUID):', courtId)
```

---

### Étape 4: Tester après suppression

1. Vérifier que le build passe: `npm run build`
2. Tester une réservation:
   - Si courts chargés correctement → ✅ Réservation OK
   - Si courts non chargés → ❌ Erreur claire "court not loaded from DB"

---

### Étape 5: Commit la suppression

```bash
git add -A
git commit -m "remove: MVP fallback court_id (courts now load correctly from DB)

Courts now load correctly from Supabase, no longer need hardcoded fallback

Verified:
- [COURTS] Loaded: 2 courts
- All terrains have valid courtId (UUID)
- Booking works without fallback
- No foreign key errors

Removed:
- Fallback to '21d09a66-b7db-4966-abf1-cc210f7476c1'
- Warning logs when fallback activated
- TODO comments about removing fallback

Restored original guard:
if (!courtId) {
  alert('Erreur: Terrain sans UUID (court not loaded from DB)')
  return
}

File modified:
- app/player/(authenticated)/clubs/[id]/reserver/page.tsx"
```

---

## Debugging: Pourquoi les courts ne se chargent pas

### Vérifications à faire:

#### 1. Vérifier que la query Supabase s'exécute

**Console logs attendus:**
```
[COURTS] Loading courts from Supabase for club: ba43c579-e522-4b51-8542-737c2c6452bb
[COURTS] ✅ Loaded: 2 courts
[COURTS] Data: [...]
```

**Si pas de logs:**
- Le `useEffect` ne s'exécute pas
- `club?.id` est undefined

**Si error:**
- Vérifier les RLS policies sur `public.courts`
- Vérifier que les courts existent en DB

---

#### 2. Vérifier les RLS policies

**Query SQL:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'courts';
```

**Policy attendue:**
```sql
CREATE POLICY "mvp_read_courts"
ON public.courts
FOR SELECT
TO anon, authenticated
USING (true);
```

**Si policy manquante:**
- Appliquer la migration 019: `supabase/migrations/019_mvp_public_read_policies.sql`

---

#### 3. Vérifier que les courts existent en DB

**Query SQL:**
```sql
SELECT id, name, court_type, club_id
FROM public.courts
WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'
ORDER BY name;
```

**Résultat attendu:**
```
id                                   | name       | court_type | club_id
-------------------------------------|------------|------------|--------------------------------------
21d09a66-b7db-4966-abf1-cc210f7476c1 | Terrain 1  | Indoor     | ba43c579-e522-4b51-8542-737c2c6452bb
6dceaf95-80dd-4fcf-b401-7d4c937f6e9e | Terrain 2  | Outdoor    | ba43c579-e522-4b51-8542-737c2c6452bb
```

**Si vide:**
- Créer les courts manuellement:
```sql
INSERT INTO public.courts (id, club_id, name, court_type) VALUES
  ('21d09a66-b7db-4966-abf1-cc210f7476c1', 'ba43c579-e522-4b51-8542-737c2c6452bb', 'Terrain 1', 'Indoor'),
  ('6dceaf95-80dd-4fcf-b401-7d4c937f6e9e', 'ba43c579-e522-4b51-8542-737c2c6452bb', 'Terrain 2', 'Outdoor');
```

---

#### 4. Tester la query manuellement

**Dans SQL Editor Supabase:**
```sql
SELECT id, name, court_type
FROM public.courts
WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'
ORDER BY name ASC;
```

**Devrait retourner 2 lignes.**

**Si 0 lignes:**
- Les courts n'existent pas en DB
- Créer les courts (voir query ci-dessus)

**Si erreur "permission denied":**
- RLS policy manquante ou incorrecte
- Appliquer migration 019

---

## Résumé

| Aspect | Status |
|--------|--------|
| **Patch actif** | ✅ OUI (commit `f1aacb1`) |
| **Fallback court_id** | `21d09a66-b7db-4966-abf1-cc210f7476c1` |
| **Utilisé si** | `selectedTerrainData.courtId` est `null` ou `undefined` |
| **Logs visibles** | ✅ OUI (warning avec séparateurs) |
| **À retirer quand** | Courts se chargent correctement depuis DB |
| **Build OK** | ✅ OUI |

---

## Checklist pour retirer le patch

- [ ] Vérifier logs: `[COURTS] ✅ Loaded: 2 courts`
- [ ] Vérifier `terrains[0].courtId` est un UUID valide (pas `undefined`)
- [ ] Tester une réservation SANS voir le log "MVP FALLBACK ACTIVÉ"
- [ ] Supprimer le code du fallback (lignes ~641-656)
- [ ] Restaurer le guard original `if (!courtId) { alert(...); return; }`
- [ ] Vérifier le build: `npm run build`
- [ ] Tester une réservation après suppression
- [ ] Commit: "remove: MVP fallback court_id"

---

**⚠️ CE PATCH DOIT ÊTRE RETIRÉ DÈS QUE LES COURTS SE CHARGENT CORRECTEMENT ! ⚠️**

**Date limite suggérée:** Dès que la migration 019 est appliquée et que les courts existent en DB.
