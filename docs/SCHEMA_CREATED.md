# ✅ Schéma SQL Créé - Pad'up MVP

Date : 2026-01-22

---

## 🎉 Résumé

Le schéma SQL complet pour le MVP Pad'up a été créé avec succès !

**Fichier** : `supabase/schema.sql` (443 lignes)

---

## 📊 Ce qui a été créé

### ✅ Types Enum (2)
- `booking_status` : confirmed, cancelled
- `membership_role` : owner, staff

### ✅ Tables (7)
1. **clubs** - Clubs de padel (id, name, city, address, phone, email)
2. **courts** - Terrains par club (id, club_id, name, is_active)
3. **memberships** - Rôles utilisateurs (user_id, club_id, role) [PK composite]
4. **bookings** - Réservations créneaux 30 min (id, court_id, slot_start, slot_end, created_by, status)
5. **products** - Produits vendus (id, club_id, name, category, price_cents, is_available)
6. **orders** - Commandes d'extras (id, booking_id, club_id, total_cents)
7. **order_items** - Détail commandes (order_id, product_id, quantity, price_cents) [PK composite]

### ✅ Contraintes Critiques
- **UNIQUE(court_id, slot_start)** sur `bookings` → Anti double-booking garanti
- **CHECK(slot_end = slot_start + 30 min)** → Créneaux fixes 30 minutes
- **CHECK(slot_end > slot_start)** → Cohérence temporelle
- **CHECK(price_cents >= 0)** → Prix positifs
- **CHECK(quantity > 0)** → Quantités valides

### ✅ Indexes (11)
- `bookings` : club_id, court_id, slot_start, created_by, status
- `courts` : club_id
- `products` : club_id
- `orders` : club_id, booking_id
- `memberships` : user_id, club_id

### ✅ Fonctions & Triggers
- Fonction `update_updated_at_column()` pour auto-update `updated_at`
- Trigger sur `bookings` pour mettre à jour `updated_at` automatiquement

### ✅ Row Level Security (RLS)
- ✅ RLS activé sur les 7 tables
- ✅ 15+ policies créées pour sécuriser l'accès

---

## 🔒 Policies RLS Principales

### **bookings** (Réservations)
- **SELECT** : Tout le monde (public) → Voir disponibilités
- **INSERT** : Seulement si `auth.uid() = created_by`
- **UPDATE** : Créateur OU staff/owner du club
- **DELETE** : Créateur OU staff/owner du club

### **clubs** & **courts** & **products**
- **SELECT** : Tout le monde (public)
- **INSERT/UPDATE/DELETE** : Owner ou staff du club

### **memberships**
- **SELECT** : Utilisateur concerné OU owner du club
- **INSERT/UPDATE/DELETE** : Owner du club uniquement

### **orders** & **order_items**
- **SELECT/INSERT** : Créateur de la réservation OU staff du club

---

## 🛡️ Anti Double-Booking - Comment ça marche

### 1. Contrainte SQL (Niveau DB)
```sql
CONSTRAINT unique_court_slot UNIQUE (court_id, slot_start)
```
→ **Garantie ultime** : Impossible d'insérer 2 réservations identiques, même en race condition.

### 2. Créneaux Fixes 30 Min
```sql
CONSTRAINT slot_duration_30min CHECK (slot_end = slot_start + interval '30 minutes')
```
→ Tous les créneaux font exactement 30 minutes (08:00-08:30, 08:30-09:00, etc.).

### 3. Exemple d'Utilisation

**Réserver 1h30 (3 créneaux)** :
```sql
-- Insérer 3 lignes dans bookings
INSERT INTO bookings (court_id, slot_start, slot_end, created_by, status)
VALUES 
  ('<court_id>', '2026-01-25 10:00:00', '2026-01-25 10:30:00', '<user_id>', 'confirmed'),
  ('<court_id>', '2026-01-25 10:30:00', '2026-01-25 11:00:00', '<user_id>', 'confirmed'),
  ('<court_id>', '2026-01-25 11:00:00', '2026-01-25 11:30:00', '<user_id>', 'confirmed');
```

**Tenter un double-booking** :
```sql
-- ❌ ÉCHOUERA avec erreur "unique_court_slot"
INSERT INTO bookings (court_id, slot_start, slot_end, created_by, status)
VALUES ('<court_id>', '2026-01-25 10:00:00', '2026-01-25 10:30:00', '<user_id>', 'confirmed');
```

---

## 🚀 Comment Appliquer le Schéma

### Méthode 1 : Supabase Dashboard (Recommandé pour MVP)

1. Aller sur [app.supabase.com](https://app.supabase.com)
2. Ouvrir votre projet
3. Menu **SQL Editor** (icône </> à gauche)
4. Cliquer **New query**
5. Copier TOUT le contenu de `supabase/schema.sql`
6. Cliquer **Run** (ou Cmd+Enter)
7. Vérifier les messages de succès :
   ```
   ✅ Schema Pad'up MVP créé avec succès !
   📊 Tables: clubs, courts, memberships, bookings, products, orders, order_items
   🔒 RLS activé sur toutes les tables
   ```

### Méthode 2 : Supabase CLI

```bash
# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref your-project-ref

# Appliquer le schema
psql -h db.xxx.supabase.co -U postgres -d postgres -f supabase/schema.sql
```

---

## 🧪 Tests Rapides Post-Setup

### 1. Vérifier les Tables
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- Devrait retourner : clubs, courts, memberships, bookings, products, orders, order_items
```

### 2. Vérifier les Policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
-- Devrait retourner 15+ policies
```

### 3. Insérer un Club de Test
```sql
INSERT INTO clubs (name, city, address, phone, email)
VALUES ('Test Club', 'Paris', '123 Rue Test', '0123456789', 'test@test.com')
RETURNING id;
-- Devrait retourner un UUID
```

### 4. Tester Anti Double-Booking
```sql
-- 1. Insérer une réservation
INSERT INTO bookings (club_id, court_id, slot_start, slot_end, created_by, status)
VALUES (
  '<club_id>',
  '<court_id>',
  '2026-01-25 10:00:00+00',
  '2026-01-25 10:30:00+00',
  auth.uid(),
  'confirmed'
);

-- 2. Tenter même créneau (DOIT ÉCHOUER)
INSERT INTO bookings (club_id, court_id, slot_start, slot_end, created_by, status)
VALUES (
  '<club_id>',
  '<court_id>',
  '2026-01-25 10:00:00+00',  -- Même heure
  '2026-01-25 10:30:00+00',
  auth.uid(),
  'confirmed'
);
-- ❌ Erreur attendue: duplicate key value violates unique constraint "unique_court_slot"
```

---

## 📖 Documentation Associée

Pour plus de détails, voir :
- **`docs/DATABASE.md`** : Guide complet de la base de données
  - Schéma détaillé des tables
  - Explications RLS
  - Requêtes d'exemple
  - Dépannage
- **`docs/ARCHITECTURE.md`** : Architecture technique globale
- **`docs/TODO.md`** : Prochaines étapes (Phase 2 : Setup Supabase)

---

## ✅ Checklist de Validation

Après avoir appliqué le schéma, vérifier :
- [ ] Les 7 tables existent
- [ ] RLS est activé sur toutes les tables
- [ ] Les policies sont créées (15+)
- [ ] Insertion d'un club de test fonctionne
- [ ] Anti double-booking fonctionne (erreur sur doublon)
- [ ] Les indexes sont créés (11)

---

## 🎯 Prochaines Étapes

### Phase 2 : Authentification (voir `docs/TODO.md`)
1. Configurer Supabase Auth (email/password)
2. Créer `lib/auth/getUserWithRole.ts`
3. Créer middleware de protection routes `/club/*`
4. Implémenter page `/login`

### Phase 3 : Interface Joueur
1. Connecter page `/book` à Supabase (fetch clubs)
2. Créer page `/book/[clubId]` (calendrier réservation)
3. Implémenter Server Action `createBooking`
4. Tester parcours complet : voir club → choisir créneau → confirmer

---

## 📊 Statistiques du Schéma

| Métrique | Valeur |
|----------|--------|
| **Lignes de code** | 443 |
| **Tables** | 7 |
| **Enum types** | 2 |
| **Contraintes** | 10+ |
| **Indexes** | 11 |
| **Policies RLS** | 15+ |
| **Triggers** | 1 |
| **Fonctions** | 1 |

---

## 🆘 Support

### Erreurs Courantes

**1. "extension uuid-ossp does not exist"**
- Solution : Le schéma l'active automatiquement. Vérifier que vous avez les droits `SUPERUSER` ou utiliser Supabase Dashboard.

**2. "RLS bloque toutes mes requêtes"**
- Solution : Vérifier que vous êtes authentifié (`SELECT auth.uid()` doit retourner un UUID).
- En dev : Désactiver temporairement RLS avec `ALTER TABLE xxx DISABLE ROW LEVEL SECURITY;` (à réactiver après !).

**3. "Constraint violation: unique_court_slot"**
- ✅ **C'est normal** ! L'anti double-booking fait son travail.
- Solution : Gérer l'erreur côté application (voir `docs/DATABASE.md`).

---

## 🎉 Félicitations !

Vous avez maintenant :
- ✅ Un schéma SQL complet et production-ready
- ✅ Anti double-booking garanti par contraintes SQL
- ✅ RLS activé pour sécuriser l'accès
- ✅ Indexes pour optimiser les performances
- ✅ Documentation détaillée pour comprendre le schéma

**Le backend est prêt ! Passez à l'authentification.** 🚀

---

**Fichiers créés** :
- ✅ `supabase/schema.sql` (443 lignes)
- ✅ `docs/DATABASE.md` (guide complet)
- ✅ `docs/SCHEMA_CREATED.md` (ce fichier)
