-- ============================================
-- Migration: Système d'abonnement Club (sans paiement)
-- Description: Plans free / pro / premium pour les clubs
-- ============================================

-- 1. Ajouter les colonnes d'abonnement
ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium'));

ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Index pour filtrer par plan
CREATE INDEX IF NOT EXISTS clubs_plan_idx ON public.clubs(plan);

-- 3. Commentaires
COMMENT ON COLUMN public.clubs.plan IS 'Plan d''abonnement du club : free, pro ou premium';
COMMENT ON COLUMN public.clubs.plan_started_at IS 'Date de début du plan actuel';

-- 4. Vue pour afficher les limitations par plan (aide au développement)
CREATE OR REPLACE VIEW club_plan_features AS
SELECT 
  c.id,
  c.name,
  c.plan,
  c.plan_started_at,
  CASE c.plan
    WHEN 'free' THEN 1
    WHEN 'pro' THEN 999
    WHEN 'premium' THEN 999
  END AS max_courts,
  CASE c.plan
    WHEN 'free' THEN false
    WHEN 'pro' THEN true
    WHEN 'premium' THEN true
  END AS has_advanced_stats,
  CASE c.plan
    WHEN 'free' THEN false
    WHEN 'pro' THEN false
    WHEN 'premium' THEN true
  END AS is_premium_badge
FROM public.clubs c;

COMMENT ON VIEW club_plan_features IS 'Vue helper pour les features par plan (pour debug/dev)';











