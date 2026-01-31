# Anti Double-Booking MVP

## Objectif

Empêcher **2 utilisateurs** (navigateurs différents) de réserver le **même créneau** simultanément.

✅ **Solution robuste** : contrainte UNIQUE côté DB  
✅ **Simple** : pas de RPC complexe  
✅ **MVP-ready** : insert direct + gestion 409

---

## Architecture

### 1. Base de données (Supabase)

**Contrainte UNIQUE** sur `(court_id, date, start_time)` avec `status='confirmed'` :

```sql
CREATE UNIQUE INDEX reservations_unique_court_slot_idx
  ON public.reservations(court_id, date, start_time)
  WHERE status = 'confirmed';
```

**Pourquoi ça marche :**
- Postgres bloque automatiquement les inserts conflictuels
- Code erreur `23505` (unique violation)
- Fonctionne même sous forte charge (ACID)
- Le `WHERE status='confirmed'` permet plusieurs annulations sur le même créneau

### 2. API (`/api/bookings`)

**INSERT direct** dans `reservations` :

```typescript
const { data, error } = await supabase
  .from("reservations")
  .insert([{
    court_id: courtId,
    player_id: createdBy,
    date: date,           // YYYY-MM-DD
    start_time: startTime, // HH:MM:SS
    end_time: endTime,     // HH:MM:SS
    status: 'confirmed',
  }])
  .select()
  .single();
```

**Gestion du conflit (409)** :

```typescript
if (error.code === "23505") {
  return NextResponse.json(
    { error: "Ce créneau est déjà réservé." },
    { status: 409 }
  );
}
```

### 3. Frontend

**Déjà prêt** : gère le 409 avec rollback + toast :

```typescript
if (res.status === 409) {
  showToast("⚠️ Trop tard : quelqu'un vient de réserver ce créneau.", "warning");
  writeLock(null);  // Rollback du lock local
  setSlotLock(null);
  await loadAvailability();  // Refresh pour voir l'état réel
}
```

---

## Déploiement

### ÉTAPE 1 : Exécuter la migration SQL

Dans **Supabase SQL Editor** :

```sql
-- Fichier: supabase/migrations/016_unique_slot_constraint.sql
DROP INDEX IF EXISTS public.reservations_no_overlap_idx;
DROP INDEX IF EXISTS public.reservations_unique_court_slot_idx;

CREATE UNIQUE INDEX reservations_unique_court_slot_idx
  ON public.reservations(court_id, date, start_time)
  WHERE status = 'confirmed';
```

### ÉTAPE 2 : Vérifier les fichiers modifiés

✅ `supabase/migrations/016_unique_slot_constraint.sql` (nouveau)  
✅ `app/api/bookings/route.ts` (modifié - insert direct)  
✅ `app/(public)/availability/page.tsx` (modifié - API décommentée)

### ÉTAPE 3 : Redémarrer Next.js

```bash
npm run dev
```

---

## Tests

### Test 1 : SQL (Supabase)

Exécuter `supabase/test_anti_double_booking.sql` dans Supabase SQL Editor.

**Résultat attendu :**
```
✅ OK: Première réservation créée avec succès
✅ OK: Double réservation bloquée (code 23505)
✅ OK: Réservation sur autre créneau créée avec succès
✅ OK: Réservation après annulation autorisée
```

### Test 2 : UI (2 navigateurs)

1. **Chrome normal** : `/availability`
2. **Chrome privé** : `/availability`

**Scénario :**

| Action | Chrome Normal | Chrome Privé | Résultat |
|--------|---------------|--------------|----------|
| 1. Clic sur "10:30 - 12:00" | ✅ Modal ouverte | - | - |
| 2. Clic "Confirmer" | ✅ Grisé bleu | - | - |
| 3. Clic sur "10:30 - 12:00" | - | ✅ Modal ouverte | - |
| 4. Clic "Confirmer" | - | ❌ Toast "Trop tard" | **409 reçu** |
| 5. Refresh auto | - | ✅ Créneau grisé jaune | **DB = source de vérité** |

**Logs attendus (console)** :

Chrome Normal :
```
[API INSERT - reservations] { clubId, courtId, slotStart, createdBy }
[INSERT SUCCESS - reservations] { id: "...", status: "confirmed" }
```

Chrome Privé :
```
[API INSERT - reservations] { clubId, courtId, slotStart, createdBy }
[INSERT ERROR - reservations] { code: "23505", message: "..." }
[BOOKING CONFLICT - UNIQUE CONSTRAINT] { courtId, date, startTime }
```

---

## Pourquoi cette approche ?

### ✅ Avantages

1. **Robuste** : La DB est la source de vérité (ACID)
2. **Simple** : Pas de RPC complexe à maintenir
3. **Performant** : Index unique = O(1) lookup
4. **Évolutif** : Fonctionne sous forte charge

### ⚠️ Limitations (futures)

1. **Pas de slots multiples atomiques** : si on veut réserver 2 créneaux consécutifs en une transaction, il faudra une RPC
2. **Pas de validation métier avancée** : ex. "max 3 réservations par jour"
3. **Pas de booking_slots** : table séparée pour le planning (à ajouter plus tard si nécessaire)

---

## Migration future vers RPC (optionnel)

Quand les besoins deviennent plus complexes :

```sql
CREATE OR REPLACE FUNCTION public.create_booking_90m(
  p_club_id UUID,
  p_court_id UUID,
  p_start_at TIMESTAMPTZ,
  p_user_id UUID,
  p_status TEXT DEFAULT 'confirmed'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_date DATE;
  v_start_time TIME;
  v_end_time TIME;
  v_booking_id UUID;
BEGIN
  -- Extraire date/time
  v_date := p_start_at::DATE;
  v_start_time := p_start_at::TIME;
  v_end_time := (p_start_at + INTERVAL '90 minutes')::TIME;
  
  -- Vérifier permissions (RLS)
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Insert booking
  INSERT INTO public.reservations (
    court_id, player_id, date, start_time, end_time, status
  ) VALUES (
    p_court_id, p_user_id, v_date, v_start_time, v_end_time, p_status
  )
  RETURNING id INTO v_booking_id;
  
  -- Insert booking_slot (si table existe)
  -- INSERT INTO public.booking_slots ...
  
  RETURN json_build_object(
    'booking_id', v_booking_id,
    'status', 'success'
  );
END;
$$;
```

Puis dans l'API :

```typescript
const { data, error } = await supabase.rpc("create_booking_90m", {
  p_club_id: clubId,
  p_court_id: courtId,
  p_start_at: slotStart,
  p_user_id: createdBy,
});
```

---

## Résumé

| Composant | État | Détails |
|-----------|------|---------|
| Migration SQL | ✅ Prête | `016_unique_slot_constraint.sql` |
| API `/api/bookings` | ✅ Modifiée | Insert direct + gestion 409 |
| Frontend | ✅ Prêt | Gère déjà le 409 |
| Tests SQL | ✅ Disponibles | `test_anti_double_booking.sql` |
| Documentation | ✅ Complète | Ce fichier |

**MVP complet et fonctionnel !** 🚀

---

## Prochaines étapes (optionnel)

1. **Authentification réelle** : remplacer `createdBy` hardcodé par `auth.uid()`
2. **Table `booking_slots`** : pour le planning club détaillé
3. **RPC avancée** : pour réservations multiples atomiques
4. **Notifications** : email/push après réservation confirmée
5. **Paiement** : intégrer Stripe pour `status: pending → confirmed`
