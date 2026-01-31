import Link from 'next/link'

export const metadata = {
  title: 'Page introuvable | Pad\'Up',
  description: 'La page que vous recherchez n\'existe pas',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="text-center bg-white rounded-2xl shadow-xl border border-slate-200 p-10 max-w-lg">
        <div className="mb-6">
          <div className="text-8xl font-bold text-slate-900 mb-4">404</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Page introuvable
          </h1>
          <p className="text-lg text-slate-600">
            Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/player/accueil"
            className="block w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/player/clubs"
            className="block w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold transition-all"
          >
            Trouver un club
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Besoin d&apos;aide ? Contactez notre équipe support.
          </p>
        </div>
      </div>
    </div>
  )
}











