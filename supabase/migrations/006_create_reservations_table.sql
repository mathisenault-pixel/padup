-- ============================================
-- Table: reservations
-- Description: Stocke les réservations des joueurs
-- ============================================

CREATE TABLE IF NOT EXISTS public.reservations (
  -- Clé primaire
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Références
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Date et horaires de la réservation
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Validation : l'heure de fin doit être après l'heure de début
  CONSTRAINT valid_reservation_time CHECK (end_time > start_time),
  
  -- Statut de la réservation
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  
  -- Prix (optionnel pour plus tard)
  price DECIMAL(10, 2),
  
  -- Notes
  notes TEXT,
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS reservations_court_id_idx ON public.reservations(court_id);
CREATE INDEX IF NOT EXISTS reservations_player_id_idx ON public.reservations(player_id);
CREATE INDEX IF NOT EXISTS reservations_date_idx ON public.reservations(date);
CREATE INDEX IF NOT EXISTS reservations_status_idx ON public.reservations(status);

-- Index composite pour vérifier les conflits de réservation
CREATE INDEX IF NOT EXISTS reservations_conflict_check_idx 
  ON public.reservations(court_id, date, start_time, end_time) 
  WHERE status = 'confirmed';

-- Contrainte unique : empêcher les réservations qui se chevauchent pour le même terrain
-- Note : Cette contrainte est complexe et nécessite une fonction de vérification
CREATE UNIQUE INDEX IF NOT EXISTS reservations_no_overlap_idx
  ON public.reservations(court_id, date, start_time, end_time)
  WHERE status = 'confirmed';

-- Activer Row Level Security
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Politique : Les joueurs peuvent voir leurs propres réservations
CREATE POLICY "Players can view own reservations"
  ON public.reservations
  FOR SELECT
  USING (auth.uid() = player_id);

-- Politique : Les joueurs peuvent créer des réservations
CREATE POLICY "Players can create reservations"
  ON public.reservations
  FOR INSERT
  WITH CHECK (auth.uid() = player_id);

-- Politique : Les joueurs peuvent mettre à jour leurs réservations (annulation)
CREATE POLICY "Players can update own reservations"
  ON public.reservations
  FOR UPDATE
  USING (auth.uid() = player_id);

-- Politique : Les clubs peuvent voir les réservations de leurs terrains
CREATE POLICY "Clubs can view court reservations"
  ON public.reservations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courts
      JOIN public.clubs ON clubs.id = courts.club_id
      WHERE courts.id = reservations.court_id
      AND clubs.owner_id = auth.uid()
    )
  );

-- Politique : Les clubs peuvent mettre à jour les réservations de leurs terrains
CREATE POLICY "Clubs can update court reservations"
  ON public.reservations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.courts
      JOIN public.clubs ON clubs.id = courts.club_id
      WHERE courts.id = reservations.court_id
      AND clubs.owner_id = auth.uid()
    )
  );

-- Fonction pour vérifier les conflits de réservation
CREATE OR REPLACE FUNCTION check_reservation_conflict(
  p_court_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_reservation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO conflict_count
  FROM public.reservations
  WHERE court_id = p_court_id
    AND date = p_date
    AND status = 'confirmed'
    AND (p_reservation_id IS NULL OR id != p_reservation_id)
    AND (
      -- Vérifier si les créneaux se chevauchent
      (start_time < p_end_time AND end_time > p_start_time)
    );
  
  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour empêcher les réservations conflictuelles
CREATE OR REPLACE FUNCTION prevent_reservation_conflict()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND check_reservation_conflict(
    NEW.court_id,
    NEW.date,
    NEW.start_time,
    NEW.end_time,
    NEW.id
  ) THEN
    RAISE EXCEPTION 'Ce créneau est déjà réservé';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_reservation_insert_or_update
  BEFORE INSERT OR UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION prevent_reservation_conflict();

-- Trigger pour mettre à jour cancelled_at lors de l'annulation
CREATE OR REPLACE FUNCTION update_cancelled_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_reservation_cancelled
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_cancelled_at();

-- Vue pour faciliter les requêtes de réservations avec informations complètes
CREATE OR REPLACE VIEW reservations_with_details AS
SELECT 
  r.id,
  r.court_id,
  r.player_id,
  r.date,
  r.start_time,
  r.end_time,
  r.status,
  r.price,
  r.notes,
  r.created_at,
  r.updated_at,
  r.cancelled_at,
  co.name AS court_name,
  co.type AS court_type,
  cl.id AS club_id,
  cl.name AS club_name,
  cl.city AS club_city,
  p.email AS player_email,
  pr.player_name
FROM public.reservations r
JOIN public.courts co ON co.id = r.court_id
JOIN public.clubs cl ON cl.id = co.club_id
JOIN auth.users u ON u.id = r.player_id
LEFT JOIN public.profiles pr ON pr.id = r.player_id
LEFT JOIN public.profiles p ON p.id = r.player_id;

-- Commentaires
COMMENT ON TABLE public.reservations IS 'Réservations des terrains par les joueurs';
COMMENT ON COLUMN public.reservations.court_id IS 'ID du terrain réservé';
COMMENT ON COLUMN public.reservations.player_id IS 'ID du joueur qui réserve';
COMMENT ON COLUMN public.reservations.date IS 'Date de la réservation';
COMMENT ON COLUMN public.reservations.status IS 'Statut : confirmed ou cancelled';











