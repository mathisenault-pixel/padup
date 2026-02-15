-- ============================================
-- Migration 024: Fix Courts RLS pour lecture publique
-- Description: Nettoyer les policies conflictuelles et permettre
--              la lecture publique de TOUS les courts (is_active ou non)
-- ============================================

-- Supprimer toutes les anciennes policies de lecture publique
DROP POLICY IF EXISTS "mvp_read_courts" ON public.courts;
DROP POLICY IF EXISTS "public can view active courts" ON public.courts;
DROP POLICY IF EXISTS "club members can read all courts" ON public.courts;

-- Créer UNE SEULE policy de lecture publique (tous les courts)
CREATE POLICY "anyone_can_read_courts"
  ON public.courts
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Garder les policies de modification pour les membres du club
-- (ces policies restent inchangées et fonctionnent correctement)

-- Vérification
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'courts'
    AND policyname = 'anyone_can_read_courts';
  
  IF policy_count = 1 THEN
    RAISE NOTICE '✅ Policy "anyone_can_read_courts" créée avec succès';
  ELSE
    RAISE WARNING '⚠️ Problème lors de la création de la policy';
  END IF;
END $$;
