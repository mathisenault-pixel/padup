/**
 * Script de correction du décalage timezone dans les bookings
 * 
 * PROBLÈME:
 * Les bookings ont été créés avec slot_start/slot_end en "heure locale + Z"
 * Ex: 08:00 Paris stocké comme "2026-02-15T08:00:00+00:00" (08:00 UTC)
 * 
 * ATTENDU:
 * 08:00 Paris devrait être stocké comme "2026-02-15T07:00:00+00:00" (07:00 UTC car Paris = UTC+1)
 * 
 * CORRECTION:
 * Soustraire 1 heure à tous les slot_start et slot_end
 */

-- Backup: Créer une table temporaire avec les anciennes valeurs
CREATE TEMP TABLE bookings_backup_timezone AS
SELECT id, slot_start, slot_end, created_at
FROM public.bookings;

-- Afficher un aperçu avant correction
SELECT 
  id,
  slot_start AS old_slot_start,
  slot_start - INTERVAL '1 hour' AS new_slot_start,
  slot_end AS old_slot_end,
  slot_end - INTERVAL '1 hour' AS new_slot_end
FROM public.bookings
LIMIT 5;

-- ⚠️ ATTENTION: Décommentez la ligne suivante pour appliquer la correction
-- UPDATE public.bookings
-- SET 
--   slot_start = slot_start - INTERVAL '1 hour',
--   slot_end = slot_end - INTERVAL '1 hour';

-- Vérifier après correction
-- SELECT 
--   b.id,
--   bb.slot_start AS old_slot_start,
--   b.slot_start AS new_slot_start,
--   bb.slot_end AS old_slot_end,
--   b.slot_end AS new_slot_end
-- FROM public.bookings b
-- JOIN bookings_backup_timezone bb ON b.id = bb.id
-- LIMIT 5;

/**
 * INSTRUCTIONS D'UTILISATION:
 * 
 * 1. Exécuter ce script dans Supabase SQL Editor pour voir l'aperçu
 * 2. Vérifier que les nouvelles heures correspondent aux heures locales attendues
 * 3. Décommenter la ligne UPDATE pour appliquer la correction
 * 4. Vérifier avec la dernière SELECT que tout est correct
 * 
 * ROLLBACK si nécessaire:
 * UPDATE public.bookings b
 * SET 
 *   slot_start = bb.slot_start,
 *   slot_end = bb.slot_end
 * FROM bookings_backup_timezone bb
 * WHERE b.id = bb.id;
 */
