# ✅ Vérification : L'insert est-il correct ?

## État actuel du code

### 📁 Fichier: `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

**Ligne 486-502 — Payload d'insertion:**

```typescript
const bookingPayload = {
  club_id: club.id,                    // ✅ club_id (string)
  court_id: courtId,                   // ✅ court_id (UUID)
  booking_date: bookingDate,           // ✅ booking_date (DATE YYYY-MM-DD)
  slot_id: selectedSlot.id,            // ✅ slot_id (INTEGER)
  status: 'confirmed' as const,        // ✅ status ('confirmed')
  created_by: 'player-demo-user',      // ✅ created_by
  created_at: new Date().toISOString() // ✅ created_at
}

console.log('[BOOKING INSERT] Payload:', bookingPayload)

const { data: bookingData, error: bookingError } = await supabase
  .from('bookings')                    // ✅ Table correcte
  .insert([bookingPayload])
  .select()
  .single()
```

**✅ TOUS LES CHAMPS REQUIS SONT PRÉSENTS**

---

## 🔍 Vérifier si le problème vient d'anciennes données

Si vous avez des lignes avec `booking_date NULL` ou `slot_id NULL`, ce sont des **anciennes données de test**.

### Script de nettoyage créé :

`supabase/cleanup_null_bookings.sql`

**Ce script:**
1. ✅ Affiche les lignes problématiques
2. ✅ Supprime toutes les lignes avec `booking_date IS NULL` ou `slot_id IS NULL`
3. ✅ Vérifie que les contraintes `NOT NULL` sont appliquées
4. ✅ Affiche le résultat final

---

## 🧪 Test du flux complet

### Étape par étape :

1. **Ouvrir la console du navigateur (F12)**
2. **Aller sur un club** : `/player/clubs/1/reserver`
3. **Cliquer sur un créneau disponible**
4. **Confirmer la réservation**

### Logs attendus dans la console :

```
[BOOKING INSERT] Payload: {
  club_id: "1",
  court_id: "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
  booking_date: "2026-01-23",
  slot_id: 5,
  status: "confirmed",
  created_by: "player-demo-user",
  created_at: "2026-01-23T10:30:00.000Z"
}

[BOOKING INSERT] ✅ Success: { id: 123, club_id: "1", court_id: "...", booking_date: "2026-01-23", slot_id: 5, ... }

[REALTIME] Change detected: { eventType: 'INSERT', new: { slot_id: 5, booking_date: "2026-01-23", ... } }
[REALTIME] ✅ Slot booked (INSERT): { courtKey: "6dceaf95-...", slotId: 5 }
```

### ✅ Résultat visible :
- Le créneau cliqué devient **gris** instantanément
- Les autres onglets/navigateurs voient aussi le créneau **gris**

---

## 🔧 Actions à faire maintenant

### 1. Nettoyer les anciennes données NULL

**Dans Supabase SQL Editor, exécuter :**

```sql
-- Voir les lignes problématiques
SELECT id, club_id, court_id, booking_date, slot_id, status, created_at
FROM public.bookings
WHERE booking_date IS NULL OR slot_id IS NULL
ORDER BY created_at DESC;

-- Si des lignes s'affichent, les supprimer
DELETE FROM public.bookings
WHERE booking_date IS NULL OR slot_id IS NULL;
```

**Ou exécuter tout le script :**
```bash
# Dans Supabase SQL Editor
# Copier-coller le contenu de supabase/cleanup_null_bookings.sql
```

### 2. Vérifier le mapping des courts

**Dans le fichier :**
```typescript
const COURT_ID_MAP: Record<string, Record<number, string>> = {
  '1': { // Le Hangar
    1: '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e',
    // ... vérifier que ces UUIDs correspondent aux vrais court_id en DB
  }
}
```

**Vérifier en DB :**
```sql
SELECT id, club_id, name FROM public.courts ORDER BY club_id, name;
```

Comparer avec `COURT_ID_MAP` et corriger si nécessaire.

### 3. Tester le flux complet

1. Ouvrir 2 onglets
2. Réserver dans onglet 1
3. ✅ Vérifier que onglet 2 grise instantanément

---

## ⚠️ Note importante

**Le fichier `/app/api/bookings/route.ts` insère encore dans `reservations` (ancienne structure).**

Ce endpoint n'est **PAS** utilisé par le flux principal de réservation, mais il existe encore. Si vous voyez des inserts dans `reservations`, c'est peut-être ce endpoint qui est appelé par erreur.

**Solution :**
- Soit supprimer `/app/api/bookings/route.ts` complètement
- Soit le réécrire pour insérer dans `bookings` au lieu de `reservations`

---

## ✅ Checklist de vérification

- [x] `handleFinalConfirmation` insère dans `public.bookings`
- [x] Tous les champs requis sont présents (club_id, court_id, booking_date, slot_id, status)
- [x] Log `[BOOKING INSERT] Payload:` ajouté
- [x] Gestion erreur 23505 (double-booking)
- [x] Build OK
- [ ] **À FAIRE** : Nettoyer les anciennes données NULL en DB
- [ ] **À FAIRE** : Vérifier que `COURT_ID_MAP` correspond aux vrais UUIDs
- [ ] **À FAIRE** : Tester le flux complet

---

**Date:** 2026-01-22  
**Commit:** `d1fa624`
