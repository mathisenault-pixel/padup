'use client'

import { useState } from 'react'
import { login, signup } from './actions'

export default function ClubLogin() {
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      {/* Main Content */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-slate-600 rounded-2xl blur-2xl opacity-50"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-400 to-slate-600 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/20">
                <span className="text-5xl">🏢</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-2xl tracking-tight">
              Espace Club
            </h1>
            <p className="text-xl text-blue-200 font-medium">
              Gestion professionnelle
            </p>
          </div>

          {/* Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-slate-600 rounded-3xl blur-xl opacity-30"></div>
            <div className="relative bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-700">
              {error && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-xl text-red-200 font-semibold text-center">
                  ⚠️ {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-2 uppercase tracking-wider">
                    Email professionnel
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-5 py-4 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-lg bg-slate-900 text-white placeholder-slate-500"
                    placeholder="contact@votreclub.fr"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-200 mb-2 uppercase tracking-wider">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    minLength={6}
                    className="w-full px-5 py-4 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-lg bg-slate-900 text-white placeholder-slate-500"
                    placeholder="••••••••"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-slate-800 transition-all shadow-xl hover:shadow-blue-500/50 transform hover:scale-105 active:scale-95 border border-blue-500"
                >
                  {isSignup ? 'Créer un compte club' : 'Accéder au dashboard'}
                </button>
              </form>
              
              <div className="mt-8 pt-6 border-t border-slate-700">
                <button
                  onClick={() => setIsSignup(!isSignup)}
                  className="w-full text-center text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  {isSignup ? 'Déjà inscrit ? Se connecter' : 'Nouveau club ? S\'inscrire'}
                </button>
              </div>
              
              <div className="mt-4 text-center space-y-2">
                <a 
                  href="/" 
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 font-medium transition-colors"
                >
                  <span>←</span>
                  <span>Retour à l&apos;accueil</span>
                </a>
                <div className="pt-2">
                  <a 
                    href="/player/login" 
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors text-sm"
                  >
                    <span>🎾</span>
                    <span>Vous êtes un joueur ? Connectez-vous ici</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-slate-700">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-slate-200 font-semibold text-xs">Analytics</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-slate-700">
              <div className="text-3xl mb-2">💰</div>
              <p className="text-slate-200 font-semibold text-xs">Revenus</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-slate-700">
              <div className="text-3xl mb-2">👥</div>
              <p className="text-slate-200 font-semibold text-xs">Clients</p>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-700">
              <span className="text-green-400 text-xl">✓</span>
              <span className="text-slate-300 font-medium text-sm">Plateforme sécurisée et certifiée</span>
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
      `}</style>
    </div>
  )
}
