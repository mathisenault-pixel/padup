-- ============================================
-- NETTOYAGE (si table club_requests existe déjà avec erreur)
-- ============================================
-- À exécuter UNIQUEMENT si la migration précédente a partiellement tourné

-- Option 1: DROP complet (DEV uniquement, perte de données)
DROP TABLE IF EXISTS public.club_requests CASCADE;

-- Puis exécuter SQL_MIGRATION_READY.sql


-- ============================================
-- Option 2: ALTER (PROD, conserve les données)
-- ============================================
-- Si vous avez déjà des données et voulez les garder:

-- 1. Supprimer l'index/constraint problématique (si existe)
DROP INDEX IF EXISTS unique_club_requests_email_per_day CASCADE;
ALTER TABLE public.club_requests DROP CONSTRAINT IF EXISTS unique_email_per_day CASCADE;

-- 2. Ajouter la colonne générée (si pas déjà présente)
ALTER TABLE public.club_requests 
  ADD COLUMN IF NOT EXISTS request_day DATE GENERATED ALWAYS AS (created_at::date) STORED;

-- 3. Créer la contrainte unique
ALTER TABLE public.club_requests 
  ADD CONSTRAINT unique_email_per_day UNIQUE (contact_email, request_day);

-- 4. Ajouter l'index sur request_day
CREATE INDEX IF NOT EXISTS idx_club_requests_day ON public.club_requests(request_day);

-- 5. Ajouter website si manquant
ALTER TABLE public.club_requests 
  ADD COLUMN IF NOT EXISTS website TEXT;

-- 6. Ajouter commentaires
COMMENT ON COLUMN public.club_requests.request_day IS 'Date (jour uniquement) - pour contrainte anti-spam';
COMMENT ON CONSTRAINT unique_email_per_day ON public.club_requests IS 'Anti-spam: max 1 demande par email par jour';


-- ============================================
-- RECOMMANDATION
-- ============================================
-- En DEV: Utiliser Option 1 (DROP + recréer)
-- En PROD: Utiliser Option 2 (ALTER pour conserver données)
