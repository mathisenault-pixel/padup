import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default async function PlayerAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/player/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'player') {
    redirect('/player/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Top Navigation Bar - Premium & Elegant */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-lg bg-opacity-90 shadow-sm">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Brand - Sophisticated */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pad&apos;Up</h1>
                  <p className="text-xs text-slate-500 font-medium tracking-wide">Conçu par des joueurs pour les joueurs</p>
                </div>
              </div>
            </div>

            {/* User Info - Elegant */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{user.email}</p>
                <p className="text-xs text-slate-500">Membre Premium</p>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-slate-800 to-slate-600 rounded-xl flex items-center justify-center text-white font-semibold text-base shadow-md">
                {user.email?.[0].toUpperCase()}
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all text-sm shadow-sm hover:shadow-md"
                >
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Horizontal Tabs Navigation - Clean & Minimal */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-1 py-1 overflow-x-auto">
            <Link
              href="/player/accueil"
              className="group flex items-center gap-2.5 px-6 py-3.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all border-b-2 border-transparent hover:border-slate-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-semibold text-sm">Accueil</span>
            </Link>
            
            <Link
              href="/player/clubs"
              className="group flex items-center gap-2.5 px-6 py-3.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all border-b-2 border-transparent hover:border-slate-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-semibold text-sm">Clubs</span>
            </Link>
            
            <Link
              href="/player/reservations"
              className="group flex items-center gap-2.5 px-6 py-3.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all border-b-2 border-transparent hover:border-slate-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold text-sm">Réservations</span>
            </Link>
            
            <Link
              href="/player/tournois"
              className="group flex items-center gap-2.5 px-6 py-3.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all border-b-2 border-transparent hover:border-slate-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className="font-semibold text-sm">Tournois</span>
            </Link>
            
            <Link
              href="/player/messages"
              className="group flex items-center gap-2.5 px-6 py-3.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all border-b-2 border-transparent hover:border-slate-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="font-semibold text-sm">Messages</span>
            </Link>
            
            <Link
              href="/player/profil"
              className="group flex items-center gap-2.5 px-6 py-3.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all border-b-2 border-transparent hover:border-slate-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-semibold text-sm">Profil</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content - Premium Card */}
      <main className="min-h-[calc(100vh-200px)]">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
