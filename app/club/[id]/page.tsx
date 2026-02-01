import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient' // ✅ Client serveur, pas browser

type Club = {
  id: string
  name: string
  city: string
  address?: string
  phone?: string
  email?: string
}

export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ LOG SERVEUR AU TOUT DÉBUT
  console.log('[SERVER] /club/[id]/page.tsx - ROUTE HIT, params:', params)
  
  // ============================================
  // SÉCURISATION: Vérifier que params.id existe
  // ============================================
  const resolvedParams = await params
  console.log('[SERVER] /club/[id]/page.tsx - resolvedParams:', resolvedParams)
  
  const clubId = resolvedParams?.id
  
  console.log('[SERVER] /club/[id]/page.tsx - clubId:', clubId, 'type:', typeof clubId)
  
  // ✅ Si pas d'ID, afficher 404
  if (!clubId) {
    console.error('[CLUB DETAIL] ❌ No clubId in params')
    notFound()
  }
  
  // ============================================
  // CHARGEMENT DU CLUB DEPUIS SUPABASE
  // ============================================
  // ✅ Utiliser maybeSingle() pour ne jamais throw
  const { data, error } = await supabase
    .from('clubs')
    .select('id, name, city, address, phone, email')
    .eq('id', clubId)
    .maybeSingle()
  
  if (error || !data) {
    console.error('[CLUB DETAIL] ❌ Club fetch failed:', error || 'No data')
    console.error('[CLUB DETAIL] clubId:', clubId)
    notFound()
  }
  
  console.log('[CLUB DETAIL] ✅ Club loaded:', data.name)
  
  // ============================================
  // VÉRIFICATION: Ne jamais lire data.xxx sans check
  // ============================================
  const club: Club = {
    id: data.id || clubId,
    name: data.name || 'Club sans nom',
    city: data.city || 'Ville non spécifiée',
    address: data.address || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Club Details</h1>
            <Link 
              href="/" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Retour
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="mb-6">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-4">
              Club
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">{club.name}</h2>
            <p className="text-gray-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {club.city}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-4">
            {club.address && (
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Adresse</p>
                <p className="text-gray-900">{club.address}</p>
              </div>
            )}
            
            {club.phone && (
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Téléphone</p>
                <a 
                  href={`tel:${club.phone}`} 
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  {club.phone}
                </a>
              </div>
            )}
            
            {club.email && (
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Email</p>
                <a 
                  href={`mailto:${club.email}`} 
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  {club.email}
                </a>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Club ID (UUID)</p>
            <code className="block px-4 py-2 bg-gray-100 text-gray-800 rounded font-mono text-sm">
              {club.id}
            </code>
          </div>

          <div className="mt-8 flex gap-4">
            <Link
              href="/player/clubs"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Voir tous les clubs
            </Link>
            <Link
              href={`/player/clubs/${club.id}/reserver`}
              className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-semibold rounded-lg transition-colors"
            >
              Réserver un terrain
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
