'use client'

import { useState } from 'react'
import { login, signup } from './actions'

export default function PlayerLogin() {
  const [error, setError] = useState<string | null>(null)
  const [isSignup, setIsSignup] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = isSignup ? await signup(formData) : await login(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      // Redirect happened, this is expected
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      {/* Main Content */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20">
                <span className="text-5xl transform -rotate-12">🎾</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black text-white mb-2 drop-shadow-2xl">
              Espace Joueur
            </h1>
            <p className="text-xl text-yellow-200 font-bold">
              Prêt à jouer ? 🚀
            </p>
          </div>

          {/* Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl blur-xl opacity-50"></div>
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-yellow-300">
              {error && (
                <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-xl text-red-700 font-bold text-center animate-shake">
                  ⚠️ {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wide">
                    📧 Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-5 py-4 border-3 border-purple-300 rounded-xl focus:ring-4 focus:ring-yellow-400 focus:border-yellow-500 outline-none transition-all font-semibold text-lg bg-white shadow-inner text-gray-900"
                    placeholder="ton@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wide">
                    🔒 Mot de passe
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    minLength={6}
                    className="w-full px-5 py-4 border-3 border-purple-300 rounded-xl focus:ring-4 focus:ring-yellow-400 focus:border-yellow-500 outline-none transition-all font-semibold text-lg bg-white shadow-inner text-gray-900"
                    placeholder="••••••••"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-xl font-black text-xl hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 transition-all shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105 active:scale-95 border-4 border-yellow-400"
                >
                  {isSignup ? '🎉 Créer mon compte' : '🚀 C\'est parti !'}
                </button>
              </form>
              
              <div className="mt-8 pt-6 border-t-2 border-gray-200">
                <button
                  onClick={() => setIsSignup(!isSignup)}
                  className="w-full text-center text-purple-700 hover:text-purple-900 font-bold transition-colors"
                >
                  {isSignup ? '✅ Déjà un compte ? Connecte-toi !' : '✨ Pas encore inscrit ? Rejoins-nous !'}
                </button>
              </div>
              
              <div className="mt-4 text-center space-y-2">
                <a 
                  href="/" 
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
                >
                  <span>←</span>
                  <span>Retour à l&apos;accueil</span>
                </a>
                <div className="pt-2">
                  <a 
                    href="/club/login" 
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors text-sm"
                  >
                    <span>🏢</span>
                    <span>Vous êtes un club ? Connectez-vous ici</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-white/30">
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-white font-bold text-xs">Réservation rapide</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-white/30">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-white font-bold text-xs">Tournois</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-white/30">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-white font-bold text-xs">Statistiques</p>
            </div>
          </div>
        </div>
      </main>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
