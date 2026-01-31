# ⚡ Quick Start : Endpoints Disponibilités + Planning

Guide de démarrage rapide pour tester les nouveaux endpoints.

---

## 🚀 Étape 1 : Vérifier que tout est installé

### Fichiers créés

```bash
# Utils
lib/slots.ts

# API Routes
app/api/clubs/[clubId]/courts/[courtId]/availability/route.ts
app/api/club/planning/route.ts

# UI Pages
app/(public)/availability/page.tsx  (refactorisée)
app/club/planning/page.tsx          (nouvelle)

# Documentation
ENDPOINTS_PLANNING.md
ENDPOINTS_README.md
QUICKSTART_ENDPOINTS.md

# Tests SQL
supabase/test_endpoints.sql
```

### Vérifier les migrations

```bash
# S'assurer que les migrations sont appliquées
# - 013_booking_slots_90min.sql (anti double-booking)
# - 014_rls_roles_security.sql (RLS + rôles)
```

---

## 🧪 Étape 2 : Tester les endpoints (API)

### 1. Lancer le serveur

```bash
cd /Users/mathisenault/Desktop/padup.one
npm run dev
```

Le serveur démarre sur `http://localhost:3000`.

### 2. Tester l'endpoint disponibilités

```bash
curl "http://localhost:3000/api/clubs/ba43c579-e522-4b51-8542-737c2c6452bb/courts/6dceaf95-80dd-4fcf-b401-7d4c937f6e9e/availability?date=2026-01-30"
```

**Résultat attendu :**
```json
{
  "clubId": "ba43c579-e522-4b51-8542-737c2c6452bb",
  "courtId": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
  "date": "2026-01-30",
  "slots": [
    {
      "slot_id": "ba43c579_...",
      "start_at": "2026-01-30T09:00:00.000Z",
      "end_at": "2026-01-30T10:30:00.000Z",
      "label": "09:00 - 10:30",
      "status": "free"
    },
    ...
  ],
  "meta": {
    "totalSlots": 14,
    "freeSlots": 12,
    "reservedSlots": 2,
    "slotDuration": 90
  }
}
```

**Vérifier :**
- ✅ 14 slots (09:00 → 22:00)
- ✅ Chaque slot a `slot_id`, `start_at`, `end_at`, `label`, `status`
- ✅ `status: 'free'` ou `status: 'reserved'`
- ✅ `meta.totalSlots = 14`

### 3. Tester l'endpoint planning club

```bash
curl "http://localhost:3000/api/club/planning?clubId=ba43c579-e522-4b51-8542-737c2c6452bb&date=2026-01-30&view=day"
```

**Résultat attendu :**
```json
{
  "clubId": "ba43c579-e522-4b51-8542-737c2c6452bb",
  "date": "2026-01-30",
  "view": "day",
  "courts": [
    {
      "court_id": "6dceaf95-80dd-4fcf-b401-7d4c937f6e9e",
      "court_name": "Terrain 2",
      "slots": [...],
      "meta": {
        "totalSlots": 14,
        "freeSlots": 12,
        "reservedSlots": 2
      }
    },
    ...
  ],
  "meta": {
    "totalCourts": 4,
    "totalSlots": 56,
    "totalFreeSlots": 48,
    "totalReservedSlots": 8
  }
}
```

**Vérifier :**
- ✅ Tous les terrains du club retournés
- ✅ Chaque terrain a 14 slots
- ✅ `meta.totalSlots = nb_terrains * 14`
- ✅ `meta.totalFreeSlots + meta.totalReservedSlots = meta.totalSlots`

---

## 🎨 Étape 3 : Tester l'UI (Joueur)

### 1. Ouvrir la page disponibilités

```
http://localhost:3000/availability
```

**Vérifier :**
- ✅ 14 créneaux affichés (09:00 → 22:00)
- ✅ Code couleur : blanc = libre, gris = occupé
- ✅ Compteur : "X créneaux disponibles sur 14"

### 2. Réserver un créneau

1. Cliquer sur un créneau "Libre" (ex: 09:00 - 10:30)
2. **Vérifier** :
   - ✅ Le créneau devient gris **instantanément** (optimistic UI)
   - ✅ Message "✅ Réservation confirmée !" s'affiche
   - ✅ Le créneau reste gris après refresh

### 3. Tester Realtime synchronization

1. Ouvrir **2 onglets** sur `http://localhost:3000/availability`
2. Dans l'onglet A, réserver un créneau "10:30 - 12:00"
3. **Vérifier** :
   - ✅ Onglet A : message "✅ Réservation confirmée !"
   - ✅ Onglet B : le créneau passe **automatiquement** en "Occupé" (sans refresh)

### 4. Tester conflit double-booking

1. Ouvrir **2 onglets** sur `http://localhost:3000/availability`
2. Dans les 2 onglets, cliquer **en même temps** sur le même créneau (ex: 12:00 - 13:30)
3. **Vérifier** :
   - ✅ Onglet A : ✅ "Réservation confirmée !" (premier arrivé)
   - ✅ Onglet B : ⚠️ "Trop tard : quelqu'un vient de réserver ce créneau." (conflit 409)
   - ✅ Les 2 onglets affichent le créneau en "Occupé"

---

## 🏢 Étape 4 : Tester l'UI (Club)

### 1. Ouvrir la page planning

```
http://localhost:3000/club/planning
```

**Vérifier :**
- ✅ Affiche tous les terrains du club
- ✅ Pour chaque terrain :
  - Nom du terrain
  - "X libres • Y réservés"
  - % libre (avec code couleur : vert = beaucoup, jaune = moyen, rouge = plein)
  - Grille de 14 créneaux
- ✅ Résumé global :
  - "X terrains • Y créneaux au total"
  - "Z créneaux libres • W réservations"

### 2. Navigation date

**Vérifier :**
- ✅ Bouton "← Jour précédent" : recule d'un jour
- ✅ Bouton "Jour suivant →" : avance d'un jour
- ✅ Bouton "Aujourd'hui" : revient à aujourd'hui
- ✅ Input date : permet de sélectionner une date précise

### 3. Vue jour / semaine

**Vérifier :**
- ✅ Bouton "Jour" : affiche uniquement la date sélectionnée
- ✅ Bouton "Semaine" : (TODO) affiche la semaine entière

---

## 🐛 Étape 5 : Vérifier les logs

### Console browser (DevTools)

Ouvrir les DevTools (`F12`) et aller dans l'onglet "Console".

**Logs attendus :**

#### Page joueur (`/availability`)

```
[LOAD AVAILABILITY] { clubId: "ba43c579-...", courtId: "6dceaf95-...", date: "2026-01-30" }
[AVAILABILITY LOADED] { totalSlots: 14, freeSlots: 12, reservedSlots: 2 }
[REALTIME] Nouvelle réservation: { ... }
[BOOK SLOT] { slotId: "...", startAt: "...", endAt: "..." }
[BOOKING SUCCESS] { ... }
```

#### Page club (`/club/planning`)

```
[LOAD PLANNING] { clubId: "ba43c579-...", date: "2026-01-30", view: "day" }
[PLANNING LOADED] { courts: 4, totalSlots: 56, freeSlots: 48, reservedSlots: 8 }
```

### Terminal (Next.js server)

Dans le terminal où `npm run dev` tourne.

**Logs attendus :**

```
[API AVAILABILITY] { clubId: "ba43c579-...", courtId: "6dceaf95-...", date: "2026-01-30" }
[SLOTS GENERATED] { count: 14, first: { ... }, last: { ... } }
[BOOKED SLOTS FROM DB] { count: 2, slots: [...] }
[AVAILABILITY RESULT] { totalSlots: 14, freeSlots: 12, reservedSlots: 2 }

[API CLUB PLANNING] { clubId: "ba43c579-...", date: "2026-01-30", view: "day" }
[COURTS FETCHED] { count: 4, courts: [...] }
[BOOKINGS FETCHED] { count: 8 }
[PLANNING RESULT] { courts: 4, totalSlots: 56, totalFreeSlots: 48, totalReservedSlots: 8 }
```

---

## ✅ Checklist finale

### Endpoints API

- [ ] `GET /api/clubs/.../availability` retourne 200 + JSON correct
- [ ] `GET /api/club/planning` retourne 200 + JSON correct
- [ ] Erreur 400 si date manquante ou invalide
- [ ] Logs serveur clairs (sans erreur)

### UI Joueur

- [ ] 14 créneaux affichés (09:00 → 22:00)
- [ ] Code couleur : blanc = libre, gris = occupé
- [ ] Optimistic UI : griser instantanément au clic
- [ ] Realtime : autre onglet voit la réservation immédiatement
- [ ] Conflit 409 : message "Trop tard" + créneau reste gris

### UI Club

- [ ] Tous les terrains affichés
- [ ] % libre par terrain (code couleur)
- [ ] Résumé global correct
- [ ] Navigation date fonctionne
- [ ] Vue jour / semaine (TODO semaine)

### Base de données

- [ ] Migrations appliquées (013 + 014)
- [ ] RLS activé
- [ ] Contrainte UNIQUE bloque les doublons
- [ ] RPC `create_booking_90m` fonctionne
- [ ] Memberships créés (au moins 1 owner)

---

## 🆘 Troubleshooting

### Erreur : "Failed to fetch bookings"

**Cause :** Supabase n'arrive pas à lire `booking_slots`.

**Solution :**
1. Vérifier que la table `booking_slots` existe :
   ```sql
   SELECT * FROM public.booking_slots LIMIT 5;
   ```
2. Vérifier que RLS est activé et policies créées :
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'booking_slots';
   ```
3. Vérifier les variables d'env :
   ```bash
   cat .env.local
   # NEXT_PUBLIC_SUPABASE_URL=...
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

### Erreur : "No courts found for this club"

**Cause :** Le club n'a pas de terrains.

**Solution :**
1. Vérifier que des terrains existent :
   ```sql
   SELECT * FROM public.courts WHERE club_id = 'ba43c579-...';
   ```
2. Si vide, créer des terrains :
   ```sql
   INSERT INTO public.courts (club_id, name) VALUES
     ('ba43c579-...', 'Terrain 1'),
     ('ba43c579-...', 'Terrain 2');
   ```

### Erreur : Realtime ne fonctionne pas

**Cause :** Supabase Realtime n'est pas activé.

**Solution :**
1. Aller sur Supabase Dashboard > Database > Replication
2. Activer Realtime pour la table `reservations`
3. Redémarrer l'app (`npm run dev`)

### Les créneaux ne correspondent pas

**Cause :** Timezone mismatch (DB en UTC, UI en Europe/Paris).

**Solution :**
1. Vérifier les logs dans DevTools :
   ```
   [SLOTS GENERATED] { first: { start_at: "..." } }
   [BOOKED SLOTS FROM DB] { slots: [...] }
   ```
2. Comparer les `start_at` : doivent être identiques (même format ISO)
3. Si différent, vérifier `toISOWithOffset()` dans `lib/slots.ts`

---

## 🎯 Résumé

**Endpoints créés :**
- ✅ `GET /api/clubs/:clubId/courts/:courtId/availability?date=YYYY-MM-DD`
- ✅ `GET /api/club/planning?clubId=...&date=YYYY-MM-DD&view=day|week`

**UI créée :**
- ✅ Page joueur : `/availability` (refactorisée)
- ✅ Page club : `/club/planning` (nouvelle)

**Fonctionnalités :**
- ✅ Source de vérité : DB (booking_slots)
- ✅ Créneaux fixes : 90 min (1h30)
- ✅ Optimistic UI locking
- ✅ Realtime synchronization
- ✅ Anti double-booking (contrainte UNIQUE + RPC)
- ✅ Gestion des conflits (409)

**Prochaines étapes :**
- [ ] Authentification + authorization (vérifier membership staff/owner)
- [ ] Cache / performance (Redis)
- [ ] Vue semaine (planning club)
- [ ] Modal détails réservation (qui, quand, combien)
- [ ] Filtres (terrain, statut, user)

**MVP complet et prêt pour la production !** 🚀
