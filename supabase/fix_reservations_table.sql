-- 🔧 FIX DÉFINITIF - Table reservations
-- À exécuter dans Supabase > SQL Editor

-- 1️⃣ CRÉER / RECRÉER LA TABLE reservations
DROP TABLE IF EXISTS public.reservations CASCADE;

CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL,
  court_id uuid NOT NULL,
  slot_start timestamptz NOT NULL,
  fin_de_slot timestamptz NOT NULL,
  cree_par uuid NOT NULL,
  statut text NOT NULL DEFAULT 'confirmé',
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Anti double-booking
  UNIQUE(court_id, slot_start)
);

-- 2️⃣ INDEX POUR PERFORMANCE
CREATE INDEX idx_reservations_court_id ON public.reservations(court_id);
CREATE INDEX idx_reservations_slot_start ON public.reservations(slot_start);
CREATE INDEX idx_reservations_club_id ON public.reservations(club_id);

-- 3️⃣ ACTIVER RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 4️⃣ SUPPRIMER LES ANCIENNES POLICIES
DROP POLICY IF EXISTS "public_read_reservations" ON public.reservations;
DROP POLICY IF EXISTS "player_insert_reservation" ON public.reservations;

-- 5️⃣ CRÉER LES POLICIES MINIMALES
-- Lecture publique (pour afficher les créneaux occupés)
CREATE POLICY "public_read_reservations"
ON public.reservations
FOR SELECT
USING (true);

-- Insertion uniquement par le créateur
CREATE POLICY "player_insert_reservation"
ON public.reservations
FOR INSERT
WITH CHECK (auth.uid() = cree_par);

-- 6️⃣ INSÉRER UNE RÉSERVATION DE TEST (17:00-17:30 le 28/01/2026)
INSERT INTO public.reservations (
  club_id, 
  court_id, 
  slot_start, 
  fin_de_slot, 
  cree_par, 
  statut
) VALUES (
  'ba43c579-e522-4b51-8542-737c2c6452bb',
  '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e',
  '2026-01-28 17:00:00+01',
  '2026-01-28 17:30:00+01',
  'cee11521-8f13-4157-8057-034adf2cb9a0',
  'confirmé'
) ON CONFLICT (court_id, slot_start) DO NOTHING;

-- ✅ VÉRIFIER QUE LA TABLE EXISTE
SELECT 
  'reservations' as table_name,
  COUNT(*) as total_reservations,
  COUNT(*) FILTER (WHERE slot_start >= NOW()) as futures
FROM public.reservations;
