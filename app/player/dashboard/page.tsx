'use client'

import { useState } from 'react'
import Link from 'next/link'

type Club = {
  id: number
  nom: string
  ville: string
  distance: string
  note: number
  photo: string
  imageUrl: string
}

export default function PlayerDashboardPage() {
  const [clubsPopulaires] = useState<Club[]>([
    {
      id: 1,
      nom: 'Le Hangar Sport & Co',
      ville: 'Rochefort-du-Gard',
      distance: '5 min d\'Avignon',
      note: 4.8,
      photo: '🏗️',
      imageUrl: '/images/clubs/le-hangar.jpg'
    },
    {
      id: 2,
      nom: 'Paul & Louis Sport',
      ville: 'Le Pontet',
      distance: '10 min d\'Avignon',
      note: 4.7,
      photo: '🎾',
      imageUrl: '/images/clubs/paul-louis.jpg'
    },
    {
      id: 3,
      nom: 'ZE Padel',
      ville: 'Boulbon',
      distance: '20 min d\'Avignon',
      note: 4.6,
      photo: '⚡',
      imageUrl: '/images/clubs/ze-padel.jpg'
    },
    {
      id: 4,
      nom: 'QG Padel Club',
      ville: 'Saint-Laurent-des-Arbres',
      distance: '15 min d\'Avignon',
      note: 4.7,
      photo: '🏟️',
      imageUrl: '/images/clubs/qg-padel.jpg'
    },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-lg bg-opacity-90 shadow-sm">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pad&apos;Up</h1>
                  <p className="text-xs text-slate-500 font-medium tracking-wide">Conçu par des joueurs pour les joueurs</p>
                </div>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link
                href="/player/login"
                className="px-5 py-2.5 text-slate-700 hover:text-slate-900 font-semibold transition-all"
              >
                Connexion
              </Link>
              <Link
                href="/player/login"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
              >
                S&apos;inscrire
              </Link>
              <Link
                href="/club/login"
                className="px-5 py-2.5 text-slate-700 hover:text-slate-900 font-medium transition-all text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Espace Club
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center py-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-4">
              Réservez votre terrain en quelques clics
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Découvrez les meilleurs clubs de padel près de chez vous et réservez instantanément
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/player/login"
                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg text-lg"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="#clubs"
                className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg border border-slate-200 text-lg"
              >
                Découvrir les clubs
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 py-8 border-y border-slate-200">
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900 mb-2">4</p>
              <p className="text-slate-600">Clubs partenaires</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900 mb-2">26</p>
              <p className="text-slate-600">Terrains disponibles</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900 mb-2">4.7/5</p>
              <p className="text-slate-600">Note moyenne</p>
            </div>
          </div>

          {/* Clubs populaires */}
          <div id="clubs">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-bold text-slate-900">Clubs populaires</h3>
              <Link 
                href="/player/login"
                className="text-slate-600 hover:text-slate-900 font-semibold"
              >
                Voir tous les clubs →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {clubsPopulaires.map((club) => (
                <div
                  key={club.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  <div className="relative h-48 overflow-hidden border-b border-slate-200">
                    <img 
                      src={club.imageUrl} 
                      alt={club.nom}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{club.nom}</h4>
                    <p className="text-slate-600 mb-4">{club.ville} • {club.distance}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <svg className="w-5 h-5 text-slate-700 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-bold text-slate-900">{club.note.toFixed(1)}</span>
                      </div>
                      <Link
                        href="/player/login"
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all text-sm"
                      >
                        Réserver
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Réservation instantanée</h4>
              <p className="text-slate-600">Réservez votre terrain en quelques clics, 24h/24 et 7j/7</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Paiement sécurisé</h4>
              <p className="text-slate-600">Vos transactions sont protégées et sécurisées</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Suivi de performance</h4>
              <p className="text-slate-600">Suivez vos statistiques et progressez dans votre jeu</p>
            </div>
          </div>

          {/* CTA Final */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-12 text-center text-white">
            <h3 className="text-4xl font-bold mb-4">Prêt à commencer ?</h3>
            <p className="text-xl text-slate-300 mb-8">Rejoignez la communauté Pad&apos;Up dès aujourd&apos;hui</p>
            <Link
              href="/player/login"
              className="inline-block px-8 py-4 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition-all shadow-lg text-lg"
            >
              Créer mon compte gratuitement
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

