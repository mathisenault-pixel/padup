-- =====================================================
-- Migration 013: Anti-double-booking créneaux 1h30
-- =====================================================
-- Objectif: Garantir l'unicité des créneaux 90 min côté DB
-- Protection atomique contre les réservations simultanées
-- =====================================================

-- 1) TABLE booking_slots : source de vérité des créneaux réservés
-- ============================================================

CREATE TABLE IF NOT EXISTS public.booking_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Références
  booking_id uuid NOT NULL,
  club_id uuid NOT NULL,
  court_id uuid NOT NULL,
  
  -- Créneaux (90 minutes EXACTEMENT)
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  
  -- Métadonnées
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Contrainte: end_at DOIT être start_at + 90 minutes
  CONSTRAINT booking_slots_duration_90min 
    CHECK (end_at = start_at + interval '90 minutes'),
  
  -- Contrainte UNIQUE: impossible de réserver 2x le même (court, start)
  CONSTRAINT booking_slots_unique_court_start 
    UNIQUE (court_id, start_at)
);

-- Commentaires
COMMENT ON TABLE public.booking_slots IS 
  'Créneaux réservés 1h30. Contrainte UNIQUE empêche double-booking.';

COMMENT ON CONSTRAINT booking_slots_duration_90min ON public.booking_slots IS
  'Enforce: end_at = start_at + 90 minutes exactement';

COMMENT ON CONSTRAINT booking_slots_unique_court_start ON public.booking_slots IS
  'Anti-double-booking: un seul booking par (court_id, start_at)';


-- 2) INDEX pour performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_booking_slots_court_start 
  ON public.booking_slots (court_id, start_at);

CREATE INDEX IF NOT EXISTS idx_booking_slots_club_date 
  ON public.booking_slots (club_id, start_at);

CREATE INDEX IF NOT EXISTS idx_booking_slots_booking 
  ON public.booking_slots (booking_id);


-- 3) RLS (Row Level Security)
-- ============================================================

ALTER TABLE public.booking_slots ENABLE ROW LEVEL SECURITY;

-- Policy: tout le monde peut lire les créneaux occupés (pour afficher dispo)
DROP POLICY IF EXISTS "public_read_booking_slots" ON public.booking_slots;
CREATE POLICY "public_read_booking_slots" 
  ON public.booking_slots 
  FOR SELECT 
  USING (true);

-- Policy: seule la fonction RPC peut insérer (via SECURITY DEFINER)
DROP POLICY IF EXISTS "rpc_insert_booking_slots" ON public.booking_slots;
CREATE POLICY "rpc_insert_booking_slots" 
  ON public.booking_slots 
  FOR INSERT 
  WITH CHECK (true);


-- 4) FONCTION RPC: create_booking_90m
-- ============================================================
-- Transaction atomique: crée booking + booking_slot en un seul appel
-- Garantit l'unicité via contrainte UNIQUE
-- Rollback automatique si conflit

CREATE OR REPLACE FUNCTION public.create_booking_90m(
  p_club_id uuid,
  p_court_id uuid,
  p_start_at timestamptz,
  p_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_end_at timestamptz;
  v_booking_id uuid;
  v_slot_id uuid;
  v_result json;
BEGIN
  -- Calcul automatique end_at = start_at + 90 minutes
  v_end_at := p_start_at + interval '90 minutes';

  -- Validation 1: start_at doit être dans le futur
  IF p_start_at <= now() THEN
    RAISE EXCEPTION 'start_at doit être dans le futur'
      USING HINT = 'Impossible de réserver un créneau passé';
  END IF;

  -- Validation 2: start_at doit être aligné sur 00 ou 30 minutes (optionnel)
  IF EXTRACT(minute FROM p_start_at) NOT IN (0, 30) THEN
    RAISE EXCEPTION 'start_at doit être aligné sur :00 ou :30'
      USING HINT = 'Ex: 09:00, 10:30, 14:00, etc.';
  END IF;

  -- Validation 3: vérifier que club_id et court_id existent (optionnel mais recommandé)
  IF NOT EXISTS (SELECT 1 FROM public.clubs WHERE id = p_club_id) THEN
    RAISE EXCEPTION 'Club introuvable: %', p_club_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.courts WHERE id = p_court_id AND club_id = p_club_id) THEN
    RAISE EXCEPTION 'Court introuvable ou ne fait pas partie du club: %', p_court_id;
  END IF;

  -- Transaction atomique: INSERT booking + booking_slot
  
  -- Étape 1: Insérer dans reservations (table existante)
  INSERT INTO public.reservations (
    club_id,
    court_id,
    slot_start,
    fin_de_slot,
    cree_par,
    statut
  ) VALUES (
    p_club_id,
    p_court_id,
    p_start_at,
    v_end_at,
    p_user_id,
    'confirmé'
  )
  RETURNING identifiant INTO v_booking_id;

  -- Étape 2: Insérer dans booking_slots (protection anti-double-booking)
  -- Si conflit UNIQUE → PostgreSQL lève une exception → rollback auto
  INSERT INTO public.booking_slots (
    booking_id,
    club_id,
    court_id,
    start_at,
    end_at
  ) VALUES (
    v_booking_id,
    p_club_id,
    p_court_id,
    p_start_at,
    v_end_at
  )
  RETURNING id INTO v_slot_id;

  -- Construire la réponse JSON
  v_result := json_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'slot_id', v_slot_id,
    'club_id', p_club_id,
    'court_id', p_court_id,
    'start_at', p_start_at,
    'end_at', v_end_at,
    'duration_minutes', 90,
    'created_by', p_user_id
  );

  RETURN v_result;

EXCEPTION
  -- Gestion spécifique du conflit UNIQUE (23505)
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Créneau déjà réservé'
      USING 
        ERRCODE = '23505',
        DETAIL = format('Le créneau %s est déjà occupé sur le court %s', p_start_at, p_court_id),
        HINT = 'Choisissez un autre créneau';
  
  -- Autres erreurs
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur lors de la création de la réservation: %', SQLERRM;
END;
$$;

-- Commentaire sur la fonction
COMMENT ON FUNCTION public.create_booking_90m IS
  'RPC atomique: crée booking + booking_slot en transaction. Protection anti-double-booking via UNIQUE constraint.';


-- 5) GRANT permissions
-- ============================================================

-- Permettre aux utilisateurs authentifiés d'appeler la RPC
GRANT EXECUTE ON FUNCTION public.create_booking_90m TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking_90m TO anon;


-- 6) TEST de la contrainte UNIQUE (optionnel, à exécuter manuellement)
-- ============================================================

-- Test 1: Insérer un créneau
-- SELECT public.create_booking_90m(
--   'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,  -- club_id
--   '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,  -- court_id
--   '2026-01-29 10:00:00+00'::timestamptz,         -- start_at
--   'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid   -- user_id
-- );

-- Test 2: Réinsérer le MÊME créneau (doit échouer avec erreur "Créneau déjà réservé")
-- SELECT public.create_booking_90m(
--   'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
--   '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
--   '2026-01-29 10:00:00+00'::timestamptz,
--   'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid
-- );
-- Résultat attendu: ERROR - Créneau déjà réservé


-- 7) Vue pour vérifier les créneaux occupés (optionnel)
-- ============================================================

CREATE OR REPLACE VIEW public.v_booking_slots_occupied AS
SELECT 
  bs.id AS slot_id,
  bs.booking_id,
  bs.club_id,
  bs.court_id,
  bs.start_at,
  bs.end_at,
  EXTRACT(EPOCH FROM (bs.end_at - bs.start_at)) / 60 AS duration_minutes,
  r.statut AS booking_status,
  r.cree_par AS created_by,
  bs.created_at
FROM public.booking_slots bs
LEFT JOIN public.reservations r ON r.identifiant = bs.booking_id
ORDER BY bs.start_at DESC;

COMMENT ON VIEW public.v_booking_slots_occupied IS
  'Vue pour voir tous les créneaux occupés avec détails booking';


-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
