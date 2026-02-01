-- ===== Script d'application rapide Migration 019 =====
-- À copier-coller dans le SQL Editor Supabase
-- Dashboard: https://supabase.com/dashboard/project/eohioutmqfqdehfxgjgv/sql/new

-- ===== MVP : lecture publique clubs / courts / time_slots =====

-- CLUBS
alter table public.clubs enable row level security;

drop policy if exists "mvp_read_clubs" on public.clubs;

create policy "mvp_read_clubs"
on public.clubs
for select
to anon, authenticated
using (true);

-- COURTS
alter table public.courts enable row level security;

drop policy if exists "mvp_read_courts" on public.courts;

create policy "mvp_read_courts"
on public.courts
for select
to anon, authenticated
using (true);

-- TIME SLOTS
alter table public.time_slots enable row level security;

drop policy if exists "mvp_read_time_slots" on public.time_slots;

create policy "mvp_read_time_slots"
on public.time_slots
for select
to anon, authenticated
using (true);

-- ===== VERIFICATION =====
-- Vérifier que les policies sont actives:

SELECT 
  schemaname, 
  tablename, 
  policyname, 
  roles, 
  cmd, 
  qual
FROM pg_policies
WHERE tablename IN ('clubs', 'courts', 'time_slots')
ORDER BY tablename, policyname;

-- Résultat attendu:
-- public | clubs      | mvp_read_clubs      | {anon,authenticated} | SELECT | true
-- public | courts     | mvp_read_courts     | {anon,authenticated} | SELECT | true
-- public | time_slots | mvp_read_time_slots | {anon,authenticated} | SELECT | true
