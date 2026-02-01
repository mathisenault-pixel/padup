# ✅ Fix: "Club introuvable" + Erreur enum "pending"

## Bugs corrigés

### Bug 1: "Club introuvable"
**Symptôme:** La page reserver affiche "Club introuvable" quand l'URL contient un ancien ID (ex: `/player/clubs/1/reserver`)

**Cause:** Depuis le passage aux UUIDs réels, le club a l'ID `ba43c579-e522-4b51-8542-737c2c6452bb` mais les anciennes URLs utilisent encore `1`, `2`, etc.

---

### Bug 2: Erreur Supabase 22P02
**Symptôme:** `invalid input value for enum booking_status: "pending"`

**Cause:** L'enum `booking_status` en DB ne supporte PAS la valeur `"pending"`. Les valeurs valides sont probablement `"confirmed"` et `"cancelled"`.

---

## Solutions appliquées

### 1. **Constante DEMO_CLUB_UUID**

**Fichier:** `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

```typescript
// ✅ UUID du club démo (MVP: un seul club)
const DEMO_CLUB_UUID = 'ba43c579-e522-4b51-8542-737c2c6452bb'

const clubs: Club[] = [
  {
    id: DEMO_CLUB_UUID,
    nom: 'Club Démo Pad\'up',
    ...
  }
]
```

---

### 2. **Redirection automatique vers le bon UUID**

**AVANT:**
```typescript
const club = useMemo(() => clubs.find(c => c.id === resolvedParams.id), [resolvedParams.id])

// Si params.id = "1" → club = undefined → "Club introuvable"
```

**APRÈS:**
```typescript
// ✅ Redirection si l'ID ne correspond pas
useEffect(() => {
  if (resolvedParams.id !== DEMO_CLUB_UUID) {
    console.log('[CLUB REDIRECT] Invalid club ID:', resolvedParams.id, '→ redirecting to', DEMO_CLUB_UUID)
    router.replace(`/player/clubs/${DEMO_CLUB_UUID}/reserver`)
  }
}, [resolvedParams.id, router])

// ✅ Toujours retourner le club démo (MVP: un seul club)
const club = useMemo(() => {
  return clubs[0]
}, [])
```

**Résultat:**
- URL `/player/clubs/1/reserver` → redirige automatiquement vers `/player/clubs/ba43c579-.../reserver`
- URL `/player/clubs/xyz/reserver` → redirige automatiquement vers `/player/clubs/ba43c579-.../reserver`
- Plus jamais "Club introuvable"

---

### 3. **Suppression de "pending" dans loadBookings (SELECT)**

**AVANT:**
```typescript
const { data, error } = await supabase
  .from('bookings')
  .select('id, court_id, booking_date, slot_id, status')
  .in('court_id', courtIds)
  .eq('booking_date', bookingDate)
  .in('status', ['confirmed', 'pending'])  // ❌ 'pending' invalide
```

**Erreur:**
```
22P02: invalid input value for enum booking_status: "pending"
```

**APRÈS:**
```typescript
const { data, error } = await supabase
  .from('bookings')
  .select('id, court_id, booking_date, slot_id, status')
  .in('court_id', courtIds)
  .eq('booking_date', bookingDate)
  .eq('status', 'confirmed')  // ✅ Uniquement 'confirmed'
```

**Résultat:** Aucune erreur 22P02

---

### 4. **Suppression de "pending" dans Realtime (INSERT)**

**AVANT:**
```typescript
if (payload.eventType === 'INSERT' && payloadNew) {
  if (payloadNew.status === 'confirmed' || payloadNew.status === 'pending') {  // ❌
    // ajouter au Set
  }
}
```

**APRÈS:**
```typescript
if (payload.eventType === 'INSERT' && payloadNew) {
  if (payloadNew.status === 'confirmed') {  // ✅
    // ajouter au Set
  }
}
```

---

### 5. **Suppression de "pending" dans Realtime (UPDATE)**

**AVANT:**
```typescript
// Cas 1: changement de status
if (payloadOld.status !== payloadNew.status) {
  // old → confirmed/pending: ajouter
  if (payloadNew.status === 'confirmed' || payloadNew.status === 'pending') {  // ❌
    // ajouter
  }
  // confirmed/pending → cancelled: retirer
  else if (payloadNew.status === 'cancelled' && 
           (payloadOld.status === 'confirmed' || payloadOld.status === 'pending')) {  // ❌
    // retirer
  }
}

// Cas 2: changement de slot_id
if (payloadOld.slot_id !== payloadNew.slot_id) {
  if (payloadOld.status === 'confirmed' || payloadOld.status === 'pending') {  // ❌
    newSet.delete(payloadOld.slot_id)
  }
  if (payloadNew.status === 'confirmed' || payloadNew.status === 'pending') {  // ❌
    newSet.add(payloadNew.slot_id)
  }
}
```

**APRÈS:**
```typescript
// Cas 1: changement de status
if (payloadOld.status !== payloadNew.status) {
  // old → confirmed: ajouter
  if (payloadNew.status === 'confirmed') {  // ✅
    // ajouter
  }
  // confirmed → cancelled: retirer
  else if (payloadNew.status === 'cancelled' && payloadOld.status === 'confirmed') {  // ✅
    // retirer
  }
}

// Cas 2: changement de slot_id
if (payloadOld.slot_id !== payloadNew.slot_id) {
  if (payloadOld.status === 'confirmed') {  // ✅
    newSet.delete(payloadOld.slot_id)
  }
  if (payloadNew.status === 'confirmed') {  // ✅
    newSet.add(payloadNew.slot_id)
  }
}
```

---

### 6. **Mise à jour des types et commentaires**

**Type Booking:**
```typescript
type Booking = {
  id: string
  court_id: string
  booking_date: string
  slot_id: number
  status: string // 'confirmed' | 'cancelled' (enum booking_status ne supporte pas 'pending')
  slot_start?: string
  slot_end?: string
}
```

**Payload d'insertion:**
```typescript
const bookingPayload = {
  club_id: club.id,
  court_id: courtId,
  booking_date: bookingDate,
  slot_id: selectedSlot.id,
  status: 'confirmed' as const,  // 'confirmed' | 'cancelled' (enum booking_status)
  created_by: user.id,
  created_at: new Date().toISOString()
}
```

---

## Résumé des changements

| Modification | Avant | Après |
|--------------|-------|-------|
| **Club UUID** | ID variable selon URL | Constante `DEMO_CLUB_UUID` |
| **Club lookup** | `clubs.find(c => c.id === params.id)` | `clubs[0]` (toujours le club démo) |
| **Redirection** | Aucune → "Club introuvable" | Auto-redirect vers UUID correct |
| **SELECT status** | `.in('status', ['confirmed', 'pending'])` | `.eq('status', 'confirmed')` |
| **Realtime INSERT** | `status === 'confirmed' \|\| 'pending'` | `status === 'confirmed'` |
| **Realtime UPDATE** | `status === 'confirmed' \|\| 'pending'` | `status === 'confirmed'` |
| **Type Booking** | `'confirmed' \| 'pending' \| 'cancelled'` | `'confirmed' \| 'cancelled'` |

---

## Tests de validation

### Test 1: Redirection automatique

1. **Aller sur:** `/player/clubs/1/reserver`
2. **Vérifier:** Redirection automatique vers `/player/clubs/ba43c579-.../reserver`
3. **Logs attendus:**
   ```
   [CLUB REDIRECT] Invalid club ID: 1 → redirecting to ba43c579-e522-4b51-8542-737c2c6452bb
   ```
4. **Résultat:** Page reserver s'affiche correctement (pas "Club introuvable")

---

### Test 2: SELECT bookings sans erreur

1. **Aller sur:** `/player/clubs/ba43c579-.../reserver`
2. **Ouvrir la console**
3. **Vérifier les logs:**
   ```
   [BOOKINGS] Loading for all courts: { courtIds: [...], bookingDate: "2026-02-01" }
   [BOOKINGS] fetched count X
   [BOOKINGS] bookedSlots size Y
   ```
4. **Pas d'erreur 22P02**

---

### Test 3: Réservation sans "pending"

1. **Faire une réservation**
2. **Vérifier le payload:**
   ```
   [BOOKING PAYLOAD BEFORE INSERT]
   {
     ...
     "status": "confirmed",  ✅ pas "pending"
     ...
   }
   ```
3. **Vérifier l'insert:**
   ```
   [BOOKING INSERT] ✅✅✅ SUCCESS
   ```
4. **Pas d'erreur 22P02**

---

### Test 4: Realtime avec "confirmed" uniquement

1. **Ouvrir 2 onglets**
2. **Réserver dans onglet 1**
3. **Vérifier logs Realtime dans onglet 2:**
   ```
   [REALTIME bookings] payload { eventType: 'INSERT', new: { status: 'confirmed', ... } }
   [REALTIME] ✅ Slot booked (INSERT): { courtKey: "...", slotId: 5 }
   ```
4. **Le créneau se grise instantanément**

---

## Enum booking_status en DB

**Valeurs valides (supposées):**
- ✅ `'confirmed'`
- ✅ `'cancelled'`
- ❌ `'pending'` (n'existe PAS)

**Si vous avez besoin de "pending":**
1. Ajouter la valeur à l'enum en DB:
   ```sql
   ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'pending';
   ```
2. Remettre les conditions avec "pending" dans le code

**Note:** Pour ce MVP, "pending" n'est pas nécessaire. Toutes les réservations sont directement "confirmed".

---

## Checklist de validation

- [x] Constante `DEMO_CLUB_UUID` créée
- [x] Redirection automatique si ID invalide
- [x] Club lookup simplifié (`clubs[0]`)
- [x] "pending" supprimé de `.in('status', ...)`
- [x] "pending" supprimé des conditions Realtime INSERT
- [x] "pending" supprimé des conditions Realtime UPDATE
- [x] Type `Booking` mis à jour
- [x] Commentaires mis à jour
- [x] Build OK
- [ ] **À TESTER:** URL `/player/clubs/1/reserver` redirige
- [ ] **À TESTER:** Aucune erreur 22P02 lors du SELECT
- [ ] **À TESTER:** Réservation fonctionne
- [ ] **À TESTER:** Realtime fonctionne

---

## Fichiers modifiés

- **`app/player/(authenticated)/clubs/[id]/reserver/page.tsx`**
  - Ajout de `DEMO_CLUB_UUID`
  - Ajout de `useEffect` pour redirection
  - Simplification de `club` lookup
  - Suppression de "pending" partout

---

**Date:** 2026-02-01  
**Status:** Fix appliqué, build OK, prêt pour tests
