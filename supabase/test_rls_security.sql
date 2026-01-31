-- =====================================================
-- TEST RLS + ROLES : Vérifier la sécurité
-- =====================================================
-- À exécuter dans Supabase SQL Editor après la migration 014
-- =====================================================

-- =====================================================
-- SETUP : Créer des users et memberships de test
-- =====================================================

-- Nettoyer (optionnel, en dev uniquement)
-- DELETE FROM public.booking_slots WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb';
-- DELETE FROM public.reservations WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb';
-- DELETE FROM public.memberships WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb';

-- Créer des memberships de test
-- Note: Remplacer par de vrais user_id de auth.users
INSERT INTO public.memberships (user_id, club_id, role) VALUES
  ('cee11521-8f13-4157-8057-034adf2cb9a0'::uuid, 'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid, 'owner'),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid, 'staff'),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid, 'player'),
  ('00000000-0000-0000-0000-000000000003'::uuid, 'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid, 'player')
ON CONFLICT (user_id, club_id) DO NOTHING;


-- =====================================================
-- TEST 1: Vérifier que RLS est activé
-- =====================================================

SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('clubs', 'courts', 'memberships', 'reservations', 'booking_slots')
ORDER BY tablename;

-- RÉSULTAT ATTENDU: rowsecurity = true pour toutes les tables


-- =====================================================
-- TEST 2: Lister toutes les policies
-- =====================================================

SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,  -- SELECT, INSERT, UPDATE, DELETE, ALL
  permissive,
  roles,
  qual,  -- USING clause
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- RÉSULTAT ATTENDU: Plusieurs policies par table


-- =====================================================
-- TEST 3: Tables publiques (lecture anonyme)
-- =====================================================

-- Désactiver temporairement l'auth pour simuler un user anonyme
RESET ROLE;
SET ROLE anon;

-- Test 3.1: Lecture des clubs (DOIT FONCTIONNER)
SELECT id, name FROM public.clubs LIMIT 5;
-- RÉSULTAT ATTENDU: Liste des clubs ✅

-- Test 3.2: Lecture des courts (DOIT FONCTIONNER)
SELECT id, name, club_id FROM public.courts LIMIT 5;
-- RÉSULTAT ATTENDU: Liste des terrains ✅

-- Test 3.3: Lecture des booking_slots (DOIT FONCTIONNER)
SELECT id, court_id, start_at, end_at FROM public.booking_slots LIMIT 5;
-- RÉSULTAT ATTENDU: Liste des créneaux occupés ✅

-- Test 3.4: Lecture des reservations (DOIT ÊTRE VIDE)
SELECT * FROM public.reservations;
-- RÉSULTAT ATTENDU: 0 rows (RLS filtre tout) ✅

-- Test 3.5: Lecture des memberships (DOIT ÊTRE VIDE)
SELECT * FROM public.memberships;
-- RÉSULTAT ATTENDU: 0 rows (RLS filtre tout) ✅

RESET ROLE;


-- =====================================================
-- TEST 4: Player ne voit que SES bookings
-- =====================================================

-- Simuler user = player (00000000-0000-0000-0000-000000000002)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

-- Test 4.1: Créer UNE réservation via RPC
SELECT public.create_booking_90m(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
  '2026-02-01 10:00:00+00'::timestamptz,
  '00000000-0000-0000-0000-000000000002'::uuid
);
-- RÉSULTAT ATTENDU: JSON avec booking_id, slot_id ✅

-- Test 4.2: Lire SES réservations
SELECT identifiant, club_id, court_id, slot_start, fin_de_slot, statut, cree_par
FROM public.reservations;
-- RÉSULTAT ATTENDU: 1 row (celle créée juste avant) ✅

-- Test 4.3: Essayer de lire les réservations d'un autre player
SELECT * FROM public.reservations WHERE cree_par = '00000000-0000-0000-0000-000000000003'::uuid;
-- RÉSULTAT ATTENDU: 0 rows (RLS filtre) ✅

-- Test 4.4: Essayer de modifier une réservation d'un autre
UPDATE public.reservations 
SET statut = 'annulé' 
WHERE cree_par = 'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid;
-- RÉSULTAT ATTENDU: 0 rows updated (RLS bloque) ✅

RESET ROLE;


-- =====================================================
-- TEST 5: Staff voit TOUS les bookings de SON club
-- =====================================================

-- Simuler user = staff (00000000-0000-0000-0000-000000000001)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "00000000-0000-0000-0000-000000000001"}';

-- Test 5.1: Lire TOUTES les réservations du club
SELECT identifiant, club_id, court_id, slot_start, fin_de_slot, statut, cree_par
FROM public.reservations
WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid;
-- RÉSULTAT ATTENDU: Toutes les réservations du club (pas juste les siennes) ✅

-- Test 5.2: Modifier une réservation d'un player
UPDATE public.reservations 
SET statut = 'confirmé'  -- Modification innocente
WHERE cree_par = '00000000-0000-0000-0000-000000000002'::uuid
  AND club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid;
-- RÉSULTAT ATTENDU: 1 row updated (staff peut modifier) ✅

-- Test 5.3: Essayer de lire les réservations d'un AUTRE club
SELECT * FROM public.reservations WHERE club_id != 'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid;
-- RÉSULTAT ATTENDU: 0 rows (staff ne voit que SON club) ✅

RESET ROLE;


-- =====================================================
-- TEST 6: Owner peut gérer les memberships
-- =====================================================

-- Simuler user = owner (cee11521-8f13-4157-8057-034adf2cb9a0)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "cee11521-8f13-4157-8057-034adf2cb9a0"}';

-- Test 6.1: Lire tous les memberships du club
SELECT user_id, club_id, role FROM public.memberships
WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid;
-- RÉSULTAT ATTENDU: Tous les membres du club ✅

-- Test 6.2: Ajouter un nouveau membre (staff)
INSERT INTO public.memberships (user_id, club_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000099'::uuid,
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  'staff'
);
-- RÉSULTAT ATTENDU: 1 row inserted ✅

-- Test 6.3: Supprimer un membre
DELETE FROM public.memberships 
WHERE user_id = '00000000-0000-0000-0000-000000000099'::uuid
  AND club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid;
-- RÉSULTAT ATTENDU: 1 row deleted ✅

-- Test 6.4: Essayer de gérer les memberships d'un AUTRE club
INSERT INTO public.memberships (user_id, club_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000099'::uuid,
  '00000000-0000-0000-0000-CLUB-B-UUID'::uuid,  -- Autre club
  'player'
);
-- RÉSULTAT ATTENDU: ❌ Erreur ou 0 rows (RLS bloque si owner n'est pas dans club B)

RESET ROLE;


-- =====================================================
-- TEST 7: Player essaie de s'auto-promouvoir (DOIT ÉCHOUER)
-- =====================================================

-- Simuler user = player (00000000-0000-0000-0000-000000000002)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

-- Test 7.1: Essayer de changer son propre rôle en "owner"
UPDATE public.memberships 
SET role = 'owner' 
WHERE user_id = '00000000-0000-0000-0000-000000000002'::uuid;
-- RÉSULTAT ATTENDU: 0 rows updated (RLS bloque) ✅

-- Test 7.2: Essayer d'ajouter un membership "owner" pour soi dans un autre club
INSERT INTO public.memberships (user_id, club_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-CLUB-B-UUID'::uuid,
  'owner'
);
-- RÉSULTAT ATTENDU: ❌ Erreur (RLS bloque, pas owner du club B)

RESET ROLE;


-- =====================================================
-- TEST 8: Validation RPC create_booking_90m
-- =====================================================

-- Test 8.1: Essayer de réserver pour un AUTRE user (DOIT ÉCHOUER)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT public.create_booking_90m(
  'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'::uuid,
  '2026-02-01 12:00:00+00'::timestamptz,
  'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid  -- ← Pas auth.uid()
);
-- RÉSULTAT ATTENDU: ❌ EXCEPTION "Impossible de réserver pour un autre utilisateur"

RESET ROLE;


-- =====================================================
-- TEST 9: Fonctions helper
-- =====================================================

-- Test 9.1: is_club_staff
SELECT public.is_club_staff('ba43c579-e522-4b51-8542-737c2c6452bb'::uuid, 'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid);
-- RÉSULTAT ATTENDU: true (owner) ✅

SELECT public.is_club_staff('ba43c579-e522-4b51-8542-737c2c6452bb'::uuid, '00000000-0000-0000-0000-000000000001'::uuid);
-- RÉSULTAT ATTENDU: true (staff) ✅

SELECT public.is_club_staff('ba43c579-e522-4b51-8542-737c2c6452bb'::uuid, '00000000-0000-0000-0000-000000000002'::uuid);
-- RÉSULTAT ATTENDU: false (player) ✅

-- Test 9.2: is_club_owner
SELECT public.is_club_owner('ba43c579-e522-4b51-8542-737c2c6452bb'::uuid, 'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid);
-- RÉSULTAT ATTENDU: true ✅

SELECT public.is_club_owner('ba43c579-e522-4b51-8542-737c2c6452bb'::uuid, '00000000-0000-0000-0000-000000000001'::uuid);
-- RÉSULTAT ATTENDU: false (staff, pas owner) ✅


-- =====================================================
-- TEST 10: Cross-club isolation
-- =====================================================

-- Créer un membership dans un AUTRE club pour le même user
INSERT INTO public.memberships (user_id, club_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,  -- Même user
  '00000000-0000-0000-0000-CLUB-B-UUID'::uuid,  -- Autre club
  'player'
)
ON CONFLICT DO NOTHING;

-- Simuler ce user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

-- Test 10.1: Lire les réservations (ne doit voir QUE les siennes, tous clubs confondus)
SELECT identifiant, club_id, court_id, slot_start, cree_par
FROM public.reservations;
-- RÉSULTAT ATTENDU: Seulement SES bookings (club A + club B) ✅

-- Test 10.2: Vérifier qu'il ne voit PAS les bookings d'autres players du club A
SELECT COUNT(*) FROM public.reservations 
WHERE club_id = 'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid
  AND cree_par != '00000000-0000-0000-0000-000000000002'::uuid;
-- RÉSULTAT ATTENDU: 0 (RLS filtre) ✅

RESET ROLE;


-- =====================================================
-- RÉSUMÉ DES TESTS
-- =====================================================

/*
✅ TEST 1: RLS activé sur toutes les tables
✅ TEST 2: Policies créées pour chaque table
✅ TEST 3: Tables publiques (clubs/courts/booking_slots) lisibles par anon
✅ TEST 4: Player ne voit que SES bookings
✅ TEST 5: Staff voit TOUS les bookings de SON club
✅ TEST 6: Owner peut gérer les memberships de SON club
✅ TEST 7: Player ne peut PAS s'auto-promouvoir
✅ TEST 8: RPC valide que p_user_id = auth.uid()
✅ TEST 9: Fonctions helper fonctionnent
✅ TEST 10: Isolation cross-club (pas de fuite)

Si tous les tests passent → RLS + Rôles fonctionnent correctement ! 🔒🚀
*/
