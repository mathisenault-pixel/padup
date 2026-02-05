import Link from 'next/link'

export default function ClubAccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Back to home */}
        <div className="mb-8">
          <Link href="/player/accueil" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l'accueil
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left side - Info */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-700 p-12 text-white flex flex-col justify-center">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold mb-4">Espace Club Pad&apos;up</h1>
                <p className="text-slate-100 text-lg leading-relaxed">
                  Gérez vos terrains, réservations et créneaux en temps réel.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Dashboard en temps réel</h3>
                    <p className="text-slate-100 text-sm">Suivez vos réservations et statistiques</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Gestion des terrains</h3>
                    <p className="text-slate-100 text-sm">Activez, désactivez ou bloquez des créneaux</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Annulation facile</h3>
                    <p className="text-slate-100 text-sm">Annulez des réservations en un clic</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="p-12 flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Accédez à votre espace</h2>
                <p className="text-gray-600">Connectez-vous ou créez un compte club</p>
              </div>

              <div className="space-y-4">
                {/* Se connecter */}
                <Link
                  href="/club/login"
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Se connecter
                </Link>

                {/* Créer un compte */}
                <Link
                  href="/club/signup"
                  className="w-full py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl transition-all border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Créer un compte club
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Besoin d&apos;aide ?{' '}
                  <a href="#" className="text-slate-700 hover:text-slate-700 font-medium">
                    Contactez-nous
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features below */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Gain de temps</h3>
            <p className="text-sm text-gray-600">Automatisez la gestion de vos réservations</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Simple & efficace</h3>
            <p className="text-sm text-gray-600">Interface intuitive et rapide à prendre en main</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Temps réel</h3>
            <p className="text-sm text-gray-600">Synchronisation instantanée des disponibilités</p>
          </div>
        </div>
      </div>
    </div>
  )
}
