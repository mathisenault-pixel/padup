-- ============================================
-- Table: clubs
-- Description: Stocke les informations des clubs de padel
-- ============================================

CREATE TABLE IF NOT EXISTS public.clubs (
  -- Clé primaire
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Propriétaire du club (référence auth.users.id)
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations du club
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Logo et images
  logo_url TEXT,
  cover_image_url TEXT,
  
  -- Capacité
  total_courts INTEGER DEFAULT 0,
  indoor_courts INTEGER DEFAULT 0,
  outdoor_courts INTEGER DEFAULT 0,
  
  -- Horaires (JSON pour flexibilité)
  opening_hours JSONB,
  
  -- Statut
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS clubs_owner_id_idx ON public.clubs(owner_id);
CREATE INDEX IF NOT EXISTS clubs_city_idx ON public.clubs(city);
CREATE INDEX IF NOT EXISTS clubs_is_active_idx ON public.clubs(is_active);

-- Contrainte : Un utilisateur ne peut avoir qu'un seul club
CREATE UNIQUE INDEX IF NOT EXISTS clubs_owner_id_unique_idx ON public.clubs(owner_id);

-- Activer Row Level Security
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

-- Politique : Les clubs peuvent voir leur propre club
CREATE POLICY "Clubs can view own club"
  ON public.clubs
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Politique : Les clubs peuvent créer leur club
CREATE POLICY "Clubs can create own club"
  ON public.clubs
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Politique : Les clubs peuvent mettre à jour leur propre club
CREATE POLICY "Clubs can update own club"
  ON public.clubs
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Politique : Les joueurs peuvent voir les clubs actifs
CREATE POLICY "Players can view active clubs"
  ON public.clubs
  FOR SELECT
  USING (is_active = true);

-- Trigger pour updated_at
CREATE TRIGGER on_club_updated
  BEFORE UPDATE ON public.clubs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Commentaires pour la documentation
COMMENT ON TABLE public.clubs IS 'Informations des clubs de padel';
COMMENT ON COLUMN public.clubs.owner_id IS 'ID du propriétaire du club (référence auth.users.id)';
COMMENT ON COLUMN public.clubs.name IS 'Nom du club';
COMMENT ON COLUMN public.clubs.total_courts IS 'Nombre total de terrains';
COMMENT ON COLUMN public.clubs.is_active IS 'Le club est-il actif et visible ?';
COMMENT ON COLUMN public.clubs.is_verified IS 'Le club est-il vérifié par l''équipe Pad''Up ?';











