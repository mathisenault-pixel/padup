# ✅ Fix: RLS Policy avec created_by = auth.uid()

## Contexte

**Problème:** L'insert dans `public.bookings` échouait ou ne fonctionnait pas avec la RLS policy:
```sql
WITH CHECK (auth.uid() = created_by)
```

**Cause:** Le champ `created_by` était à `null` dans le payload d'insertion au lieu de contenir l'UUID de l'utilisateur connecté.

**Objectif:** Récupérer l'utilisateur connecté et utiliser son UUID dans `created_by` pour satisfaire la RLS policy.

---

## Solution appliquée

### 1. **Récupération de l'utilisateur connecté AVANT l'insert**

**Fichier:** `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

**Code ajouté (juste après `setIsSubmitting(true)` et avant la construction du payload):**

```typescript
// ✅ RÉCUPÉRER L'UTILISATEUR CONNECTÉ (OBLIGATOIRE POUR RLS)
console.log('[RESERVE] Getting authenticated user...')
const { data: { user }, error: userErr } = await supabase.auth.getUser()

if (userErr) {
  console.error('[RESERVE] ❌ CRITICAL: Error fetching user:', userErr)
  console.error('[RESERVE] ❌ User error details:', JSON.stringify(userErr, null, 2))
  alert('Erreur lors de la récupération de l\'utilisateur. Veuillez vous reconnecter.')
  setIsSubmitting(false)
  return
}

if (!user) {
  console.error('[RESERVE] ❌ CRITICAL: No user logged in')
  alert('Vous devez être connecté pour réserver. Veuillez vous connecter.')
  setIsSubmitting(false)
  return
}

console.log('[RESERVE] ✅ User authenticated:', user.id)
```

**Pourquoi:**
- `supabase.auth.getUser()` récupère l'utilisateur actuellement connecté
- Si erreur ou pas d'utilisateur → alerte + arrêt du processus
- L'UUID de l'utilisateur (`user.id`) sera utilisé pour `created_by`

---

### 2. **Utilisation de user.id dans le payload**

**AVANT (ne fonctionnait pas avec RLS):**
```typescript
const bookingPayload = {
  club_id: club.id,
  court_id: courtId,
  booking_date: bookingDate,
  slot_id: selectedSlot.id,
  status: 'confirmed',
  created_by: null,  // ❌ NULL → RLS policy rejette
  created_at: new Date().toISOString()
}
```

**APRÈS (fonctionne avec RLS):**
```typescript
const bookingPayload = {
  club_id: club.id,
  court_id: courtId,
  booking_date: bookingDate,
  slot_id: selectedSlot.id,
  status: 'confirmed',
  created_by: user.id,  // ✅ UUID de l'utilisateur connecté
  created_at: new Date().toISOString()
}
```

**Pourquoi:**
- La RLS policy `WITH CHECK (auth.uid() = created_by)` vérifie que le `created_by` dans le payload correspond à l'utilisateur connecté
- Si `created_by = user.id` et que `auth.uid() = user.id` → la policy accepte
- Si `created_by = null` → la policy rejette (NULL ≠ UUID)

---

### 3. **Logging amélioré du payload (inclut created_by)**

```typescript
console.log('[BOOKING PAYLOAD BEFORE INSERT] ===== CRITICAL FIELDS =====')
console.log('created_by:', bookingPayload.created_by, '(type:', typeof bookingPayload.created_by, ') ← REQUIRED FOR RLS')
console.log('booking_date:', bookingPayload.booking_date, '(type:', typeof bookingPayload.booking_date, ')')
console.log('slot_id:', bookingPayload.slot_id, '(type:', typeof bookingPayload.slot_id, ')')
console.log('club_id:', bookingPayload.club_id, '(type:', typeof bookingPayload.club_id, ')')
console.log('court_id:', bookingPayload.court_id, '(type:', typeof bookingPayload.court_id, ')')
console.log('status:', bookingPayload.status, '(type:', typeof bookingPayload.status, ')')
```

**Output attendu:**
```
[BOOKING PAYLOAD BEFORE INSERT] ===== CRITICAL FIELDS =====
created_by: user-uuid-here (type: string) ← REQUIRED FOR RLS  ✅
booking_date: 2026-02-01 (type: string)
slot_id: 5 (type: number)
...
```

---

### 4. **Logging amélioré des erreurs d'insertion**

```typescript
if (bookingError) {
  console.error('[BOOKING INSERT ERROR] ❌❌❌')
  console.error('[BOOKING INSERT ERROR] Object:', bookingError)
  console.error('[BOOKING INSERT ERROR] JSON:', JSON.stringify(bookingError, null, 2))
  console.error('[BOOKING INSERT ERROR - Full details]', {
    table: 'bookings',
    message: bookingError.message,
    details: bookingError.details,
    hint: bookingError.hint,
    code: bookingError.code
  })
  
  // Alert avec tous les détails
  const errorMessage = [
    `Erreur réservation (table: bookings)`,
    `Message: ${bookingError.message}`,
    bookingError.details ? `Détails: ${bookingError.details}` : '',
    bookingError.hint ? `Conseil: ${bookingError.hint}` : '',
    bookingError.code ? `Code: ${bookingError.code}` : ''
  ].filter(Boolean).join('\n')
  
  alert(errorMessage)
  setIsSubmitting(false)
  return
}
```

**Pourquoi:**
- `JSON.stringify(bookingError, null, 2)` affiche TOUTE la structure de l'erreur
- Aide à diagnostiquer les erreurs RLS, les contraintes NOT NULL, les foreign keys, etc.

---

### 5. **Logging amélioré dans loadBookings (SELECT)**

**AVANT:**
```typescript
if (error) {
  console.error('[BOOKINGS] Error:', {
    table: 'bookings',
    message: error.message,
    code: error.code,
    details: error.details
  })
  return
}
```

**APRÈS:**
```typescript
if (error) {
  console.error('[BOOKINGS] Error object:', error)
  console.error('[BOOKINGS] Error JSON:', JSON.stringify(error, null, 2))
  console.error('[BOOKINGS] Error details:', {
    table: 'bookings',
    query: 'SELECT with in() filters',
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint
  })
  return
}
```

**Pourquoi:**
- Permet de voir si les erreurs viennent de RLS policies sur SELECT
- Affiche les hints de PostgreSQL qui expliquent souvent le problème

---

## RLS Policy expliquée

### Policy INSERT sur public.bookings

```sql
CREATE POLICY "Users can insert their own bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = created_by);
```

**Signification:**
- `FOR INSERT` → s'applique uniquement aux opérations INSERT
- `WITH CHECK (...)` → vérifie la condition APRÈS l'insert
- `auth.uid()` → UUID de l'utilisateur actuellement connecté (côté Supabase)
- `created_by` → valeur du champ `created_by` dans le payload d'insertion

**Fonctionnement:**
1. Frontend envoie un insert avec `created_by = user.id`
2. Supabase récupère `auth.uid()` depuis le JWT de l'utilisateur
3. Supabase vérifie: `auth.uid() = created_by` ?
   - ✅ Si OUI → insert accepté
   - ❌ Si NON → erreur 403 (policy violation)

---

## Logs attendus lors d'une réservation

### 1. Récupération de l'utilisateur

```
[RESERVE] Getting authenticated user...
[RESERVE] ✅ User authenticated: user-uuid-here
```

**Si pas connecté:**
```
[RESERVE] ❌ CRITICAL: No user logged in
Alert: "Vous devez être connecté pour réserver. Veuillez vous connecter."
```

### 2. Payload avant insert

```
[BOOKING PAYLOAD BEFORE INSERT] ===== FULL PAYLOAD =====
{
  "club_id": "ba43c579-e522-4b51-8542-737c2c6452bb",
  "court_id": "21d9a066-b7db-4966-abf1-cc210f7476c1",
  "booking_date": "2026-02-01",
  "slot_id": 5,
  "slot_start": "2026-02-01T14:00:00",
  "slot_end": "2026-02-01T15:30:00",
  "status": "confirmed",
  "created_by": "user-uuid-here",  ✅ NOT NULL
  "created_at": "2026-02-01T10:30:00.000Z"
}

[BOOKING PAYLOAD BEFORE INSERT] ===== CRITICAL FIELDS =====
created_by: user-uuid-here (type: string) ← REQUIRED FOR RLS  ✅
```

### 3. Insert réussi

```
[BOOKING INSERT] Calling Supabase insert...
[BOOKING INSERT] ✅✅✅ SUCCESS
[BOOKING INSERT] ✅ Data returned from DB: { ... }
```

### 4. Si erreur RLS

```
[BOOKING INSERT ERROR] ❌❌❌
[BOOKING INSERT ERROR] JSON: {
  "code": "42501",
  "message": "new row violates row-level security policy for table \"bookings\"",
  "details": null,
  "hint": null
}
```

**Code 42501 = RLS policy violation**

---

## Tests à effectuer

### Test 1: Utilisateur connecté

1. **Se connecter à l'application**
2. **Aller sur la page reserver**
   ```
   /player/clubs/ba43c579-e522-4b51-8542-737c2c6452bb/reserver
   ```
3. **Ouvrir la console (F12)**
4. **Faire une réservation**
5. **Vérifier les logs:**
   ```
   [RESERVE] ✅ User authenticated: user-uuid
   [BOOKING PAYLOAD BEFORE INSERT] created_by: user-uuid ✅
   [BOOKING INSERT] ✅✅✅ SUCCESS
   ```
6. **Vérifier en DB:**
   ```sql
   SELECT 
     id,
     created_by,
     booking_date,
     slot_id,
     status
   FROM public.bookings
   ORDER BY created_at DESC
   LIMIT 1;
   ```
   
   **Résultat attendu:**
   - `created_by` = UUID de l'utilisateur (NOT NULL)
   - `booking_date` = '2026-02-01' (NOT NULL)
   - `slot_id` = 5 (NOT NULL)

---

### Test 2: Utilisateur NON connecté

1. **Se déconnecter**
2. **Aller sur la page reserver** (si accessible)
3. **Essayer de faire une réservation**
4. **Vérifier:**
   ```
   [RESERVE] ❌ CRITICAL: No user logged in
   Alert: "Vous devez être connecté pour réserver..."
   ```
5. **L'insert ne doit PAS être tenté**

---

## Diagnostics possibles

### Erreur: "new row violates row-level security policy"

**Symptôme:**
```
[BOOKING INSERT ERROR] code: "42501"
message: "new row violates row-level security policy for table \"bookings\""
```

**Causes possibles:**

1. **created_by ne correspond pas à auth.uid()**
   - Vérifier que `created_by` dans le payload = UUID de l'utilisateur
   - Vérifier que l'utilisateur est bien connecté
   - Log: `console.log('auth user:', user.id, 'created_by:', bookingPayload.created_by)`

2. **JWT expiré ou invalide**
   - Se déconnecter/reconnecter
   - Vérifier le JWT dans les headers (Network tab)

3. **Policy incorrecte en DB**
   - Vérifier la policy:
     ```sql
     SELECT * FROM pg_policies WHERE tablename = 'bookings';
     ```
   - S'assurer que `WITH CHECK (auth.uid() = created_by)` existe

---

### Erreur: "No user logged in"

**Symptôme:**
```
[RESERVE] ❌ CRITICAL: No user logged in
```

**Causes:**
- L'utilisateur n'est pas connecté
- La session a expiré
- Le JWT n'est pas valide

**Solution:**
- Rediriger vers la page de login
- Implémenter un refresh token automatique
- Vérifier la durée de vie du JWT dans Supabase

---

### Erreur: "Error fetching user"

**Symptôme:**
```
[RESERVE] ❌ CRITICAL: Error fetching user: { ... }
```

**Causes:**
- Problème réseau
- Supabase indisponible
- Configuration Supabase incorrecte

**Solution:**
- Vérifier les variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Vérifier la connexion réseau
- Retry avec exponentiel backoff

---

## Résumé des changements

**Fichier:** `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

**Modifications:**
1. ✅ Récupération de l'utilisateur connecté avec `supabase.auth.getUser()`
2. ✅ Vérification que l'utilisateur existe (sinon alert + return)
3. ✅ Utilisation de `user.id` dans `created_by` (au lieu de `null`)
4. ✅ Logging de `created_by` dans le payload
5. ✅ Logging complet des erreurs d'insertion (`JSON.stringify`)
6. ✅ Logging amélioré des erreurs de SELECT dans `loadBookings`

**Aucune modification de RLS policy en DB.**

---

## Checklist

- [x] Code modifié
- [x] Guards ajoutés pour user
- [x] created_by utilise user.id
- [x] Logs améliorés
- [x] Build OK
- [ ] **À TESTER:** Réservation avec utilisateur connecté
- [ ] **À VÉRIFIER:** created_by NON NULL en DB
- [ ] **À VÉRIFIER:** Pas d'erreur RLS 42501
- [ ] **À TESTER:** Réservation sans utilisateur connecté (doit être bloquée)

---

**Date:** 2026-02-01  
**Status:** Fix appliqué, prêt pour tests avec utilisateur connecté
