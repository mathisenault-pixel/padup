'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // ✅ TOUJOURS logger l'erreur globale
    console.error('❌ [GLOBAL ERROR] Global error caught:', error)
    console.error('❌ [GLOBAL ERROR] Error message:', error.message)
    console.error('❌ [GLOBAL ERROR] Error stack:', error.stack)
    if (error.digest) {
      console.error('❌ [GLOBAL ERROR] Error digest:', error.digest)
    }
  }, [error])

  return (
    <html>
      <body>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px',
          background: 'linear-gradient(to bottom right, #fee2e2, #fecaca, #fca5a5)'
        }}>
          <div style={{
            textAlign: 'center',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            padding: '40px',
            maxWidth: '500px',
            border: '2px solid #fca5a5'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#991b1b', marginBottom: '8px' }}>
              Erreur Globale
            </h1>
            <p style={{ fontSize: '16px', color: '#7f1d1d', marginBottom: '24px' }}>
              Une erreur critique est survenue. Veuillez rafraîchir la page.
            </p>
            
            <button
              onClick={reset}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '12px'
              }}
            >
              Réessayer
            </button>
            
            <a
              href="/"
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 24px',
                background: '#f1f5f9',
                color: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none',
                boxSizing: 'border-box'
              }}
            >
              Retour à l&apos;accueil
            </a>

            {process.env.NODE_ENV === 'development' && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                textAlign: 'left'
              }}>
                <p style={{
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#7f1d1d',
                  wordBreak: 'break-all',
                  margin: 0
                }}>
                  {error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
