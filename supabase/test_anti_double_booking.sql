-- ============================================
-- Test: Anti double-booking MVP
-- Description: Vérifier que la contrainte UNIQUE empêche les doubles réservations
-- ============================================

-- ÉTAPE 1: Vérifier que la contrainte existe
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'reservations'
  AND indexname LIKE '%unique%';

-- ÉTAPE 2: Insérer une première réservation (devrait réussir)
-- Adapter les UUIDs selon votre DB
DO $$
DECLARE
  v_court_id UUID := '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e';  -- Remplacer par un courtId valide
  v_player_id UUID := 'cee11521-8f13-4157-8057-034adf2cb9a0'; -- Remplacer par un userId valide
BEGIN
  INSERT INTO public.reservations (
    court_id,
    player_id,
    date,
    start_time,
    end_time,
    status
  ) VALUES (
    v_court_id,
    v_player_id,
    CURRENT_DATE,
    '10:30:00',
    '12:00:00',
    'confirmed'
  );
  
  RAISE NOTICE 'Première réservation créée avec succès';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erreur première réservation: %', SQLERRM;
END $$;

-- ÉTAPE 3: Tenter une deuxième réservation sur le MÊME créneau (devrait échouer)
DO $$
DECLARE
  v_court_id UUID := '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e';  -- Même courtId
  v_player_id UUID := '00000000-0000-0000-0000-000000000002'; -- Autre userId
BEGIN
  INSERT INTO public.reservations (
    court_id,
    player_id,
    date,
    start_time,
    end_time,
    status
  ) VALUES (
    v_court_id,
    v_player_id,
    CURRENT_DATE,
    '10:30:00',  -- MÊME start_time
    '12:00:00',
    'confirmed'
  );
  
  RAISE NOTICE '❌ PROBLÈME: Double réservation autorisée!';
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE '✅ OK: Double réservation bloquée (code 23505)';
  WHEN OTHERS THEN
    RAISE NOTICE 'Autre erreur: %', SQLERRM;
END $$;

-- ÉTAPE 4: Tenter une réservation sur un AUTRE créneau (devrait réussir)
DO $$
DECLARE
  v_court_id UUID := '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e';  -- Même courtId
  v_player_id UUID := '00000000-0000-0000-0000-000000000002'; -- Autre userId
BEGIN
  INSERT INTO public.reservations (
    court_id,
    player_id,
    date,
    start_time,
    end_time,
    status
  ) VALUES (
    v_court_id,
    v_player_id,
    CURRENT_DATE,
    '12:00:00',  -- AUTRE start_time
    '13:30:00',
    'confirmed'
  );
  
  RAISE NOTICE 'Réservation sur autre créneau créée avec succès';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erreur autre créneau: %', SQLERRM;
END $$;

-- ÉTAPE 5: Vérifier qu'on peut annuler ET réserver à nouveau
DO $$
DECLARE
  v_court_id UUID := '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e';
  v_player_id UUID := 'cee11521-8f13-4157-8057-034adf2cb9a0';
  v_reservation_id UUID;
BEGIN
  -- Annuler la première réservation
  UPDATE public.reservations
  SET status = 'cancelled'
  WHERE court_id = v_court_id
    AND date = CURRENT_DATE
    AND start_time = '10:30:00'
  RETURNING id INTO v_reservation_id;
  
  RAISE NOTICE 'Réservation % annulée', v_reservation_id;
  
  -- Réserver à nouveau le même créneau (devrait réussir car status='cancelled' exclu de l'index)
  INSERT INTO public.reservations (
    court_id,
    player_id,
    date,
    start_time,
    end_time,
    status
  ) VALUES (
    v_court_id,
    '00000000-0000-0000-0000-000000000003', -- Autre user
    CURRENT_DATE,
    '10:30:00',
    '12:00:00',
    'confirmed'
  );
  
  RAISE NOTICE '✅ OK: Réservation après annulation autorisée';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erreur réservation après annulation: %', SQLERRM;
END $$;

-- ÉTAPE 6: Afficher toutes les réservations de test
SELECT
  id,
  court_id,
  player_id,
  date,
  start_time,
  end_time,
  status,
  created_at
FROM public.reservations
WHERE date = CURRENT_DATE
ORDER BY start_time, created_at;

-- NETTOYAGE (optionnel)
-- DELETE FROM public.reservations WHERE date = CURRENT_DATE;
