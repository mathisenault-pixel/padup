# ✅ FIX TIMEZONE: Décalage +1h dans le planning des réservations

## 🔍 Diagnostic du problème

### Symptôme
- **Page disponibilité** : affiche les bons créneaux (08:00–09:30, 09:30–11:00, etc.)
- **Planning du jour par terrain** : affiche des créneaux décalés de +1h (09:00–10:30, 10:30–12:00, etc.)

### Cause racine
Les réservations sont stockées en base de données avec un **mauvais timezone** :
- ❌ **Stockage actuel** : 08:00 Paris stocké comme `"2026-02-15T08:00:00+00:00"` (08:00 UTC)
- ✅ **Stockage correct** : 08:00 Paris devrait être `"2026-02-15T07:00:00+00:00"` (07:00 UTC car Paris = UTC+1)

Quand on affiche `"2026-02-15T08:00:00+00:00"` en timezone Paris (UTC+1), JavaScript le convertit en **09:00** → Décalage de +1h

### Preuve (logs du build)
```
[DASHBOARD MAIN] slot_start raw: 2026-02-15T08:00:00+00:00  ← Stocké en UTC
[DASHBOARD MAIN] slot_start formatted: 09:00                ← Affiché en Paris (UTC+1)
[TIMEZONE DEBUG] Paris (formatTimeInParisTz): 09:00         ← Confirme le +1h
```

## ✅ Solution appliquée

### 1. Source de vérité unique pour les timezones (`lib/dateUtils.ts`)

Création d'un module dédié avec des fonctions timezone-aware :

```typescript
import { format, parseISO } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

export const APP_TIMEZONE = 'Europe/Paris'

// ✅ Afficher une heure en timezone Paris (HH:mm)
export function formatTimeInParisTz(isoString: string): string

// ✅ Créer un slot_start en UTC depuis une date/heure locale Paris
export function createSlotStartUTC(dateStr: string, timeStr: string): string

// ✅ Calculer slot_end = slot_start + 90 minutes
export function calculateSlotEnd(slotStartISO: string): string

// ✅ Debug timezone (affiche tous les formats)
export function debugTimezone(label: string, isoString: string): void
```

### 2. Utilisation dans tous les composants

**Dashboard club** (`components/club/hangar/DashboardMain.tsx`) :
- Import de `formatTimeInParisTz` et `debugTimezone`
- Remplacement de `toLocaleTimeString` par `formatTimeInParisTz`
- Ajout de logs de debug pour diagnostiquer

**Page de réservation** (`app/player/(authenticated)/clubs/[id]/reserver/page.tsx`) :
- Import de `createSlotStartUTC`, `calculateSlotEnd`, `debugTimezone`
- Remplacement de la logique manuelle de création de dates par `createSlotStartUTC`
- Ajout de logs de debug avant insert

### 3. Correction des données existantes

**Script SQL** : `scripts/fix-booking-timezones.sql`

Ce script :
1. Crée un backup temporaire des anciennes valeurs
2. Affiche un aperçu des corrections (avant/après)
3. Permet d'appliquer la correction (UPDATE à décommenter)
4. Permet un rollback si besoin

```sql
-- Aperçu de la correction
SELECT 
  id,
  slot_start AS old_slot_start,
  slot_start - INTERVAL '1 hour' AS new_slot_start
FROM public.bookings
LIMIT 5;

-- Appliquer la correction (décommenter pour exécuter)
-- UPDATE public.bookings
-- SET 
--   slot_start = slot_start - INTERVAL '1 hour',
--   slot_end = slot_end - INTERVAL '1 hour';
```

## 📋 Actions à effectuer

### 1. Exécuter le script SQL
1. Ouvrir Supabase SQL Editor
2. Copier le contenu de `scripts/fix-booking-timezones.sql`
3. Exécuter la première partie (aperçu)
4. Vérifier que les nouvelles heures sont correctes
5. Décommenter la ligne UPDATE et réexécuter
6. Vérifier avec la dernière SELECT

### 2. Tester les nouvelles réservations
1. Créer une nouvelle réservation pour un créneau 08:00-09:30
2. Vérifier en DB que c'est stocké comme `slot_start: 2026-XX-XXT07:00:00+00:00` (07:00 UTC)
3. Vérifier dans le dashboard que ça s'affiche comme `08:00` (heure Paris)

### 3. Vérifier la cohérence
- **Page disponibilité** : doit afficher 08:00–09:30, 09:30–11:00, etc.
- **Planning du jour par terrain** : doit afficher 08:00–09:30, 09:30–11:00, etc. (IDENTIQUE)
- **Data (créneaux disponibles)** : doit afficher 08:00–09:30, 09:30–11:00, etc. (IDENTIQUE)

## 🎯 Garanties

### ✅ Après cette correction :
1. **Une seule source de vérité** : `lib/dateUtils.ts` pour tous les calculs timezone
2. **Affichage cohérent** : tous les écrans utilisent `formatTimeInParisTz`
3. **Création correcte** : toutes les nouvelles réservations utilisent `createSlotStartUTC`
4. **Logs de debug** : `debugTimezone` permet de diagnostiquer rapidement tout problème

### ⚠️ Points d'attention
- Les **anciennes réservations** doivent être corrigées avec le script SQL
- Les **nouvelles réservations** seront automatiquement correctes
- Si une page n'utilise pas `formatTimeInParisTz`, elle affichera le mauvais horaire

## 🔧 Maintenance future

Pour ajouter une nouvelle page qui affiche des heures :
1. Importer `formatTimeInParisTz` de `@/lib/dateUtils`
2. Utiliser `formatTimeInParisTz(booking.slot_start)` au lieu de `toLocaleTimeString`
3. En cas de doute, ajouter `debugTimezone('label', isoString)` pour diagnostiquer

**❌ Ne JAMAIS faire :**
```typescript
new Date(slot_start).toLocaleTimeString() // ❌ Timezone du navigateur
```

**✅ TOUJOURS faire :**
```typescript
formatTimeInParisTz(slot_start) // ✅ Timezone Paris explicite
```

## 📊 État actuel

Build OK ✅
- `npm run build` réussi
- Logs de debug activés
- Nouvelle logique timezone en place

Prochaines étapes :
1. Exécuter le script SQL de correction
2. Tester en prod
3. Supprimer les logs de debug une fois validé
