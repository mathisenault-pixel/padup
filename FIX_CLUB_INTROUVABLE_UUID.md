# ✅ Fix: "Club introuvable" après passage aux UUID

## Problème

**Symptôme:**
```
Message: "Club introuvable" ou "Aucun club trouvé"
```

Navigation depuis la page d'accueil ou clubs vers `/player/clubs/[id]/reserver` affichait "Club introuvable".

**Cause:**
La page d'accueil utilisait des **IDs numériques** (1, 2, 3, 4) pour les clubs, alors que la page reserver attend des **UUIDs** depuis le passage aux UUID.

```typescript
// ❌ AVANT (accueil/page.tsx)
type Club = {
  id: number  // ❌ ID numérique
  nom: string
  // ...
}

const clubs = [
  { id: 1, nom: 'Le Hangar Sport & Co', ... },  // ❌ ID numérique
  { id: 2, nom: 'Paul & Louis Sport', ... },    // ❌ ID numérique
  { id: 3, nom: 'ZE Padel', ... },              // ❌ ID numérique
  { id: 4, nom: 'QG Padel Club', ... },         // ❌ ID numérique
]

// Lien
<Link href={`/player/clubs/${club.id}/reserver`}>  // ❌ Génère /player/clubs/1/reserver
```

**Résultat:**
- Navigation vers `/player/clubs/1/reserver`
- La page reserver redirige vers `/player/clubs/ba43c579-.../reserver` (UUID correct)
- Mais pendant le temps de redirection, affichait "Club introuvable"

---

## Solution appliquée

### 1. Corriger le type Club dans accueil/page.tsx

**Fichier:** `app/player/(authenticated)/accueil/page.tsx`

**AVANT:**
```typescript
type Club = {
  id: number  // ❌
  nom: string
  // ...
}
```

**APRÈS:**
```typescript
type Club = {
  id: string  // ✅ UUID depuis public.clubs
  nom: string
  // ...
}
```

---

### 2. Utiliser l'UUID du club démo pour tous les clubs

**Pour MVP:** Un seul club fonctionnel (Club Démo Pad'up). Tous les clubs de la page d'accueil pointent vers ce même UUID.

**AVANT:**
```typescript
const [clubs] = useState<Club[]>([
  { id: 1, nom: 'Le Hangar Sport & Co', ... },     // ❌ ID numérique
  { id: 2, nom: 'Paul & Louis Sport', ... },       // ❌ ID numérique
  { id: 3, nom: 'ZE Padel', ... },                 // ❌ ID numérique
  { id: 4, nom: 'QG Padel Club', ... },            // ❌ ID numérique
])
```

**APRÈS:**
```typescript
// ✅ Pour MVP: tous les clubs pointent vers le club démo UUID
// En production, chaque club aurait son propre UUID
const DEMO_CLUB_UUID = 'ba43c579-e522-4b51-8542-737c2c6452bb'

const [clubs] = useState<Club[]>([
  {
    id: DEMO_CLUB_UUID,  // ✅ UUID du club démo (seul club fonctionnel pour MVP)
    nom: 'Le Hangar Sport & Co',
    // ...
  },
  {
    id: DEMO_CLUB_UUID,  // ✅ Pour MVP, tous redirigent vers le club démo
    nom: 'Paul & Louis Sport',
    // ...
  },
  {
    id: DEMO_CLUB_UUID,  // ✅ Pour MVP, tous redirigent vers le club démo
    nom: 'ZE Padel',
    // ...
  },
  {
    id: DEMO_CLUB_UUID,  // ✅ Pour MVP, tous redirigent vers le club démo
    nom: 'QG Padel Club',
    // ...
  },
])
```

**Résultat:**
- Tous les liens génèrent maintenant `/player/clubs/ba43c579-.../reserver`
- Plus de redirection nécessaire
- Plus de message "Club introuvable"

---

### 3. Ajouter des logs détaillés dans reserver/page.tsx

**Fichier:** `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

**Ajouté au début du composant:**

```typescript
// ✅ LOGS DÉTAILLÉS POUR DEBUG
console.log('[CLUB] params.id=', resolvedParams.id, 'type=', typeof resolvedParams.id)
console.log('[CLUB] DEMO_CLUB_UUID=', DEMO_CLUB_UUID)
console.log('[CLUB] clubs array length=', clubs.length)
console.log('[CLUB] clubs[0]=', clubs[0])
```

**Ajouté dans useMemo du club:**

```typescript
const club = useMemo(() => {
  // ✅ Pour MVP: toujours retourner le club démo
  // La redirection ci-dessus s'occupe de corriger l'URL si besoin
  const foundClub = clubs[0]
  console.log('[CLUB] Selected club:', foundClub)
  return foundClub
}, [])
```

**Logs attendus (avec UUID correct):**

```
[CLUB] params.id= ba43c579-e522-4b51-8542-737c2c6452bb type= string
[CLUB] DEMO_CLUB_UUID= ba43c579-e522-4b51-8542-737c2c6452bb
[CLUB] clubs array length= 1
[CLUB] clubs[0]= { id: "ba43c579-...", nom: "Club Démo Pad'up", ... }
[CLUB] Selected club: { id: "ba43c579-...", nom: "Club Démo Pad'up", ... }
```

---

### 4. Améliorer le message d'erreur si club manquant

**AVANT:**
```typescript
if (!club) {
  return <div className="p-8">Club introuvable</div>
}
```

**APRÈS:**
```typescript
// ✅ Vérification du club (ne devrait jamais arriver en pratique)
if (!club) {
  console.error('[CLUB] ❌ CRITICAL: No club found! This should never happen.')
  console.error('[CLUB] params.id:', resolvedParams.id)
  console.error('[CLUB] clubs array:', clubs)
  return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-lg font-bold text-red-900 mb-2">Erreur de configuration</h2>
        <p className="text-red-700">Aucun club disponible. Redirection en cours...</p>
        <p className="text-sm text-red-600 mt-2">ID reçu: {resolvedParams.id}</p>
      </div>
    </div>
  )
}
```

**Note:** Ce message ne devrait plus jamais s'afficher car `clubs[0]` existe toujours.

---

## Flux de navigation corrigé

### AVANT (avec IDs numériques)

```
1️⃣  USER → Page accueil
          ↓
2️⃣  Clic sur club "Le Hangar Sport & Co" (id: 1)
          ↓
3️⃣  Navigation vers /player/clubs/1/reserver
          ↓
4️⃣  Page reserver charge
          ↓
5️⃣  params.id = "1" (string)
          ↓
6️⃣  club = clubs.find(c => c.id === "1")
          ↓
7️⃣  ❌ club = undefined (car clubs[0].id = "ba43c579-...")
          ↓
8️⃣  Affiche "Club introuvable" ❌
          ↓
9️⃣  useEffect détecte ID invalide
          ↓
🔟  Redirige vers /player/clubs/ba43c579-.../reserver
          ↓
1️⃣1️⃣  Page recharge, club trouvé ✅
```

**Problème:** Message "Club introuvable" visible pendant ~1 seconde.

---

### APRÈS (avec UUID)

```
1️⃣  USER → Page accueil
          ↓
2️⃣  Clic sur club "Le Hangar Sport & Co" (id: "ba43c579-...")
          ↓
3️⃣  Navigation vers /player/clubs/ba43c579-.../reserver
          ↓
4️⃣  Page reserver charge
          ↓
5️⃣  params.id = "ba43c579-..." (string)
          ↓
6️⃣  club = clubs[0] (toujours défini)
          ↓
7️⃣  ✅ club = { id: "ba43c579-...", ... }
          ↓
8️⃣  Page affichée correctement ✅
          ↓
9️⃣  Pas de redirection (ID correct)
```

**Résultat:** Aucun message d'erreur, navigation fluide.

---

## Tests de validation

### Test 1: Navigation depuis accueil

```bash
1. Démarrer: npm run dev
2. Aller sur http://localhost:3000/player/accueil
3. Cliquer sur n'importe quel club
4. Vérifier console browser:
   [CLUB] params.id= ba43c579-... type= string
   [CLUB] Selected club: { id: "ba43c579-...", ... }
5. Vérifier: Page reserver s'affiche correctement ✅
6. Vérifier: Pas de message "Club introuvable" ✅
7. Vérifier URL: /player/clubs/ba43c579-.../reserver ✅
```

---

### Test 2: Navigation depuis liste clubs

```bash
1. Aller sur http://localhost:3000/player/clubs
2. Cliquer sur le club affiché
3. Vérifier console:
   [CLUB] params.id= ba43c579-... type= string
4. Vérifier: Page reserver s'affiche ✅
5. Pas de message d'erreur ✅
```

---

### Test 3: URL directe avec UUID correct

```bash
1. Aller directement sur:
   http://localhost:3000/player/clubs/ba43c579-e522-4b51-8542-737c2c6452bb/reserver
2. Vérifier console:
   [CLUB] params.id= ba43c579-... type= string
   [CLUB] DEMO_CLUB_UUID= ba43c579-...
3. Vérifier: Page s'affiche immédiatement ✅
4. Pas de redirection ✅
```

---

### Test 4: URL directe avec ancien ID numérique

```bash
1. Aller directement sur:
   http://localhost:3000/player/clubs/1/reserver
2. Vérifier console:
   [CLUB] params.id= 1 type= string
   [CLUB REDIRECT] Invalid club ID: 1 → redirecting to ba43c579-...
3. Vérifier: Redirection automatique vers UUID correct ✅
4. Page s'affiche après redirection ✅
```

---

### Test 5: Réservation fonctionne

```bash
1. Après navigation vers page reserver
2. Sélectionner date + terrain + créneau
3. Confirmer réservation
4. Vérifier console:
   [RESERVE] ✅ User authenticated
   [BOOKING INSERT] ✅✅✅ SUCCESS
5. Réservation créée ✅
```

---

## Checklist de validation

- [x] Type Club.id changé de `number` à `string` dans accueil/page.tsx
- [x] Tous les clubs utilisent DEMO_CLUB_UUID
- [x] Logs détaillés ajoutés dans reserver/page.tsx
- [x] Message d'erreur amélioré si club manquant
- [x] Build OK
- [ ] **À TESTER:** Navigation depuis accueil fonctionne
- [ ] **À TESTER:** Navigation depuis liste clubs fonctionne
- [ ] **À TESTER:** URL directe avec UUID correct fonctionne
- [ ] **À TESTER:** Ancien ID numérique redirige correctement
- [ ] **À TESTER:** Réservation fonctionne après navigation

---

## Fichiers modifiés

### 1. `app/player/(authenticated)/accueil/page.tsx`

**Changements:**
- Type `Club.id`: `number` → `string`
- Ajout constante `DEMO_CLUB_UUID`
- Tous les clubs utilisent `DEMO_CLUB_UUID` comme ID

**Impact:**
- Liens générés: `/player/clubs/ba43c579-.../reserver` ✅
- Plus d'IDs numériques ✅

---

### 2. `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

**Changements:**
- Ajout logs détaillés au début du composant
- Ajout logs dans `useMemo` du club
- Amélioration message d'erreur si club manquant

**Impact:**
- Meilleur diagnostic en cas de problème ✅
- Message d'erreur plus clair ✅

---

## Notes importantes

### Pour MVP: Un seul club fonctionnel

Tous les clubs de la page d'accueil utilisent le même UUID (`DEMO_CLUB_UUID`). En production, chaque club aurait son propre UUID distinct.

**Avantages MVP:**
- ✅ Navigation fonctionne pour tous les clubs
- ✅ Pas de gestion multi-clubs complexe
- ✅ Logs clairs et debuggage facile

**Pour production future:**
```typescript
const clubs = [
  {
    id: 'uuid-club-1',  // ✅ UUID unique pour chaque club
    nom: 'Le Hangar Sport & Co',
    // ...
  },
  {
    id: 'uuid-club-2',  // ✅ UUID unique
    nom: 'Paul & Louis Sport',
    // ...
  },
  // ...
]
```

---

### Redirection automatique toujours active

La logique de redirection dans `reserver/page.tsx` reste active :

```typescript
useEffect(() => {
  if (resolvedParams.id !== DEMO_CLUB_UUID) {
    console.log('[CLUB REDIRECT] Invalid club ID:', resolvedParams.id, '→ redirecting to', DEMO_CLUB_UUID)
    router.replace(`/player/clubs/${DEMO_CLUB_UUID}/reserver`)
  }
}, [resolvedParams.id, router])
```

**Rôle:** Permet de gérer les anciennes URLs ou erreurs de navigation.

---

### Pourquoi params.id est une string en Next.js App Router

```typescript
// Next.js App Router
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  console.log(typeof resolvedParams.id)  // ✅ "string" (toujours)
}
```

**Important:** 
- `params.id` est **toujours une string** en Next.js App Router
- Même si l'URL est `/clubs/1`, `params.id` vaut `"1"` (string)
- Avec UUID: `params.id` vaut `"ba43c579-..."` (string)
- ❌ Ne JAMAIS faire `Number(params.id)` ou `parseInt(params.id)` avec des UUID
- ✅ Toujours comparer directement: `params.id === DEMO_CLUB_UUID`

---

## Résumé des changements

| Aspect | Avant | Après |
|--------|-------|-------|
| **Type Club.id** | `number` | `string` (UUID) |
| **IDs clubs accueil** | 1, 2, 3, 4 | `ba43c579-...` (tous) |
| **Liens générés** | `/player/clubs/1/reserver` | `/player/clubs/ba43c579-.../reserver` |
| **Message erreur** | "Club introuvable" (visible) | Pas d'erreur (ou message détaillé) |
| **Redirection** | Nécessaire (ID invalide) | Pas nécessaire (ID correct) |
| **Navigation** | ❌ Problématique | ✅ Fluide |
| **Logs** | ⚠️ Basiques | ✅ Détaillés |

---

**Date:** 2026-02-01  
**Status:** Fix appliqué, build OK, prêt pour tests  
**Note:** Plus de conversions Number() ou parseInt() sur les IDs de clubs
