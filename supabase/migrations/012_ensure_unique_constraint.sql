-- Migration: S'assurer que la contrainte unique existe pour éviter les doublons
-- Date: 2026-01-27
-- Description: Contrainte UNIQUE sur (court_id, slot_start, fin_de_slot)

-- 1. Vérifier si la contrainte existe déjà
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'reservations_unique_slot'
    ) THEN
        -- Créer la contrainte unique
        ALTER TABLE public.reservations
        ADD CONSTRAINT reservations_unique_slot
        UNIQUE (court_id, slot_start, fin_de_slot);
        
        RAISE NOTICE 'Contrainte unique reservations_unique_slot créée';
    ELSE
        RAISE NOTICE 'Contrainte unique reservations_unique_slot existe déjà';
    END IF;
END $$;

-- 2. Vérifier l'index associé
CREATE INDEX IF NOT EXISTS idx_reservations_unique_slot
ON public.reservations(court_id, slot_start, fin_de_slot);

-- 3. Afficher un résumé des contraintes
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.reservations'::regclass
AND conname LIKE '%unique%';
