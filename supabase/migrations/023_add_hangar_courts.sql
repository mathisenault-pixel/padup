-- ============================================
-- Migration: Ajouter les 6 terrains du club Le Hangar
-- Description: Insertion des terrains pour le club HANGAR1
-- ============================================

-- Insertion des 6 terrains pour Le Hangar (club_code = 'HANGAR1')
DO $$
DECLARE
  v_club_id UUID;
BEGIN
  -- Récupérer l'ID du club Hangar
  SELECT id INTO v_club_id
  FROM public.clubs
  WHERE club_code = 'HANGAR1'
  LIMIT 1;

  -- Vérifier que le club existe
  IF v_club_id IS NULL THEN
    RAISE NOTICE 'Club HANGAR1 not found. Skipping court insertion.';
    RETURN;
  END IF;

  -- Insérer les 6 terrains
  INSERT INTO public.courts (club_id, name, type, description, surface, lighting, covered, is_active)
  VALUES
    (v_club_id, 'Terrain 1', 'padel', 'Terrain couvert avec éclairage LED', 'gazon synthétique', true, true, true),
    (v_club_id, 'Terrain 2', 'padel', 'Terrain couvert avec éclairage LED', 'gazon synthétique', true, true, true),
    (v_club_id, 'Terrain 3', 'padel', 'Terrain couvert avec éclairage LED', 'gazon synthétique', true, true, true),
    (v_club_id, 'Terrain 4', 'padel', 'Terrain couvert avec éclairage LED', 'gazon synthétique', true, true, true),
    (v_club_id, 'Terrain 5', 'padel', 'Terrain couvert avec éclairage LED', 'gazon synthétique', true, true, true),
    (v_club_id, 'Terrain 6', 'padel', 'Terrain couvert avec éclairage LED', 'gazon synthétique', true, true, true)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Successfully added 6 courts for club HANGAR1';
END $$;
