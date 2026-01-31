-- =====================================================
-- TEST ENDPOINTS : Vérifier les données pour les endpoints
-- =====================================================
-- À exécuter dans Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. VÉRIFIER LES CLUBS
-- =====================================================

SELECT 
  id,
  name,
  city
FROM public.clubs
ORDER BY name
LIMIT 10;

-- RÉSULTAT ATTENDU: Liste des clubs


-- =====================================================
-- 2. VÉRIFIER LES TERRAINS (COURTS)
-- =====================================================

SELECT 
  c.id AS court_id,
  c.name AS court_name,
  c.club_id,
  cl.name AS club_name
FROM public.courts c
JOIN public.clubs cl ON cl.id = c.club_id
WHERE c.club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid
ORDER BY c.name;

-- RÉSULTAT ATTENDU: Liste des terrains du club test


-- =====================================================
-- 3. VÉRIFIER LES RÉSERVATIONS (booking_slots)
-- =====================================================

SELECT 
  bs.id AS slot_id,
  bs.booking_id,
  bs.court_id,
  bs.start_at,
  bs.end_at,
  EXTRACT(EPOCH FROM (bs.end_at - bs.start_at)) / 60 AS duration_minutes,
  b.statut AS booking_status,
  b.cree_par AS created_by
FROM public.booking_slots bs
LEFT JOIN public.reservations b ON b.identifiant = bs.booking_id
WHERE bs.court_id = '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid
  AND bs.start_at >= '2026-01-28T00:00:00Z'::timestamptz
  AND bs.start_at < '2026-01-29T00:00:00Z'::timestamptz
ORDER BY bs.start_at;

-- RÉSULTAT ATTENDU: Liste des créneaux réservés pour le terrain test (28 janvier)
-- VÉRIFIER: duration_minutes = 90


-- =====================================================
-- 4. VÉRIFIER LA CONTRAINTE UNIQUE (anti double-booking)
-- =====================================================

-- Test: Essayer de créer un doublon
DO $$
DECLARE
  v_booking_id uuid;
BEGIN
  -- Créer une réservation
  INSERT INTO public.reservations (
    club_id,
    court_id,
    slot_start,
    fin_de_slot,
    cree_par,
    statut
  ) VALUES (
    'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
    '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
    '2026-02-15 10:00:00+00'::timestamptz,
    '2026-02-15 11:30:00+00'::timestamptz,
    'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid,
    'confirmé'
  )
  RETURNING identifiant INTO v_booking_id;
  
  -- Insérer dans booking_slots
  INSERT INTO public.booking_slots (
    booking_id,
    club_id,
    court_id,
    start_at,
    end_at
  ) VALUES (
    v_booking_id,
    'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
    '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
    '2026-02-15 10:00:00+00'::timestamptz,
    '2026-02-15 11:30:00+00'::timestamptz
  );
  
  RAISE NOTICE 'Première réservation OK: %', v_booking_id;
  
  -- Essayer de créer un doublon (DOIT ÉCHOUER)
  BEGIN
    INSERT INTO public.booking_slots (
      booking_id,
      club_id,
      court_id,
      start_at,
      end_at
    ) VALUES (
      gen_random_uuid(),
      'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
      '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
      '2026-02-15 10:00:00+00'::timestamptz,
      '2026-02-15 11:30:00+00'::timestamptz
    );
    
    RAISE EXCEPTION 'ERREUR: Le doublon a été accepté !';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'OK: Contrainte UNIQUE a bloqué le doublon (attendu)';
  END;
  
  -- Nettoyer
  DELETE FROM public.booking_slots WHERE booking_id = v_booking_id;
  DELETE FROM public.reservations WHERE identifiant = v_booking_id;
  
  RAISE NOTICE 'Test terminé: données nettoyées';
END $$;

-- RÉSULTAT ATTENDU: "OK: Contrainte UNIQUE a bloqué le doublon"


-- =====================================================
-- 5. TESTER LA RPC create_booking_90m
-- =====================================================

-- Test 1: Créer une réservation normale (DOIT RÉUSSIR)
SELECT public.create_booking_90m(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
  '2026-02-20 14:00:00+00'::timestamptz,
  'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid
);

-- RÉSULTAT ATTENDU: JSON avec success = true, booking_id, slot_id


-- Test 2: Essayer de réserver le même créneau (DOIT ÉCHOUER)
DO $$
BEGIN
  PERFORM public.create_booking_90m(
    'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
    '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
    '2026-02-20 14:00:00+00'::timestamptz,
    'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid
  );
  
  RAISE EXCEPTION 'ERREUR: Le doublon a été accepté !';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLERRM LIKE '%déjà réservé%' THEN
      RAISE NOTICE 'OK: RPC a bloqué le doublon avec message personnalisé';
    ELSE
      RAISE EXCEPTION 'ERREUR inattendue: %', SQLERRM;
    END IF;
END $$;

-- RÉSULTAT ATTENDU: "OK: RPC a bloqué le doublon"


-- Test 3: Nettoyer
DELETE FROM public.booking_slots 
WHERE start_at = '2026-02-20 14:00:00+00'::timestamptz
  AND court_id = '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid;

DELETE FROM public.reservations 
WHERE slot_start = '2026-02-20 14:00:00+00'::timestamptz
  AND court_id = '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid;


-- =====================================================
-- 6. SIMULER UNE JOURNÉE COMPLÈTE (14 créneaux 90 min)
-- =====================================================

-- Générer les créneaux théoriques de 09:00 à 22:00 (14 slots)
WITH time_slots AS (
  SELECT 
    '2026-01-30'::date + (n || ' hours')::interval AS start_time
  FROM generate_series(9, 21, 1.5) AS n  -- 9h, 10h30, 12h, ..., 21h30
)
SELECT 
  ROW_NUMBER() OVER (ORDER BY start_time) AS slot_number,
  start_time::timestamptz AS start_at,
  (start_time + interval '90 minutes')::timestamptz AS end_at,
  TO_CHAR(start_time, 'HH24:MI') || ' - ' || TO_CHAR(start_time + interval '90 minutes', 'HH24:MI') AS label
FROM time_slots
WHERE start_time < '2026-01-30 22:00:00'::timestamp;

-- RÉSULTAT ATTENDU: 14 créneaux de 90 minutes
-- 1. 09:00 - 10:30
-- 2. 10:30 - 12:00
-- 3. 12:00 - 13:30
-- ...
-- 14. 21:30 - 23:00


-- =====================================================
-- 7. VÉRIFIER LES POLICIES RLS
-- =====================================================

-- Lister les policies sur booking_slots
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'booking_slots';

-- RÉSULTAT ATTENDU:
-- - public_read_booking_slots (SELECT, USING true)
-- - rpc_insert_booking_slots (INSERT, WITH CHECK true)
-- - staff_delete_club_booking_slots (DELETE, USING membership check)


-- =====================================================
-- 8. VÉRIFIER LES MEMBERSHIPS
-- =====================================================

SELECT 
  m.user_id,
  m.club_id,
  m.role,
  c.name AS club_name
FROM public.memberships m
JOIN public.clubs c ON c.id = m.club_id
WHERE m.club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid
ORDER BY m.role, m.user_id;

-- RÉSULTAT ATTENDU: Liste des memberships pour le club test
-- Au moins 1 owner


-- =====================================================
-- 9. TEST ENDPOINT AVAILABILITY (simulation)
-- =====================================================

-- Simuler ce que fait l'endpoint /api/clubs/.../availability
WITH 
-- Étape 1: Générer tous les slots théoriques
all_slots AS (
  SELECT 
    ROW_NUMBER() OVER (ORDER BY start_time) AS slot_number,
    start_time::timestamptz AS start_at,
    (start_time + interval '90 minutes')::timestamptz AS end_at,
    TO_CHAR(start_time, 'HH24:MI') || ' - ' || TO_CHAR(start_time + interval '90 minutes', 'HH24:MI') AS label
  FROM (
    SELECT '2026-01-30'::date + (n || ' hours')::interval AS start_time
    FROM generate_series(9, 21, 1.5) AS n
  ) times
  WHERE start_time < '2026-01-30 22:00:00'::timestamp
),
-- Étape 2: Récupérer les réservations
booked_slots AS (
  SELECT 
    bs.start_at,
    bs.end_at,
    bs.booking_id
  FROM public.booking_slots bs
  WHERE bs.court_id = '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid
    AND bs.start_at >= '2026-01-30T00:00:00Z'::timestamptz
    AND bs.start_at < '2026-01-31T00:00:00Z'::timestamptz
)
-- Étape 3: Marquer chaque slot comme free ou reserved
SELECT 
  a.slot_number,
  a.label,
  a.start_at,
  a.end_at,
  CASE 
    WHEN b.booking_id IS NOT NULL THEN 'reserved'
    ELSE 'free'
  END AS status,
  b.booking_id
FROM all_slots a
LEFT JOIN booked_slots b ON b.start_at = a.start_at AND b.end_at = a.end_at
ORDER BY a.slot_number;

-- RÉSULTAT ATTENDU:
-- - 14 lignes (1 par créneau)
-- - status = 'free' ou 'reserved'
-- - booking_id rempli si reserved


-- =====================================================
-- 10. RÉSUMÉ FINAL
-- =====================================================

-- Compter les créneaux disponibles vs réservés pour chaque terrain
SELECT 
  c.id AS court_id,
  c.name AS court_name,
  COUNT(bs.id) AS reserved_slots,
  14 - COUNT(bs.id) AS free_slots,
  ROUND((COUNT(bs.id)::numeric / 14) * 100, 1) AS occupancy_percent
FROM public.courts c
LEFT JOIN public.booking_slots bs ON bs.court_id = c.id
  AND bs.start_at >= '2026-01-30T00:00:00Z'::timestamptz
  AND bs.start_at < '2026-01-31T00:00:00Z'::timestamptz
WHERE c.club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid
GROUP BY c.id, c.name
ORDER BY c.name;

-- RÉSULTAT ATTENDU:
-- court_name | reserved_slots | free_slots | occupancy_percent
-- -----------|----------------|------------|------------------
-- Terrain 1  | 2              | 12         | 14.3%
-- Terrain 2  | 1              | 13         | 7.1%
-- ...


-- =====================================================
-- FIN DES TESTS
-- =====================================================

/*
CHECKLIST:
✅ Clubs et terrains existent
✅ Réservations (booking_slots) créées
✅ Contrainte UNIQUE bloque les doublons
✅ RPC create_booking_90m fonctionne
✅ Policies RLS activées
✅ Memberships créés
✅ Simulation endpoint availability OK
✅ Résumé occupancy par terrain

Si tous les tests passent → Les endpoints sont prêts à être utilisés ! 🚀
*/
