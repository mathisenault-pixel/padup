import Link from 'next/link'

export default function ClubDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Club</h1>
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Site public
              </Link>
              <button className="text-sm text-red-600 hover:text-red-700">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <Link 
              href="/club" 
              className="py-3 border-b-2 border-blue-600 text-blue-600 font-semibold text-sm"
            >
              Accueil
            </Link>
            <Link 
              href="/club/bookings" 
              className="py-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-semibold text-sm"
            >
              Planning
            </Link>
            <Link 
              href="/club/products" 
              className="py-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-semibold text-sm"
            >
              Produits
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">Réservations aujourd'hui</div>
            <div className="text-3xl font-black text-gray-900">12</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">En attente</div>
            <div className="text-3xl font-black text-yellow-600">3</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-2">CA estimé (semaine)</div>
            <div className="text-3xl font-black text-green-600">1,240€</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Actions rapides</h2>
          <div className="flex gap-4">
            <Link
              href="/club/bookings"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Voir le planning
            </Link>
            <Link
              href="/club/products"
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Gérer les produits
            </Link>
          </div>
        </div>

        {/* Recent Bookings */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Réservations récentes</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Heure</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joueur</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Terrain</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">10:00 - 11:30</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Joueur {i}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Terrain {i}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        En attente
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
