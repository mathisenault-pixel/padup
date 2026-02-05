import Link from 'next/link'

export default function ClubBookingsPage() {
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
              className="py-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-semibold text-sm"
            >
              Accueil
            </Link>
            <Link 
              href="/club/bookings" 
              className="py-3 border-b-2 border-slate-900 text-slate-700 font-semibold text-sm"
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Planning des réservations</h2>
            <p className="text-gray-600">Gérez les réservations de vos terrains</p>
          </div>
          <input 
            type="date" 
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex gap-4 flex-wrap">
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Tous les statuts</option>
              <option>En attente</option>
              <option>Confirmé</option>
              <option>Annulé</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Tous les terrains</option>
              <option>Terrain 1</option>
              <option>Terrain 2</option>
              <option>Terrain 3</option>
            </select>
          </div>
        </div>

        {/* Calendar View Placeholder */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Vue calendrier</h3>
          <div className="grid grid-cols-7 gap-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <div 
                key={i} 
                className="aspect-square border border-gray-200 rounded-lg p-2 hover:bg-gray-50 cursor-pointer"
              >
                <div className="text-sm text-gray-900">{(i % 30) + 1}</div>
                {i % 3 === 0 && (
                  <div className="text-xs text-slate-700 mt-1">3 rés.</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">Liste des réservations</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Heure</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joueur</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Terrain</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">2026-01-2{(i % 9) + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{10 + i}:00 - {11 + i}:30</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">Joueur {i + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">joueur{i}@example.com</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Terrain {(i % 3) + 1}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      i % 3 === 0 
                        ? 'bg-yellow-100 text-yellow-800'
                        : i % 3 === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {i % 3 === 0 ? 'En attente' : i % 3 === 1 ? 'Confirmé' : 'Annulé'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-slate-700 hover:text-slate-700 font-semibold">
                      Voir détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
