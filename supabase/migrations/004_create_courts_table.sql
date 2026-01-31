-- ============================================
-- Table: courts (terrains)
-- Description: Stocke les terrains de padel des clubs
-- ============================================

CREATE TABLE IF NOT EXISTS public.courts (
  -- Clé primaire
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Référence au club propriétaire
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  
  -- Informations du terrain
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'padel', -- 'padel', 'indoor', 'outdoor'
  description TEXT,
  
  -- Caractéristiques
  surface TEXT, -- 'gazon synthétique', 'béton', etc.
  lighting BOOLEAN DEFAULT false,
  covered BOOLEAN DEFAULT false,
  
  -- Statut
  is_active BOOLEAN DEFAULT true,
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS courts_club_id_idx ON public.courts(club_id);
CREATE INDEX IF NOT EXISTS courts_is_active_idx ON public.courts(is_active);

-- Activer Row Level Security
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

-- Politique : Les clubs peuvent voir leurs propres terrains
CREATE POLICY "Clubs can view own courts"
  ON public.courts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clubs
      WHERE clubs.id = courts.club_id
      AND clubs.owner_id = auth.uid()
    )
  );

-- Politique : Les clubs peuvent créer des terrains
CREATE POLICY "Clubs can create own courts"
  ON public.courts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clubs
      WHERE clubs.id = courts.club_id
      AND clubs.owner_id = auth.uid()
    )
  );

-- Politique : Les clubs peuvent mettre à jour leurs terrains
CREATE POLICY "Clubs can update own courts"
  ON public.courts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.clubs
      WHERE clubs.id = courts.club_id
      AND clubs.owner_id = auth.uid()
    )
  );

-- Politique : Les clubs peuvent supprimer leurs terrains
CREATE POLICY "Clubs can delete own courts"
  ON public.courts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.clubs
      WHERE clubs.id = courts.club_id
      AND clubs.owner_id = auth.uid()
    )
  );

-- Politique : Les joueurs peuvent voir les terrains des clubs actifs
CREATE POLICY "Players can view active courts"
  ON public.courts
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.clubs
      WHERE clubs.id = courts.club_id
      AND clubs.is_active = true
    )
  );

-- Trigger pour mettre à jour total_courts dans clubs
CREATE OR REPLACE FUNCTION update_club_courts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.clubs
    SET 
      total_courts = (SELECT COUNT(*) FROM public.courts WHERE club_id = NEW.club_id AND is_active = true),
      indoor_courts = (SELECT COUNT(*) FROM public.courts WHERE club_id = NEW.club_id AND is_active = true AND covered = true),
      outdoor_courts = (SELECT COUNT(*) FROM public.courts WHERE club_id = NEW.club_id AND is_active = true AND covered = false)
    WHERE id = NEW.club_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE public.clubs
    SET 
      total_courts = (SELECT COUNT(*) FROM public.courts WHERE club_id = OLD.club_id AND is_active = true),
      indoor_courts = (SELECT COUNT(*) FROM public.courts WHERE club_id = OLD.club_id AND is_active = true AND covered = true),
      outdoor_courts = (SELECT COUNT(*) FROM public.courts WHERE club_id = OLD.club_id AND is_active = true AND covered = false)
    WHERE id = OLD.club_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_court_change
  AFTER INSERT OR UPDATE OR DELETE ON public.courts
  FOR EACH ROW
  EXECUTE FUNCTION update_club_courts_count();

-- Commentaires
COMMENT ON TABLE public.courts IS 'Terrains de padel des clubs';
COMMENT ON COLUMN public.courts.club_id IS 'ID du club propriétaire';
COMMENT ON COLUMN public.courts.name IS 'Nom du terrain (ex: Court 1, Court Central)';
COMMENT ON COLUMN public.courts.type IS 'Type de terrain (padel, indoor, outdoor)';











