'use client'

import { useEffect, useState } from 'react'
import supabase from '@/lib/supabaseClient'

export default function HealthPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    async function checkSupabase() {
      try {
        // Tester la connexion avec une requête simple
        const { data, error } = await supabase
          .from('clubs')
          .select('count')
          .limit(1)

        if (error) {
          setStatus('error')
          setMessage('Erreur Supabase')
          setDetails({
            error: error.message,
            code: error.code,
            hint: error.hint,
            details: error.details
          })
        } else {
          setStatus('success')
          setMessage('SUPABASE OK')
          setDetails({
            timestamp: new Date().toISOString(),
            connection: 'established',
            note: 'Connexion Supabase fonctionnelle'
          })
        }
      } catch (err: any) {
        setStatus('error')
        setMessage('Erreur de connexion')
        setDetails({
          error: err.message || 'Erreur inconnue',
          stack: err.stack
        })
      }
    }

    checkSupabase()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className={`rounded-lg p-8 shadow-lg border-2 ${
          status === 'loading' 
            ? 'bg-blue-50 border-blue-200' 
            : status === 'success' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Health Check - Supabase
            </h1>
            <p className="text-gray-600">
              Diagnostic de connexion à la base de données
            </p>
          </div>

          {/* Status */}
          <div className="mb-6">
            {status === 'loading' && (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-lg font-semibold text-blue-900">
                  Connexion en cours...
                </span>
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-2xl font-black text-green-900">
                  {message}
                </span>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-2xl font-black text-red-900">
                  {message}
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          {details && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Détails</h3>
              <pre className="text-xs text-gray-700 overflow-x-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}

          {/* Instructions si erreur */}
          {status === 'error' && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-bold text-yellow-900 mb-2">
                🔧 Instructions de dépannage
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>1. Vérifier que .env.local contient les bonnes credentials Supabase</li>
                <li>2. Vérifier que la table "clubs" existe dans Supabase</li>
                <li>3. Vérifier les Row Level Security (RLS) policies</li>
                <li>4. Redémarrer le serveur dev après modification de .env.local</li>
              </ul>
            </div>
          )}

          {/* Config Info */}
          <div className="mt-6 pt-6 border-t border-gray-300">
            <p className="text-xs text-gray-500">
              <strong>URL Supabase:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Non configuré'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              <strong>Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '••••••••' : 'Non configuré'}
            </p>
          </div>

        </div>

        {/* Navigation */}
        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  )
}
