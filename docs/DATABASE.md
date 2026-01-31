# 🗄️ Base de Données - Pad'up MVP

Guide complet pour la base de données Supabase.

---

## 📋 Vue d'Ensemble

Le schéma est défini dans **`supabase/schema.sql`** et peut être exécuté directement dans Supabase.

### Tables Créées (7)
1. **clubs** - Clubs de padel
2. **courts** - Terrains par club
3. **memberships** - Rôles utilisateurs (owner/staff)
4. **bookings** - Réservations (créneaux 30 min)
5. **products** - Produits vendus (boissons, snacks)
6. **orders** - Commandes d'extras
7. **order_items** - Détail des commandes

---

## 🚀 Appliquer le Schéma

### Option 1 : Via Supabase Dashboard (Recommandé pour MVP)

1. Aller sur [supabase.com](https://supabase.com)
2. Ouvrir votre projet
3. Aller dans **SQL Editor** (menu gauche)
4. Créer une **New query**
5. Copier tout le contenu de `supabase/schema.sql`
6. Cliquer sur **Run** (ou Cmd+Enter)
7. Vérifier les messages de succès

### Option 2 : Via Supabase CLI

```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref your-project-ref

# Appliquer le schema
supabase db reset
# OU
psql -h db.xxx.supabase.co -U postgres -d postgres -f supabase/schema.sql
```

---

## 📊 Schéma des Tables

### `clubs`
Informations des clubs de padel.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique (PK) |
| name | TEXT | Nom du club |
| city | TEXT | Ville |
| address | TEXT | Adresse complète |
| phone | TEXT | Téléphone |
| email | TEXT | Email de contact |
| created_at | TIMESTAMPTZ | Date de création |

**Indexes** : Aucun (table de référence)

---

### `courts`
Terrains de padel par club.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique (PK) |
| club_id | UUID | Club parent (FK) |
| name | TEXT | Nom du terrain (ex: "Terrain 1") |
| is_active | BOOLEAN | Terrain actif ou non |
| created_at | TIMESTAMPTZ | Date de création |

**Indexes** :
- `idx_courts_club_id` sur `club_id`

**Cascade** : DELETE club → DELETE courts

---

### `memberships`
Rôles des utilisateurs dans les clubs.

| Colonne | Type | Description |
|---------|------|-------------|
| user_id | UUID | Utilisateur (FK auth.users) |
| club_id | UUID | Club (FK) |
| role | membership_role | 'owner' ou 'staff' |
| created_at | TIMESTAMPTZ | Date de création |

**PK Composite** : (user_id, club_id)

**Indexes** :
- `idx_memberships_user_id` sur `user_id`
- `idx_memberships_club_id` sur `club_id`

---

### `bookings`
Réservations de terrains (créneaux de 30 minutes).

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique (PK) |
| club_id | UUID | Club (FK) |
| court_id | UUID | Terrain (FK) |
| slot_start | TIMESTAMPTZ | Début du créneau |
| slot_end | TIMESTAMPTZ | Fin du créneau |
| created_by | UUID | Créateur (FK auth.users) |
| player_name | TEXT | Nom du joueur |
| player_email | TEXT | Email du joueur |
| player_phone | TEXT | Téléphone du joueur |
| status | booking_status | 'confirmed' ou 'cancelled' |
| notes | TEXT | Notes/commentaires |
| created_at | TIMESTAMPTZ | Date de création |
| updated_at | TIMESTAMPTZ | Date de modification |

**Contraintes CRITIQUES** :
- ✅ **UNIQUE(court_id, slot_start)** → Anti double-booking
- ✅ **CHECK(slot_end = slot_start + 30 min)** → Créneaux fixes 30 min
- ✅ **CHECK(slot_end > slot_start)** → Cohérence temporelle

**Indexes** :
- `idx_bookings_club_id` sur `club_id`
- `idx_bookings_court_id` sur `court_id`
- `idx_bookings_slot_start` sur `slot_start`
- `idx_bookings_created_by` sur `created_by`
- `idx_bookings_status` sur `status`

**Trigger** : Auto-update `updated_at` à chaque modification

---

### `products`
Produits vendus au club (boissons, snacks, repas).

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique (PK) |
| club_id | UUID | Club (FK) |
| name | TEXT | Nom du produit |
| category | TEXT | Catégorie (boisson, snack, repas) |
| price_cents | INTEGER | Prix en centimes (ex: 250 = 2,50€) |
| is_available | BOOLEAN | Disponible ou non |
| created_at | TIMESTAMPTZ | Date de création |

**Indexes** :
- `idx_products_club_id` sur `club_id`

**Note** : Prix en centimes pour éviter les problèmes de virgule flottante.

---

### `orders`
Commandes d'extras liées à une réservation.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique (PK) |
| booking_id | UUID | Réservation (FK) |
| club_id | UUID | Club (FK) |
| total_cents | INTEGER | Total en centimes |
| created_at | TIMESTAMPTZ | Date de création |

**Indexes** :
- `idx_orders_club_id` sur `club_id`
- `idx_orders_booking_id` sur `booking_id`

---

### `order_items`
Détail des produits dans une commande.

| Colonne | Type | Description |
|---------|------|-------------|
| order_id | UUID | Commande (FK) |
| product_id | UUID | Produit (FK) |
| quantity | INTEGER | Quantité |
| price_cents | INTEGER | Prix unitaire au moment de la commande |

**PK Composite** : (order_id, product_id)

**Note** : `price_cents` est copié depuis `products` pour figer le prix (historique).

---

## 🛡️ Row Level Security (RLS)

### Principe
Toutes les tables ont RLS activé. Les policies définissent qui peut lire/écrire quoi.

### Policies par Table

#### **clubs**
- ✅ SELECT : Tout le monde (public)
- ✅ UPDATE : Seulement owner du club

#### **courts**
- ✅ SELECT : Tout le monde (public)
- ✅ INSERT/UPDATE/DELETE : Owner ou staff du club

#### **memberships**
- ✅ SELECT : Utilisateur concerné OU owner du club
- ✅ INSERT/UPDATE/DELETE : Owner du club uniquement

#### **bookings**
- ✅ SELECT : Tout le monde (pour voir disponibilités)
- ✅ INSERT : Seulement si `auth.uid() = created_by`
- ✅ UPDATE : Créateur OU staff/owner du club
- ✅ DELETE : Créateur OU staff/owner du club

#### **products**
- ✅ SELECT : Tout le monde (public)
- ✅ INSERT/UPDATE/DELETE : Owner ou staff du club

#### **orders** & **order_items**
- ✅ SELECT : Créateur de la réservation OU staff du club
- ✅ INSERT : Créateur de la réservation OU staff du club

---

## 🔒 Anti Double-Booking

### Stratégie
Combinaison de **contraintes SQL** + **vérification applicative**.

### 1. Contrainte SQL (Garantie Ultime)
```sql
CONSTRAINT unique_court_slot UNIQUE (court_id, slot_start)
```
→ Impossible d'insérer 2 réservations avec même `court_id` + `slot_start`, même en cas de race condition.

### 2. Contrainte Créneaux 30 Min
```sql
CONSTRAINT slot_duration_30min CHECK (slot_end = slot_start + interval '30 minutes')
```
→ Tous les créneaux font exactement 30 minutes.

### 3. Vérification Applicative (Server Action)
```typescript
// Avant d'insérer, vérifier disponibilité
const { data: existing } = await supabase
  .from('bookings')
  .select('id')
  .eq('court_id', courtId)
  .eq('slot_start', slotStart)
  .neq('status', 'cancelled')
  .maybeSingle()

if (existing) {
  return { error: 'Créneau déjà réservé' }
}
```

### Créneaux Possibles (30 min)
```
08:00 - 08:30
08:30 - 09:00
09:00 - 09:30
...
22:30 - 23:00
23:00 - 23:30
```

**Réservation typique 1h30** = 3 créneaux consécutifs
- Insérer 3 lignes dans `bookings` :
  - 10:00 - 10:30
  - 10:30 - 11:00
  - 11:00 - 11:30

---

## 🧪 Tester le Schéma

### 1. Vérifier les Tables
```sql
-- Lister toutes les tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Compter les policies
SELECT schemaname, tablename, COUNT(*) 
FROM pg_policies 
GROUP BY schemaname, tablename;
```

### 2. Insérer des Données de Test
```sql
-- Créer un club
INSERT INTO clubs (name, city, address, phone, email)
VALUES ('Test Padel Club', 'Paris', '123 Rue Test', '0123456789', 'test@test.com')
RETURNING id;

-- Créer des terrains (remplacer <club_id>)
INSERT INTO courts (club_id, name)
VALUES 
  ('<club_id>', 'Terrain 1'),
  ('<club_id>', 'Terrain 2'),
  ('<club_id>', 'Terrain 3');

-- Créer des produits
INSERT INTO products (club_id, name, category, price_cents)
VALUES 
  ('<club_id>', 'Eau minérale', 'boisson', 250),
  ('<club_id>', 'Coca-Cola', 'boisson', 300),
  ('<club_id>', 'Sandwich', 'repas', 800);
```

### 3. Tester Anti Double-Booking
```sql
-- Créer une réservation (remplacer <court_id> et <user_id>)
INSERT INTO bookings (club_id, court_id, slot_start, slot_end, created_by, status)
VALUES (
  '<club_id>',
  '<court_id>',
  '2026-01-25 10:00:00+00',
  '2026-01-25 10:30:00+00',
  '<user_id>',
  'confirmed'
);

-- Tenter une 2ème réservation (même créneau)
-- ❌ DEVRAIT ÉCHOUER avec erreur "unique_court_slot"
INSERT INTO bookings (club_id, court_id, slot_start, slot_end, created_by, status)
VALUES (
  '<club_id>',
  '<court_id>',
  '2026-01-25 10:00:00+00',
  '2026-01-25 10:30:00+00',
  '<user_id>',
  'confirmed'
);
```

---

## 📈 Performance

### Indexes Créés
- ✅ 11 indexes au total pour optimiser les requêtes fréquentes
- ✅ Index sur clés étrangères (FK)
- ✅ Index sur colonnes de recherche (club_id, court_id, slot_start, status)

### Requêtes Optimisées
```sql
-- Trouver disponibilités (rapide grâce aux indexes)
SELECT * FROM bookings 
WHERE court_id = '<court_id>' 
  AND slot_start >= '2026-01-25'
  AND slot_start < '2026-01-26'
  AND status != 'cancelled';

-- Lister réservations d'un club (rapide)
SELECT * FROM bookings 
WHERE club_id = '<club_id>' 
  AND DATE(slot_start) = '2026-01-25'
ORDER BY slot_start;
```

---

## 🔄 Migrations Futures

Pour ajouter des colonnes/tables :
1. Créer un nouveau fichier `supabase/migrations/XXX_description.sql`
2. Écrire les commandes SQL (ALTER TABLE, CREATE TABLE, etc.)
3. Appliquer avec `supabase db push`

**Exemple** :
```sql
-- supabase/migrations/001_add_booking_price.sql
ALTER TABLE bookings ADD COLUMN price_cents INTEGER;
```

---

## 🆘 Dépannage

### Erreur "extension uuid-ossp does not exist"
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### RLS bloque tout
Vérifier que vous êtes authentifié :
```sql
SELECT auth.uid(); -- Doit retourner un UUID, pas NULL
```

### Constraint violation (double-booking)
✅ C'est **normal** ! La contrainte fait son travail. Gérer l'erreur côté application :
```typescript
try {
  await supabase.from('bookings').insert(...)
} catch (error) {
  if (error.code === '23505') { // unique_violation
    return { error: 'Créneau déjà réservé' }
  }
}
```

---

## ✅ Checklist Post-Setup

Après avoir appliqué le schéma :
- [ ] Toutes les tables sont créées (7)
- [ ] RLS est activé sur toutes les tables
- [ ] Les policies existent (vérifier avec `SELECT * FROM pg_policies`)
- [ ] Tester l'insertion d'un club de test
- [ ] Tester l'insertion de terrains
- [ ] Tester l'insertion d'une réservation
- [ ] Tester le double-booking (devrait échouer)

---

**Prêt à coder !** 🚀

Le schéma est maintenant prêt pour le développement. Passez à la phase suivante : **Authentification** (voir `docs/TODO.md`).
