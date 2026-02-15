-- =====================================================
-- Migration 021: RLS + Club Authentication
-- Objectif: Sécuriser l'accès aux données via RLS
--           et authentification Supabase
-- =====================================================

-- =====================================================
-- PARTIE 1: Activer RLS sur les tables
-- =====================================================

-- Activer RLS sur courts
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Activer RLS sur products (au cas où)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTIE 2: Créer la table club_memberships
-- =====================================================

CREATE TABLE IF NOT EXISTS public.club_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, club_id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_club_memberships_user_id ON public.club_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_club_id ON public.club_memberships(club_id);

-- Activer RLS sur club_memberships
ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;

-- Commentaires
COMMENT ON TABLE public.club_memberships IS 'Liaison entre utilisateurs auth et clubs';
COMMENT ON COLUMN public.club_memberships.role IS 'Rôle: admin, staff, etc.';

-- =====================================================
-- PARTIE 3: Policies RLS - CLUB_MEMBERSHIPS
-- =====================================================

-- Policy: Les membres peuvent lire leurs propres memberships
CREATE POLICY "members can read own memberships"
  ON public.club_memberships
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Les admins peuvent gérer les memberships de leur club
CREATE POLICY "admins can manage club memberships"
  ON public.club_memberships
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.club_memberships m
      WHERE m.user_id = auth.uid()
        AND m.club_id = club_memberships.club_id
        AND m.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_memberships m
      WHERE m.user_id = auth.uid()
        AND m.club_id = club_memberships.club_id
        AND m.role = 'admin'
    )
  );

-- =====================================================
-- PARTIE 4: Supprimer les anciennes policies (si existantes)
-- =====================================================

-- Courts: supprimer anciennes policies
DROP POLICY IF EXISTS "Clubs can view own courts" ON public.courts;
DROP POLICY IF EXISTS "Clubs can create own courts" ON public.courts;
DROP POLICY IF EXISTS "Clubs can update own courts" ON public.courts;
DROP POLICY IF EXISTS "Clubs can delete own courts" ON public.courts;
DROP POLICY IF EXISTS "Players can view active courts" ON public.courts;
DROP POLICY IF EXISTS "Courts are viewable by everyone" ON public.courts;
DROP POLICY IF EXISTS "Courts are manageable by club staff" ON public.courts;

-- Bookings: supprimer anciennes policies
DROP POLICY IF EXISTS "Players can view own reservations" ON public.bookings;
DROP POLICY IF EXISTS "Players can create reservations" ON public.bookings;
DROP POLICY IF EXISTS "Players can update own reservations" ON public.bookings;
DROP POLICY IF EXISTS "Clubs can view court reservations" ON public.bookings;
DROP POLICY IF EXISTS "Clubs can update court reservations" ON public.bookings;
DROP POLICY IF EXISTS "Bookings are viewable by everyone" ON public.bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Bookings are updatable by creator or club staff" ON public.bookings;
DROP POLICY IF EXISTS "Bookings are deletable by creator or club staff" ON public.bookings;

-- Products: supprimer anciennes policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Products are manageable by club staff" ON public.products;

-- =====================================================
-- PARTIE 5: Nouvelles policies RLS - COURTS
-- =====================================================

-- Policy: Lecture publique des courts actifs (pour les joueurs)
CREATE POLICY "public can view active courts"
  ON public.courts
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Policy: Les membres du club peuvent lire tous leurs courts
CREATE POLICY "club members can read all courts"
  ON public.courts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.club_memberships m
      WHERE m.user_id = auth.uid()
        AND m.club_id = courts.club_id
    )
  );

-- Policy: Les membres du club peuvent créer des courts
CREATE POLICY "club members can insert courts"
  ON public.courts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_memberships m
      WHERE m.user_id = auth.uid()
        AND m.club_id = courts.club_id
    )
  );

-- Policy: Les membres du club peuvent modifier leurs courts
CREATE POLICY "club members can update courts"
  ON public.courts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.club_memberships m
      WHERE m.user_id = auth.uid()
        AND m.club_id = courts.club_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_memberships m
      WHERE m.user_id = auth.uid()
        AND m.club_id = courts.club_id
    )
  );

-- Policy: Les membres du club peuvent supprimer leurs courts
CREATE POLICY "club members can delete courts"
  ON public.courts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.club_memberships m
      WHERE m.user_id = auth.uid()
        AND m.club_id = courts.club_id
    )
  );

-- =====================================================
-- PARTIE 6: Nouvelles policies RLS - BOOKINGS
-- =====================================================

-- Policy: Lecture publique des bookings (pour afficher disponibilités)
CREATE POLICY "public can view bookings"
  ON public.bookings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Les membres du club peuvent créer des bookings pour leur club
CREATE POLICY "club members can insert bookings"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_memberships m
      WHERE m.user_id = auth.uid()
        AND m.club_id = bookings.club_id
    )
  );

-- Policy: Les membres du club peuvent modifier leurs bookings
CREATE POLICY "club members can update bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.club_memberships m
      WHERE m.user_id = auth.uid()
        AND m.club_id = bookings.club_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_memberships m
      WHERE m.user_id = auth.uid()
        AND m.club_id = bookings.club_id
    )
  );

-- Policy: Les membres du club peuvent supprimer leurs bookings
CREATE POLICY "club members can delete bookings"
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.club_memberships m
      WHERE m.user_id = auth.uid()
        AND m.club_id = bookings.club_id
    )
  );

-- =====================================================
-- PARTIE 7: Nouvelles policies RLS - PRODUCTS
-- =====================================================

-- Policy: Lecture publique des produits disponibles
CREATE POLICY "public can view available products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (is_available = true);

-- Policy: Les membres du club peuvent lire tous leurs produits
CREATE POLICY "club members can read all products"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.club_memberships m
      WHERE m.user_id = auth.uid()
        AND m.club_id = products.club_id
    )
  );

-- Policy: Les membres du club peuvent gérer leurs produits
CREATE POLICY "club members can manage products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.club_memberships m
      WHERE m.user_id = auth.uid()
        AND m.club_id = products.club_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_memberships m
      WHERE m.user_id = auth.uid()
        AND m.club_id = products.club_id
    )
  );

-- =====================================================
-- PARTIE 8: Fonction helper pour vérifier le membership
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_club_member(p_club_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.club_memberships
    WHERE club_id = p_club_id
      AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer le club d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_clubs(p_user_id UUID)
RETURNS TABLE (
  club_id UUID,
  club_name TEXT,
  club_code TEXT,
  role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.club_code,
    m.role
  FROM public.club_memberships m
  JOIN public.clubs c ON c.id = m.club_id
  WHERE m.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================

DO $$
DECLARE
  courts_rls BOOLEAN;
  bookings_rls BOOLEAN;
  products_rls BOOLEAN;
  memberships_rls BOOLEAN;
  memberships_count INTEGER;
BEGIN
  -- Vérifier RLS activé
  SELECT relrowsecurity INTO courts_rls FROM pg_class WHERE relname = 'courts';
  SELECT relrowsecurity INTO bookings_rls FROM pg_class WHERE relname = 'bookings';
  SELECT relrowsecurity INTO products_rls FROM pg_class WHERE relname = 'products';
  SELECT relrowsecurity INTO memberships_rls FROM pg_class WHERE relname = 'club_memberships';
  
  -- Compter les memberships
  SELECT COUNT(*) INTO memberships_count FROM public.club_memberships;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration 021: RLS + Club Auth';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS courts: %', courts_rls;
  RAISE NOTICE 'RLS bookings: %', bookings_rls;
  RAISE NOTICE 'RLS products: %', products_rls;
  RAISE NOTICE 'RLS club_memberships: %', memberships_rls;
  RAISE NOTICE 'Memberships existants: %', memberships_count;
  RAISE NOTICE '========================================';
  
  IF NOT (courts_rls AND bookings_rls AND products_rls AND memberships_rls) THEN
    RAISE WARNING '⚠️ RLS pas activé sur toutes les tables !';
  ELSE
    RAISE NOTICE '✅ RLS activé sur toutes les tables !';
  END IF;
END $$;
