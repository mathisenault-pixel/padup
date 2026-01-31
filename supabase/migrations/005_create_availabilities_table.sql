-- ============================================
-- Table: availabilities (disponibilités)
-- Description: Définit les créneaux horaires disponibles pour chaque terrain
-- ============================================

CREATE TABLE IF NOT EXISTS public.availabilities (
  -- Clé primaire
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Référence au terrain
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  
  -- Jour de la semaine (0 = Dimanche, 1 = Lundi, ..., 6 = Samedi)
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  
  -- Horaires
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Validation : l'heure de fin doit être après l'heure de début
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS availabilities_court_id_idx ON public.availabilities(court_id);
CREATE INDEX IF NOT EXISTS availabilities_day_of_week_idx ON public.availabilities(day_of_week);

-- Activer Row Level Security
ALTER TABLE public.availabilities ENABLE ROW LEVEL SECURITY;

-- Politique : Les clubs peuvent voir les disponibilités de leurs terrains
CREATE POLICY "Clubs can view own availabilities"
  ON public.availabilities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courts
      JOIN public.clubs ON clubs.id = courts.club_id
      WHERE courts.id = availabilities.court_id
      AND clubs.owner_id = auth.uid()
    )
  );

-- Politique : Les clubs peuvent créer des disponibilités
CREATE POLICY "Clubs can create own availabilities"
  ON public.availabilities
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courts
      JOIN public.clubs ON clubs.id = courts.club_id
      WHERE courts.id = availabilities.court_id
      AND clubs.owner_id = auth.uid()
    )
  );

-- Politique : Les clubs peuvent mettre à jour leurs disponibilités
CREATE POLICY "Clubs can update own availabilities"
  ON public.availabilities
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.courts
      JOIN public.clubs ON clubs.id = courts.club_id
      WHERE courts.id = availabilities.court_id
      AND clubs.owner_id = auth.uid()
    )
  );

-- Politique : Les clubs peuvent supprimer leurs disponibilités
CREATE POLICY "Clubs can delete own availabilities"
  ON public.availabilities
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.courts
      JOIN public.clubs ON clubs.id = courts.club_id
      WHERE courts.id = availabilities.court_id
      AND clubs.owner_id = auth.uid()
    )
  );

-- Politique : Les joueurs peuvent voir les disponibilités des terrains actifs
CREATE POLICY "Players can view public availabilities"
  ON public.availabilities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courts
      JOIN public.clubs ON clubs.id = courts.club_id
      WHERE courts.id = availabilities.court_id
      AND courts.is_active = true
      AND clubs.is_active = true
    )
  );

-- Fonction helper pour obtenir le nom du jour
CREATE OR REPLACE FUNCTION get_day_name(day_num INTEGER)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE day_num
    WHEN 0 THEN 'Dimanche'
    WHEN 1 THEN 'Lundi'
    WHEN 2 THEN 'Mardi'
    WHEN 3 THEN 'Mercredi'
    WHEN 4 THEN 'Jeudi'
    WHEN 5 THEN 'Vendredi'
    WHEN 6 THEN 'Samedi'
    ELSE 'Inconnu'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Commentaires
COMMENT ON TABLE public.availabilities IS 'Créneaux horaires disponibles pour les terrains';
COMMENT ON COLUMN public.availabilities.court_id IS 'ID du terrain concerné';
COMMENT ON COLUMN public.availabilities.day_of_week IS 'Jour de la semaine (0=Dimanche, 6=Samedi)';
COMMENT ON COLUMN public.availabilities.start_time IS 'Heure de début du créneau';
COMMENT ON COLUMN public.availabilities.end_time IS 'Heure de fin du créneau';











