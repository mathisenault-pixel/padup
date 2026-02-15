import { createClient } from '@supabase/supabase-js'
import CourtsClient from '@/components/club/hangar/CourtsClient'

// Utiliser la service role key côté serveur pour bypasser RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function CourtsPage() {
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
    .select('id, name, is_active, created_at')
    .eq('club_id', club.id)
    .order('created_at', { ascending: true })

  // 3️⃣ Rendre le composant client
  return (
    <CourtsClient
      clubId={club.id}
      initialCourts={courts ?? []}
    />
  )
}
