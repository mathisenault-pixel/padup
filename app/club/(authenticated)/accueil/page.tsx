'use client'

import { useState } from 'react'

type Periode = 'jour' | 'semaine' | 'mois' | 'annee'

type Alert = {
  id: number
  type: 'info' | 'warning' | 'urgent'
  titre: string
  message: string
  heure: string
}

type ReservationRapide = {
  id: number
  heure: string
  terrain: string
  client: string
  statut: 'Confirmée' | 'En attente'
}

export default function AccueilPage() {
  const [periode, setPeriode] = useState<Periode>('jour')
  const [selectedDate, setSelectedDate] = useState('2025-01-20')

  const stats = {
    jour: {
      reservations: 14,
      revenus: 620,
      tauxOccupation: 78,
      nouveauxClients: 3
    },
    semaine: {
      reservations: 89,
      revenus: 3940,
      tauxOccupation: 72,
      nouveauxClients: 12
    },
    mois: {
      reservations: 356,
      revenus: 15850,
      tauxOccupation: 68,
      nouveauxClients: 45
    },
    annee: {
      reservations: 4280,
      revenus: 190400,
      tauxOccupation: 71,
      nouveauxClients: 487
    }
  }

  const [alertes] = useState<Alert[]>([
    {
      id: 1,
      type: 'urgent',
      titre: 'Terrain 4 en maintenance',
      message: 'Maintenance programmée de 14h à 16h',
      heure: '08:30'
    },
    {
      id: 2,
      type: 'warning',
      titre: '3 annulations aujourd\'hui',
      message: 'Créneaux libres : 10h, 14h, 19h',
      heure: '09:15'
    },
    {
      id: 3,
      type: 'info',
      titre: 'Nouveau tournoi inscrit',
      message: '16 équipes pour le tournoi du 25 janvier',
      heure: '10:00'
    },
  ])

  const [reservationsJour] = useState<ReservationRapide[]>([
    { id: 1, heure: '09:00', terrain: 'T1', client: 'Jean Dupont', statut: 'Confirmée' },
    { id: 2, heure: '10:00', terrain: 'T2', client: 'Marie Martin', statut: 'Confirmée' },
    { id: 3, heure: '11:00', terrain: 'T3', client: 'Pierre Durand', statut: 'En attente' },
    { id: 4, heure: '14:00', terrain: 'T1', client: 'Sophie Bernard', statut: 'Confirmée' },
    { id: 5, heure: '16:00', terrain: 'T5', client: 'Luc Petit', statut: 'Confirmée' },
    { id: 6, heure: '18:00', terrain: 'T2', client: 'Emma Dubois', statut: 'Confirmée' },
    { id: 7, heure: '19:30', terrain: 'T3', client: 'Thomas Roux', statut: 'Confirmée' },
  ])

  const currentStats = stats[periode]

  const getPeriodeLabel = () => {
    switch (periode) {
      case 'jour': return 'Aujourd\'hui'
      case 'semaine': return 'Cette semaine'
      case 'mois': return 'Ce mois'
      case 'annee': return 'Cette année'
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'border-red-200 bg-red-50'
      case 'warning': return 'border-amber-200 bg-amber-50'
      case 'info': return 'border-slate-200 bg-slate-50'
      default: return 'border-slate-200 bg-slate-50'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-600 mt-2">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        {/* Sélecteur de date */}
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none font-medium text-slate-900"
          />
        </div>
      </div>

      {/* Sélecteur de période */}
      <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-sm inline-flex gap-2">
        <button
          onClick={() => setPeriode('jour')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            periode === 'jour'
              ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Jour
        </button>
        <button
          onClick={() => setPeriode('semaine')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            periode === 'semaine'
              ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Semaine
        </button>
        <button
          onClick={() => setPeriode('mois')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            periode === 'mois'
              ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Mois
        </button>
        <button
          onClick={() => setPeriode('annee')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            periode === 'annee'
              ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Année
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-100 text-sm font-medium">Réservations</span>
            <svg className="w-6 h-6 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-4xl font-bold mb-1">{currentStats.reservations}</p>
          <p className="text-amber-100 text-sm font-medium">{getPeriodeLabel()}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-medium">Revenus</span>
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-slate-900 mb-1">{currentStats.revenus.toLocaleString()}€</p>
          <p className="text-slate-500 text-sm font-medium">{getPeriodeLabel()}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-medium">Taux occupation</span>
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-slate-900 mb-1">{currentStats.tauxOccupation}%</p>
          <p className="text-slate-500 text-sm font-medium">{getPeriodeLabel()}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-medium">Nouveaux clients</span>
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-slate-900 mb-1">{currentStats.nouveauxClients}</p>
          <p className="text-slate-500 text-sm font-medium">{getPeriodeLabel()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertes */}
        <div className="lg:col-span-1 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Alertes</h2>
            {alertes.filter(a => a.type === 'urgent').length > 0 && (
              <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {alertes.filter(a => a.type === 'urgent').length}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {alertes.map((alerte) => (
              <div
                key={alerte.id}
                className={`p-4 rounded-lg border ${getAlertColor(alerte.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getAlertIcon(alerte.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-slate-900 text-sm">{alerte.titre}</h3>
                      <span className="text-xs text-slate-500">{alerte.heure}</span>
                    </div>
                    <p className="text-sm text-slate-700">{alerte.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-medium transition-all text-sm">
            Voir toutes les alertes
          </button>
        </div>

        {/* Réservations du jour */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Planning du jour</h2>
            <button 
              onClick={() => alert('Fonctionnalité en développement')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-semibold transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nouvelle réservation
            </button>
          </div>

          <div className="space-y-3">
            {reservationsJour.map((reservation) => (
              <div
                key={reservation.id}
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 text-center">
                    <span className="text-lg font-bold text-slate-900">{reservation.heure}</span>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                    {reservation.terrain}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{reservation.client}</p>
                    <p className="text-sm text-slate-600">1h30</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-md text-xs font-semibold border ${
                    reservation.statut === 'Confirmée'
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>
                    {reservation.statut}
                  </span>
                  <button 
                    onClick={() => alert('Options de réservation')}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => alert('Voir le planning complet')}
            className="w-full mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-medium transition-all text-sm"
          >
            Voir le planning complet
          </button>
        </div>
      </div>

      {/* Graphique rapide */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Évolution {getPeriodeLabel().toLowerCase()}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 mb-2 font-medium">Matinée (8h-12h)</p>
            <p className="text-3xl font-bold text-slate-900 mb-1">45%</p>
            <p className="text-xs text-slate-500">15 réservations</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 mb-2 font-medium">Après-midi (12h-18h)</p>
            <p className="text-3xl font-bold text-slate-900 mb-1">62%</p>
            <p className="text-xs text-slate-500">21 réservations</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-700 mb-2 font-medium">Soirée (18h-22h)</p>
            <p className="text-3xl font-bold text-amber-900 mb-1">89%</p>
            <p className="text-xs text-amber-600">30 réservations</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 mb-2 font-medium">Nuit (22h-00h)</p>
            <p className="text-3xl font-bold text-slate-900 mb-1">34%</p>
            <p className="text-xs text-slate-500">7 réservations</p>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => alert('Statistiques détaillées')}
          className="group p-6 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all text-center"
        >
          <svg className="w-10 h-10 text-slate-600 mx-auto mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="font-semibold text-slate-900">Voir les stats</p>
        </button>
        <button 
          onClick={() => alert('Gestion des clients')}
          className="group p-6 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all text-center"
        >
          <svg className="w-10 h-10 text-slate-600 mx-auto mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="font-semibold text-slate-900">Gérer les clients</p>
        </button>
        <button 
          onClick={() => alert('Paramètres d\'exploitation')}
          className="group p-6 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all text-center"
        >
          <svg className="w-10 h-10 text-slate-600 mx-auto mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="font-semibold text-slate-900">Exploitation</p>
        </button>
        <button 
          onClick={() => alert('Détails des revenus')}
          className="group p-6 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all text-center"
        >
          <svg className="w-10 h-10 text-amber-600 mx-auto mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold text-slate-900">Voir les revenus</p>
        </button>
      </div>
    </div>
  )
}


