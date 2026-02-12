import { Suspense } from 'react'
import RechercheClient from './RechercheClient'

export default function RecherchePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white pb-24">
        <div className="sticky top-0 z-50 bg-white border-b border-black/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10"></div>
            <h1 className="text-xl font-bold text-black tracking-tight">Recherche</h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <RechercheClient />
    </Suspense>
  )
}
