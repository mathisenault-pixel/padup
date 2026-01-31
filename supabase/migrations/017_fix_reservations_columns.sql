-- ============================================
-- Migration: Corriger les colonnes de reservations
-- Description: Remplacer date/start_time/end_time par slot_start/fin_de_slot
--              et player_id par user_id
-- ============================================

-- 1. Vérifier si les anciennes colonnes existent encore
DO $$
BEGIN
  -- Si la colonne 'date' existe, on doit migrer
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'reservations' 
    AND column_name = 'date'
  ) THEN
    RAISE NOTICE 'Migration des colonnes date/time vers slot_start/fin_de_slot...';
    
    -- Ajouter les nouvelles colonnes si elles n'existent pas
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'reservations' 
      AND column_name = 'slot_start'
    ) THEN
      ALTER TABLE public.reservations
      ADD COLUMN slot_start TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'reservations' 
      AND column_name = 'fin_de_slot'
    ) THEN
      ALTER TABLE public.reservations
      ADD COLUMN fin_de_slot TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'reservations' 
      AND column_name = 'user_id'
    ) THEN
      ALTER TABLE public.reservations
      ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'reservations' 
      AND column_name = 'club_id'
    ) THEN
      ALTER TABLE public.reservations
      ADD COLUMN club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE;
    END IF;
    
    -- Migrer les données existantes (combiner date + time)
    UPDATE public.reservations
    SET 
      slot_start = (date + start_time)::TIMESTAMPTZ,
      fin_de_slot = (date + end_time)::TIMESTAMPTZ,
      user_id = player_id,
      club_id = (SELECT club_id FROM public.courts WHERE id = reservations.court_id)
    WHERE slot_start IS NULL;
    
    -- Rendre les nouvelles colonnes NOT NULL
    ALTER TABLE public.reservations
    ALTER COLUMN slot_start SET NOT NULL,
    ALTER COLUMN fin_de_slot SET NOT NULL,
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN club_id SET NOT NULL;
    
    -- Supprimer les anciennes colonnes
    ALTER TABLE public.reservations
    DROP COLUMN IF EXISTS date,
    DROP COLUMN IF EXISTS start_time,
    DROP COLUMN IF EXISTS end_time,
    DROP COLUMN IF EXISTS player_id;
    
    RAISE NOTICE 'Migration terminée avec succès';
  ELSE
    RAISE NOTICE 'Les colonnes sont déjà à jour (slot_start/fin_de_slot)';
  END IF;
END $$;

-- 2. Recréer la contrainte unique sur les nouvelles colonnes
DROP INDEX IF EXISTS public.reservations_unique_court_slot_idx;
DROP INDEX IF EXISTS public.reservations_no_overlap_idx;

CREATE UNIQUE INDEX IF NOT EXISTS reservations_unique_slot_idx
  ON public.reservations(court_id, slot_start)
  WHERE status IN ('confirmed', 'reserved');

-- 3. Index pour performance
CREATE INDEX IF NOT EXISTS idx_reservations_slot_start
  ON public.reservations(slot_start);

CREATE INDEX IF NOT EXISTS idx_reservations_court_slot
  ON public.reservations(court_id, slot_start);

CREATE INDEX IF NOT EXISTS idx_reservations_user
  ON public.reservations(user_id);

CREATE INDEX IF NOT EXISTS idx_reservations_club
  ON public.reservations(club_id);

-- 4. Commentaires
COMMENT ON COLUMN public.reservations.slot_start IS 'Début du créneau (timestamptz)';
COMMENT ON COLUMN public.reservations.fin_de_slot IS 'Fin du créneau (timestamptz)';
COMMENT ON COLUMN public.reservations.user_id IS 'ID de l utilisateur (remplace player_id)';
COMMENT ON COLUMN public.reservations.club_id IS 'ID du club';

-- 5. Afficher la structure finale
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'reservations'
ORDER BY ordinal_position;
