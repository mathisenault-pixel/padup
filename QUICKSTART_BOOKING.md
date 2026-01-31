# ⚡ Quick Start : Flux Réservation Complet

Guide rapide pour tester le système de réservation 1h30 avec modal, toasts et annulation.

---

## 🚀 Étape 1 : Setup

### 1. Appliquer la migration SQL

```bash
# Dans Supabase SQL Editor
# Copier-coller le contenu de:
supabase/migrations/015_booking_statuses.sql
```

**Vérifier que c'est appliqué:**
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'reservations' AND column_name IN ('statut', 'cancelled_at', 'cancelled_by');
```

**Résultat attendu:**
```
statut       | text        | 'confirmed'
cancelled_at | timestamptz | NULL
cancelled_by | uuid        | NULL
```

### 2. Vérifier les RPC

```sql
-- Vérifier que create_booking_90m a le paramètre p_status
SELECT proname, proargtypes, prosrc
FROM pg_proc
WHERE proname = 'create_booking_90m';

-- Vérifier que cancel_booking existe
SELECT proname
FROM pg_proc
WHERE proname = 'cancel_booking';
```

**Résultat attendu:**
```
create_booking_90m | existe
cancel_booking     | existe
```

### 3. Démarrer le serveur

```bash
cd /Users/mathisenault/Desktop/padup.one
npm run dev
```

Serveur disponible sur `http://localhost:3000`

---

## 🧪 Étape 2 : Tester Disponibilités + Modal

### 1. Ouvrir la page disponibilités

```
http://localhost:3000/availability
```

**Vérifier:**
- ✅ 14 créneaux affichés (09:00 → 22:00)
- ✅ Code couleur : blanc = libre, gris = occupé
- ✅ Compteur "X créneaux disponibles sur 14"

### 2. Cliquer sur un créneau libre

**Action:** Cliquer sur "09:00 - 10:30"

**Vérifier:**
- ✅ Modal s'ouvre avec titre "Confirmer votre réservation"
- ✅ Détails affichés : horaire, durée (1h30), terrain
- ✅ 2 boutons : "Annuler" et "Confirmer"

### 3. Annuler la modal

**Action:** Cliquer "Annuler" ou cliquer en dehors de la modal

**Vérifier:**
- ✅ Modal se ferme
- ✅ Créneau reste "Libre"

### 4. Confirmer la réservation

**Action:**
1. Cliquer sur "09:00 - 10:30"
2. Cliquer "Confirmer"

**Vérifier:**
- ✅ Créneau devient gris **instantanément** (optimistic UI)
- ✅ Bouton affiche "Réservation..." pendant la requête
- ✅ Modal se ferme après succès
- ✅ Toast vert "✅ Réservation confirmée !" s'affiche en haut à droite
- ✅ Toast disparaît après 3 secondes
- ✅ Créneau reste gris après disparition du toast

### 5. Vérifier dans DevTools Console

**Ouvrir Console (F12):**
```
[BOOK SLOT] { slotId: "...", startAt: "...", endAt: "..." }
[RPC SUCCESS - create_booking_90m] { ... }
[BOOKING SUCCESS] { ... }
[AVAILABILITY LOADED] { totalSlots: 14, freeSlots: 12, reservedSlots: 2 }
```

---

## 🔥 Étape 3 : Tester Conflits

### 1. Ouvrir 2 onglets

```
Onglet A: http://localhost:3000/availability
Onglet B: http://localhost:3000/availability
```

### 2. Réserver le même créneau

**Dans les 2 onglets:**
1. Cliquer sur "10:30 - 12:00"
2. Cliquer "Confirmer" **en même temps**

**Vérifier:**
- ✅ **Onglet A** (premier arrivé):
  - Toast vert "✅ Réservation confirmée !"
  - Créneau reste gris
  
- ✅ **Onglet B** (conflit):
  - Toast jaune "⚠️ Trop tard : quelqu'un vient de réserver ce créneau."
  - Créneau passe en gris (refresh automatique)

---

## 📱 Étape 4 : Tester Realtime Synchronization

### 1. Ouvrir 2 onglets

```
Onglet A: http://localhost:3000/availability
Onglet B: http://localhost:3000/availability
```

### 2. Réserver dans l'onglet A

**Onglet A:**
1. Cliquer sur "12:00 - 13:30"
2. Confirmer

**Vérifier dans l'onglet B (sans refresh):**
- ✅ Créneau "12:00 - 13:30" passe **automatiquement** en "Occupé" (gris)
- ✅ Compteur se met à jour : "X créneaux disponibles"

**Si ça ne fonctionne pas:**
1. Vérifier dans Supabase Dashboard > Database > Replication
2. Activer Realtime pour la table `reservations`
3. Redémarrer `npm run dev`

---

## 📋 Étape 5 : Tester "Mes Réservations"

### 1. Ouvrir la page

```
http://localhost:3000/me/bookings
```

**Vérifier:**
- ✅ Liste des réservations affichée
- ✅ Filtre "À venir" sélectionné par défaut
- ✅ Seules les réservations confirmées + futures s'affichent

### 2. Vérifier les détails d'une réservation

**Pour chaque réservation:**
- ✅ Nom du club affiché
- ✅ Nom du terrain affiché
- ✅ Date + horaire affiché (ex: "Jeudi 30 janvier 2026 • 09:00 - 10:30")
- ✅ Badge "Confirmée" (vert)
- ✅ Bouton "Annuler la réservation" visible

### 3. Tester les filtres

**Cliquer sur "Passées":**
- ✅ Seules les réservations passées s'affichent
- ✅ Badge "Passée" (gris)
- ✅ Pas de bouton "Annuler"

**Cliquer sur "Annulées":**
- ✅ Seules les réservations annulées s'affichent (vide si aucune)

**Cliquer sur "Toutes":**
- ✅ Toutes les réservations s'affichent

---

## ❌ Étape 6 : Tester Annulation

### 1. Annuler une réservation

**Action:**
1. Sur http://localhost:3000/me/bookings
2. Cliquer "Annuler la réservation" sur une réservation future
3. Modal s'ouvre avec détails

**Vérifier modal:**
- ✅ Titre "Annuler la réservation"
- ✅ Détails réservation affichés (club, terrain, date, horaire)
- ✅ Message d'avertissement rouge : "Cette action est irréversible"
- ✅ 2 boutons : "Non, garder" et "Oui, annuler"

### 2. Annuler (vraiment)

**Action:** Cliquer "Oui, annuler"

**Vérifier:**
- ✅ Bouton affiche "Annulation..." pendant la requête
- ✅ Modal se ferme après succès
- ✅ Toast vert "✅ Réservation annulée avec succès." s'affiche
- ✅ Réservation **disparaît** de la liste "À venir"

### 3. Vérifier dans "Annulées"

**Action:** Cliquer sur le filtre "Annulées"

**Vérifier:**
- ✅ Réservation annulée apparaît dans la liste
- ✅ Badge "Annulée" (rouge)
- ✅ Pas de bouton "Annuler"
- ✅ Opacité réduite (0.7)

### 4. Vérifier que le créneau est libéré

**Action:**
1. Retourner sur http://localhost:3000/availability
2. Sélectionner la même date que la réservation annulée

**Vérifier:**
- ✅ Créneau est de nouveau "Libre" (blanc)
- ✅ Peut être réservé à nouveau

---

## 🔍 Étape 7 : Tester Gestion d'Erreurs

### Test 1 : Annuler une réservation déjà annulée

**Setup:**
1. Annuler une réservation
2. Dans Supabase SQL Editor, récupérer l'ID de la réservation:
   ```sql
   SELECT identifiant FROM reservations WHERE statut = 'cancelled' LIMIT 1;
   ```

**Action:** Appeler l'API d'annulation:
```bash
curl -X POST http://localhost:3000/api/bookings/BOOKING-UUID/cancel \
  -H "Content-Type: application/json" \
  -d '{"cancelledBy": "cee11521-8f13-4157-8057-034adf2cb9a0"}'
```

**Vérifier:**
- ✅ Statut HTTP 400
- ✅ Body: `{ "error": "Réservation déjà annulée", "code": "ALREADY_CANCELLED" }`

### Test 2 : Réservation introuvable

**Action:**
```bash
curl -X POST http://localhost:3000/api/bookings/00000000-0000-0000-0000-000000000000/cancel \
  -H "Content-Type: application/json"
```

**Vérifier:**
- ✅ Statut HTTP 404
- ✅ Body: `{ "error": "Réservation introuvable", "code": "BOOKING_NOT_FOUND" }`

### Test 3 : Date passée (validation)

**Action:**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "clubId": "ba43c579-e522-4b51-8542-737c2c6452bb",
    "courtId": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
    "slotStart": "2020-01-01T10:00:00.000Z",
    "createdBy": "cee11521-8f13-4157-8057-034adf2cb9a0"
  }'
```

**Vérifier:**
- ✅ Statut HTTP 400
- ✅ Body: `{ "error": "start_at doit être dans le futur", "code": "VALIDATION_ERROR" }`

---

## ✅ Checklist Finale

### Backend
- [ ] Migration 015 appliquée
- [ ] RPC `create_booking_90m` modifiée (paramètre `p_status`)
- [ ] RPC `cancel_booking` créée
- [ ] Route POST /api/bookings fonctionne
- [ ] Route POST /api/bookings/:id/cancel fonctionne

### UI Disponibilités
- [ ] Modal de confirmation s'ouvre
- [ ] Créneau devient gris instantanément (optimistic UI)
- [ ] Toast de succès s'affiche
- [ ] Toast de conflit (409) s'affiche si double-booking
- [ ] Realtime synchronization fonctionne

### UI Mes Réservations
- [ ] Liste des réservations s'affiche
- [ ] Filtres fonctionnent (À venir / Passées / Annulées / Toutes)
- [ ] Badge de statut correct
- [ ] Bouton "Annuler" visible uniquement pour futures confirmées
- [ ] Modal d'annulation s'ouvre
- [ ] Annulation fonctionne
- [ ] Toast de succès s'affiche
- [ ] Créneau libéré automatiquement

### Gestion d'Erreurs
- [ ] 409 (Conflit) : Toast "Trop tard"
- [ ] 400 (Validation) : Toast "Erreur: ..."
- [ ] 404 (Not Found) : Toast "Réservation introuvable"
- [ ] 403 (Forbidden) : Toast "Permission refusée"

---

## 🐛 Troubleshooting

### Erreur : "Modal ne s'ouvre pas"

**Cause :** Composant Modal non trouvé.

**Solution :**
1. Vérifier que `components/ui/Modal.tsx` existe
2. Vérifier l'import dans `availability/page.tsx`:
   ```typescript
   import Modal from "@/components/ui/Modal";
   ```

### Erreur : "Toast ne s'affiche pas"

**Cause :** Hook `useToast` non utilisé correctement.

**Solution :**
1. Vérifier l'import:
   ```typescript
   import { useToast } from "@/components/ui/Toast";
   ```
2. Vérifier l'utilisation:
   ```typescript
   const { toast, showToast, hideToast, ToastComponent } = useToast();
   ```
3. Ajouter `{ToastComponent}` en fin de JSX

### Erreur : "Realtime ne fonctionne pas"

**Cause :** Realtime non activé sur la table `reservations`.

**Solution :**
1. Supabase Dashboard > Database > Replication
2. Activer Realtime pour `reservations`
3. Redémarrer `npm run dev`

### Erreur : "Annulation ne libère pas le créneau"

**Cause :** `booking_slots` pas supprimé.

**Solution :**
1. Vérifier que la RPC `cancel_booking` contient:
   ```sql
   DELETE FROM public.booking_slots WHERE booking_id = p_booking_id;
   ```
2. Vérifier que la contrainte `ON DELETE CASCADE` existe sur `booking_slots.booking_id`

---

## 🎯 Résumé

**Ce qui a été testé:**
- ✅ Modal de confirmation (disponibilités)
- ✅ Toast notifications (succès/erreur/conflit)
- ✅ Optimistic UI (griser instantanément)
- ✅ Realtime synchronization (entre onglets)
- ✅ Conflits double-booking (409)
- ✅ Page "Mes réservations"
- ✅ Annulation de réservation
- ✅ Gestion d'erreurs (400, 403, 404, 409)

**Prochaines étapes:**
1. Authentification (récupérer `auth.uid()` depuis la session)
2. Paiement (Stripe integration)
3. Notifications email (confirmation + annulation)
4. Dashboard club (vue des réservations par staff/owner)

**MVP complet et fonctionnel !** 🚀
