# 🔧 Script de correction du timezone des bookings

## 🎯 Objectif

Corriger le décalage de +1h dans l'affichage des réservations causé par un mauvais stockage du timezone.

## 🔍 Problème

Les bookings sont stockés avec l'heure locale + UTC au lieu de l'heure UTC correcte :
- ❌ **Actuel** : 08:00 Paris stocké comme `2026-02-15T08:00:00+00:00` (08:00 UTC)
- ✅ **Attendu** : 08:00 Paris devrait être `2026-02-15T07:00:00+00:00` (07:00 UTC car Paris = UTC+1)

**Conséquence** : Quand on affiche en timezone Paris, `08:00 UTC` devient `09:00 Paris` → Décalage de +1h

## ✅ Solution

Le script `fix-timezone-bookings.js` soustrait 1 heure à tous les `slot_start` et `slot_end` des bookings.

## 📋 Utilisation

### 1. Mode PREVIEW (recommandé d'abord)

Affiche un aperçu des modifications sans rien changer :

```bash
node scripts/fix-timezone-bookings.js
```

Cela affichera :
- Nombre total de bookings à corriger
- Aperçu des 5 premiers bookings (avant/après)
- Instructions pour confirmer

### 2. Mode CORRECTION (avec confirmation)

Pour appliquer réellement les corrections :

```bash
node scripts/fix-timezone-bookings.js --confirm
```

⚠️ **ATTENTION** : Cette opération est **IRRÉVERSIBLE** !

## 🛡️ Sécurité

- Le script utilise `SUPABASE_SERVICE_ROLE_KEY` pour bypasser RLS
- Aucun backup automatique n'est créé
- Testez d'abord en PREVIEW

## ✅ Vérification après correction

1. Redémarrer l'application : `npm run dev`
2. Ouvrir le dashboard club
3. Vérifier que :
   - Les réservations affichent la bonne heure (08:00 au lieu de 09:00)
   - Les créneaux disponibles ne montrent plus les slots déjà réservés

## 📊 Exemple de sortie

### Mode PREVIEW
```
🔍 Récupération des bookings...

📊 9 bookings trouvés

📋 APERÇU DES CORRECTIONS (premiers 5):
────────────────────────────────────────────────────────────────────────────────

1. Booking ID: 9a6e1606...
   slot_start:
     Avant:  2026-02-15T08:00:00+00:00 (UTC: Sun, 15 Feb 2026 08:00:00 GMT)
     Après:  2026-02-15T07:00:00.000Z (UTC: Sun, 15 Feb 2026 07:00:00 GMT)
   slot_end:
     Avant:  2026-02-15T09:30:00+00:00 (UTC: Sun, 15 Feb 2026 09:30:00 GMT)
     Après:  2026-02-15T08:30:00.000Z (UTC: Sun, 15 Feb 2026 08:30:00 GMT)

...

⚠️  9 bookings seront modifiés
⚠️  Cette opération est IRRÉVERSIBLE (sans backup)

💡 Pour confirmer, relancez avec: node scripts/fix-timezone-bookings.js --confirm

ℹ️  Mode PREVIEW uniquement (aucune modification appliquée)
```

### Mode CORRECTION
```
🚀 APPLICATION DES CORRECTIONS...

✅ 9/9

✅ TERMINÉ !
   Succès: 9
   Erreurs: 0

🎉 Tous les bookings ont été corrigés avec succès !
🔄 Redémarrez l'application pour voir les changements.
```

## 🔄 Rollback (en cas de problème)

Si les corrections causent un problème, vous pouvez les annuler en **ajoutant** 1 heure :

1. Modifier le script ligne 77 et 80 :
   ```javascript
   // Changer de:
   const newStart = new Date(oldStart.getTime() - 60 * 60 * 1000) // -1 heure
   // À:
   const newStart = new Date(oldStart.getTime() + 60 * 60 * 1000) // +1 heure
   ```

2. Réexécuter :
   ```bash
   node scripts/fix-timezone-bookings.js --confirm
   ```

## 📝 Notes

- Le script n'affecte QUE les bookings existants
- Les **nouvelles** réservations seront automatiquement créées avec le bon timezone (grâce à `createSlotStartUTC`)
- Après la correction, tous les écrans afficheront des heures cohérentes

## ⚠️ Pré-requis

Variables d'environnement requises dans `.env.local` :
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` ← **Important !**

Si elles manquent, le script affichera une erreur explicite.
