import { createClient } from '@supabase/supabase-js'
import DashboardMain from '@/components/club/hangar/DashboardMain'

// Utiliser la service role key côté serveur pour bypasser RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function DashboardPage() {
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

  // 2️⃣ Récupérer TOUS les bookings du club (pas seulement aujourd'hui)
  // Le composant client filtrera selon les besoins (aujourd'hui / 7 jours / mois)
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  
  // Charger les 30 prochains jours pour couvrir tous les filtres
  const end = new Date(now)
  end.setDate(end.getDate() + 30)
  end.setHours(23, 59, 59, 999)

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, club_id, court_id, slot_start, slot_end, status, created_at, created_by, courts!inner(id, name)')
    .eq('club_id', club.id)
    .gte('slot_start', start.toISOString())
    .lte('slot_start', end.toISOString())
    .order('slot_start', { ascending: true })
  
  if (bookingsError) {
    console.error('[HANGAR PAGE] Error fetching bookings:', bookingsError)
  }
  
  console.log('[HANGAR PAGE] Loaded bookings count:', bookings?.length || 0)
  console.log('[HANGAR PAGE] Bookings:', JSON.stringify(bookings?.slice(0, 3), null, 2))

  // 3️⃣ Récupérer tous les terrains du Hangar (y compris les nouveaux)
  const { data: courts, error: courtsError } = await supabase
    .from('courts')
    .select('id, name, club_id')
    .eq('club_id', club.id)
  
  if (courtsError) {
    console.error('[HANGAR PAGE] Error fetching courts:', courtsError)
  }
  
  console.log('[HANGAR PAGE] Club ID:', club.id)
  console.log('[HANGAR PAGE] Loaded courts count:', courts?.length || 0)
  console.log('[HANGAR PAGE] Courts:', JSON.stringify(courts, null, 2))

  // 4️⃣ Récupérer les paramètres
  const { data: settings } = await supabase
    .from('club_settings')
    .select('*')
    .eq('club_id', club.id)
    .single()

  // 5️⃣ Afficher le dashboard
  return (
    <DashboardMain
      clubId={club.id}
      initialBookings={bookings ?? []}
      courts={courts ?? []}
      settings={settings}
    />
  )
}
