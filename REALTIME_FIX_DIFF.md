# 🔧 Correction de l'implémentation Realtime - DIFF EXACT

## Contexte

**Problèmes corrigés:**
1. ❌ Le filtre Realtime ne filtrait que sur `court_id`, pas sur `booking_date`
2. ❌ La logique du callback ne gérait pas correctement tous les cas d'UPDATE
3. ❌ Utilisation de variables `newBooking`/`oldBooking` au lieu de `payloadNew`/`payloadOld`
4. ⚠️ Pas de référence à `'pending'` (statut inexistant dans l'enum)

## Enum booking_status

```sql
booking_status = ('confirmed', 'cancelled')
```

**Il n'existe PAS de statut `'pending'`** dans la DB.

---

## 🔧 CORRECTION APPLIQUÉE

### Fichier: `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

**Ligne 275-334 — Callback Realtime (AVANT)**

```typescript
const channel = supabase
  .channel(`bookings-${courtId}-${bookingDate}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookings',
    filter: `court_id=eq.${courtId}`,
  }, (payload) => {
    const newBooking = payload.new as BookedSlot
    const oldBooking = payload.old as BookedSlot
    
    // Si INSERT ou UPDATE vers confirmed
    if (payload.eventType === 'INSERT' || 
        (payload.eventType === 'UPDATE' && newBooking?.status === 'confirmed')) {
      if (newBooking.booking_date === bookingDate && newBooking.status === 'confirmed') {
        setBookedSlots(prev => new Set([...prev, newBooking.slot_id]))
      }
    }
    
    // Si UPDATE vers cancelled ou DELETE
    if (payload.eventType === 'DELETE' || 
        (payload.eventType === 'UPDATE' && newBooking?.status === 'cancelled')) {
      const slotToRemove = payload.eventType === 'DELETE' ? oldBooking?.slot_id : newBooking?.slot_id
      if (slotToRemove) {
        setBookedSlots(prev => {
          const newSet = new Set(prev)
          newSet.delete(slotToRemove)
          return newSet
        })
      }
    }
  })
```

**Ligne 275-368 — Callback Realtime (APRÈS)**

```typescript
const channel = supabase
  .channel(`bookings-${courtId}-${bookingDate}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookings',
    filter: `court_id=eq.${courtId}`, // ⚠️ Supabase ne supporte pas AND dans filter
  }, (payload) => {
    console.log('[REALTIME] Change detected:', payload)
    
    // ✅ Filtrer manuellement par booking_date dans le callback
    const payloadNew = payload.new as BookedSlot | null
    const payloadOld = payload.old as BookedSlot | null
    
    // Ignorer les événements qui ne concernent pas notre date
    if (payloadNew && payloadNew.booking_date !== bookingDate) {
      console.log('[REALTIME] Ignored (wrong date):', payloadNew.booking_date)
      return
    }
    if (!payloadNew && payloadOld && payloadOld.booking_date !== bookingDate) {
      console.log('[REALTIME] Ignored (wrong date):', payloadOld.booking_date)
      return
    }
    
    // ✅ INSERT: ajouter si status = 'confirmed'
    if (payload.eventType === 'INSERT') {
      if (payloadNew?.status === 'confirmed') {
        setBookedSlots(prev => new Set([...prev, payloadNew.slot_id]))
        console.log('[REALTIME] ✅ Slot booked (INSERT):', payloadNew.slot_id)
      }
    }
    
    // ✅ UPDATE: gérer changement de status ou slot_id
    else if (payload.eventType === 'UPDATE') {
      if (!payloadOld || !payloadNew) return
      
      // Cas 1: changement de status
      if (payloadOld.status !== payloadNew.status) {
        // old: cancelled → new: confirmed => ajouter
        if (payloadNew.status === 'confirmed') {
          setBookedSlots(prev => new Set([...prev, payloadNew.slot_id]))
          console.log('[REALTIME] ✅ Slot booked (UPDATE confirmed):', payloadNew.slot_id)
        }
        // old: confirmed → new: cancelled => retirer
        else if (payloadNew.status === 'cancelled' && payloadOld.status === 'confirmed') {
          setBookedSlots(prev => {
            const newSet = new Set(prev)
            newSet.delete(payloadOld.slot_id)
            return newSet
          })
          console.log('[REALTIME] ✅ Slot freed (UPDATE cancelled):', payloadOld.slot_id)
        }
      }
      
      // Cas 2: changement de slot_id (rare, mais possible)
      else if (payloadOld.slot_id !== payloadNew.slot_id) {
        setBookedSlots(prev => {
          const newSet = new Set(prev)
          // Retirer l'ancien slot si c'était confirmed
          if (payloadOld.status === 'confirmed') {
            newSet.delete(payloadOld.slot_id)
          }
          // Ajouter le nouveau slot si c'est confirmed
          if (payloadNew.status === 'confirmed') {
            newSet.add(payloadNew.slot_id)
          }
          return newSet
        })
        console.log('[REALTIME] ✅ Slot changed:', payloadOld.slot_id, '→', payloadNew.slot_id)
      }
    }
    
    // ✅ DELETE: retirer le slot
    else if (payload.eventType === 'DELETE') {
      if (payloadOld?.slot_id) {
        setBookedSlots(prev => {
          const newSet = new Set(prev)
          newSet.delete(payloadOld.slot_id)
          return newSet
        })
        console.log('[REALTIME] ✅ Slot freed (DELETE):', payloadOld.slot_id)
      }
    }
  })
```

---

## ✅ CHANGEMENTS DÉTAILLÉS

### 1. Filtre Realtime

**AVANT:**
```typescript
filter: `court_id=eq.${courtId}`,
```

**APRÈS:**
```typescript
filter: `court_id=eq.${courtId}`, // ⚠️ Supabase ne supporte pas AND dans filter
```

**✅ Filtrage manuel ajouté dans le callback:**
```typescript
// Ignorer les événements qui ne concernent pas notre date
if (payloadNew && payloadNew.booking_date !== bookingDate) {
  return
}
if (!payloadNew && payloadOld && payloadOld.booking_date !== bookingDate) {
  return
}
```

### 2. Variables payload

**AVANT:**
```typescript
const newBooking = payload.new as BookedSlot
const oldBooking = payload.old as BookedSlot
```

**APRÈS:**
```typescript
const payloadNew = payload.new as BookedSlot | null
const payloadOld = payload.old as BookedSlot | null
```

**Raison:** Typage correct avec `| null` pour gérer les cas DELETE.

### 3. Logique INSERT

**AVANT:**
```typescript
if (payload.eventType === 'INSERT' || ...) {
  if (newBooking.booking_date === bookingDate && newBooking.status === 'confirmed') {
    // ...
  }
}
```

**APRÈS:**
```typescript
if (payload.eventType === 'INSERT') {
  if (payloadNew?.status === 'confirmed') {
    setBookedSlots(prev => new Set([...prev, payloadNew.slot_id]))
    console.log('[REALTIME] ✅ Slot booked (INSERT):', payloadNew.slot_id)
  }
}
```

**✅ Séparation claire des événements** (plus de mélange INSERT/UPDATE).

### 4. Logique UPDATE

**AVANT:**
```typescript
if (payload.eventType === 'INSERT' || 
    (payload.eventType === 'UPDATE' && newBooking?.status === 'confirmed')) {
  // ...
}
```

**APRÈS:**
```typescript
else if (payload.eventType === 'UPDATE') {
  if (!payloadOld || !payloadNew) return
  
  // Cas 1: changement de status
  if (payloadOld.status !== payloadNew.status) {
    if (payloadNew.status === 'confirmed') {
      // Ajouter
    }
    else if (payloadNew.status === 'cancelled' && payloadOld.status === 'confirmed') {
      // Retirer
    }
  }
  
  // Cas 2: changement de slot_id
  else if (payloadOld.slot_id !== payloadNew.slot_id) {
    // Gérer déplacement de slot
  }
}
```

**✅ Gère maintenant:**
- ✅ Changement `cancelled` → `confirmed`
- ✅ Changement `confirmed` → `cancelled`
- ✅ Changement de `slot_id` (rare)

### 5. Logique DELETE

**AVANT:**
```typescript
if (payload.eventType === 'DELETE' || 
    (payload.eventType === 'UPDATE' && newBooking?.status === 'cancelled')) {
  const slotToRemove = payload.eventType === 'DELETE' ? oldBooking?.slot_id : newBooking?.slot_id
  // ...
}
```

**APRÈS:**
```typescript
else if (payload.eventType === 'DELETE') {
  if (payloadOld?.slot_id) {
    setBookedSlots(prev => {
      const newSet = new Set(prev)
      newSet.delete(payloadOld.slot_id)
      return newSet
    })
    console.log('[REALTIME] ✅ Slot freed (DELETE):', payloadOld.slot_id)
  }
}
```

**✅ Séparation claire** entre UPDATE vers `cancelled` et DELETE.

---

## ✅ VÉRIFICATIONS

| Point | Status |
|-------|--------|
| Filtre `court_id` dans Realtime | ✅ |
| Filtre `booking_date` dans callback | ✅ |
| Typage correct (`payloadNew` / `payloadOld`) | ✅ |
| Gestion INSERT | ✅ |
| Gestion UPDATE (status change) | ✅ |
| Gestion UPDATE (slot_id change) | ✅ |
| Gestion DELETE | ✅ |
| Aucune référence à `'pending'` | ✅ |
| `isSlotAvailable` utilise `bookedSlots` state | ✅ |
| Build Next.js OK | ✅ |

---

## 📊 Tableau de flux

| Événement | Action |
|-----------|--------|
| **INSERT** + `status='confirmed'` | Ajouter `slot_id` au Set |
| **INSERT** + `status='cancelled'` | Rien (pas ajouté) |
| **UPDATE** `cancelled`→`confirmed` | Ajouter `slot_id` au Set |
| **UPDATE** `confirmed`→`cancelled` | Retirer `slot_id` du Set |
| **UPDATE** `slot_id` change | Retirer ancien, ajouter nouveau (selon status) |
| **DELETE** | Retirer `slot_id` du Set |

---

## 🚀 Résultat

✅ **Synchronisation temps réel conforme à l'enum `booking_status`**  
✅ **Filtre correct sur `court_id` + `booking_date`**  
✅ **Tous les cas d'UPDATE gérés**  
✅ **Pas de référence à `'pending'`**  
✅ **Build OK**

---

**Date:** 2026-01-22  
**Commit:** À venir
