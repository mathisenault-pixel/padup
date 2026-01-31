# Test PGRST205 Fix

## Changements appliqués

1. **Client Supabase centralisé** (`lib/supabaseClient.ts`)
   - Configuration explicite : `db: { schema: "public" }`
   - Logs d'initialisation

2. **Page availability** (`app/(public)/availability/page.tsx`)
   - Utilise le client centralisé
   - Logs avant chaque query

3. **API bookings** (`app/api/bookings/route.ts`)
   - Client avec config explicite
   - Logs avant chaque insert

## Tester

1. Ouvrir : http://localhost:3000/availability
2. Console navigateur (Cmd+Option+J)
3. Chercher les logs :
   - `[SUPABASE CLIENT INIT]`
   - `[QUERY START]`
   - `[SUPABASE SUCCESS - loadBooked]` ou `[SUPABASE ERROR - loadBooked]`

## Si PGRST205 persiste

Vérifier dans Supabase Dashboard :
- Table API > Settings > API > Schemas exposed : `public` coché
- SQL Editor : `SELECT * FROM public.reservations LIMIT 1;`
