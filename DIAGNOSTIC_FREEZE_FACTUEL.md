# 🔬 DIAGNOSTIC FACTUEL - FREEZE RÉSERVATION

## ✅ MODIFICATIONS APPLIQUÉES

### 1. Confirmation que le code modifié s'exécute
**Ajouté** :
```typescript
console.log("🚀 RESERVER PAGE VERSION", Date.now())
console.count('🔄 ReservationPage render')
```

**Test** : Ouvrir /player/clubs/1/reserver et vérifier que la console affiche :
```
🚀 RESERVER PAGE VERSION 1737577200000
🔄 ReservationPage render: 1
```

---

### 2. Mesure du coût réel avec performance.now()
**Ajouté** :
```typescript
const renderStart = performance.now()
// ... tout le render
const renderEnd = performance.now()
const computeMs = (renderEnd - renderStart).toFixed(2)
console.log(`⏱️ [RENDER] Total compute: ${computeMs}ms`)

if (parseFloat(computeMs) > 50) {
  console.error(`🔴 [RENDER] SLOW! ${computeMs}ms > 50ms`)
}
```

**Plus** : Mesure de chaque opération lourde :
```typescript
// Génération timeSlots
const start = performance.now()
const result = generateTimeSlots()
console.log(`⏱️ [SLOTS] Generated in ${(performance.now() - start).toFixed(2)}ms`)

// Génération cache unavailable
const start = performance.now()
// ... calcul
console.log(`⏱️ [CACHE] Built for ${terrains.length} terrains in ${elapsed}ms`)
```

**Attendu** :
```
⏱️ [SLOTS] Generated in 0.05ms
⏱️ [DAYS] Generated in 0.03ms
⏱️ [TERRAINS] Generated 8 in 0.01ms
⏱️ [CACHE] Built for 8 terrains in 0.52ms
⏱️ [RENDER] Total compute: 2.34ms
```

**SI > 50ms** : Identifier quelle partie prend du temps

---

### 3. Vérification des dépendances instables avec useRef
**Ajouté** :
```typescript
const prevClub = useRef(club)
const prevTimeSlots = useRef(timeSlots)
const prevNextDays = useRef(nextDays)
const prevSelectedDate = useRef(selectedDate)

useEffect(() => {
  if (!Object.is(prevClub.current, club)) {
    console.warn('⚠️ [DEPS] club changed reference!', { 
      wasNbrTerrains: prevClub.current?.nombreTerrains, 
      nowNbrTerrains: club?.nombreTerrains 
    })
    prevClub.current = club
  }
  if (!Object.is(prevTimeSlots.current, timeSlots)) {
    console.warn('⚠️ [DEPS] timeSlots changed reference!')
    prevTimeSlots.current = timeSlots
  }
  if (!Object.is(prevNextDays.current, nextDays)) {
    console.warn('⚠️ [DEPS] nextDays changed reference!')
    prevNextDays.current = nextDays
  }
  if (!Object.is(prevSelectedDate.current, selectedDate)) {
    console.log('✅ [DEPS] selectedDate changed (expected):', selectedDate.toDateString())
    prevSelectedDate.current = selectedDate
  }
})
```

**Attendu** : Aucun warning sauf `selectedDate changed` quand on clique sur une date

**SI warning `club changed reference`** :
- → `club` n'est pas stable
- → Le `useMemo` sur `club` ne marche pas
- → Vérifier que `resolvedParams.id` ne change pas

**SI warning `timeSlots changed reference`** :
- → Le `useMemo([])` sur `timeSlots` ne marche pas
- → Problème de React strict mode ou autre

---

### 4. Stabilisation de `club` en amont
**Changé** :
```typescript
// AVANT (instable)
const club = clubs.find(c => c.id === resolvedParams.id)

// APRÈS (stable avec useMemo)
const club = useMemo(() => clubs.find(c => c.id === resolvedParams.id), [resolvedParams.id])
```

**Raison** : `clubs.find()` retourne une nouvelle référence à chaque appel si `clubs` est un array dans le module. Avec `useMemo`, on garantit que `club` ne change que si `resolvedParams.id` change.

---

### 5. Optimisation O(1) avec Map/Set
**Changé** :
```typescript
// AVANT (O(n) sur array)
const unavailableSlotsCache = useMemo(() => {
  const cache: { [terrainId: number]: string[] } = {}
  terrains.forEach(terrain => {
    cache[terrain.id] = generateUnavailableSlots(terrain.id, selectedDate)
  })
  return cache
}, [selectedDate, terrains])

const isSlotAvailable = (terrainId: number, slot: { startTime: string }) => {
  return !unavailableSlotsCache[terrainId]?.includes(slot.startTime)
  // ↑ .includes() = O(n)
}

// APRÈS (O(1) avec Set)
const unavailableSet = useMemo(() => {
  const map = new Map<number, Set<string>>()
  
  terrains.forEach(terrain => {
    const unavailableSlots = generateUnavailableSlots(terrain.id, selectedDate)
    map.set(terrain.id, new Set(unavailableSlots))
  })
  
  return map
}, [selectedDate, terrains, club.nombreTerrains])

const isSlotAvailable = useCallback((terrainId: number, slot: { startTime: string }): boolean => {
  const terrainSet = unavailableSet.get(terrainId)
  if (!terrainSet) return true
  return !terrainSet.has(slot.startTime)
  // ↑ .has() = O(1)
}, [unavailableSet])
```

**Gain théorique** :
- Avant : 80 lookups × O(n) avec n=3-10 = ~300 opérations
- Après : 80 lookups × O(1) = 80 opérations
- **Gain : 70% d'opérations en moins**

---

### 6. Vérification absence de boucle setState
**Résultat** : ✅ Aucun useEffect qui fait setState sur cette page (sauf le diagnostic)

**Recherche effectuée** :
```bash
grep -n "useEffect" page.tsx
# → Résultat : 1 seul useEffect (diagnostic)
# → Pas de setState dans useEffect
```

---

## 🧪 PROTOCOLE DE TEST

### Test 1 : Confirmer que le code modifié s'exécute
```bash
npm run dev
# Ouvrir http://localhost:3000/player/clubs/1/reserver
# Ouvrir la console Chrome (F12)
```

**Vérifier dans la console** :
```
✅ Doit apparaître : 🚀 RESERVER PAGE VERSION 1737577200000
✅ Doit apparaître : 🔄 ReservationPage render: 1
```

**SI N'APPARAÎT PAS** :
- Code non appliqué
- Cache Next.js : `rm -rf .next && npm run dev`

---

### Test 2 : Mesurer le coût réel
**Dans la console, vérifier** :
```
⏱️ [SLOTS] Generated in X.XXms
⏱️ [DAYS] Generated in X.XXms
⏱️ [TERRAINS] Generated X in X.XXms
⏱️ [CACHE] Built for X terrains in X.XXms
⏱️ [RENDER] Total compute: X.XXms
```

**Seuils attendus** :
- Slots : < 1ms ✅
- Days : < 1ms ✅
- Terrains : < 1ms ✅
- Cache : < 5ms ✅ (10 créneaux × 8 terrains)
- **Total render : < 10ms** ✅

**SI > 50ms** :
- Identifier quelle ligne
- Logs montrent où le temps est dépensé

---

### Test 3 : Vérifier dépendances stables
**Cliquer sur un créneau** (pas changer de date, juste cliquer)

**Dans la console, ne doit PAS apparaître** :
```
❌ ⚠️ [DEPS] club changed reference!
❌ ⚠️ [DEPS] timeSlots changed reference!
❌ ⚠️ [DEPS] nextDays changed reference!
```

**SI apparaît** :
- Problème de stabilité
- useMemo ne fonctionne pas comme prévu
- Possible cause : React Strict Mode (double render en dev)

---

### Test 4 : Vérifier compteurs ne spamment pas
**Cliquer sur un créneau, puis un autre, puis un autre (3 clics)**

**Dans la console** :
```
🔄 ReservationPage render: 1  ← Initial
🔘 [SLOT] Click: 1 08:00      ← Clic 1
🔄 ReservationPage render: 2  ← Re-render modal
🔘 [SLOT] Click: 2 09:30      ← Clic 2
🔄 ReservationPage render: 3  ← Re-render modal
```

**Compteur [CACHE]** :
```
🔄 [CACHE] Recalculating: 1  ← Initial seulement
```

**SI [CACHE] Recalculating spam (2, 3, 4, 5...)** :
- **Problème** : Deps instables
- Vérifier warnings `[DEPS]` ci-dessus
- `terrains` ou `selectedDate` changent de référence

---

### Test 5 : Changer de date (test légitime de recalcul)
**Cliquer sur "Demain" (bouton de date)**

**Dans la console** :
```
✅ [DEPS] selectedDate changed (expected): Thu Jan 23 2026
🔄 [CACHE] Recalculating: 2  ← Normal ! Date a changé
⏱️ [CACHE] Built for 8 terrains in X.XXms
```

**C'est NORMAL** : Le cache DOIT se recalculer quand on change de date.

---

### Test 6 : Test de charge CPU
**Cliquer rapidement 10 fois sur des créneaux différents**

**Vérifier** :
1. Moniteur d'activité → Chrome
   - **Attendu** : < 30% CPU
   - **SI 100% CPU** : Freeze encore présent

2. Console
   - **Attendu** : 10 logs `🔘 [SLOT] Click`
   - **Attendu** : `🔄 ReservationPage render: 1-20` (max 2 par clic)
   - **SI > 50 renders** : Boucle infinie

3. Interface
   - **Attendu** : Réactive, pas de freeze
   - **SI freeze** : Regarder quel log manque (indique où ça bloque)

---

## 📊 INTERPRÉTATION DES RÉSULTATS

### Scénario A : Tout fonctionne ✅
```
🚀 RESERVER PAGE VERSION 1737577200000
🔄 ReservationPage render: 1
⏱️ [SLOTS] Generated in 0.05ms
⏱️ [DAYS] Generated in 0.03ms
⏱️ [TERRAINS] Generated 8 in 0.01ms
🔄 [CACHE] Recalculating: 1
⏱️ [CACHE] Built for 8 terrains in 0.52ms
⏱️ [RENDER] Total compute: 2.34ms

[Clic sur créneau]
🔘 [SLOT] Click: 1 08:00
🔄 ReservationPage render: 2
⏱️ [RENDER] Total compute: 0.15ms  ← Pas de recalcul lourd

[10 clics rapides]
CPU : 15-25%
Renders : 1-20
Interface : Fluide
```

**Conclusion** : **Problème résolu** ✅

---

### Scénario B : Deps instables
```
🚀 RESERVER PAGE VERSION 1737577200000
🔄 ReservationPage render: 1
⚠️ [DEPS] club changed reference!  ← PROBLÈME
🔄 [CACHE] Recalculating: 1
⏱️ [CACHE] Built for 8 terrains in 0.52ms
⏱️ [RENDER] Total compute: 2.34ms

[Clic sur créneau]
🔘 [SLOT] Click: 1 08:00
🔄 ReservationPage render: 2
⚠️ [DEPS] club changed reference!  ← PROBLÈME
🔄 [CACHE] Recalculating: 2  ← Recalcul inutile !
⏱️ [CACHE] Built for 8 terrains in 0.52ms
⏱️ [RENDER] Total compute: 2.89ms
```

**Conclusion** : `club` n'est pas stable malgré `useMemo`

**Cause probable** :
- `resolvedParams.id` change (ne devrait pas)
- Ou `clubs` array change de référence (besoin de le sortir du render)

**Fix** :
```typescript
// Sortir clubs du render (en dehors du composant, après les imports)
const STATIC_CLUBS = [
  { id: '1', nom: 'Le Hangar Sport & Co', ... },
  // ...
]

export default function ReservationPage({ params }) {
  const club = useMemo(() => STATIC_CLUBS.find(c => c.id === resolvedParams.id), [resolvedParams.id])
}
```

---

### Scénario C : Calcul lourd détecté
```
🚀 RESERVER PAGE VERSION 1737577200000
🔄 ReservationPage render: 1
⏱️ [SLOTS] Generated in 0.05ms
⏱️ [DAYS] Generated in 0.03ms
⏱️ [TERRAINS] Generated 8 in 0.01ms
🔄 [CACHE] Recalculating: 1
⏱️ [CACHE] Built for 8 terrains in 125.32ms  ← PROBLÈME !
🔴 [RENDER] SLOW! 128.45ms > 50ms
⏱️ [RENDER] Total compute: 128.45ms
```

**Conclusion** : La génération du cache est trop lente

**Cause probable** :
- `generateUnavailableSlots()` fait un calcul trop lourd
- Ou les 8 terrains × 10 slots = 80 appels prennent trop de temps

**Fix** :
```typescript
// Option 1 : Précalculer tout au mount
const [unavailableCache, setUnavailableCache] = useState(() => buildCache())

// Option 2 : Web Worker
useEffect(() => {
  const worker = new Worker('/worker.js')
  worker.postMessage({ terrains, date: selectedDate })
  worker.onmessage = (e) => setUnavailableCache(e.data)
}, [selectedDate])

// Option 3 : Simplifier generateUnavailableSlots
// - Réduire le nombre de créneaux indisponibles
// - Utiliser une seed plus simple
```

---

### Scénario D : Boucle infinie détectée
```
🚀 RESERVER PAGE VERSION 1737577200000
🔄 ReservationPage render: 1
⏱️ [RENDER] Total compute: 2.34ms
🔄 ReservationPage render: 2
⏱️ [RENDER] Total compute: 2.31ms
🔄 ReservationPage render: 3
⏱️ [RENDER] Total compute: 2.29ms
🔄 ReservationPage render: 4
⏱️ [RENDER] Total compute: 2.32ms
... (à l'infini)
```

**Conclusion** : Boucle de re-renders

**Cause probable** :
- Un state qui change déclenche un re-render
- Ce re-render change le state
- → Boucle

**Debug** :
- Regarder les warnings `[DEPS]` : quelle dep change ?
- Si `club` change : problème dans `useMemo` du club
- Si `terrains` change : problème dans `useMemo` des terrains
- Si rien ne change mais render quand même : vérifier les hooks

---

## 🎯 DIFF PRÉCIS DES MODIFICATIONS

### Fichier : `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

#### Import ajouté :
```diff
- import { useState, use, useMemo, useCallback } from 'react'
+ import { useState, use, useMemo, useCallback, useRef, useEffect } from 'react'
```

#### Début de la fonction :
```diff
export default function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
+ // DIAGNOSTIC: Confirmer version + perf
+ console.log("🚀 RESERVER PAGE VERSION", Date.now())
+ console.count('🔄 ReservationPage render')
+ const renderStart = performance.now()
+
  const resolvedParams = use(params)
  const router = useRouter()
  
- const club = clubs.find(c => c.id === resolvedParams.id)
+ // STABILISATION: Club en dehors du render
+ const club = useMemo(() => clubs.find(c => c.id === resolvedParams.id), [resolvedParams.id])
```

#### TimeSlots et NextDays :
```diff
- const timeSlots = useMemo(() => {
-   console.log('🔄 [SLOTS] Generating time slots')
-   return generateTimeSlots()
- }, [])
+ const timeSlots = useMemo(() => {
+   const start = performance.now()
+   console.count('🔄 [SLOTS] Generating')
+   const result = generateTimeSlots()
+   console.log(`⏱️ [SLOTS] Generated in ${(performance.now() - start).toFixed(2)}ms`)
+   return result
+ }, [])
```

(Même pattern pour `nextDays`)

#### Diagnostic des dépendances :
```diff
+ const prevClub = useRef(club)
+ const prevTimeSlots = useRef(timeSlots)
+ const prevNextDays = useRef(nextDays)
+ const prevSelectedDate = useRef(selectedDate)
+ 
+ useEffect(() => {
+   if (!Object.is(prevClub.current, club)) {
+     console.warn('⚠️ [DEPS] club changed reference!', { 
+       wasNbrTerrains: prevClub.current?.nombreTerrains, 
+       nowNbrTerrains: club?.nombreTerrains 
+     })
+     prevClub.current = club
+   }
+   // ... autres checks
+ })
```

#### Cache avec Map/Set :
```diff
- const unavailableSlotsCache = useMemo(() => {
-   console.log('🔄 [CACHE] Recalculating unavailable slots for', terrains.length, 'terrains')
-   console.time('cache-generation')
-   
-   const cache: { [terrainId: number]: string[] } = {}
-   
-   terrains.forEach(terrain => {
-     cache[terrain.id] = generateUnavailableSlots(terrain.id, selectedDate)
-   })
-   
-   console.timeEnd('cache-generation')
-   console.log('✅ [CACHE] Done:', Object.keys(cache).length, 'terrains cached')
-   return cache
- }, [selectedDate, terrains])
+ const unavailableSet = useMemo(() => {
+   const start = performance.now()
+   console.count('🔄 [CACHE] Recalculating')
+   
+   const map = new Map<number, Set<string>>()
+   
+   terrains.forEach(terrain => {
+     const unavailableSlots = generateUnavailableSlots(terrain.id, selectedDate)
+     map.set(terrain.id, new Set(unavailableSlots))
+   })
+   
+   const elapsed = (performance.now() - start).toFixed(2)
+   console.log(`⏱️ [CACHE] Built for ${terrains.length} terrains in ${elapsed}ms`)
+   
+   return map
+ }, [selectedDate, terrains, club.nombreTerrains])
```

#### isSlotAvailable :
```diff
- const isSlotAvailable = useCallback((terrainId: number, slot: { startTime: string }) => {
-   return !unavailableSlotsCache[terrainId]?.includes(slot.startTime)
- }, [unavailableSlotsCache])
+ const isSlotAvailable = useCallback((terrainId: number, slot: { startTime: string }): boolean => {
+   const terrainSet = unavailableSet.get(terrainId)
+   if (!terrainSet) return true
+   return !terrainSet.has(slot.startTime)
+ }, [unavailableSet])
```

#### Fin du render :
```diff
+ // DIAGNOSTIC: Log render cost
+ const renderEnd = performance.now()
+ const computeMs = (renderEnd - renderStart).toFixed(2)
+ console.log(`⏱️ [RENDER] Total compute: ${computeMs}ms`)
+ 
+ if (parseFloat(computeMs) > 50) {
+   console.error(`🔴 [RENDER] SLOW! ${computeMs}ms > 50ms`)
+ }
```

---

## 🔍 RAISON DU FREEZE RESTANT (basée sur logs)

### Hypothèse #1 : `clubs` array instable
**Symptôme attendu** :
```
⚠️ [DEPS] club changed reference!
🔄 [CACHE] Recalculating: (spam 10+ fois)
```

**Cause** : L'array `clubs` est défini dans le render (lignes 27-97 du fichier). À chaque render, un nouvel array est créé, donc `.find()` retourne un nouvel objet même si le contenu est identique.

**Solution** : Sortir `clubs` en dehors du composant :
```typescript
// AVANT le export default
const CLUBS_DATA: Club[] = [ /* ... */ ]

export default function ReservationPage({ params }) {
  const club = useMemo(() => CLUBS_DATA.find(c => c.id === resolvedParams.id), [resolvedParams.id])
}
```

### Hypothèse #2 : React Strict Mode (double render)
**Symptôme attendu** :
```
🔄 ReservationPage render: 1
⏱️ [RENDER] Total compute: 2.34ms
🔄 ReservationPage render: 2
⏱️ [RENDER] Total compute: 2.31ms
```

**Cause** : En dev, React Strict Mode monte/démonte les composants 2 fois pour détecter les bugs.

**Solution** : Normal en dev, disparaît en prod. Pas un vrai problème.

### Hypothèse #3 : Calcul trop lourd
**Symptôme attendu** :
```
⏱️ [CACHE] Built for 8 terrains in 125.32ms
🔴 [RENDER] SLOW! 128.45ms > 50ms
```

**Cause** : `generateUnavailableSlots()` est trop lent (boucle while, Math.sin, etc.)

**Solution** : Précalculer au serveur ou optimiser l'algo.

---

## ✅ CHECKLIST POST-TEST

- [ ] `🚀 RESERVER PAGE VERSION` apparaît dans la console
- [ ] `⏱️ [RENDER] Total compute` < 10ms au 1er render
- [ ] Pas de warning `⚠️ [DEPS]` sauf `selectedDate` lors d'un changement
- [ ] `🔄 [CACHE] Recalculating: 1` au 1er render seulement
- [ ] 10 clics rapides → CPU < 30%, pas de freeze
- [ ] Pas d'erreur `🔴 [RENDER] SLOW!`

**SI TOUS LES CHECKS PASSENT** : ✅ Problème résolu
**SI 1+ CHECK ÉCHOUE** : Envoyer les logs console complets

---

**Date** : 2026-01-22
**Status** : 🟡 En attente de tests utilisateur avec logs
