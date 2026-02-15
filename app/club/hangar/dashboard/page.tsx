import { createClient } from '@supabase/supabase-js'
import DashboardLive from '@/components/club/hangar/DashboardLive'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function HangarDashboardPage() {
  // 1️⃣ Récupérer le club Hangar
  const { data: club } = await supabase
    .from('clubs')
    .select('id')
    .eq('club_code', 'HANGAR1')
    .single()

  if (!club) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-2">⚠️ Club introuvable</div>
          <p className="text-sm text-slate-400">
            Le club avec le code HANGAR1 n'existe pas dans la base de données.
          </p>
        </div>
      </div>
    )
  }

  // 2️⃣ Récupérer les bookings d'aujourd'hui
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

  // 3️⃣ Afficher le dashboard live
  return <DashboardLive clubId={club.id} initialBookings={bookings ?? []} />
}
