# FIX — React Error #310 (useEffect crash sur club)

**Date:** 2026-01-22  
**Fichier corrigé:** `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

---

## 🔴 PROBLÈME

**Symptôme:**
- En production, crash avec "Minified React error #310"
- Console affiche: "[CLUB] Selected club: Object"
- L'app crashe car des `useEffect` ou handlers accèdent à `club.id`, `club.name`, etc. alors que les données ne sont pas encore prêtes

**Cause:**
React error #310 survient quand un hook (comme `useEffect`, `useCallback`) essaie d'accéder à une propriété d'un objet `undefined`/`null` ou incomplet.

Dans notre cas:
- `club` peut être `null`, `undefined`, ou un objet vide `{}`
- Plusieurs `useEffect` et `useCallback` utilisaient `club.id`, `club.name` sans vérifier que ces propriétés existaient

---

## ✅ SOLUTION APPLIQUÉE

### 1. **Guard principal renforcé (ligne 289-337)**

**AVANT:**
```typescript
if (!club) {
  // Afficher erreur
  return (...)
}

// ❌ Pas de vérification de club.id
// Le code JSX peut maintenant accéder à club.imageUrl, club.name, etc.
```

**APRÈS:**
```typescript
// ✅ Guard 1: Vérifier que club existe
if (!club) {
  console.error('[CLUB] ❌ CRITICAL: No club found!')
  return (...)
}

// ✅ Guard 2: Vérifier que club.id existe (propriété critique)
if (!club.id) {
  console.error('[CLUB] ❌ CRITICAL: Club has no id!')
  return (...)
}

// ✅ Maintenant safe: JSX peut accéder à club.name, club.imageUrl, etc.
```

---

### 2. **useEffect "Load Bookings" (ligne 418-427)**

**AVANT:**
```typescript
useEffect(() => {
  if (!club) {
    console.warn('🔍 [DEBUG BOOKINGS] No club, skipping')
    return
  }
  
  const loadBookings = async () => {
    // ...
    console.log('🔍 [DEBUG BOOKINGS] Club ID:', club.id) // ❌ Peut crasher si club.id n'existe pas
    // ...
    .eq('club_id', club.id) // ❌ Peut crasher
  }
}, [selectedDate, club, terrains])
```

**APRÈS:**
```typescript
useEffect(() => {
  // ✅ Guard 1: Vérifier que club existe
  if (!club) {
    console.warn('🔍 [DEBUG BOOKINGS] No club, skipping')
    return
  }
  
  // ✅ Guard 2: Vérifier que club.id existe
  if (!club.id) {
    console.warn('🔍 [DEBUG BOOKINGS] No club.id, skipping')
    return
  }
  
  const loadBookings = async () => {
    // ✅ Safe: club.id est garanti d'exister
    console.log('🔍 [DEBUG BOOKINGS] Club ID:', club.id)
    .eq('club_id', club.id)
  }
}, [selectedDate, club, terrains])
```

---

### 3. **useEffect "Realtime Sync" (ligne 495-509)**

**AVANT:**
```typescript
useEffect(() => {
  if (!club) return
  
  // ❌ Pas de vérification de club.id
  const bookingDate = selectedDate.toISOString().split('T')[0]
  
  console.log('[REALTIME] Subscribing to bookings:', { 
    clubId: club.id, // ❌ Peut crasher
  })
  
  const channel = supabase
    .channel(`bookings-${club.id}-${bookingDate}`) // ❌ Peut crasher
}, [selectedDate, club, terrains])
```

**APRÈS:**
```typescript
useEffect(() => {
  // ✅ Guard 1: Vérifier que club existe
  if (!club) {
    console.warn('[REALTIME] No club, skipping')
    return
  }
  
  // ✅ Guard 2: Vérifier que club.id existe
  if (!club.id) {
    console.warn('[REALTIME] No club.id, skipping')
    return
  }
  
  // ✅ Safe: club.id est garanti d'exister
  const bookingDate = selectedDate.toISOString().split('T')[0]
  
  console.log('[REALTIME] Subscribing to bookings:', { 
    clubId: club.id, // ✅ Safe
  })
  
  const channel = supabase
    .channel(`bookings-${club.id}-${bookingDate}`) // ✅ Safe
}, [selectedDate, club, terrains])
```

---

### 4. **useCallback "sendInvitations" (ligne 630-666)**

**AVANT:**
```typescript
const sendInvitations = useCallback(async (reservationId: string) => {
  // ❌ Pas de guard sur club
  
  try {
    const response = await fetch('/api/invite', {
      method: 'POST',
      body: JSON.stringify({
        clubName: club.name, // ❌ Peut crasher si club.name n'existe pas
      })
    })
  }
}, [invitedEmails, club, selectedDate, selectedSlot])
```

**APRÈS:**
```typescript
const sendInvitations = useCallback(async (reservationId: string) => {
  // ✅ GUARD: Vérifier que club est prêt
  if (!club || !club.id || !club.name) {
    console.error('[INVITE] ❌ Club not ready:', { club })
    return
  }
  
  // ✅ Safe: club.name est garanti d'exister
  try {
    const response = await fetch('/api/invite', {
      method: 'POST',
      body: JSON.stringify({
        clubName: club.name, // ✅ Safe
      })
    })
  }
}, [invitedEmails, club, selectedDate, selectedSlot])
```

---

### 5. **useCallback "handleFinalConfirmation" (ligne 709-1090)**

**AVANT:**
```typescript
const handleFinalConfirmation = useCallback(async (withPremium: boolean) => {
  // ✅ Guards existants pour selectedDate, selectedSlot, selectedTerrain
  
  // ❌ Pas de guard sur club
  
  // ...
  const bookingPayload = {
    club_id: club.id, // ❌ Peut crasher si club.id n'existe pas
  }
}, [..., club, ...])
```

**APRÈS:**
```typescript
const handleFinalConfirmation = useCallback(async (withPremium: boolean) => {
  // ✅ GUARD: Vérifier que club est prêt
  if (!club || !club.id) {
    console.error('[RESERVE] ❌ CRITICAL: club or club.id is null/undefined', { club })
    alert('Erreur critique: Données du club manquantes')
    return
  }
  
  // ✅ Guards existants pour selectedDate, selectedSlot, selectedTerrain
  
  // ✅ Safe: club.id est garanti d'exister
  const bookingPayload = {
    club_id: club.id, // ✅ Safe
  }
}, [..., club, ...])
```

---

## 📋 RÉCAPITULATIF DES GUARDS

| Emplacement | Guard Ajouté | Protection |
|-------------|--------------|-----------|
| **Ligne 289-337** | `if (!club)` + `if (!club.id)` | Bloque tout le rendu JSX si club invalide |
| **Ligne 418-427** | `if (!club)` + `if (!club.id)` | Empêche useEffect bookings de crasher |
| **Ligne 495-509** | `if (!club)` + `if (!club.id)` | Empêche useEffect realtime de crasher |
| **Ligne 643-645** | `if (!club \|\| !club.id \|\| !club.name)` | Empêche sendInvitations de crasher |
| **Ligne 723-727** | `if (!club \|\| !club.id)` | Empêche handleFinalConfirmation de crasher |

---

## ✅ RÉSULTAT

**Build:**
```bash
npm run build
```

```
✅ Compiled successfully in 3.8s
✅ Generating static pages using 1 worker (30/30) in 770.6ms
✅ NO ERRORS
```

**Comportement attendu:**
- ✅ Plus de crash React #310
- ✅ Tous les `useEffect` attendent que `club` soit complètement chargé avant d'exécuter leur logique
- ✅ Tous les `useCallback` vérifient que `club` et `club.id` existent avant d'accéder aux propriétés
- ✅ Le JSX ne s'affiche que si `club` et `club.id` sont valides

---

## 🧪 TEST

1. Démarrer l'app:
   ```bash
   npm run dev
   ```

2. Naviguer vers `/player/clubs`

3. Cliquer sur un club

4. Vérifier console browser:
   ```
   [CLUB FETCH] ✅ Club loaded successfully: { id: "...", name: "...", city: "..." }
   [CLUB] Selected club: { id: "...", name: "...", ... }
   [DEBUG COURTS] Club ID: a1b2c3d4-...
   [DEBUG BOOKINGS] Club ID: a1b2c3d4-...
   [REALTIME] Subscribing to bookings: { clubId: "a1b2c3d4-..." }
   ```

5. ✅ Aucune erreur React #310

6. ✅ Page s'affiche correctement avec toutes les informations du club

---

## 📝 RÈGLE GÉNÉRALE

**Pour TOUT composant qui utilise `club` (ou tout objet chargé de façon asynchrone) :**

### Dans useEffect / useCallback:
```typescript
useEffect(() => {
  // ✅ TOUJOURS vérifier AVANT d'accéder aux propriétés
  if (!club) return
  if (!club.id) return
  if (!Array.isArray(club.courts)) return // Si nécessaire
  
  // ✅ Maintenant safe: utiliser club.id, club.courts, etc.
}, [club])
```

### Dans le JSX (au début du composant):
```typescript
// ✅ Bloquer le rendu si données incomplètes
if (!club || !club.id) return null
if (!Array.isArray(club.courts)) return null

// ✅ Maintenant safe: JSX peut utiliser club.name, club.imageUrl, etc.
return (
  <div>
    <h1>{club.name}</h1>
    <img src={club.imageUrl} />
  </div>
)
```

---

## 🎯 CONCLUSION

Le bug React #310 était causé par des accès à `club.id`, `club.name`, etc. avant que l'objet `club` soit complètement chargé.

**Solution:** Ajouter des guards strictes (`if (!club)` + `if (!club.id)`) dans TOUS les endroits qui utilisent `club` :
- ✅ Guard principal dans le rendu (ligne 289-337)
- ✅ Guards dans tous les useEffect (lignes 418, 495)
- ✅ Guards dans tous les useCallback (lignes 643, 723)

**Résultat:** L'app attend maintenant que `club` soit complètement prêt avant d'exécuter toute logique ou d'afficher le JSX.
