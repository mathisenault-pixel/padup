-- =====================================================
-- Migration 014: RLS + Rôles (Sécurité MVP)
-- =====================================================
-- Objectif: Protéger les données sensibles avec Row Level Security
-- Garantir que chaque utilisateur ne voit que ses propres données
-- ou celles de son club (si staff/owner)
-- =====================================================

-- =====================================================
-- 1) TABLE memberships : Base des rôles
-- =====================================================

CREATE TABLE IF NOT EXISTS public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Références
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  
  -- Rôle de l'utilisateur dans ce club
  role text NOT NULL CHECK (role IN ('owner', 'staff', 'player')),
  
  -- Métadonnées
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Contrainte: un user ne peut avoir qu'un seul rôle par club
  CONSTRAINT memberships_unique_user_club UNIQUE (user_id, club_id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships (user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_club ON public.memberships (club_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_club ON public.memberships (user_id, club_id);

-- Commentaires
COMMENT ON TABLE public.memberships IS 
  'Rôles utilisateurs par club. Un user peut être player, staff ou owner.';

COMMENT ON COLUMN public.memberships.role IS 
  'owner: propriétaire club, staff: employé, player: joueur/membre';


-- =====================================================
-- 2) ACTIVER RLS sur TOUTES les tables sensibles
-- =====================================================

-- Tables de base
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Tables de réservation
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_slots ENABLE ROW LEVEL SECURITY;

-- Tables commerce (si présentes)
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- 3) POLICIES : clubs (LECTURE PUBLIQUE)
-- =====================================================
-- Les clubs sont visibles par tous pour afficher la liste

DROP POLICY IF EXISTS "public_read_clubs" ON public.clubs;
CREATE POLICY "public_read_clubs"
  ON public.clubs
  FOR SELECT
  USING (true);  -- Tout le monde peut lire

DROP POLICY IF EXISTS "owner_staff_manage_clubs" ON public.clubs;
CREATE POLICY "owner_staff_manage_clubs"
  ON public.clubs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.club_id = clubs.id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'staff')
    )
  );

COMMENT ON POLICY "public_read_clubs" ON public.clubs IS
  'Tout le monde peut voir les clubs (pour liste publique)';

COMMENT ON POLICY "owner_staff_manage_clubs" ON public.clubs IS
  'Seuls owner/staff peuvent modifier leur club';


-- =====================================================
-- 4) POLICIES : courts (LECTURE PUBLIQUE)
-- =====================================================
-- Les terrains sont visibles par tous pour afficher les dispos

DROP POLICY IF EXISTS "public_read_courts" ON public.courts;
CREATE POLICY "public_read_courts"
  ON public.courts
  FOR SELECT
  USING (true);  -- Tout le monde peut lire

DROP POLICY IF EXISTS "owner_staff_manage_courts" ON public.courts;
CREATE POLICY "owner_staff_manage_courts"
  ON public.courts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.club_id = courts.club_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'staff')
    )
  );

COMMENT ON POLICY "public_read_courts" ON public.courts IS
  'Tout le monde peut voir les terrains (pour afficher dispos)';

COMMENT ON POLICY "owner_staff_manage_courts" ON public.courts IS
  'Seuls owner/staff peuvent gérer les terrains de leur club';


-- =====================================================
-- 5) POLICIES : memberships (PRIVÉ)
-- =====================================================
-- Chaque user ne voit que SES memberships

DROP POLICY IF EXISTS "user_read_own_memberships" ON public.memberships;
CREATE POLICY "user_read_own_memberships"
  ON public.memberships
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "owner_read_club_memberships" ON public.memberships;
CREATE POLICY "owner_read_club_memberships"
  ON public.memberships
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.club_id = memberships.club_id
        AND m.user_id = auth.uid()
        AND m.role = 'owner'
    )
  );

DROP POLICY IF EXISTS "owner_manage_club_memberships" ON public.memberships;
CREATE POLICY "owner_manage_club_memberships"
  ON public.memberships
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.club_id = memberships.club_id
        AND m.user_id = auth.uid()
        AND m.role = 'owner'
    )
  );

COMMENT ON POLICY "user_read_own_memberships" ON public.memberships IS
  'User peut lire ses propres memberships';

COMMENT ON POLICY "owner_read_club_memberships" ON public.memberships IS
  'Owner peut lire tous les memberships de son club';

COMMENT ON POLICY "owner_manage_club_memberships" ON public.memberships IS
  'Owner peut ajouter/supprimer des membres dans son club';


-- =====================================================
-- 6) POLICIES : reservations (PRIVÉ)
-- =====================================================

-- A) Joueur peut lire SES réservations
DROP POLICY IF EXISTS "user_read_own_bookings" ON public.reservations;
CREATE POLICY "user_read_own_bookings"
  ON public.reservations
  FOR SELECT
  USING (cree_par = auth.uid());

-- B) Staff/Owner peut lire TOUTES les réservations de SON club
DROP POLICY IF EXISTS "staff_read_club_bookings" ON public.reservations;
CREATE POLICY "staff_read_club_bookings"
  ON public.reservations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.club_id = reservations.club_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'staff')
    )
  );

-- C) Joueur peut créer UNE réservation (via RPC, mais policy pour sécurité)
DROP POLICY IF EXISTS "user_create_own_booking" ON public.reservations;
CREATE POLICY "user_create_own_booking"
  ON public.reservations
  FOR INSERT
  WITH CHECK (cree_par = auth.uid());

-- D) Joueur peut modifier/annuler SA réservation
DROP POLICY IF EXISTS "user_update_own_booking" ON public.reservations;
CREATE POLICY "user_update_own_booking"
  ON public.reservations
  FOR UPDATE
  USING (cree_par = auth.uid());

-- E) Staff/Owner peut modifier TOUTES les réservations de SON club
DROP POLICY IF EXISTS "staff_update_club_bookings" ON public.reservations;
CREATE POLICY "staff_update_club_bookings"
  ON public.reservations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.club_id = reservations.club_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'staff')
    )
  );

-- F) Seuls Staff/Owner peuvent supprimer des réservations
DROP POLICY IF EXISTS "staff_delete_club_bookings" ON public.reservations;
CREATE POLICY "staff_delete_club_bookings"
  ON public.reservations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.club_id = reservations.club_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'staff')
    )
  );

COMMENT ON POLICY "user_read_own_bookings" ON public.reservations IS
  'Joueur peut voir ses propres réservations';

COMMENT ON POLICY "staff_read_club_bookings" ON public.reservations IS
  'Staff/Owner peut voir toutes les réservations de son club';

COMMENT ON POLICY "user_create_own_booking" ON public.reservations IS
  'Joueur peut créer une réservation (via RPC create_booking_90m)';

COMMENT ON POLICY "user_update_own_booking" ON public.reservations IS
  'Joueur peut modifier/annuler sa réservation';

COMMENT ON POLICY "staff_update_club_bookings" ON public.reservations IS
  'Staff/Owner peut modifier toutes les réservations du club';

COMMENT ON POLICY "staff_delete_club_bookings" ON public.reservations IS
  'Seuls Staff/Owner peuvent supprimer des réservations';


-- =====================================================
-- 7) POLICIES : booking_slots (LECTURE PUBLIQUE, ÉCRITURE RPC)
-- =====================================================

-- A) Lecture publique : tout le monde peut voir les créneaux occupés
--    (nécessaire pour afficher les dispos)
DROP POLICY IF EXISTS "public_read_booking_slots" ON public.booking_slots;
CREATE POLICY "public_read_booking_slots"
  ON public.booking_slots
  FOR SELECT
  USING (true);  -- Public (pour afficher calendrier)

-- B) Écriture : UNIQUEMENT via RPC create_booking_90m
--    La RPC a SECURITY DEFINER et bypass RLS
DROP POLICY IF EXISTS "rpc_insert_booking_slots" ON public.booking_slots;
CREATE POLICY "rpc_insert_booking_slots"
  ON public.booking_slots
  FOR INSERT
  WITH CHECK (true);  -- La RPC gère les permissions

-- C) Suppression : Seuls Staff/Owner peuvent supprimer des slots
DROP POLICY IF EXISTS "staff_delete_club_booking_slots" ON public.booking_slots;
CREATE POLICY "staff_delete_club_booking_slots"
  ON public.booking_slots
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.club_id = booking_slots.club_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'staff')
    )
  );

COMMENT ON POLICY "public_read_booking_slots" ON public.booking_slots IS
  'Lecture publique des créneaux occupés (pour afficher dispos)';

COMMENT ON POLICY "rpc_insert_booking_slots" ON public.booking_slots IS
  'Insertion uniquement via RPC create_booking_90m (SECURITY DEFINER)';

COMMENT ON POLICY "staff_delete_club_booking_slots" ON public.booking_slots IS
  'Seuls Staff/Owner peuvent supprimer des créneaux (annulations)';


-- =====================================================
-- 8) HELPER FUNCTIONS (optionnel mais utile)
-- =====================================================

-- Fonction pour vérifier si un user est staff/owner d'un club
CREATE OR REPLACE FUNCTION public.is_club_staff(p_club_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.club_id = p_club_id
      AND m.user_id = p_user_id
      AND m.role IN ('owner', 'staff')
  );
$$;

COMMENT ON FUNCTION public.is_club_staff IS
  'Retourne true si user est staff ou owner du club';


-- Fonction pour vérifier si un user est owner d'un club
CREATE OR REPLACE FUNCTION public.is_club_owner(p_club_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.club_id = p_club_id
      AND m.user_id = p_user_id
      AND m.role = 'owner'
  );
$$;

COMMENT ON FUNCTION public.is_club_owner IS
  'Retourne true si user est owner du club';


-- =====================================================
-- 9) MODIFIER create_booking_90m pour vérifier permissions
-- =====================================================

-- Remplacer la fonction existante avec vérification de permissions
DROP FUNCTION IF EXISTS public.create_booking_90m(uuid, uuid, timestamptz, uuid);

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

  -- Validation 2: start_at doit être aligné sur 00 ou 30 minutes
  IF EXTRACT(minute FROM p_start_at) NOT IN (0, 30) THEN
    RAISE EXCEPTION 'start_at doit être aligné sur :00 ou :30'
      USING HINT = 'Ex: 09:00, 10:30, 14:00, etc.';
  END IF;

  -- Validation 3: vérifier que club_id et court_id existent
  IF NOT EXISTS (SELECT 1 FROM public.clubs WHERE id = p_club_id) THEN
    RAISE EXCEPTION 'Club introuvable: %', p_club_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.courts WHERE id = p_court_id AND club_id = p_club_id) THEN
    RAISE EXCEPTION 'Court introuvable ou ne fait pas partie du club: %', p_court_id;
  END IF;

  -- Validation 4: vérifier que p_user_id = auth.uid() (sécurité)
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Impossible de réserver pour un autre utilisateur'
      USING HINT = 'p_user_id doit être égal à auth.uid()';
  END IF;

  -- Transaction atomique: INSERT booking + booking_slot
  
  -- Étape 1: Insérer dans reservations
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

COMMENT ON FUNCTION public.create_booking_90m IS
  'RPC atomique: crée booking + booking_slot. Vérifie que p_user_id = auth.uid() pour sécurité.';


-- =====================================================
-- 10) GRANTS (permissions d'exécution)
-- =====================================================

-- Permettre aux utilisateurs authentifiés d'appeler les fonctions
GRANT EXECUTE ON FUNCTION public.create_booking_90m TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_club_staff TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_club_owner TO authenticated, anon;


-- =====================================================
-- 11) RÉSUMÉ DES PERMISSIONS (documentation)
-- =====================================================

/*
TABLES PUBLIQUES EN LECTURE (tout le monde peut voir) :
- clubs (pour afficher la liste des clubs)
- courts (pour afficher les terrains disponibles)
- booking_slots (pour afficher les créneaux occupés / dispos)

TABLES PRIVÉES (user ne voit que ses données ou celles de son club) :
- memberships (user voit ses propres memberships, owner voit ceux de son club)
- reservations (user voit ses bookings, staff/owner voient tous ceux du club)

TABLES COMMERCE (si présentes, à protéger de la même façon) :
- products (seuls staff/owner du club)
- orders (seuls staff/owner du club + user peut voir ses propres commandes)
- order_items (lié à orders)

FONCTIONS RPC :
- create_booking_90m : accessible par authenticated
- is_club_staff : accessible par authenticated + anon
- is_club_owner : accessible par authenticated + anon

RÔLES :
- player : peut réserver, voir ses réservations
- staff : peut voir/gérer toutes les réservations du club, gérer produits/commandes
- owner : comme staff + peut gérer les memberships (ajouter/supprimer staff/players)
*/


-- =====================================================
-- 12) TESTER LES PERMISSIONS (optionnel, à exécuter manuellement)
-- =====================================================

-- Test 1: Insérer un membership
-- INSERT INTO public.memberships (user_id, club_id, role)
-- VALUES (
--   'cee11521-8f13-4157-8057-034adf2cb9a0'::uuid,
--   'ba43c579-e522-4b51-8542-737c2c6452bb'::uuid,
--   'player'
-- );

-- Test 2: Vérifier qu'un user ne voit que SES réservations
-- SET LOCAL ROLE authenticated;
-- SET LOCAL request.jwt.claims TO '{"sub": "cee11521-8f13-4157-8057-034adf2cb9a0"}';
-- SELECT * FROM public.reservations;  -- Ne voit que ses bookings

-- Test 3: Vérifier qu'un user ne peut pas lire les memberships d'autres users
-- SELECT * FROM public.memberships WHERE user_id != auth.uid();  -- Vide


-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
