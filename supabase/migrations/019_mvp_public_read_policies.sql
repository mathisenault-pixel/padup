-- ===== MVP : lecture publique clubs / courts / time_slots =====
-- Migration 019
-- Created: 2026-01-22
-- Purpose: Allow public read access to clubs, courts, and time_slots for MVP

-- ============================================
-- CLUBS - Public read access
-- ============================================
alter table public.clubs enable row level security;

drop policy if exists "mvp_read_clubs" on public.clubs;

create policy "mvp_read_clubs"
on public.clubs
for select
to anon, authenticated
using (true);

-- ============================================
-- COURTS - Public read access
-- ============================================
alter table public.courts enable row level security;

drop policy if exists "mvp_read_courts" on public.courts;

create policy "mvp_read_courts"
on public.courts
for select
to anon, authenticated
using (true);

-- ============================================
-- TIME SLOTS - Public read access
-- ============================================
alter table public.time_slots enable row level security;

drop policy if exists "mvp_read_time_slots" on public.time_slots;

create policy "mvp_read_time_slots"
on public.time_slots
for select
to anon, authenticated
using (true);

-- ============================================
-- VERIFICATION
-- ============================================
-- To verify these policies are active, run:
-- SELECT schemaname, tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('clubs', 'courts', 'time_slots');
