import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home(): Promise<never> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Si l'utilisateur est connecté, vérifier son rôle et rediriger
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'player') {
      redirect('/player/accueil')
    } else if (profile?.role === 'club') {
      redirect('/club/accueil')
    }
  }

  // Si non connecté, rediriger vers la page d'accueil joueur publique
  redirect('/player/dashboard')
}
