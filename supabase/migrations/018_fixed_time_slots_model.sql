-- =====================================================
-- Migration 018: Modèle créneaux fixes 1h30 (Modèle A)
-- =====================================================
-- Objectif: Verrouillage anti double-booking avec slots prédéfinis
-- Contrainte: UNIQUE (court_id, booking_date, slot_id)
-- Durée fixe: 1h30 (90 minutes)
-- =====================================================

-- =====================================================
-- 1. TABLE time_slots : Créneaux fixes de la journée
-- =====================================================

CREATE TABLE IF NOT EXISTS public.time_slots (
  id SERIAL PRIMARY KEY,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 90,
  label TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Contrainte: end_time doit être après start_time
  CONSTRAINT time_slots_end_after_start CHECK (end_time > start_time),
  
  -- Contrainte: durée doit être 90 minutes
  CONSTRAINT time_slots_duration_90min CHECK (duration_minutes = 90),
  
  -- Contrainte: start_time unique (pas de doublons)
  CONSTRAINT time_slots_unique_start_time UNIQUE (start_time)
);

-- Commentaires
COMMENT ON TABLE public.time_slots IS 
  'Créneaux horaires fixes de la journée (8h-22h30 par tranches de 1h30)';

COMMENT ON COLUMN public.time_slots.start_time IS 
  'Heure de début du créneau (ex: 08:00, 09:30, 11:00)';

COMMENT ON COLUMN public.time_slots.label IS 
  'Label lisible (ex: "08:00 - 09:30", "09:30 - 11:00")';


-- =====================================================
-- 2. SEED des créneaux fixes (8h00 - 22h30, tranches 1h30)
-- =====================================================

-- Idempotence: suppression et recréation
TRUNCATE TABLE public.time_slots RESTART IDENTITY CASCADE;

INSERT INTO public.time_slots (start_time, end_time, duration_minutes, label) VALUES
  ('08:00'::time, '09:30'::time, 90, '08:00 - 09:30'),
  ('09:30'::time, '11:00'::time, 90, '09:30 - 11:00'),
  ('11:00'::time, '12:30'::time, 90, '11:00 - 12:30'),
  ('12:30'::time, '14:00'::time, 90, '12:30 - 14:00'),
  ('14:00'::time, '15:30'::time, 90, '14:00 - 15:30'),
  ('15:30'::time, '17:00'::time, 90, '15:30 - 17:00'),
  ('17:00'::time, '18:30'::time, 90, '17:00 - 18:30'),
  ('18:30'::time, '20:00'::time, 90, '18:30 - 20:00'),
  ('20:00'::time, '21:30'::time, 90, '20:00 - 21:30'),
  ('21:30'::time, '23:00'::time, 90, '21:30 - 23:00')
ON CONFLICT (start_time) DO NOTHING;

-- Vérification
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.time_slots;
  RAISE NOTICE '✅ % créneaux fixes créés', v_count;
END $$;


-- =====================================================
-- 3. MODIFIER la table bookings : Ajouter slot_id + booking_date
-- =====================================================

-- Ajouter la colonne slot_id (référence vers time_slots)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'bookings' 
      AND column_name = 'slot_id'
  ) THEN
    ALTER TABLE public.bookings 
      ADD COLUMN slot_id INTEGER REFERENCES public.time_slots(id) ON DELETE RESTRICT;
    RAISE NOTICE '✅ Colonne slot_id ajoutée à bookings';
  ELSE
    RAISE NOTICE 'ℹ️ Colonne slot_id existe déjà';
  END IF;
END $$;

-- Ajouter la colonne booking_date (date locale du club)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'bookings' 
      AND column_name = 'booking_date'
  ) THEN
    ALTER TABLE public.bookings 
      ADD COLUMN booking_date DATE;
    RAISE NOTICE '✅ Colonne booking_date ajoutée à bookings';
  ELSE
    RAISE NOTICE 'ℹ️ Colonne booking_date existe déjà';
  END IF;
END $$;


-- =====================================================
-- 4. CONTRAINTE UNIQUE anti double-booking
-- =====================================================

-- Supprimer l'ancienne contrainte si elle existe
DO $$
BEGIN
  -- Supprimer unique_court_slot si elle existe
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_court_slot' 
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE public.bookings DROP CONSTRAINT unique_court_slot;
    RAISE NOTICE '✅ Ancienne contrainte unique_court_slot supprimée';
  END IF;

  -- Supprimer slot_duration_30min si elle existe
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'slot_duration_30min' 
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE public.bookings DROP CONSTRAINT slot_duration_30min;
    RAISE NOTICE '✅ Ancienne contrainte slot_duration_30min supprimée';
  END IF;
END $$;

-- Créer la NOUVELLE contrainte unique (modèle A)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_court_booking_slot' 
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE public.bookings 
      ADD CONSTRAINT unique_court_booking_slot 
      UNIQUE (court_id, booking_date, slot_id);
    RAISE NOTICE '✅ Contrainte UNIQUE (court_id, booking_date, slot_id) créée';
  ELSE
    RAISE NOTICE 'ℹ️ Contrainte unique_court_booking_slot existe déjà';
  END IF;
END $$;

COMMENT ON CONSTRAINT unique_court_booking_slot ON public.bookings IS
  'Anti double-booking: un terrain ne peut être réservé qu''une fois par (date, créneau)';


-- =====================================================
-- 5. INDEX pour performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_bookings_slot_id 
  ON public.bookings (slot_id);

CREATE INDEX IF NOT EXISTS idx_bookings_booking_date 
  ON public.bookings (booking_date);

CREATE INDEX IF NOT EXISTS idx_bookings_court_date_slot 
  ON public.bookings (court_id, booking_date, slot_id);

RAISE NOTICE '✅ Index créés pour performance';


-- =====================================================
-- 6. FONCTION: Créer une réservation avec slot fixe
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_booking_fixed_slot(
  p_club_id UUID,
  p_court_id UUID,
  p_booking_date DATE,
  p_slot_id INTEGER,
  p_user_id UUID,
  p_player_name TEXT DEFAULT NULL,
  p_player_email TEXT DEFAULT NULL,
  p_player_phone TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id UUID;
  v_slot_start TIMESTAMPTZ;
  v_slot_end TIMESTAMPTZ;
  v_slot_record RECORD;
  v_result JSON;
BEGIN
  -- Validation 1: booking_date doit être dans le futur ou aujourd'hui
  IF p_booking_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'booking_date doit être aujourd''hui ou dans le futur'
      USING HINT = 'Impossible de réserver dans le passé';
  END IF;

  -- Validation 2: slot_id doit exister et être actif
  SELECT * INTO v_slot_record 
  FROM public.time_slots 
  WHERE id = p_slot_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Créneau introuvable ou inactif: %', p_slot_id;
  END IF;

  -- Validation 3: club_id doit exister
  IF NOT EXISTS (SELECT 1 FROM public.clubs WHERE id = p_club_id) THEN
    RAISE EXCEPTION 'Club introuvable: %', p_club_id;
  END IF;

  -- Validation 4: court_id doit exister et appartenir au club
  IF NOT EXISTS (
    SELECT 1 FROM public.courts 
    WHERE id = p_court_id 
      AND club_id = p_club_id 
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Terrain introuvable, inactif ou ne fait pas partie du club';
  END IF;

  -- Calcul de slot_start et slot_end (timestamptz)
  -- Combine booking_date (DATE) + start_time/end_time (TIME)
  v_slot_start := p_booking_date::TIMESTAMP + v_slot_record.start_time;
  v_slot_end := p_booking_date::TIMESTAMP + v_slot_record.end_time;

  -- Validation 5: le créneau doit être dans le futur
  IF v_slot_start <= now() THEN
    RAISE EXCEPTION 'Impossible de réserver un créneau passé'
      USING HINT = format('Le créneau %s est déjà passé', v_slot_start);
  END IF;

  -- INSERT dans bookings
  -- La contrainte UNIQUE (court_id, booking_date, slot_id) protège contre le double-booking
  INSERT INTO public.bookings (
    club_id,
    court_id,
    slot_id,
    booking_date,
    slot_start,
    slot_end,
    created_by,
    player_name,
    player_email,
    player_phone,
    status
  ) VALUES (
    p_club_id,
    p_court_id,
    p_slot_id,
    p_booking_date,
    v_slot_start,
    v_slot_end,
    p_user_id,
    p_player_name,
    p_player_email,
    p_player_phone,
    'confirmed'
  )
  RETURNING id INTO v_booking_id;

  -- Construire la réponse JSON
  v_result := json_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'club_id', p_club_id,
    'court_id', p_court_id,
    'booking_date', p_booking_date,
    'slot_id', p_slot_id,
    'slot_label', v_slot_record.label,
    'slot_start', v_slot_start,
    'slot_end', v_slot_end,
    'duration_minutes', 90,
    'created_by', p_user_id
  );

  RETURN v_result;

EXCEPTION
  -- Gestion du conflit UNIQUE (23505)
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Créneau déjà réservé'
      USING 
        ERRCODE = '23505',
        DETAIL = format(
          'Le créneau %s le %s est déjà occupé sur ce terrain',
          v_slot_record.label,
          p_booking_date
        ),
        HINT = 'Choisissez un autre créneau ou un autre terrain';
  
  -- Autres erreurs
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur lors de la création de la réservation: %', SQLERRM;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION public.create_booking_fixed_slot IS
  'Crée une réservation avec créneau fixe. Protection anti double-booking via UNIQUE (court_id, booking_date, slot_id)';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_booking_fixed_slot TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking_fixed_slot TO anon;


-- =====================================================
-- 7. FONCTION: Obtenir les disponibilités
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_availabilities_fixed_slots(
  p_club_id UUID,
  p_booking_date DATE
)
RETURNS TABLE (
  court_id UUID,
  court_name TEXT,
  slot_id INTEGER,
  slot_label TEXT,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH all_slots AS (
    -- Tous les créneaux actifs
    SELECT 
      ts.id AS slot_id,
      ts.label AS slot_label,
      ts.start_time,
      ts.end_time
    FROM public.time_slots ts
    WHERE ts.is_active = true
    ORDER BY ts.start_time
  ),
  all_courts AS (
    -- Tous les terrains actifs du club
    SELECT 
      c.id AS court_id,
      c.name AS court_name
    FROM public.courts c
    WHERE c.club_id = p_club_id
      AND c.is_active = true
    ORDER BY c.name
  ),
  occupied_slots AS (
    -- Créneaux déjà réservés pour cette date
    SELECT 
      b.court_id,
      b.slot_id
    FROM public.bookings b
    WHERE b.club_id = p_club_id
      AND b.booking_date = p_booking_date
      AND b.status IN ('confirmed', 'pending')
  )
  -- Combinaison: tous les courts × tous les slots
  SELECT 
    ac.court_id,
    ac.court_name,
    ats.slot_id,
    ats.slot_label,
    ats.start_time,
    ats.end_time,
    -- Disponible SI aucune réservation trouvée dans occupied_slots
    (os.court_id IS NULL) AS is_available
  FROM all_courts ac
  CROSS JOIN all_slots ats
  LEFT JOIN occupied_slots os 
    ON os.court_id = ac.court_id 
    AND os.slot_id = ats.slot_id
  ORDER BY ac.court_name, ats.start_time;
END;
$$;

COMMENT ON FUNCTION public.get_availabilities_fixed_slots IS
  'Retourne les disponibilités pour un club et une date donnés';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_availabilities_fixed_slots TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_availabilities_fixed_slots TO anon;


-- =====================================================
-- 8. RLS pour time_slots
-- =====================================================

ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

-- Policy: tout le monde peut lire les créneaux
DROP POLICY IF EXISTS "time_slots_public_read" ON public.time_slots;
CREATE POLICY "time_slots_public_read"
  ON public.time_slots
  FOR SELECT
  USING (true);


-- =====================================================
-- 9. Vue pour voir les réservations avec slots
-- =====================================================

CREATE OR REPLACE VIEW public.v_bookings_with_slots AS
SELECT 
  b.id AS booking_id,
  b.club_id,
  cl.name AS club_name,
  b.court_id,
  co.name AS court_name,
  b.booking_date,
  b.slot_id,
  ts.label AS slot_label,
  ts.start_time,
  ts.end_time,
  b.slot_start,
  b.slot_end,
  b.status,
  b.created_by,
  b.player_name,
  b.player_email,
  b.created_at
FROM public.bookings b
JOIN public.clubs cl ON cl.id = b.club_id
JOIN public.courts co ON co.id = b.court_id
LEFT JOIN public.time_slots ts ON ts.id = b.slot_id
ORDER BY b.booking_date DESC, ts.start_time DESC;

COMMENT ON VIEW public.v_bookings_with_slots IS
  'Vue enrichie des réservations avec informations des créneaux fixes';


-- =====================================================
-- 10. Vérification finale
-- =====================================================

DO $$
DECLARE
  v_slots_count INTEGER;
  v_has_slot_id BOOLEAN;
  v_has_booking_date BOOLEAN;
  v_has_constraint BOOLEAN;
BEGIN
  -- Compter les créneaux
  SELECT COUNT(*) INTO v_slots_count FROM public.time_slots;
  
  -- Vérifier colonnes
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'slot_id'
  ) INTO v_has_slot_id;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'booking_date'
  ) INTO v_has_booking_date;
  
  -- Vérifier contrainte unique
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_court_booking_slot'
  ) INTO v_has_constraint;

  -- Afficher résumé
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration 018 terminée avec succès !';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 Créneaux fixes créés: %', v_slots_count;
  RAISE NOTICE '✅ Colonne slot_id: %', CASE WHEN v_has_slot_id THEN 'OK' ELSE 'MANQUANT' END;
  RAISE NOTICE '✅ Colonne booking_date: %', CASE WHEN v_has_booking_date THEN 'OK' ELSE 'MANQUANT' END;
  RAISE NOTICE '✅ Contrainte UNIQUE: %', CASE WHEN v_has_constraint THEN 'OK' ELSE 'MANQUANT' END;
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎯 Prochaines étapes:';
  RAISE NOTICE '   1. Tester: SELECT * FROM public.time_slots;';
  RAISE NOTICE '   2. Tester: SELECT public.create_booking_fixed_slot(...);';
  RAISE NOTICE '   3. Tester: SELECT * FROM public.get_availabilities_fixed_slots(...);';
  RAISE NOTICE '========================================';
END $$;
