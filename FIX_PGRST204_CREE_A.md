# ✅ Fix PGRST204: `created_at` → `cree_a`

## Problème

**Erreur PostgREST PGRST204:**
```
column "created_at" does not exist
```

**Cause:**
- Le code essayait d'accéder à `reservations.created_at`
- La vraie colonne en DB est `reservations.cree_a`

---

## Fichiers corrigés

### 1. `/app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

#### Ligne 573: Insert payload

**AVANT:**
```typescript
const reservationPayload = {
  // ...
  created_at: new Date().toISOString()
}
```

**APRÈS:**
```typescript
const reservationPayload = {
  // ...
  cree_a: new Date().toISOString()  // ✅ CORRECT: cree_a (colonne réelle en DB)
}
```

#### Ligne 310-320: Fetch error logging

**AVANT:**
```typescript
if (error) {
  console.error('[RESERVATIONS] Error:', error)
  return
}
```

**APRÈS:**
```typescript
if (error) {
  console.error('[RESERVATIONS] Error:', {
    table: 'reservations',
    query: 'select id, court_id, slot_start, fin_de_slot, statut',
    error,
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint
  })
  return
}
```

#### Ligne 606-622: Insert error logging

**AVANT:**
```typescript
const errorMessage = [
  `Erreur réservation: ${reservationError.message}`,
  // ...
].filter(Boolean).join('\n')
```

**APRÈS:**
```typescript
console.error('[RESERVATION INSERT ERROR - Full details]', {
  table: 'reservations',  // ✅ AJOUTÉ
  message: reservationError.message,
  details: reservationError.details,
  hint: reservationError.hint,
  code: reservationError.code
})

const errorMessage = [
  `Erreur réservation (table: reservations)`,  // ✅ Spécifie la table
  `Message: ${reservationError.message}`,
  // ...
].filter(Boolean).join('\n')
```

---

### 2. `/app/player/(authenticated)/reservations/page.tsx`

#### Ligne 6-13: Type Reservation

**AVANT:**
```typescript
type Reservation = {
  id: string
  court_id: string
  slot_start: string
  fin_de_slot: string
  status: string       // ❌ 'status' n'existe pas en DB
  created_at: string   // ❌ 'created_at' n'existe pas en DB
}
```

**APRÈS:**
```typescript
type Reservation = {
  id: string
  court_id: string
  slot_start: string
  fin_de_slot: string
  statut: string   // ✅ Correct: 'statut' en DB (pas 'status')
  cree_a: string   // ✅ Correct: 'cree_a' en DB (pas 'created_at')
}
```

#### Ligne 32-37: Fetch error logging

**AVANT:**
```typescript
if (queryError) {
  console.error('[SUPABASE ERROR - reservations]', queryError)
  setError(queryError.message)
}
```

**APRÈS:**
```typescript
if (queryError) {
  console.error('[SUPABASE ERROR - reservations]', {
    table: 'reservations',
    query: 'select * order by slot_start',
    error: queryError,
    message: queryError.message,
    code: queryError.code,
    details: queryError.details,
    hint: queryError.hint
  })
  setError(`${queryError.message} (code: ${queryError.code || 'N/A'})`)
}
```

#### Ligne 94-100: Affichage UI

**AVANT:**
```typescript
<div style={{ fontSize: 14, color: '#666' }}>
  Statut: {res.status}  {/* ❌ 'status' n'existe pas */}
</div>
```

**APRÈS:**
```typescript
<div style={{ fontSize: 14, color: '#666' }}>
  Statut: {res.statut}  {/* ✅ Correct */}
</div>
<div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
  Créée: {new Date(res.cree_a).toLocaleString('fr-FR')}
</div>
```

---

## Colonnes correctes en DB

### Table `public.reservations`

| Colonne | Type | Note |
|---------|------|------|
| `id` | uuid | PRIMARY KEY |
| `club_id` | text/uuid | |
| `court_id` | uuid | FOREIGN KEY |
| `slot_start` | timestamptz | NOT NULL |
| `fin_de_slot` | timestamptz | NOT NULL |
| `statut` | text | 'confirmé', 'annulé', etc. |
| `cree_par` | uuid | nullable (FK vers users) |
| `cree_a` | timestamptz | ✅ Date de création |

**IMPORTANT:** Il n'y a PAS de colonne `created_at` !

---

## Amélioration du logging

### Avant (insuffisant)

```typescript
console.error('[ERROR]', error)
```

### Après (complet)

```typescript
console.error('[ERROR]', {
  table: 'reservations',        // ✅ Indique quelle table
  query: 'select * ...',        // ✅ Indique la requête
  error: error,                 // ✅ Objet complet
  message: error.message,       // ✅ Message lisible
  code: error.code,             // ✅ Code PostgREST
  details: error.details,       // ✅ Détails techniques
  hint: error.hint              // ✅ Conseil de résolution
})
```

**Bénéfices:**
- Debug plus rapide
- Identification immédiate de la table problématique
- Code PostgREST visible (ex: PGRST204)
- Hints PostgREST affichés

---

## Vérification en DB

### Vérifier les colonnes de `reservations`

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'reservations'
ORDER BY ordinal_position;
```

**Résultat attendu:**
```
column_name    | data_type           | is_nullable
---------------|---------------------|-------------
id             | uuid                | NO
club_id        | text                | YES
court_id       | uuid                | YES
slot_start     | timestamp with tz   | NO
fin_de_slot    | timestamp with tz   | NO
statut         | text                | YES
cree_par       | uuid                | YES
cree_a         | timestamp with tz   | YES  ← Voici la colonne correcte
```

---

## Note sur `localStorage`

Le code contient aussi un `created_at` dans le localStorage (ligne 638 de `reserver/page.tsx`):

```typescript
const newReservation = {
  id: reservationId,
  date: bookingDate,
  start_time: selectedSlot.start_time,
  end_time: selectedSlot.end_time,
  status: 'confirmed',
  price: club.prix * (selectedPlayers.length + 1),
  created_at: new Date().toISOString(),  // ← localStorage seulement
  courts: { ... }
}

localStorage.setItem('demoReservations', JSON.stringify(existingReservations))
```

**Ce `created_at` est OK** car :
- ✅ C'est pour le `localStorage` uniquement (données démo)
- ✅ N'est jamais envoyé à Supabase
- ✅ Utilisé uniquement pour l'affichage local

---

## Checklist de validation

- [x] `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`:
  - [x] Payload insert utilise `cree_a` au lieu de `created_at`
  - [x] Logs d'erreur fetch améliorés (table + query)
  - [x] Logs d'erreur insert améliorés (table + détails)
- [x] `app/player/(authenticated)/reservations/page.tsx`:
  - [x] Type `Reservation` utilise `statut` et `cree_a`
  - [x] Affichage UI utilise `res.statut` et `res.cree_a`
  - [x] Logs d'erreur fetch améliorés
- [x] Build OK
- [ ] **À TESTER:** Insertion réservation → succès (pas d'erreur PGRST204)

---

## Test du fix

### 1. Tester l'insertion

1. Aller sur `/player/clubs/1/reserver`
2. Sélectionner un créneau
3. Confirmer la réservation

**Console logs attendus (succès):**

```
[RESERVATION INSERT PAYLOAD] {
  "club_id": "1",
  "court_id": "6dceaf95-...",
  "slot_start": "2026-01-23T14:00:00",
  "fin_de_slot": "2026-01-23T15:30:00",
  "statut": "confirmé",
  "cree_par": null,
  "cree_a": "2026-01-23T10:30:00.000Z"  ← ✅ Correct
}

[RESERVATION INSERT] ✅ Success: { id: "...", cree_a: "2026-01-23T10:30:00+00:00", ... }
```

**❌ SI ERREUR (indique un autre problème):**

```
[RESERVATION INSERT ERROR - Full details] {
  table: "reservations",
  message: "...",
  code: "PGRST204",  // ou autre
  details: "...",
  hint: "..."
}
```

### 2. Tester la lecture

1. Aller sur `/player/reservations`

**Console logs attendus (succès):**

```
[SUPABASE SUCCESS - reservations] { count: 1 }
```

**UI attendue:**
- Date/heure du créneau
- Statut: confirmé
- Créée: 23/01/2026 à 10:30

---

**Date:** 2026-01-22  
**Commit:** (à venir)
