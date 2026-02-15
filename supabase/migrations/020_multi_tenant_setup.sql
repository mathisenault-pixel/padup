-- =====================================================
-- Migration 020: Multi-tenant Setup
-- Objectif: S'assurer que toutes les tables ont club_id
--           et faire le backfill des données existantes
-- =====================================================

-- =====================================================
-- PARTIE 1: Ajouter les colonnes club_id si absentes
-- =====================================================

-- Courts: ajouter club_id si absent
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'courts' 
    AND column_name = 'club_id'
  ) THEN
    ALTER TABLE public.courts ADD COLUMN club_id UUID;
  END IF;
END $$;

-- Bookings: ajouter club_id si absent
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'bookings' 
    AND column_name = 'club_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN club_id UUID;
  END IF;
END $$;

-- Products: ajouter club_id si absent
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'club_id'
  ) THEN
    ALTER TABLE public.products ADD COLUMN club_id UUID;
  END IF;
END $$;

-- =====================================================
-- PARTIE 2: Ajouter les foreign keys si absentes
-- =====================================================

-- Courts: FK vers clubs
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'courts_club_id_fkey'
    AND table_name = 'courts'
  ) THEN
    ALTER TABLE public.courts
      ADD CONSTRAINT courts_club_id_fkey 
      FOREIGN KEY (club_id) 
      REFERENCES public.clubs(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- Bookings: FK vers clubs
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bookings_club_id_fkey'
    AND table_name = 'bookings'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_club_id_fkey 
      FOREIGN KEY (club_id) 
      REFERENCES public.clubs(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- Products: FK vers clubs
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_club_id_fkey'
    AND table_name = 'products'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_club_id_fkey 
      FOREIGN KEY (club_id) 
      REFERENCES public.clubs(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- PARTIE 3: Backfill des données existantes
-- =====================================================

-- Backfill courts: assigner au premier club trouvé
UPDATE public.courts
SET club_id = (
  SELECT id FROM public.clubs 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE club_id IS NULL;

-- Backfill bookings: utiliser le club du terrain si possible
-- Sinon, assigner au premier club
UPDATE public.bookings b
SET club_id = COALESCE(
  (SELECT c.club_id FROM public.courts c WHERE c.id = b.court_id),
  (SELECT id FROM public.clubs ORDER BY created_at ASC LIMIT 1)
)
WHERE b.club_id IS NULL;

-- Backfill products: assigner au premier club
UPDATE public.products
SET club_id = (
  SELECT id FROM public.clubs 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE club_id IS NULL;

-- =====================================================
-- PARTIE 4: Rendre club_id obligatoire (NOT NULL)
-- =====================================================

-- Courts: NOT NULL
ALTER TABLE public.courts 
  ALTER COLUMN club_id SET NOT NULL;

-- Bookings: NOT NULL
ALTER TABLE public.bookings 
  ALTER COLUMN club_id SET NOT NULL;

-- Products: NOT NULL
ALTER TABLE public.products 
  ALTER COLUMN club_id SET NOT NULL;

-- =====================================================
-- PARTIE 5: Ajouter des index pour performance
-- =====================================================

-- Index sur club_id pour les courts
CREATE INDEX IF NOT EXISTS idx_courts_club_id 
  ON public.courts(club_id);

-- Index sur club_id pour les bookings
CREATE INDEX IF NOT EXISTS idx_bookings_club_id 
  ON public.bookings(club_id);

-- Index sur club_id pour les products
CREATE INDEX IF NOT EXISTS idx_products_club_id 
  ON public.products(club_id);

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================

DO $$
DECLARE
  courts_count INTEGER;
  bookings_count INTEGER;
  products_count INTEGER;
  courts_null INTEGER;
  bookings_null INTEGER;
  products_null INTEGER;
BEGIN
  -- Compter les enregistrements
  SELECT COUNT(*) INTO courts_count FROM public.courts;
  SELECT COUNT(*) INTO bookings_count FROM public.bookings;
  SELECT COUNT(*) INTO products_count FROM public.products;
  
  -- Compter les NULL (devrait être 0)
  SELECT COUNT(*) INTO courts_null FROM public.courts WHERE club_id IS NULL;
  SELECT COUNT(*) INTO bookings_null FROM public.bookings WHERE club_id IS NULL;
  SELECT COUNT(*) INTO products_null FROM public.products WHERE club_id IS NULL;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration 020: Multi-tenant Setup';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Courts: % enregistrements (% NULL)', courts_count, courts_null;
  RAISE NOTICE 'Bookings: % enregistrements (% NULL)', bookings_count, bookings_null;
  RAISE NOTICE 'Products: % enregistrements (% NULL)', products_count, products_null;
  RAISE NOTICE '========================================';
  
  IF courts_null > 0 OR bookings_null > 0 OR products_null > 0 THEN
    RAISE WARNING '⚠️ Il reste des enregistrements avec club_id NULL !';
  ELSE
    RAISE NOTICE '✅ Toutes les données sont liées à un club !';
  END IF;
END $$;
