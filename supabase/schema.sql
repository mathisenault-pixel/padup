-- =====================================================
-- Pad'up MVP - Supabase Schema
-- Plateforme de réservation de padel
-- =====================================================

-- Activer extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Pour recherche texte (optionnel)

-- =====================================================
-- TYPES ENUM
-- =====================================================

-- Statut des réservations
CREATE TYPE booking_status AS ENUM (
  'confirmed',  -- Réservation confirmée
  'cancelled'   -- Réservation annulée
);

-- Rôles dans un club
CREATE TYPE membership_role AS ENUM (
  'owner',  -- Propriétaire du club
  'staff'   -- Employé/staff
);

-- =====================================================
-- TABLES
-- =====================================================

-- Table: clubs
-- Informations des clubs de padel
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: courts
-- Terrains de padel par club
CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Ex: "Terrain 1", "Court A"
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: memberships
-- Rôles des utilisateurs dans les clubs (owner/staff)
CREATE TABLE memberships (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  role membership_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, club_id)
);

-- Table: bookings
-- Réservations des terrains (créneaux de 30 min)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_name TEXT,      -- Nom du joueur (optionnel si auth)
  player_email TEXT,     -- Email du joueur
  player_phone TEXT,     -- Téléphone du joueur
  status booking_status NOT NULL DEFAULT 'confirmed',
  notes TEXT,            -- Notes/commentaires
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- CONTRAINTE ANTI DOUBLE-BOOKING
  -- Un terrain ne peut être réservé qu'une fois par créneau
  CONSTRAINT unique_court_slot UNIQUE (court_id, slot_start),
  
  -- CONTRAINTE CRÉNEAUX 30 MINUTES
  -- Chaque créneau doit durer exactement 30 minutes
  CONSTRAINT slot_duration_30min CHECK (slot_end = slot_start + interval '30 minutes'),
  
  -- CONTRAINTE: slot_end > slot_start
  CONSTRAINT slot_end_after_start CHECK (slot_end > slot_start)
);

-- Table: products
-- Produits vendus au club (boissons, snacks, etc.)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,         -- Ex: "boisson", "snack", "repas"
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: orders
-- Commandes d'extras liées à une réservation
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  total_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: order_items
-- Détail des produits dans une commande
CREATE TABLE order_items (
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0), -- Prix au moment de la commande
  PRIMARY KEY (order_id, product_id)
);

-- =====================================================
-- INDEXES POUR PERFORMANCE
-- =====================================================

-- Bookings: recherche par club et terrain
CREATE INDEX idx_bookings_club_id ON bookings(club_id);
CREATE INDEX idx_bookings_court_id ON bookings(court_id);
CREATE INDEX idx_bookings_slot_start ON bookings(slot_start);
CREATE INDEX idx_bookings_created_by ON bookings(created_by);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Courts: recherche par club
CREATE INDEX idx_courts_club_id ON courts(club_id);

-- Products: recherche par club
CREATE INDEX idx_products_club_id ON products(club_id);

-- Orders: recherche par club et booking
CREATE INDEX idx_orders_club_id ON orders(club_id);
CREATE INDEX idx_orders_booking_id ON orders(booking_id);

-- Memberships: recherche rapide par user et club
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_club_id ON memberships(club_id);

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction: Mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at sur bookings
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES RLS - CLUBS
-- =====================================================

-- Clubs: lecture publique (tout le monde peut voir les clubs)
CREATE POLICY "Clubs are viewable by everyone"
  ON clubs FOR SELECT
  USING (true);

-- Clubs: modification seulement par owner du club
CREATE POLICY "Clubs are updatable by club owners"
  ON clubs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.club_id = clubs.id
        AND memberships.user_id = auth.uid()
        AND memberships.role = 'owner'
    )
  );

-- =====================================================
-- POLICIES RLS - COURTS
-- =====================================================

-- Courts: lecture publique (pour voir disponibilités)
CREATE POLICY "Courts are viewable by everyone"
  ON courts FOR SELECT
  USING (true);

-- Courts: création/modification par owner/staff du club
CREATE POLICY "Courts are manageable by club staff"
  ON courts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.club_id = courts.club_id
        AND memberships.user_id = auth.uid()
        AND memberships.role IN ('owner', 'staff')
    )
  );

-- =====================================================
-- POLICIES RLS - MEMBERSHIPS
-- =====================================================

-- Memberships: lecture seulement par l'utilisateur concerné ou owner du club
CREATE POLICY "Users can view their own memberships"
  ON memberships FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.club_id = memberships.club_id
        AND m.user_id = auth.uid()
        AND m.role = 'owner'
    )
  );

-- Memberships: création/modification seulement par owner du club
CREATE POLICY "Club owners can manage memberships"
  ON memberships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.club_id = memberships.club_id
        AND m.user_id = auth.uid()
        AND m.role = 'owner'
    )
  );

-- =====================================================
-- POLICIES RLS - BOOKINGS
-- =====================================================

-- Bookings: lecture publique (pour afficher disponibilités)
CREATE POLICY "Bookings are viewable by everyone"
  ON bookings FOR SELECT
  USING (true);

-- Bookings: création seulement si auth.uid() = created_by
CREATE POLICY "Users can create their own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Bookings: modification par créateur OU staff/owner du club
CREATE POLICY "Bookings are updatable by creator or club staff"
  ON bookings FOR UPDATE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.club_id = bookings.club_id
        AND memberships.user_id = auth.uid()
        AND memberships.role IN ('owner', 'staff')
    )
  );

-- Bookings: suppression par créateur OU staff/owner du club
CREATE POLICY "Bookings are deletable by creator or club staff"
  ON bookings FOR DELETE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.club_id = bookings.club_id
        AND memberships.user_id = auth.uid()
        AND memberships.role IN ('owner', 'staff')
    )
  );

-- =====================================================
-- POLICIES RLS - PRODUCTS
-- =====================================================

-- Products: lecture publique (pour voir menu)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Products: gestion seulement par staff/owner du club
CREATE POLICY "Products are manageable by club staff"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.club_id = products.club_id
        AND memberships.user_id = auth.uid()
        AND memberships.role IN ('owner', 'staff')
    )
  );

-- =====================================================
-- POLICIES RLS - ORDERS
-- =====================================================

-- Orders: lecture par créateur de la réservation OU staff/owner du club
CREATE POLICY "Orders are viewable by booking creator or club staff"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = orders.booking_id
        AND bookings.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.club_id = orders.club_id
        AND memberships.user_id = auth.uid()
        AND memberships.role IN ('owner', 'staff')
    )
  );

-- Orders: création par créateur de la réservation OU staff du club
CREATE POLICY "Orders are creatable by booking creator or club staff"
  ON orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = orders.booking_id
        AND bookings.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.club_id = orders.club_id
        AND memberships.user_id = auth.uid()
        AND memberships.role IN ('owner', 'staff')
    )
  );

-- =====================================================
-- POLICIES RLS - ORDER_ITEMS
-- =====================================================

-- Order_items: lecture via orders (policy cascade)
CREATE POLICY "Order items are viewable via orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN bookings ON bookings.id = orders.booking_id
      WHERE orders.id = order_items.order_id
        AND (
          bookings.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM memberships
            WHERE memberships.club_id = orders.club_id
              AND memberships.user_id = auth.uid()
              AND memberships.role IN ('owner', 'staff')
          )
        )
    )
  );

-- Order_items: création via orders
CREATE POLICY "Order items are creatable via orders"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      JOIN bookings ON bookings.id = orders.booking_id
      WHERE orders.id = order_items.order_id
        AND (
          bookings.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM memberships
            WHERE memberships.club_id = orders.club_id
              AND memberships.user_id = auth.uid()
              AND memberships.role IN ('owner', 'staff')
          )
        )
    )
  );

-- =====================================================
-- DONNÉES DE TEST (Optionnel - Décommenter si besoin)
-- =====================================================

/*
-- Insérer un club de test
INSERT INTO clubs (name, city, address, phone, email)
VALUES 
  ('Padel Center Paris', 'Paris', '123 Rue Example, 75001 Paris', '01 23 45 67 89', 'contact@padelcenterparis.com'),
  ('Lyon Padel Club', 'Lyon', '456 Avenue Test, 69001 Lyon', '04 12 34 56 78', 'info@lyonpadelclub.com');

-- Insérer des terrains
INSERT INTO courts (club_id, name)
SELECT id, 'Terrain ' || n
FROM clubs
CROSS JOIN generate_series(1, 4) AS n;

-- Insérer des produits
INSERT INTO products (club_id, name, category, price_cents)
SELECT 
  clubs.id,
  product.name,
  product.category,
  product.price_cents
FROM clubs
CROSS JOIN (
  VALUES
    ('Eau minérale', 'boisson', 250),
    ('Coca-Cola', 'boisson', 300),
    ('Jus d''orange', 'boisson', 400),
    ('Café', 'boisson', 200),
    ('Chips', 'snack', 300),
    ('Sandwich club', 'repas', 800),
    ('Salade', 'repas', 900)
) AS product(name, category, price_cents);
*/

-- =====================================================
-- FIN DU SCHEMA
-- =====================================================

-- Vérification: Afficher un résumé des tables créées
DO $$
BEGIN
  RAISE NOTICE '✅ Schema Pad''up MVP créé avec succès !';
  RAISE NOTICE '📊 Tables: clubs, courts, memberships, bookings, products, orders, order_items';
  RAISE NOTICE '🔒 RLS activé sur toutes les tables';
  RAISE NOTICE '🛡️ Contrainte anti double-booking: UNIQUE(court_id, slot_start)';
  RAISE NOTICE '⏱️ Contrainte créneaux 30 min: CHECK(slot_end = slot_start + 30 min)';
END $$;
