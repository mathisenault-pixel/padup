import Link from 'next/link'

export default function BookPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Pad'up
            </Link>
            <Link 
              href="/club" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Espace Club →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Choisissez votre club
          </h1>
          <p className="text-gray-600">
            Sélectionnez un club pour voir les disponibilités
          </p>
        </div>

        {/* Filters Placeholder */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
          <div className="flex gap-4 flex-wrap">
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Toutes les villes</option>
              <option>Paris</option>
              <option>Lyon</option>
              <option>Marseille</option>
            </select>
            <input 
              type="date" 
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Clubs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Link 
              key={i}
              href={`/book/club-${i}`}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all hover:border-blue-500"
            >
              <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Club de Padel {i}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                123 Rue Example, 75000 Paris
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-600">
                  À partir de 25€
                </span>
                <span className="text-sm text-gray-500">
                  {3 + i} terrains
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
