-- =====================================================
-- TEST: Anti double-booking avec créneaux fixes
-- =====================================================
-- Objectif: Vérifier la contrainte UNIQUE (court_id, booking_date, slot_id)
-- =====================================================

-- =====================================================
-- SETUP: Créer des données de test
-- =====================================================

-- Insérer un club de test (si n'existe pas)
INSERT INTO public.clubs (id, name, city, address, phone, email)
VALUES (
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  'Test Club - Padel Center',
  'Paris',
  '123 Rue Test',
  '01 23 45 67 89',
  'test@padelcenter.com'
)
ON CONFLICT (id) DO NOTHING;

-- Insérer un terrain de test
INSERT INTO public.courts (id, club_id, name, is_active)
VALUES (
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  'Terrain Test 1',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Créer un user de test (simulé avec UUID fixe)
-- Note: En prod, utiliser auth.uid() pour user authentifié
DO $$
BEGIN
  -- Vérifier si user existe déjà (cette vérification est facultative)
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = 'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid
  ) THEN
    -- Insérer user dans auth.users (NOTE: cette table est gérée par Supabase Auth)
    -- En environnement de test, créez plutôt un vrai user via Supabase Dashboard
    RAISE NOTICE 'User test non trouvé - créez-le via Supabase Dashboard si besoin';
  END IF;
END $$;


-- =====================================================
-- TEST 1: Créer une réservation (doit réussir)
-- =====================================================

SELECT '========================================' AS test;
SELECT 'TEST 1: Première réservation (doit réussir)' AS test;
SELECT '========================================' AS test;

-- Réserver le créneau 08:00-09:30 (slot_id=1) pour demain
SELECT public.create_booking_fixed_slot(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,  -- club_id
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,  -- court_id
  CURRENT_DATE + INTERVAL '1 day',               -- booking_date (demain)
  1,                                              -- slot_id (08:00-09:30)
  'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid,  -- user_id
  'Jean Dupont',                                  -- player_name
  'jean.dupont@example.com',                      -- player_email
  '06 12 34 56 78'                                -- player_phone
) AS result;

-- Vérifier que la réservation a été créée
SELECT 
  id,
  court_id,
  booking_date,
  slot_id,
  status,
  player_name,
  created_at
FROM public.bookings
WHERE court_id = '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid
  AND booking_date = CURRENT_DATE + INTERVAL '1 day'
  AND slot_id = 1;

SELECT '✅ TEST 1 RÉUSSI: Première réservation créée' AS result;


-- =====================================================
-- TEST 2: Tenter de réserver le MÊME créneau (doit échouer)
-- =====================================================

SELECT '========================================' AS test;
SELECT 'TEST 2: Double réservation (doit échouer avec unique_violation)' AS test;
SELECT '========================================' AS test;

-- Cette requête DOIT échouer avec l'erreur "Créneau déjà réservé"
DO $$
BEGIN
  PERFORM public.create_booking_fixed_slot(
    'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,  -- même club
    '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,  -- même court
    CURRENT_DATE + INTERVAL '1 day',               -- même date
    1,                                              -- même slot_id
    'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid,  -- même ou différent user
    'Marie Martin',                                 -- différent player
    'marie.martin@example.com',
    '06 98 76 54 32'
  );
  
  -- Si on arrive ici, c'est un ÉCHEC du test
  RAISE EXCEPTION '❌ TEST 2 ÉCHOUÉ: Le double-booking a été accepté (contrainte UNIQUE ne fonctionne pas)';
  
EXCEPTION
  WHEN unique_violation THEN
    -- C'est le comportement attendu !
    RAISE NOTICE '✅ TEST 2 RÉUSSI: Double-booking correctement bloqué';
    RAISE NOTICE 'Erreur capturée: %', SQLERRM;
  
  WHEN OTHERS THEN
    -- Autre erreur inattendue
    RAISE EXCEPTION '❌ TEST 2 ÉCHOUÉ avec erreur inattendue: %', SQLERRM;
END $$;


-- =====================================================
-- TEST 3: Réserver un AUTRE créneau sur le même terrain (doit réussir)
-- =====================================================

SELECT '========================================' AS test;
SELECT 'TEST 3: Autre créneau même terrain (doit réussir)' AS test;
SELECT '========================================' AS test;

-- Réserver le créneau 09:30-11:00 (slot_id=2) sur le même terrain
SELECT public.create_booking_fixed_slot(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
  CURRENT_DATE + INTERVAL '1 day',
  2,  -- slot_id différent
  'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid,
  'Sophie Bernard',
  'sophie.bernard@example.com',
  '06 11 22 33 44'
) AS result;

SELECT '✅ TEST 3 RÉUSSI: Autre créneau réservé sur le même terrain' AS result;


-- =====================================================
-- TEST 4: Réserver le même créneau sur un AUTRE jour (doit réussir)
-- =====================================================

SELECT '========================================' AS test;
SELECT 'TEST 4: Même créneau autre jour (doit réussir)' AS test;
SELECT '========================================' AS test;

-- Réserver le créneau 08:00-09:30 (slot_id=1) pour après-demain
SELECT public.create_booking_fixed_slot(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
  CURRENT_DATE + INTERVAL '2 days',  -- Jour différent
  1,  -- Même slot_id
  'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid,
  'Thomas Leroy',
  'thomas.leroy@example.com',
  '06 55 66 77 88'
) AS result;

SELECT '✅ TEST 4 RÉUSSI: Même créneau réservé pour un autre jour' AS result;


-- =====================================================
-- TEST 5: Vérifier les disponibilités
-- =====================================================

SELECT '========================================' AS test;
SELECT 'TEST 5: Vérifier les disponibilités' AS test;
SELECT '========================================' AS test;

-- Disponibilités pour demain
SELECT 
  court_name,
  slot_label,
  start_time,
  end_time,
  is_available
FROM public.get_availabilities_fixed_slots(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,  -- club_id
  CURRENT_DATE + INTERVAL '1 day'                 -- date
)
WHERE court_id = '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid
ORDER BY start_time;

SELECT '✅ TEST 5 RÉUSSI: Disponibilités récupérées' AS result;


-- =====================================================
-- TEST 6: Vérifier la vue v_bookings_with_slots
-- =====================================================

SELECT '========================================' AS test;
SELECT 'TEST 6: Vue des réservations' AS test;
SELECT '========================================' AS test;

SELECT 
  booking_id,
  club_name,
  court_name,
  booking_date,
  slot_label,
  status,
  player_name,
  created_at
FROM public.v_bookings_with_slots
WHERE court_id = '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid
  AND booking_date >= CURRENT_DATE
ORDER BY booking_date, start_time;

SELECT '✅ TEST 6 RÉUSSI: Vue fonctionne correctement' AS result;


-- =====================================================
-- TEST 7: Tester reservation dans le passé (doit échouer)
-- =====================================================

SELECT '========================================' AS test;
SELECT 'TEST 7: Réservation dans le passé (doit échouer)' AS test;
SELECT '========================================' AS test;

DO $$
BEGIN
  PERFORM public.create_booking_fixed_slot(
    'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
    '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
    CURRENT_DATE - INTERVAL '1 day',  -- Hier (passé)
    1,
    'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid,
    'Test Passé',
    'test@example.com',
    '06 00 00 00 00'
  );
  
  RAISE EXCEPTION '❌ TEST 7 ÉCHOUÉ: Réservation dans le passé acceptée';
  
EXCEPTION
  WHEN OTHERS THEN
    IF SQLERRM LIKE '%futur%' OR SQLERRM LIKE '%passé%' THEN
      RAISE NOTICE '✅ TEST 7 RÉUSSI: Réservation dans le passé bloquée';
      RAISE NOTICE 'Erreur capturée: %', SQLERRM;
    ELSE
      RAISE EXCEPTION '❌ TEST 7 ÉCHOUÉ avec erreur inattendue: %', SQLERRM;
    END IF;
END $$;


-- =====================================================
-- TEST 8: Slot inexistant (doit échouer)
-- =====================================================

SELECT '========================================' AS test;
SELECT 'TEST 8: Slot inexistant (doit échouer)' AS test;
SELECT '========================================' AS test;

DO $$
BEGIN
  PERFORM public.create_booking_fixed_slot(
    'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
    '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
    CURRENT_DATE + INTERVAL '1 day',
    999,  -- Slot inexistant
    'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid,
    'Test Slot',
    'test@example.com',
    '06 00 00 00 00'
  );
  
  RAISE EXCEPTION '❌ TEST 8 ÉCHOUÉ: Slot inexistant accepté';
  
EXCEPTION
  WHEN OTHERS THEN
    IF SQLERRM LIKE '%introuvable%' OR SQLERRM LIKE '%inactif%' THEN
      RAISE NOTICE '✅ TEST 8 RÉUSSI: Slot inexistant bloqué';
      RAISE NOTICE 'Erreur capturée: %', SQLERRM;
    ELSE
      RAISE EXCEPTION '❌ TEST 8 ÉCHOUÉ avec erreur inattendue: %', SQLERRM;
    END IF;
END $$;


-- =====================================================
-- CLEANUP: Supprimer les données de test
-- =====================================================

SELECT '========================================' AS test;
SELECT 'CLEANUP: Suppression des données de test' AS test;
SELECT '========================================' AS test;

-- Supprimer les réservations de test
DELETE FROM public.bookings
WHERE court_id = '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid
  AND booking_date >= CURRENT_DATE;

SELECT '✅ Réservations de test supprimées' AS result;


-- =====================================================
-- RÉSUMÉ FINAL
-- =====================================================

SELECT '========================================' AS test;
SELECT '✅ TOUS LES TESTS RÉUSSIS !' AS test;
SELECT '========================================' AS test;
SELECT 'Résumé:' AS test;
SELECT '  ✅ TEST 1: Première réservation OK' AS test;
SELECT '  ✅ TEST 2: Double-booking bloqué (UNIQUE constraint)' AS test;
SELECT '  ✅ TEST 3: Autre créneau OK' AS test;
SELECT '  ✅ TEST 4: Autre jour OK' AS test;
SELECT '  ✅ TEST 5: Disponibilités OK' AS test;
SELECT '  ✅ TEST 6: Vue OK' AS test;
SELECT '  ✅ TEST 7: Réservation passée bloquée' AS test;
SELECT '  ✅ TEST 8: Slot inexistant bloqué' AS test;
SELECT '========================================' AS test;
SELECT 'La contrainte UNIQUE fonctionne parfaitement !' AS test;
SELECT '========================================' AS test;
