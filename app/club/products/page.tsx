import Link from 'next/link'

export default function ClubProductsPage() {
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
              className="py-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-semibold text-sm"
            >
              Planning
            </Link>
            <Link 
              href="/club/products" 
              className="py-3 border-b-2 border-slate-900 text-slate-700 font-semibold text-sm"
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
            <h2 className="text-2xl font-black text-gray-900 mb-2">Gestion des produits</h2>
            <p className="text-gray-600">Gérez boissons, snacks et extras vendus au club</p>
          </div>
          <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
            + Ajouter un produit
          </button>
        </div>

        {/* Category Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex gap-2">
            {['Tous', 'Boissons', 'Snacks', 'Repas', 'Desserts'].map((cat) => (
              <button 
                key={cat}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  cat === 'Tous' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Eau minérale', category: 'Boissons', price: '2.50', icon: '💧' },
            { name: 'Coca-Cola', category: 'Boissons', price: '3.00', icon: '🥤' },
            { name: 'Jus d\'orange', category: 'Boissons', price: '4.00', icon: '🍊' },
            { name: 'Café', category: 'Boissons', price: '2.00', icon: '☕' },
            { name: 'Chips', category: 'Snacks', price: '3.00', icon: '🥔' },
            { name: 'Barre énergétique', category: 'Snacks', price: '2.50', icon: '🍫' },
            { name: 'Sandwich club', category: 'Repas', price: '8.00', icon: '🥪' },
            { name: 'Salade Caesar', category: 'Repas', price: '9.00', icon: '🥗' },
            { name: 'Brownie', category: 'Desserts', price: '4.00', icon: '🍰' },
          ].map((product, i) => (
            <div 
              key={i} 
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{product.icon}</div>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Disponible
                </span>
              </div>
              
              <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{product.category}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-black text-gray-900">{product.price}€</div>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
                  Modifier
                </button>
                <button className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Orders Section */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Commandes récentes</h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Réservation</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Produits</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quantité</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">2026-01-2{i + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">Joueur {i + 1} - Terrain {(i % 3) + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {i % 2 === 0 ? 'Coca-Cola, Chips' : 'Eau, Sandwich'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{i + 2}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {(5 + i * 2).toFixed(2)}€
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
