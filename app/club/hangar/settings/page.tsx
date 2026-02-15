import { createClient } from '@supabase/supabase-js'
import SettingsClient from '@/components/club/hangar/SettingsClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function HangarSettingsPage() {
  // 1️⃣ Récupérer le club Hangar
  const { data: club } = await supabase
    .from('clubs')
    .select('id, name')
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

  // 2️⃣ Charger les paramètres du club (ou null si pas encore créés)
  const { data: settings } = await supabase
    .from('club_settings')
    .select('*')
    .eq('club_id', club.id)
    .single()

  // 3️⃣ Rendre le composant client
  return (
    <SettingsClient
      clubId={club.id}
      clubName={club.name}
      initialSettings={settings}
    />
  )
}
