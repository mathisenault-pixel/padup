import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Icône */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-10 h-10 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>

          {/* Titre */}
          <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">
            Accès non autorisé
          </h1>

          {/* Message */}
          <p className="text-slate-600 text-center mb-8">
            Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
            Veuillez vérifier que vous êtes connecté avec le bon compte.
          </p>

          {/* Code d'erreur */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
            <p className="text-sm text-slate-500 text-center">
              <span className="font-semibold">Code d&apos;erreur :</span> 403 - Forbidden
            </p>
          </div>

          {/* Boutons */}
          <div className="space-y-3">
            <Link
              href="/player/accueil"
              className="block w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-center transition-all shadow-md hover:shadow-lg"
            >
              Retour à l&apos;accueil
            </Link>
            
            <Link
              href="/login"
              className="block w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold text-center transition-all"
            >
              Se connecter avec un autre compte
            </Link>
          </div>

          {/* Info supplémentaire */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, veuillez contacter le support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}











