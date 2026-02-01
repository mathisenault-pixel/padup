-- =====================================================
-- Script pour obtenir les vrais UUIDs des clubs et courts
-- À exécuter dans Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CLUBS: Récupérer les UUIDs
-- =====================================================

SELECT 
  id,
  name,
  CASE 
    WHEN name LIKE '%Hangar%' THEN '→ Utiliser pour CLUB_ID_MAP[''1'']'
    WHEN name LIKE '%Paul%' OR name LIKE '%Louis%' THEN '→ Utiliser pour CLUB_ID_MAP[''2'']'
    WHEN name LIKE '%ZE%' OR name LIKE '%Padel%' THEN '→ Utiliser pour CLUB_ID_MAP[''3'']'
    WHEN name LIKE '%QG%' THEN '→ Utiliser pour CLUB_ID_MAP[''4'']'
    ELSE '→ Autre club'
  END as mapping_instruction
FROM public.clubs
ORDER BY name;

-- =====================================================
-- 2. COURTS: Récupérer les UUIDs par club
-- =====================================================

SELECT 
  c.id as court_id,
  c.club_id,
  cl.name as club_name,
  c.name as court_name,
  CASE 
    WHEN c.name LIKE '%1%' OR c.name LIKE 'Terrain 1%' THEN '→ Terrain 1'
    WHEN c.name LIKE '%2%' OR c.name LIKE 'Terrain 2%' THEN '→ Terrain 2'
    WHEN c.name LIKE '%3%' OR c.name LIKE 'Terrain 3%' THEN '→ Terrain 3'
    WHEN c.name LIKE '%4%' OR c.name LIKE 'Terrain 4%' THEN '→ Terrain 4'
    WHEN c.name LIKE '%5%' OR c.name LIKE 'Terrain 5%' THEN '→ Terrain 5'
    WHEN c.name LIKE '%6%' OR c.name LIKE 'Terrain 6%' THEN '→ Terrain 6'
    WHEN c.name LIKE '%7%' OR c.name LIKE 'Terrain 7%' THEN '→ Terrain 7'
    WHEN c.name LIKE '%8%' OR c.name LIKE 'Terrain 8%' THEN '→ Terrain 8'
    ELSE '→ Autre terrain'
  END as mapping_instruction
FROM public.courts c
JOIN public.clubs cl ON cl.id = c.club_id
ORDER BY cl.name, c.name;

-- =====================================================
-- 3. FORMAT TYPESCRIPT pour copier-coller directement
-- =====================================================

-- Pour CLUB_ID_MAP:
SELECT 
  '  ''' || ROW_NUMBER() OVER (ORDER BY name) || ''': ''' || id || ''', // ' || name as typescript_line
FROM public.clubs
ORDER BY name;

-- Pour COURT_ID_MAP (par club):
DO $$
DECLARE
  club_record RECORD;
  court_record RECORD;
  club_idx INTEGER := 1;
  court_idx INTEGER;
BEGIN
  FOR club_record IN 
    SELECT id, name FROM public.clubs ORDER BY name
  LOOP
    RAISE NOTICE '  ''%'': { // %', club_idx, club_record.name;
    
    court_idx := 1;
    FOR court_record IN
      SELECT id, name FROM public.courts 
      WHERE club_id = club_record.id 
      ORDER BY name
    LOOP
      RAISE NOTICE '    %: ''%'', // %', court_idx, court_record.id, court_record.name;
      court_idx := court_idx + 1;
    END LOOP;
    
    RAISE NOTICE '  },';
    club_idx := club_idx + 1;
  END LOOP;
END $$;

-- =====================================================
-- 4. VÉRIFICATION: Compter clubs et courts
-- =====================================================

SELECT 
  'Total clubs' as info,
  COUNT(*) as count
FROM public.clubs
UNION ALL
SELECT 
  'Total courts' as info,
  COUNT(*) as count
FROM public.courts;

-- =====================================================
-- INSTRUCTIONS D'UTILISATION
-- =====================================================

-- 1. Exécuter ce script dans Supabase SQL Editor
-- 2. Copier les UUIDs depuis la section 1 (CLUBS)
-- 3. Mettre à jour CLUB_ID_MAP dans reserver/page.tsx
-- 4. Copier les UUIDs depuis la section 2 (COURTS)
-- 5. Mettre à jour COURT_ID_MAP dans reserver/page.tsx
-- 6. Tester une réservation → Vérifier logs → isUUID: true

-- Si les tables sont vides, créer d'abord les clubs et courts:
-- INSERT INTO public.clubs (name, ...) VALUES ('Le Hangar Sport & Co', ...);
-- INSERT INTO public.courts (club_id, name, ...) VALUES (...);
