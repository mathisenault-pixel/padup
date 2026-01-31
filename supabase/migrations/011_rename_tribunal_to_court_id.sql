-- Migration: Renommer "Identifiant du tribunal" en court_id
-- Date: 2026-01-27
-- Description: Supprime les espaces dans le nom de colonne pour éviter les erreurs

-- 1. Renommer la colonne si elle existe avec l'ancien nom
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reservations' 
        AND column_name = 'Identifiant du tribunal'
    ) THEN
        ALTER TABLE public.reservations 
        RENAME COLUMN "Identifiant du tribunal" TO court_id;
        
        RAISE NOTICE 'Colonne "Identifiant du tribunal" renommée en court_id';
    ELSE
        RAISE NOTICE 'Colonne déjà renommée ou n''existe pas';
    END IF;
END $$;

-- 2. Vérifier que la colonne court_id existe maintenant
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reservations' 
        AND column_name = 'court_id'
    ) THEN
        RAISE EXCEPTION 'ERREUR: La colonne court_id n''existe pas après migration';
    END IF;
END $$;

-- 3. Mettre à jour les contraintes qui référencent l'ancienne colonne (si besoin)
-- Note: Les FK et contraintes existantes sont automatiquement renommées par PostgreSQL

-- 4. Vérifier l'index sur court_id
CREATE INDEX IF NOT EXISTS idx_reservations_court_id 
ON public.reservations(court_id);

-- 5. Afficher un résumé
SELECT 
    'court_id' as column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'reservations'
AND column_name = 'court_id';
