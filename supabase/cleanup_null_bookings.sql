-- =====================================================
-- Script de nettoyage : supprimer les bookings invalides
-- =====================================================
-- Objectif : supprimer toutes les lignes dans public.bookings
-- qui ont booking_date NULL ou slot_id NULL
-- (ces lignes viennent d'anciens tests et empêchent le Realtime)
-- =====================================================

-- 1) Afficher les lignes problématiques AVANT suppression
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.bookings
  WHERE booking_date IS NULL OR slot_id IS NULL;
  
  RAISE NOTICE '⚠️ Lignes invalides trouvées : %', v_count;
  
  IF v_count > 0 THEN
    RAISE NOTICE 'Détail des lignes à supprimer :';
    RAISE NOTICE '---';
    FOR rec IN (
      SELECT id, club_id, court_id, booking_date, slot_id, status, created_at
      FROM public.bookings
      WHERE booking_date IS NULL OR slot_id IS NULL
      ORDER BY created_at DESC
      LIMIT 20
    ) LOOP
      RAISE NOTICE 'id=% | club=% | court=% | date=% | slot=% | status=%',
        rec.id, rec.club_id, rec.court_id, rec.booking_date, rec.slot_id, rec.status;
    END LOOP;
  END IF;
END $$;

-- 2) Supprimer les lignes invalides
DELETE FROM public.bookings
WHERE booking_date IS NULL OR slot_id IS NULL;

-- 3) Vérification finale
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.bookings
  WHERE booking_date IS NULL OR slot_id IS NULL;
  
  IF v_count = 0 THEN
    RAISE NOTICE '✅ Toutes les lignes invalides ont été supprimées';
  ELSE
    RAISE WARNING '⚠️ Il reste % lignes invalides', v_count;
  END IF;
  
  -- Afficher les bookings valides restants
  SELECT COUNT(*) INTO v_count FROM public.bookings;
  RAISE NOTICE 'ℹ️ Total de bookings valides : %', v_count;
END $$;

-- 4) Vérifier que les contraintes NOT NULL sont bien appliquées
DO $$
BEGIN
  -- Vérifier booking_date
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'booking_date'
      AND is_nullable = 'NO'
  ) THEN
    RAISE NOTICE '✅ booking_date est NOT NULL';
  ELSE
    RAISE WARNING '⚠️ booking_date accepte encore NULL - vérifier migration 018';
  END IF;
  
  -- Vérifier slot_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'slot_id'
      AND is_nullable = 'NO'
  ) THEN
    RAISE NOTICE '✅ slot_id est NOT NULL';
  ELSE
    RAISE WARNING '⚠️ slot_id accepte encore NULL - vérifier migration 018';
  END IF;
END $$;

-- =====================================================
-- Résultat attendu :
-- ✅ Plus aucune ligne avec booking_date NULL ou slot_id NULL
-- ✅ Les contraintes NOT NULL empêchent de futures insertions invalides
-- ✅ Le Realtime peut maintenant fonctionner correctement
-- =====================================================
