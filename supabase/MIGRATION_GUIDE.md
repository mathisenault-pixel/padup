# Guide Migration - Renommer "Identifiant du tribunal" → court_id

## Problème

La table `public.reservations` a été créée avec une colonne nommée `"Identifiant du tribunal"` (avec espaces), ce qui cause des erreurs :

```
column reservations.court_id does not exist (code: 42703)
```

## Solution

Exécuter la migration `011_rename_tribunal_to_court_id.sql`

---

## Étapes

### 1. Dans Supabase Dashboard

1. Ouvrir **SQL Editor**
2. Copier le contenu de `supabase/migrations/011_rename_tribunal_to_court_id.sql`
3. Cliquer **RUN**

### 2. Vérification

Après exécution, vous devriez voir :

```
✅ Colonne "Identifiant du tribunal" renommée en court_id
```

Et le résumé :

```
column_name | data_type | is_nullable | column_default
court_id    | uuid      | NO          | NULL
```

### 3. Tester l'application

```
http://localhost:3000/availability
```

**Console attendue :**
```
[QUERY START] { schema: "public", table: "reservations", courtId: "...", ... }
[SUPABASE RAW RESPONSE] { data: [...], error: null }
[SUPABASE SUCCESS - loadBooked] { count: X, data: [...] }
```

**UI :**
- ✅ Plus d'erreur 42703
- ✅ Créneaux réservés = "Occupé"
- ✅ Réservation fonctionne

---

## Schéma final de la table

```sql
public.reservations {
  identifiant      uuid PRIMARY KEY DEFAULT gen_random_uuid()
  club_id          uuid NOT NULL
  court_id         uuid NOT NULL          ← RENOMMÉ
  slot_start       timestamptz NOT NULL
  fin_de_slot      timestamptz NOT NULL
  cree_par         uuid NOT NULL
  statut           text NOT NULL DEFAULT 'confirmé'
  cree_a           timestamptz DEFAULT now()
}
```

### Indexes

```sql
CREATE INDEX idx_reservations_court_id ON public.reservations(court_id);
CREATE INDEX idx_reservations_slot_start ON public.reservations(slot_start);
```

---

## Rollback (si nécessaire)

Si vous devez revenir en arrière :

```sql
ALTER TABLE public.reservations 
RENAME COLUMN court_id TO "Identifiant du tribunal";
```

⚠️ **Note :** Le code front devra aussi être mis à jour pour utiliser l'ancien nom.

---

## Colonnes vérifiées dans le code

### Frontend (`app/(public)/availability/page.tsx`)

**SELECT :**
```typescript
.select("slot_start, fin_de_slot")
.eq("court_id", courtId)           ✅
.eq("statut", "confirmé")           ✅
```

### API (`app/api/bookings/route.ts`)

**INSERT :**
```typescript
{
  club_id: clubId,       ✅
  court_id: courtId,     ✅
  slot_start: slotStart, ✅
  fin_de_slot: slotEnd,  ✅
  cree_par: createdBy,   ✅
  statut: "confirmé",    ✅
}
```

Tous les noms de colonnes correspondent au schéma DB final.

---

## Support

Si l'erreur persiste après migration :

1. **Vérifier la colonne existe :**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'reservations' 
   AND table_schema = 'public';
   ```

2. **Vérifier les données :**
   ```sql
   SELECT * FROM public.reservations LIMIT 1;
   ```

3. **Vérifier RLS :**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'reservations';
   ```

4. **Logs détaillés :**
   - Console navigateur : `[SUPABASE ERROR - loadBooked]`
   - Console serveur : `[API INSERT START]`
