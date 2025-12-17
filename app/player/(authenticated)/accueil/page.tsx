'use client'

import { useState } from 'react'
import Link from 'next/link'

type ReservationRapide = {
  id: number
  clubNom: string
  date: string
  heure: string
  terrain: string
}

type Notification = {
  id: number
  type: 'info' | 'warning' | 'success'
  titre: string
  message: string
  heure: string
}

export default function AccueilPage() {
  const [prochainesReservations] = useState<ReservationRapide[]>([
    {
      id: 1,
      clubNom: 'Le Hangar Sport & Co',
      date: '2025-01-22',
      heure: '18:00',
      terrain: 'Terrain 3'
    },
    {
      id: 2,
      clubNom: 'Paul & Louis Sport',
      date: '2025-01-25',
      heure: '20:00',
      terrain: 'Terrain 5'
    },
  ])

  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'success',
      titre: 'Réservation confirmée',
      message: 'Votre réservation au Le Hangar Sport & Co est confirmée',
      heure: '10:30'
    },
    {
      id: 2,
      type: 'info',
      titre: 'Nouveau tournoi',
      message: 'Tournoi Open ce week-end au Paul & Louis Sport',
      heure: '09:15'
    },
  ])

  const stats = {
    reservationsActives: 2,
    prochainMatch: 'Demain à 18h',
    clubsFavoris: 4,
    heuresJouees: 63
  }

  const getNotifColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'info': return 'border-blue-200 bg-blue-50'
      default: return 'border-slate-200 bg-slate-50'
    }
  }

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Bienvenue</h1>
        <p className="text-slate-600 mt-2">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm font-medium">Réservations actives</span>
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-4xl font-bold">{stats.reservationsActives}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-medium">Prochain match</span>
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.prochainMatch}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-medium">Clubs favoris</span>
            <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-slate-900">{stats.clubsFavoris}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-medium">Heures jouées</span>
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-slate-900">{stats.heuresJouees}h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prochaines réservations */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Prochaines réservations</h2>
            <Link 
              href="/player/reservations"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Voir tout
            </Link>
          </div>

          <div className="space-y-3">
            {prochainesReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                    {new Date(reservation.date).getDate()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{reservation.clubNom}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(reservation.date).toLocaleDateString('fr-FR', { weekday: 'long' })} à {reservation.heure}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">{reservation.terrain}</p>
                  <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold border border-green-200">
                    Confirmée
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/player/clubs"
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouvelle réservation
          </Link>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
            <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {notifications.length}
            </span>
          </div>

          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border ${getNotifColor(notif.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getNotifIcon(notif.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-slate-900 text-sm">{notif.titre}</h3>
                      <span className="text-xs text-slate-500">{notif.heure}</span>
                    </div>
                    <p className="text-sm text-slate-700">{notif.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-medium transition-all text-sm">
            Voir toutes les notifications
          </button>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/player/clubs"
          className="group p-6 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all text-center"
        >
          <svg className="w-10 h-10 text-slate-600 mx-auto mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="font-semibold text-slate-900">Trouver un club</p>
        </Link>

        <Link
          href="/player/reservations"
          className="group p-6 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all text-center"
        >
          <svg className="w-10 h-10 text-slate-600 mx-auto mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="font-semibold text-slate-900">Mes réservations</p>
        </Link>

        <Link
          href="/player/tournois"
          className="group p-6 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all text-center"
        >
          <svg className="w-10 h-10 text-slate-600 mx-auto mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <p className="font-semibold text-slate-900">Tournois</p>
        </Link>

        <Link
          href="/player/profil"
          className="group p-6 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all text-center"
        >
          <svg className="w-10 h-10 text-slate-600 mx-auto mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="font-semibold text-slate-900">Mon profil</p>
        </Link>
      </div>
    </div>
  )
}

