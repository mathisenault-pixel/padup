-- =====================================================
-- Migration 022: Club Invitations System
-- Objectif: Système d'invitation sécurisé pour les clubs
-- =====================================================

-- =====================================================
-- PARTIE 1: Table club_invites
-- =====================================================

CREATE TABLE IF NOT EXISTS public.club_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_club_invites_token ON public.club_invites(token);
CREATE INDEX IF NOT EXISTS idx_club_invites_club_id ON public.club_invites(club_id);

-- Activer RLS
ALTER TABLE public.club_invites ENABLE ROW LEVEL SECURITY;

-- Commentaires
COMMENT ON TABLE public.club_invites IS 'Invitations pour rejoindre un club';
COMMENT ON COLUMN public.club_invites.token IS 'Token unique pour l''invitation';
COMMENT ON COLUMN public.club_invites.expires_at IS 'Date d''expiration de l''invitation';
COMMENT ON COLUMN public.club_invites.used_at IS 'Date d''utilisation (NULL = non utilisée)';

-- =====================================================
-- PARTIE 2: Policies RLS sur club_invites
-- =====================================================

-- Policy: Lire les invitations non utilisées (pour validation)
CREATE POLICY "read unused invites"
  ON public.club_invites
  FOR SELECT
  TO authenticated
  USING (used_at IS NULL AND expires_at > NOW());

-- Policy: Les membres du club peuvent créer des invitations
CREATE POLICY "members can create invites"
  ON public.club_invites
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_memberships m
      WHERE m.user_id = auth.uid()
        AND m.club_id = club_invites.club_id
        AND m.role = 'admin'
    )
  );

-- Policy: Les membres du club peuvent voir leurs invitations
CREATE POLICY "members can view club invites"
  ON public.club_invites
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.club_memberships m
      WHERE m.user_id = auth.uid()
        AND m.club_id = club_invites.club_id
    )
  );

-- =====================================================
-- PARTIE 3: RPC redeem_club_invite
-- =====================================================

CREATE OR REPLACE FUNCTION public.redeem_club_invite(p_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inv public.club_invites%ROWTYPE;
  v_club_id UUID;
BEGIN
  -- Vérifier authentification
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Récupérer l'invitation
  SELECT * INTO v_inv
  FROM public.club_invites
  WHERE token = p_token
  LIMIT 1;

  -- Vérifier que l'invitation existe
  IF v_inv.id IS NULL THEN
    RAISE EXCEPTION 'Invitation non trouvée';
  END IF;

  -- Vérifier que l'invitation n'a pas déjà été utilisée
  IF v_inv.used_at IS NOT NULL THEN
    RAISE EXCEPTION 'Invitation déjà utilisée';
  END IF;

  -- Vérifier que l'invitation n'a pas expiré
  IF v_inv.expires_at < NOW() THEN
    RAISE EXCEPTION 'Invitation expirée';
  END IF;

  -- Créer le membership (on conflict do nothing si déjà membre)
  INSERT INTO public.club_memberships (club_id, user_id, role)
  VALUES (v_inv.club_id, auth.uid(), v_inv.role)
  ON CONFLICT (user_id, club_id) DO NOTHING;

  -- Marquer l'invitation comme utilisée
  UPDATE public.club_invites
  SET used_at = NOW(),
      used_by = auth.uid()
  WHERE id = v_inv.id;

  -- Retourner l'ID du club
  RETURN v_inv.club_id;
END;
$$;

-- Permissions sur la fonction RPC
REVOKE ALL ON FUNCTION public.redeem_club_invite(TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.redeem_club_invite(TEXT) TO authenticated;

-- Commentaire
COMMENT ON FUNCTION public.redeem_club_invite(TEXT) IS 'Utilise une invitation pour rejoindre un club';

-- =====================================================
-- PARTIE 4: Fonction helper pour valider un token
-- =====================================================

CREATE OR REPLACE FUNCTION public.validate_club_invite(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inv public.club_invites%ROWTYPE;
  v_club public.clubs%ROWTYPE;
  v_result JSON;
BEGIN
  -- Récupérer l'invitation
  SELECT * INTO v_inv
  FROM public.club_invites
  WHERE token = p_token
  LIMIT 1;

  -- Si pas trouvée
  IF v_inv.id IS NULL THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Invitation non trouvée'
    );
  END IF;

  -- Si déjà utilisée
  IF v_inv.used_at IS NOT NULL THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Invitation déjà utilisée'
    );
  END IF;

  -- Si expirée
  IF v_inv.expires_at < NOW() THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Invitation expirée'
    );
  END IF;

  -- Récupérer les infos du club
  SELECT * INTO v_club
  FROM public.clubs
  WHERE id = v_inv.club_id;

  -- Retourner les infos
  RETURN json_build_object(
    'valid', true,
    'club_id', v_club.id,
    'club_name', v_club.name,
    'club_city', v_club.city,
    'club_code', v_club.club_code,
    'role', v_inv.role,
    'expires_at', v_inv.expires_at
  );
END;
$$;

-- Permissions
REVOKE ALL ON FUNCTION public.validate_club_invite(TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.validate_club_invite(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_club_invite(TEXT) TO authenticated;

-- Commentaire
COMMENT ON FUNCTION public.validate_club_invite(TEXT) IS 'Valide un token d''invitation et retourne les infos du club';

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================

DO $$
DECLARE
  invites_rls BOOLEAN;
  invites_count INTEGER;
BEGIN
  -- Vérifier RLS
  SELECT relrowsecurity INTO invites_rls FROM pg_class WHERE relname = 'club_invites';
  
  -- Compter les invitations
  SELECT COUNT(*) INTO invites_count FROM public.club_invites;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration 022: Club Invites';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS club_invites: %', invites_rls;
  RAISE NOTICE 'Invitations existantes: %', invites_count;
  RAISE NOTICE 'Fonction redeem_club_invite: OK';
  RAISE NOTICE 'Fonction validate_club_invite: OK';
  RAISE NOTICE '========================================';
  
  IF invites_rls THEN
    RAISE NOTICE '✅ Système d''invitations prêt !';
  ELSE
    RAISE WARNING '⚠️ RLS pas activé sur club_invites !';
  END IF;
END $$;
