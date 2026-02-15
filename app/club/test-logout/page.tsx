'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/clubAuth'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export default function TestLogoutPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<string[]>([])
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    setCurrentUrl(window.location.href)
    
    // Listener pour tracker les changements d'URL
    const handleUrlChange = () => {
      const newUrl = window.location.href
      addLog(`🔄 URL changée: ${newUrl}`)
      setCurrentUrl(newUrl)
    }
    
    // Écouter les événements de navigation
    window.addEventListener('popstate', handleUrlChange)
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange)
    }
  }, [])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
    console.log(message)
  }

  const handleTestLogout = async () => {
    setLogs([])
    
    addLog('🔄 Début du test de déconnexion')
    addLog(`📍 URL actuelle: ${window.location.href}`)
    
    // 1. Vérifier la session avant
    const { data: { session: beforeSession } } = await supabaseBrowser.auth.getSession()
    addLog(`Session AVANT: ${beforeSession ? 'PRÉSENTE ✅' : 'ABSENTE ❌'}`)
    if (beforeSession) {
      addLog(`  User ID: ${beforeSession.user.id}`)
      addLog(`  Email: ${beforeSession.user.email}`)
    }
    
    // 2. Appeler signOut
    addLog('🔄 Appel de signOut()...')
    const result = await signOut()
    
    if (result.error) {
      addLog(`❌ Erreur signOut: ${result.error.message}`)
    } else {
      addLog('✅ signOut() terminé sans erreur')
    }
    
    // 3. Vérifier la session après
    const { data: { session: afterSession } } = await supabaseBrowser.auth.getSession()
    addLog(`Session APRÈS: ${afterSession ? '⚠️ ENCORE PRÉSENTE!' : '✅ BIEN SUPPRIMÉE'}`)
    if (afterSession) {
      addLog(`  ⚠️ User ID encore là: ${afterSession.user.id}`)
    }
    
    // 4. Vérifier les cookies
    addLog('🍪 Vérification des cookies...')
    const cookies = document.cookie
    if (cookies.includes('sb-')) {
      addLog('⚠️ Cookies Supabase encore présents')
    } else {
      addLog('✅ Pas de cookies Supabase')
    }
    
    // 5. Attendre 1 seconde
    addLog('⏳ Attente de 1 seconde...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 6. Re-vérifier
    const { data: { session: finalSession } } = await supabaseBrowser.auth.getSession()
    addLog(`Session FINALE: ${finalSession ? '⚠️ ENCORE LÀ!' : '✅ BIEN PARTIE'}`)
    
    // 7. Préparer la redirection
    addLog('🔄 Redirection vers /club dans 3 secondes...')
    addLog('📍 Destination: window.location.replace("/club")')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    addLog('🚀 REDIRECTION MAINTENANT!')
    window.location.replace('/club')
  }

  const handleCheckSession = async () => {
    const { data: { session } } = await supabaseBrowser.auth.getSession()
    if (session) {
      addLog(`✅ Session active: ${session.user.email}`)
    } else {
      addLog('❌ Pas de session')
    }
  }

  const handleForceLogout = async () => {
    addLog('💀 FORCE LOGOUT BRUTAL')
    await supabaseBrowser.auth.signOut({ scope: 'global' })
    addLog('💀 Nettoyage localStorage...')
    localStorage.clear()
    addLog('💀 Nettoyage sessionStorage...')
    sessionStorage.clear()
    addLog('💀 Redirection immédiate...')
    window.location.href = '/club'
  }

  const handleCheckUrl = () => {
    addLog(`📍 URL actuelle: ${window.location.href}`)
    addLog(`📍 Pathname: ${window.location.pathname}`)
    addLog(`📍 Origin: ${window.location.origin}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">🧪 Test de déconnexion COMPLET</h1>
        <p className="text-gray-600 mb-8">URL: <code className="bg-gray-200 px-2 py-1 rounded text-sm">{currentUrl}</code></p>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleTestLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              🧪 Test déconnexion normale
            </button>
            
            <button
              onClick={handleForceLogout}
              className="px-6 py-3 bg-red-900 text-white rounded-lg hover:bg-red-950 font-semibold"
            >
              💀 Force logout brutal
            </button>
            
            <button
              onClick={handleCheckSession}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              🔍 Vérifier session
            </button>
            
            <button
              onClick={handleCheckUrl}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
            >
              📍 Vérifier URL
            </button>
            
            <button
              onClick={() => router.push('/club')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              🏃 router.push('/club')
            </button>
            
            <button
              onClick={() => window.location.replace('/club')}
              className="px-6 py-3 bg-green-800 text-white rounded-lg hover:bg-green-900 font-semibold"
            >
              🚀 location.replace('/club')
            </button>
            
            <button
              onClick={() => setLogs([])}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold col-span-2"
            >
              🗑️ Effacer les logs
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-white font-bold mb-4">📝 Logs :</h2>
          <div className="space-y-2 font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400">Aucun log. Cliquez sur un bouton pour commencer...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-green-400">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-900 mb-2">🎯 Que tester :</h3>
          <ul className="list-disc list-inside space-y-1 text-yellow-800 text-sm">
            <li><strong>Test déconnexion normale</strong> : Suit le flow complet avec logs détaillés</li>
            <li><strong>Force logout brutal</strong> : Efface TOUT et redirige immédiatement</li>
            <li><strong>Vérifier session</strong> : Affiche l'état actuel de la session</li>
            <li><strong>Vérifier URL</strong> : Affiche l'URL complète actuelle</li>
            <li><strong>router.push</strong> : Test avec Next.js router</li>
            <li><strong>location.replace</strong> : Test avec navigation native</li>
          </ul>
        </div>

        <div className="mt-4 flex gap-4 justify-center">
          <a href="/club/dashboard" className="text-blue-600 hover:underline">
            ← Dashboard
          </a>
          <a href="/club" className="text-blue-600 hover:underline">
            ← Page club publique
          </a>
        </div>
      </div>
    </div>
  )
}
