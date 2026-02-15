import { createClient } from '@supabase/supabase-js'
import ReservationsSimple from '@/components/club/hangar/ReservationsSimple'

// Utiliser la service role key côté serveur pour bypasser RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function HangarReservationsPage() {
  // 1️⃣ Récupérer le club Hangar
  const { data: club } = await supabase
    .from('clubs')
    .select('id')
    .eq('club_code', 'HANGAR1')
    .single()

  if (!club) {
    return (
      <section className="space-y-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center">
          <div className="text-xl mb-2">⚠️ Club introuvable</div>
          <p className="text-sm text-slate-400">
            Le club avec le code HANGAR1 n'existe pas dans la base de données.
          </p>
        </div>
      </section>
    )
  }

  // 2️⃣ Charger les terrains du club
  const { data: courts } = await supabase
    .from('courts')
    .select('id, name')
    .eq('club_id', club.id)
    .order('name', { ascending: true })

  // 3️⃣ Charger les bookings d'aujourd'hui par défaut
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, club_id, court_id, slot_start, slot_end, status, created_at')
    .eq('club_id', club.id)
    .gte('slot_start', start.toISOString())
    .lte('slot_start', end.toISOString())
    .order('slot_start', { ascending: true })

  // 4️⃣ Rendre le composant client
  return (
    <ReservationsSimple
      clubId={club.id}
      bookings={bookings ?? []}
      courts={courts ?? []}
    />
  )
}
