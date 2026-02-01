'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // ✅ TOUJOURS logger l'erreur (dev ET prod)
    console.error('❌ [ERROR BOUNDARY] Error caught:', error)
    console.error('❌ [ERROR BOUNDARY] Error message:', error.message)
    console.error('❌ [ERROR BOUNDARY] Error stack:', error.stack)
    if (error.digest) {
      console.error('❌ [ERROR BOUNDARY] Error digest:', error.digest)
    }
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-100 to-red-200 flex items-center justify-center px-4 py-12">
      <div className="text-center bg-white rounded-2xl shadow-xl border border-red-200 p-10 max-w-lg">
        <div className="mb-6">
          <svg className="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-3xl font-bold text-red-900 mb-2">
            Une erreur est survenue
          </h1>
          <p className="text-lg text-red-700">
            Désolé, quelque chose s&apos;est mal passé. Notre équipe a été notifiée.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="block w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            Réessayer
          </button>
          <Link
            href="/player/accueil"
            className="block w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold transition-all"
          >
            Retour à l&apos;accueil
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-xs font-mono text-red-800 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}











