import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default async function ClubAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/club/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'club') {
    redirect('/club/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Top Navigation Bar - Business Premium */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Brand - Corporate Elegance */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Pad&apos;Up</h1>
                  <p className="text-xs text-slate-400 font-medium tracking-wide">Conçu par des joueurs pour les joueurs</p>
                </div>
              </div>
            </div>

            {/* User Info - Professional */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{user.email}</p>
                <p className="text-xs text-slate-400">Gestionnaire</p>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-semibold text-base shadow-md">
                {user.email?.[0].toUpperCase()}
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all text-sm border border-slate-700 hover:border-slate-600"
                >
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Horizontal Tabs Navigation - Elegant Business */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-1 py-1 overflow-x-auto">
            <Link
              href="/club/accueil"
              className="group flex items-center gap-2.5 px-6 py-3.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all border-b-2 border-transparent hover:border-amber-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-semibold text-sm">Accueil</span>
            </Link>
            
            <Link
              href="/club/pilotage"
              className="group flex items-center gap-2.5 px-6 py-3.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all border-b-2 border-transparent hover:border-amber-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-semibold text-sm">Pilotage</span>
            </Link>
            
            <Link
              href="/club/exploitation"
              className="group flex items-center gap-2.5 px-6 py-3.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all border-b-2 border-transparent hover:border-amber-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="font-semibold text-sm">Exploitation</span>
            </Link>
            
            <Link
              href="/club/clients"
              className="group flex items-center gap-2.5 px-6 py-3.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all border-b-2 border-transparent hover:border-amber-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-semibold text-sm">Clients</span>
            </Link>
            
            <Link
              href="/club/revenus"
              className="group flex items-center gap-2.5 px-6 py-3.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all border-b-2 border-transparent hover:border-amber-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-sm">Revenus</span>
            </Link>
            
            <Link
              href="/club/parametres"
              className="group flex items-center gap-2.5 px-6 py-3.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all border-b-2 border-transparent hover:border-amber-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-semibold text-sm">Paramètres</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content - Clean Professional */}
      <main className="min-h-[calc(100vh-200px)]">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
