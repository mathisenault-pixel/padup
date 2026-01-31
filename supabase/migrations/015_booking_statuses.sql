-- =====================================================
-- Migration 015: Statuts booking (pending/confirmed/cancelled)
-- =====================================================
-- Objectif: Standardiser les statuts de réservation
-- et permettre un workflow booking complet
-- =====================================================

-- =====================================================
-- 1) MODIFIER LE TYPE statut (si ce n'est pas déjà fait)
-- =====================================================

-- Option 1: Si la colonne est déjà de type text avec CHECK
-- On supprime l'ancienne contrainte et on en crée une nouvelle

ALTER TABLE public.reservations 
  DROP CONSTRAINT IF EXISTS reservations_statut_check;

-- Ajouter la nouvelle contrainte avec les 3 statuts
ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_statut_check 
  CHECK (statut IN ('pending', 'confirmed', 'cancelled'));

-- Définir la valeur par défaut
ALTER TABLE public.reservations
  ALTER COLUMN statut SET DEFAULT 'confirmed';

COMMENT ON COLUMN public.reservations.statut IS
  'Statut de la réservation: pending (en attente paiement), confirmed (confirmée), cancelled (annulée)';


-- =====================================================
-- 2) METTRE À JOUR LES RÉSERVATIONS EXISTANTES
-- =====================================================

-- Normaliser les statuts existants (si nécessaire)
-- Remplacer "confirmé" par "confirmed"
UPDATE public.reservations
SET statut = 'confirmed'
WHERE statut = 'confirmé' OR statut = 'confirmed';

-- Si des réservations ont un statut invalide, les passer en "confirmed"
UPDATE public.reservations
SET statut = 'confirmed'
WHERE statut NOT IN ('pending', 'confirmed', 'cancelled');


-- =====================================================
-- 3) AJOUTER DES COLONNES UTILES (optionnel)
-- =====================================================

-- Ajouter une colonne pour la date d'annulation
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz DEFAULT NULL;

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS cancelled_by uuid REFERENCES auth.users(id) DEFAULT NULL;

COMMENT ON COLUMN public.reservations.cancelled_at IS
  'Date d\'annulation de la réservation (NULL si pas annulée)';

COMMENT ON COLUMN public.reservations.cancelled_by IS
  'User qui a annulé la réservation (peut être différent de created_by si annulé par staff)';


-- =====================================================
-- 4) MODIFIER create_booking_90m POUR ACCEPTER STATUS
-- =====================================================

-- Remplacer la fonction existante
DROP FUNCTION IF EXISTS public.create_booking_90m(uuid, uuid, timestamptz, uuid);

CREATE OR REPLACE FUNCTION public.create_booking_90m(
  p_club_id uuid,
  p_court_id uuid,
  p_start_at timestamptz,
  p_user_id uuid,
  p_status text DEFAULT 'confirmed'  -- Nouveau paramètre
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

  -- Validation 5: vérifier que le statut est valide
  IF p_status NOT IN ('pending', 'confirmed', 'cancelled') THEN
    RAISE EXCEPTION 'Statut invalide: %', p_status
      USING HINT = 'Statut doit être: pending, confirmed ou cancelled';
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
    p_status
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
    'status', p_status,
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
  'RPC atomique: crée booking + booking_slot avec statut (pending/confirmed/cancelled). Vérifie auth.uid().';

-- Grant execute
GRANT EXECUTE ON FUNCTION public.create_booking_90m TO authenticated;


-- =====================================================
-- 5) CRÉER FONCTION ANNULATION
-- =====================================================

CREATE OR REPLACE FUNCTION public.cancel_booking(
  p_booking_id uuid,
  p_cancelled_by uuid DEFAULT auth.uid()
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking record;
  v_is_staff boolean;
  v_result json;
BEGIN
  -- Récupérer la réservation
  SELECT * INTO v_booking
  FROM public.reservations
  WHERE identifiant = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Réservation introuvable: %', p_booking_id;
  END IF;

  -- Vérifier les permissions
  -- Option 1: User annule sa propre réservation
  IF v_booking.cree_par = auth.uid() THEN
    -- OK, le user peut annuler sa propre réservation
  ELSE
    -- Option 2: Staff/Owner du club peut annuler n'importe quelle réservation
    SELECT public.is_club_staff(v_booking.club_id, auth.uid()) INTO v_is_staff;
    
    IF NOT v_is_staff THEN
      RAISE EXCEPTION 'Permission refusée'
        USING HINT = 'Vous ne pouvez annuler que vos propres réservations';
    END IF;
  END IF;

  -- Vérifier que la réservation n'est pas déjà annulée
  IF v_booking.statut = 'cancelled' THEN
    RAISE EXCEPTION 'Réservation déjà annulée';
  END IF;

  -- Mettre à jour le statut
  UPDATE public.reservations
  SET 
    statut = 'cancelled',
    cancelled_at = now(),
    cancelled_by = p_cancelled_by
  WHERE identifiant = p_booking_id;

  -- Supprimer le booking_slot (libère le créneau)
  DELETE FROM public.booking_slots
  WHERE booking_id = p_booking_id;

  -- Construire la réponse
  v_result := json_build_object(
    'success', true,
    'booking_id', p_booking_id,
    'status', 'cancelled',
    'cancelled_at', now(),
    'cancelled_by', p_cancelled_by
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur lors de l\'annulation: %', SQLERRM;
END;
$$;

COMMENT ON FUNCTION public.cancel_booking IS
  'Annule une réservation (user ou staff/owner). Supprime le booking_slot pour libérer le créneau.';

-- Grant execute
GRANT EXECUTE ON FUNCTION public.cancel_booking TO authenticated;


-- =====================================================
-- 6) VUES UTILES
-- =====================================================

-- Vue pour afficher les réservations avec détails
CREATE OR REPLACE VIEW public.v_bookings_detailed AS
SELECT 
  r.identifiant AS booking_id,
  r.club_id,
  c.name AS club_name,
  r.court_id,
  ct.name AS court_name,
  r.slot_start,
  r.fin_de_slot AS slot_end,
  r.statut AS status,
  r.cree_par AS created_by,
  r.cree_a AS created_at,
  r.cancelled_at,
  r.cancelled_by,
  bs.id AS slot_id
FROM public.reservations r
JOIN public.clubs c ON c.id = r.club_id
JOIN public.courts ct ON ct.id = r.court_id
LEFT JOIN public.booking_slots bs ON bs.booking_id = r.identifiant
ORDER BY r.slot_start DESC;

COMMENT ON VIEW public.v_bookings_detailed IS
  'Vue complète des réservations avec détails club/court';


-- =====================================================
-- 7) INDEXES DE PERFORMANCE
-- =====================================================

-- Index sur statut (pour filtrer par statut)
CREATE INDEX IF NOT EXISTS idx_reservations_statut 
  ON public.reservations (statut);

-- Index sur cancelled_at (pour requêtes d'historique)
CREATE INDEX IF NOT EXISTS idx_reservations_cancelled_at 
  ON public.reservations (cancelled_at) 
  WHERE cancelled_at IS NOT NULL;

-- Index composite pour recherches courantes
CREATE INDEX IF NOT EXISTS idx_reservations_user_status 
  ON public.reservations (cree_par, statut);


-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================

/*
RÉSUMÉ:
✅ Statuts standardisés: pending, confirmed, cancelled
✅ Valeur par défaut: confirmed
✅ Colonnes cancelled_at, cancelled_by ajoutées
✅ create_booking_90m accepte p_status
✅ cancel_booking créée (user ou staff/owner)
✅ Vue v_bookings_detailed
✅ Indexes de performance

WORKFLOW:
1. Joueur réserve → create_booking_90m(..., 'confirmed')
2. Joueur annule → cancel_booking(booking_id)
3. Staff annule → cancel_booking(booking_id) (via membership check)
*/
