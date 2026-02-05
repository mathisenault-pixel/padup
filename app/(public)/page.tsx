import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Pad'up</h1>
            <Link 
              href="/club" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Espace Club →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Réservez votre terrain de padel en ligne
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Trouvez un club près de chez vous et réservez en quelques clics
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/book"
              className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-lg transition-colors"
            >
              Réserver un terrain
            </Link>
            <Link
              href="/availability"
              className="inline-block bg-white hover:bg-gray-50 text-gray-900 font-semibold px-8 py-3 rounded-lg border-2 border-gray-300 transition-colors"
            >
              Voir les disponibilités
            </Link>
          </div>
        </div>

        {/* Clubs Grid Placeholder */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Clubs populaires</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Club {i}</h4>
                <p className="text-sm text-gray-600 mb-4">Adresse du club...</p>
                <Link 
                  href={`/book/club-${i}`}
                  className="text-slate-700 hover:text-slate-900 font-semibold text-sm"
                >
                  Voir disponibilités →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
