-- =====================================================
-- TEST RAPIDE : RPC create_booking_90m
-- =====================================================
-- À exécuter dans Supabase SQL Editor après la migration
-- =====================================================

-- 1) NETTOYAGE (optionnel - pour retester)
-- ============================================================

-- Supprimer les données de test (ATTENTION: seulement en dev)
-- DELETE FROM public.booking_slots WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb';
-- DELETE FROM public.reservations WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb';


-- 2) TEST 1: Réservation normale (DOIT RÉUSSIR)
-- ============================================================

SELECT public.create_booking_90m(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,  -- club_id
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,  -- court_id (Terrain 2)
  '2026-01-30 10:00:00+00'::timestamptz,         -- start_at (10:00 UTC)
  'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid   -- user_id
);

-- RÉSULTAT ATTENDU:
-- {
--   "success": true,
--   "booking_id": "uuid...",
--   "slot_id": "uuid...",
--   "start_at": "2026-01-30T10:00:00+00:00",
--   "end_at": "2026-01-30T11:30:00+00:00",
--   "duration_minutes": 90
-- }


-- 3) VÉRIFIER dans booking_slots
-- ============================================================

SELECT 
  id AS slot_id,
  booking_id,
  court_id,
  start_at,
  end_at,
  EXTRACT(EPOCH FROM (end_at - start_at)) / 60 AS duration_minutes,
  created_at
FROM public.booking_slots
WHERE court_id = '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'
  AND start_at >= '2026-01-30 00:00:00+00'
ORDER BY start_at;

-- RÉSULTAT ATTENDU:
-- 1 ligne avec start_at = 10:00, end_at = 11:30, duration_minutes = 90


-- 4) VÉRIFIER dans reservations
-- ============================================================

SELECT 
  identifiant AS booking_id,
  club_id,
  court_id,
  slot_start AS start_at,
  fin_de_slot AS end_at,
  statut,
  cree_par AS created_by,
  cree_a AS created_at
FROM public.reservations
WHERE court_id = '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'
  AND slot_start >= '2026-01-30 00:00:00+00'
ORDER BY slot_start;

-- RÉSULTAT ATTENDU:
-- 1 ligne avec slot_start = 10:00, fin_de_slot = 11:30, statut = 'confirmé'


-- 5) TEST 2: Double-booking (DOIT ÉCHOUER avec erreur)
-- ============================================================

SELECT public.create_booking_90m(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
  '2026-01-30 10:00:00+00'::timestamptz,         -- MÊME créneau que Test 1
  'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid
);

-- RÉSULTAT ATTENDU:
-- ERROR: Créneau déjà réservé
-- DETAIL: Le créneau 2026-01-30 10:00:00+00 est déjà occupé sur le court 6dceaf95...
-- HINT: Choisissez un autre créneau


-- 6) VÉRIFIER qu'il n'y a toujours qu'UNE SEULE ligne
-- ============================================================

SELECT COUNT(*) AS total_bookings
FROM public.booking_slots
WHERE court_id = '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'
  AND start_at = '2026-01-30 10:00:00+00';

-- RÉSULTAT ATTENDU: 1 (pas 2) ✅


-- 7) TEST 3: Validation start_at passé (DOIT ÉCHOUER)
-- ============================================================

SELECT public.create_booking_90m(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
  '2020-01-01 10:00:00+00'::timestamptz,         -- Date passée
  'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid
);

-- RÉSULTAT ATTENDU:
-- ERROR: start_at doit être dans le futur
-- HINT: Impossible de réserver un créneau passé


-- 8) TEST 4: Validation alignement minutes (DOIT ÉCHOUER)
-- ============================================================

SELECT public.create_booking_90m(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
  '2026-01-30 10:15:00+00'::timestamptz,         -- Pas :00 ou :30
  'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid
);

-- RÉSULTAT ATTENDU:
-- ERROR: start_at doit être aligné sur :00 ou :30
-- HINT: Ex: 09:00, 10:30, 14:00, etc.


-- 9) TEST 5: Créneaux multiples sur terrains différents (DOIT RÉUSSIR)
-- ============================================================

-- Même horaire, terrain différent → OK
SELECT public.create_booking_90m(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  'AUTRE_COURT_UUID'::uuid,                      -- Terrain différent
  '2026-01-30 10:00:00+00'::timestamptz,         -- Même horaire
  'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid
);

-- RÉSULTAT ATTENDU: Succès (pas de conflit car court_id différent)


-- 10) TEST 6: Créneaux consécutifs sur même terrain (DOIT RÉUSSIR)
-- ============================================================

-- Créneau 11:30 - 13:00 (après le 10:00 - 11:30)
SELECT public.create_booking_90m(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
  '2026-01-30 11:30:00+00'::timestamptz,         -- Créneau suivant
  'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid
);

-- RÉSULTAT ATTENDU: Succès (pas de conflit car start_at différent)


-- 11) VÉRIFIER tous les créneaux réservés
-- ============================================================

SELECT 
  start_at,
  end_at,
  court_id,
  created_at
FROM public.booking_slots
WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'
ORDER BY court_id, start_at;

-- RÉSULTAT ATTENDU:
-- Plusieurs lignes avec des start_at différents ou court_id différents


-- 12) Vue pour debug (optionnel)
-- ============================================================

SELECT 
  bs.start_at::date AS booking_date,
  bs.start_at::time AS start_time,
  bs.end_at::time AS end_time,
  c.name AS court_name,
  r.statut,
  bs.created_at
FROM public.booking_slots bs
LEFT JOIN public.reservations r ON r.identifiant = bs.booking_id
LEFT JOIN public.courts c ON c.id = bs.court_id
WHERE bs.club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'
ORDER BY bs.start_at;


-- =====================================================
-- RÉSUMÉ DES TESTS
-- =====================================================

-- ✅ Test 1: Réservation normale → Succès
-- ❌ Test 2: Double-booking → Erreur "Créneau déjà réservé"
-- ❌ Test 3: start_at passé → Erreur "doit être dans le futur"
-- ❌ Test 4: Mauvais alignement → Erreur "aligné sur :00 ou :30"
-- ✅ Test 5: Même horaire, terrain différent → Succès
-- ✅ Test 6: Créneaux consécutifs → Succès

-- Si tous les tests passent → La protection anti-double-booking fonctionne ! 🚀
