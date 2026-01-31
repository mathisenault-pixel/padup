-- ============================================
-- Migration: Contrainte unique anti double-booking (MVP)
-- Description: Empêche 2 réservations sur le même créneau
-- Note: Cette migration est obsolète, remplacée par 017_fix_reservations_columns.sql
-- ============================================

-- Cette migration ne fait rien car elle utilisait les anciennes colonnes (date, start_time)
-- La nouvelle structure utilise slot_start (timestamptz)
-- L'index unique est créé dans la migration 017

RAISE NOTICE 'Migration 016 obsolète - voir migration 017 pour la contrainte unique';
