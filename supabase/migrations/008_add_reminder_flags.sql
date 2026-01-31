-- ============================================
-- Migration: Ajout des flags de rappels automatiques
-- Description: Pour éviter les doublons d'emails de rappel
-- ============================================

-- 1. Ajouter les colonnes de suivi des rappels
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS reminder_j1_sent BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS reminder_h2_sent BOOLEAN NOT NULL DEFAULT false;

-- 2. Ajouter les timestamps d'envoi (optionnel, pour debug)
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS reminder_j1_sent_at TIMESTAMPTZ;

ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS reminder_h2_sent_at TIMESTAMPTZ;

-- 3. Index pour optimiser les requêtes du cron
CREATE INDEX IF NOT EXISTS reservations_reminders_j1_idx 
  ON public.reservations(date, start_time, reminder_j1_sent) 
  WHERE status = 'confirmed' AND reminder_j1_sent = false;

CREATE INDEX IF NOT EXISTS reservations_reminders_h2_idx 
  ON public.reservations(date, start_time, reminder_h2_sent) 
  WHERE status = 'confirmed' AND reminder_h2_sent = false;

-- 4. Commentaires
COMMENT ON COLUMN public.reservations.reminder_j1_sent IS 'Rappel J-1 (24h avant) envoyé ?';
COMMENT ON COLUMN public.reservations.reminder_h2_sent IS 'Rappel H-2 (2h avant) envoyé ?';
COMMENT ON COLUMN public.reservations.reminder_j1_sent_at IS 'Date/heure d''envoi du rappel J-1';
COMMENT ON COLUMN public.reservations.reminder_h2_sent_at IS 'Date/heure d''envoi du rappel H-2';











