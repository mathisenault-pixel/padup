# 🚨 MIGRATION DB REQUISE

## Erreur actuelle

```
column reservations.court_id does not exist (code: 42703)
```

## Action immédiate

### Exécuter dans Supabase SQL Editor

```sql
ALTER TABLE public.reservations 
RENAME COLUMN "Identifiant du tribunal" TO court_id;
```

**OU** exécuter le fichier complet :

📁 `supabase/migrations/011_rename_tribunal_to_court_id.sql`

---

## Fichiers créés/modifiés

### ✅ Nouveau fichier de migration
- `supabase/migrations/011_rename_tribunal_to_court_id.sql`
  - Renomme automatiquement la colonne
  - Crée l'index sur `court_id`
  - Vérifications intégrées

### ✅ Guide de migration
- `supabase/MIGRATION_GUIDE.md`
  - Instructions détaillées
  - Commandes de vérification
  - Procédure de rollback

### ✅ Code frontend amélioré
- `app/(public)/availability/page.tsx` (ligne 103-108)
  - Message clair si erreur 42703 détectée
  - Pointe vers la migration à exécuter

---

## Vérifications actuelles du code

### Frontend
```typescript
// ✅ app/(public)/availability/page.tsx
.eq("court_id", courtId)
.eq("statut", "confirmé")
.select("slot_start, fin_de_slot")
```

### API
```typescript
// ✅ app/api/bookings/route.ts
{
  club_id: clubId,
  court_id: courtId,      // ← Attend court_id
  slot_start: slotStart,
  fin_de_slot: slotEnd,
  cree_par: createdBy,
  statut: "confirmé",
}
```

**Le code est prêt, seule la DB doit être migrée.**

---

## Après migration

Tester : http://localhost:3000/availability

**Résultat attendu :**
```
[SUPABASE SUCCESS - loadBooked] { count: X, data: [...] }
```

UI : Créneaux réservés affichés ✅
