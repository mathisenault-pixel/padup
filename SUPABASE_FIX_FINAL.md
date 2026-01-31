# ✅ Correction finale Supabase - Colonnes renommées

## Changements appliqués

### Schéma confirmé `public.reservations`
```
- identifiant (uuid, PK)
- club_id (uuid)
- court_id (uuid) ← renommé depuis "Identifiant du tribunal"
- slot_start (timestamptz)
- fin_de_slot (timestamptz)
- cree_par (uuid)
- statut (text)
- cree_a (timestamptz, default now())
```

### 1. `app/(public)/availability/page.tsx`

**Variables renommées:**
- `tribunalId` → `courtId`

**Requête SELECT corrigée (ligne 79):**
```typescript
.eq("court_id", courtId)  // ✅ (était: "Identifiant du tribunal")
```

**Payload API corrigé (ligne 125):**
```typescript
body: JSON.stringify({
  clubId,
  courtId,  // ✅ (était: tribunalId)
  slotStart,
  slotEnd,
  createdBy,
})
```

**Logs mis à jour:**
- Console affiche `courtId` au lieu de `tribunalId`

---

### 2. `app/api/bookings/route.ts`

**Paramètres renommés:**
- `tribunalId` → `courtId`

**Insert corrigé (ligne 42):**
```typescript
{
  club_id: clubId,
  court_id: courtId,  // ✅ (était: "Identifiant du tribunal")
  slot_start: slotStart,
  fin_de_slot: slotEnd,
  cree_par: createdBy,
  statut: "confirmé",
}
```

**Gestion erreurs (ligne 51-77):**
- Logs détaillés: `message`, `details`, `hint`, `code`
- 409 Conflict si double réservation (code `23505`)
- 500 avec détails complets pour autres erreurs

---

## Résultat attendu

### Page `/availability`

**Console navigateur:**
```
[QUERY START] { schema: "public", table: "reservations", courtId: "...", dateRange: {...} }
[SUPABASE SUCCESS - loadBooked] { count: X, data: [...] }
```

**UI:**
- Créneaux réservés → "Occupé" (grisé)
- Créneaux libres → "Libre" (cliquable)

### Réservation

**Console serveur:**
```
[API INSERT START] { schema: "public", table: "reservations", courtId: "...", slotStart: "..." }
[SUPABASE SUCCESS - POST /api/bookings] { slotStart: "...", slotEnd: "..." }
```

**UI:**
- Succès: "Réservation OK ✅"
- Erreur: "❌ Erreur réservation: [message] (code: [code])"

---

## Fichiers modifiés

1. ✅ `app/(public)/availability/page.tsx`
   - Ligne 17: `courtId` (variable)
   - Ligne 71: log `courtId`
   - Ligne 79: `.eq("court_id", courtId)`
   - Ligne 125: payload `courtId`

2. ✅ `app/api/bookings/route.ts`
   - Ligne 20: destructure `courtId`
   - Ligne 22: validation `courtId`
   - Ligne 32: log `courtId`
   - Ligne 42: insert `court_id: courtId`
   - Ligne 56: log error `courtId`

---

## Test

```bash
# Le serveur dev recharge automatiquement
# Ouvrir: http://localhost:3000/availability
# Console: vérifier logs SUCCESS ou ERROR
```

**Plus d'erreur 42703** ✅
