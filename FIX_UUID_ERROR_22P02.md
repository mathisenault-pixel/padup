# ✅ Fix erreur Supabase 22P02: "invalid input syntax for type uuid"

## Problème identifié

**Erreur:**
```
ERROR: invalid input syntax for type uuid: '1'
Table: bookings
```

**Cause:**
Le code essayait d'insérer `club.id = '1'` (string) dans le champ `club_id` (UUID) de la table `bookings`.

Les clubs en dur dans le frontend avaient des IDs comme '1', '2', '3', '4' au lieu de vrais UUIDs.

---

## Solution appliquée

### 1. Ajout du mapping CLUB_ID_MAP

**Fichier:** `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

```typescript
// ⚠️ MAPPING des IDs de clubs en dur vers les vrais UUIDs en DB
// Ces UUIDs doivent correspondre aux IDs dans public.clubs
const CLUB_ID_MAP: Record<string, string> = {
  '1': 'a1b2c3d4-e5f6-4789-a012-3456789abcde', // Le Hangar Sport & Co
  '2': 'b2c3d4e5-f6a7-4890-b123-456789abcdef', // Paul & Louis Sport
  '3': 'c3d4e5f6-a7b8-4901-c234-56789abcdef0', // ZE Padel
  '4': 'd4e5f6a7-b8c9-4012-d345-6789abcdef01', // QG Padel Club
}
```

### 2. Utilisation du mapping avant l'insert

**AVANT:**
```typescript
const bookingPayload = {
  club_id: club.id,  // ❌ '1' → Erreur 22P02
  court_id: courtId,
  // ...
}
```

**APRÈS:**
```typescript
// ✅ Obtenir le vrai UUID du club depuis le mapping
const clubUuid = CLUB_ID_MAP[club.id]
if (!clubUuid) {
  console.error('[RESERVE] No club UUID mapping for club.id', club.id)
  alert(`Erreur: Club UUID non trouvé pour l'ID ${club.id}`)
  setIsSubmitting(false)
  return
}

const bookingPayload = {
  club_id: clubUuid,  // ✅ UUID valide
  court_id: courtId,  // ✅ UUID valide (depuis COURT_ID_MAP)
  // ...
}
```

### 3. Validation des UUIDs avant insert

```typescript
// ⚠️ VALIDATION CRITIQUE: Vérifier que les UUIDs sont valides
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

if (!uuidRegex.test(bookingPayload.club_id)) {
  console.error('[BOOKING INSERT] ❌ INVALID club_id UUID:', bookingPayload.club_id)
  alert(`Erreur critique: club_id invalide (${bookingPayload.club_id})`)
  setIsSubmitting(false)
  return
}

if (!uuidRegex.test(bookingPayload.court_id)) {
  console.error('[BOOKING INSERT] ❌ INVALID court_id UUID:', bookingPayload.court_id)
  alert(`Erreur critique: court_id invalide (${bookingPayload.court_id})`)
  setIsSubmitting(false)
  return
}
```

### 4. Logging amélioré

```typescript
console.log('[BOOKING INSERT PAYLOAD - BEFORE INSERT]', JSON.stringify(bookingPayload, null, 2))
console.log('[BOOKING INSERT PAYLOAD - Types & Validation]', {
  club_id: { 
    type: typeof bookingPayload.club_id,
    value: bookingPayload.club_id,
    isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingPayload.club_id)
  },
  court_id: {
    type: typeof bookingPayload.court_id,
    value: bookingPayload.court_id,
    isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingPayload.court_id)
  },
  booking_date: { type: typeof bookingPayload.booking_date, value: bookingPayload.booking_date },
  slot_id: { type: typeof bookingPayload.slot_id, value: bookingPayload.slot_id },
  status: { type: typeof bookingPayload.status, value: bookingPayload.status }
})
```

---

## ⚠️ ACTION REQUISE: Obtenir les vrais UUIDs

Les UUIDs dans `CLUB_ID_MAP` sont **des exemples factices**. Vous devez les remplacer par les **vrais UUIDs** de votre base de données.

### Étape 1: Récupérer les UUIDs des clubs

**Dans Supabase SQL Editor:**

```sql
SELECT id, name 
FROM public.clubs 
ORDER BY name;
```

**Résultat attendu:**
```
id                                   | name
-------------------------------------|----------------------
uuid-real-club-1                     | Le Hangar Sport & Co
uuid-real-club-2                     | Paul & Louis Sport
uuid-real-club-3                     | ZE Padel
uuid-real-club-4                     | QG Padel Club
```

### Étape 2: Mettre à jour CLUB_ID_MAP

**Dans `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`:**

```typescript
const CLUB_ID_MAP: Record<string, string> = {
  '1': 'uuid-real-club-1',  // ← Remplacer par le vrai UUID depuis la requête SQL
  '2': 'uuid-real-club-2',  // ← Remplacer par le vrai UUID depuis la requête SQL
  '3': 'uuid-real-club-3',  // ← Remplacer par le vrai UUID depuis la requête SQL
  '4': 'uuid-real-club-4',  // ← Remplacer par le vrai UUID depuis la requête SQL
}
```

### Étape 3: Vérifier COURT_ID_MAP aussi

**Dans Supabase SQL Editor:**

```sql
SELECT id, club_id, name 
FROM public.courts 
ORDER BY club_id, name;
```

**Vérifier que les UUIDs dans `COURT_ID_MAP` correspondent aux résultats.**

Si les UUIDs ne correspondent pas, les corriger aussi.

---

## Vérification du fix

### Console logs attendus (succès)

```
[BOOKING INSERT PAYLOAD - BEFORE INSERT] {
  "club_id": "uuid-real-club-1",  ← ✅ UUID valide
  "court_id": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",  ← ✅ UUID valide
  "booking_date": "2026-01-23",
  "slot_id": 5,
  "status": "confirmed"
}

[BOOKING INSERT PAYLOAD - Types & Validation] {
  club_id: {
    type: "string",
    value: "uuid-real-club-1",
    isUUID: true  ← ✅ Validation passée
  },
  court_id: {
    type: "string",
    value: "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
    isUUID: true  ← ✅ Validation passée
  },
  // ...
}

[BOOKING INSERT] ✅ Success: { id: "...", ... }
```

### Si validation échoue

```
[BOOKING INSERT] ❌ INVALID club_id UUID: 1
Alert: "Erreur critique: club_id invalide (1)"
```

→ Cela signifie que `CLUB_ID_MAP` n'a pas été mis à jour avec les vrais UUIDs.

---

## Autres endroits à vérifier

### API routes

Si vous avez d'autres API routes qui insèrent dans `bookings`, vérifier qu'elles reçoivent bien des UUIDs et non des IDs numériques.

**Exemple: `/api/bookings/route.ts`**

Actuellement ce fichier insère dans `reservations` (pas `bookings`), mais si vous le modifiez pour insérer dans `bookings`, assurez-vous que:

```typescript
// Vérifier que clubId et courtId sont des UUIDs
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clubId)) {
  return NextResponse.json({ error: 'Invalid club_id UUID' }, { status: 400 })
}

if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courtId)) {
  return NextResponse.json({ error: 'Invalid court_id UUID' }, { status: 400 })
}
```

---

## Checklist de validation

- [x] `CLUB_ID_MAP` ajouté avec UUIDs factices
- [ ] **À FAIRE:** Remplacer les UUIDs factices par les vrais UUIDs depuis `public.clubs`
- [x] Validation UUID avant insert
- [x] Logging détaillé du payload
- [x] Guard si clubUuid non trouvé
- [x] Build OK
- [ ] **À TESTER:** Réservation fonctionne sans erreur 22P02
- [ ] **À TESTER:** Logs montrent `isUUID: true` pour club_id et court_id

---

## Résumé

**Le bug était:** `club.id = '1'` → inséré dans `club_id` (UUID) → Erreur 22P02

**Le fix est:** 
1. ✅ Créer `CLUB_ID_MAP` pour mapper '1' → UUID réel
2. ✅ Utiliser `CLUB_ID_MAP[club.id]` au lieu de `club.id` directement
3. ✅ Valider que c'est un vrai UUID avant l'insert
4. ⚠️ **Action requise:** Mettre à jour les UUIDs dans le mapping avec les vrais UUIDs de la DB

---

**Date:** 2026-01-22  
**Status:** Fix appliqué, nécessite mise à jour des UUIDs
