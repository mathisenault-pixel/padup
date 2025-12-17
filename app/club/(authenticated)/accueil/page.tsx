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
      case 'urgent': return 'border-red-300 bg-red-50'
      case 'warning': return 'border-yellow-300 bg-yellow-50'
      case 'info': return 'border-blue-300 bg-blue-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'urgent': return '🚨'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '📢'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-600 mt-1">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        
        {/* Sélecteur de date */}
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none font-semibold"
          />
        </div>
      </div>

      {/* Sélecteur de période */}
      <div className="bg-white rounded-xl p-2 border-2 border-slate-200 shadow-lg inline-flex gap-2">
        <button
          onClick={() => setPeriode('jour')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            periode === 'jour'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📅 Jour
        </button>
        <button
          onClick={() => setPeriode('semaine')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            periode === 'semaine'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📊 Semaine
        </button>
        <button
          onClick={() => setPeriode('mois')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            periode === 'mois'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📆 Mois
        </button>
        <button
          onClick={() => setPeriode('annee')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            periode === 'annee'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📈 Année
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-2xl border border-blue-400">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 font-semibold">Réservations</span>
            <span className="text-4xl">📅</span>
          </div>
          <p className="text-4xl font-black mb-1">{currentStats.reservations}</p>
          <p className="text-blue-100 text-sm font-medium">{getPeriodeLabel()}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-2xl border border-green-400">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100 font-semibold">Revenus</span>
            <span className="text-4xl">💰</span>
          </div>
          <p className="text-4xl font-black mb-1">{currentStats.revenus.toLocaleString()}€</p>
          <p className="text-green-100 text-sm font-medium">{getPeriodeLabel()}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-2xl border border-orange-400">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-100 font-semibold">Taux occupation</span>
            <span className="text-4xl">📊</span>
          </div>
          <p className="text-4xl font-black mb-1">{currentStats.tauxOccupation}%</p>
          <p className="text-orange-100 text-sm font-medium">{getPeriodeLabel()}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-2xl border border-purple-400">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100 font-semibold">Nouveaux clients</span>
            <span className="text-4xl">👥</span>
          </div>
          <p className="text-4xl font-black mb-1">{currentStats.nouveauxClients}</p>
          <p className="text-purple-100 text-sm font-medium">{getPeriodeLabel()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertes */}
        <div className="lg:col-span-1 bg-white rounded-xl p-6 border-2 border-slate-200 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">🔔 Alertes</h2>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold border-2 border-red-300">
              {alertes.filter(a => a.type === 'urgent').length}
            </span>
          </div>

          <div className="space-y-3">
            {alertes.map((alerte) => (
              <div
                key={alerte.id}
                className={`p-4 rounded-lg border-2 ${getAlertColor(alerte.type)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getAlertIcon(alerte.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-slate-900">{alerte.titre}</h3>
                      <span className="text-xs text-slate-600 font-semibold">{alerte.heure}</span>
                    </div>
                    <p className="text-sm text-slate-700">{alerte.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold transition-all border-2 border-slate-300">
            Voir toutes les alertes
          </button>
        </div>

        {/* Réservations du jour */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border-2 border-slate-200 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">📅 Planning du jour</h2>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition-all">
              + Nouvelle réservation
            </button>
          </div>

          <div className="space-y-2">
            {reservationsJour.map((reservation) => (
              <div
                key={reservation.id}
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 text-center">
                    <span className="text-lg font-black text-slate-900">{reservation.heure}</span>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center text-white font-bold shadow">
                    {reservation.terrain}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{reservation.client}</p>
                    <p className="text-sm text-slate-600">1h30</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                    reservation.statut === 'Confirmée'
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  }`}>
                    {reservation.statut}
                  </span>
                  <button className="p-2 hover:bg-slate-200 rounded-lg transition-all">
                    ⋮
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold transition-all border-2 border-slate-300">
            Voir le planning complet
          </button>
        </div>
      </div>

      {/* Graphique rapide */}
      <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900 mb-4">📈 Évolution {getPeriodeLabel().toLowerCase()}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Matinée (8h-12h)</p>
            <p className="text-2xl font-bold text-slate-900">45%</p>
            <p className="text-xs text-slate-500 mt-1">15 réservations</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Après-midi (12h-18h)</p>
            <p className="text-2xl font-bold text-slate-900">62%</p>
            <p className="text-xs text-slate-500 mt-1">21 réservations</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Soirée (18h-22h)</p>
            <p className="text-2xl font-bold text-slate-900">89%</p>
            <p className="text-xs text-slate-500 mt-1">30 réservations</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Nuit (22h-00h)</p>
            <p className="text-2xl font-bold text-slate-900">34%</p>
            <p className="text-xs text-slate-500 mt-1">7 réservations</p>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="p-6 bg-white hover:bg-slate-50 rounded-xl border-2 border-slate-200 shadow-lg transition-all text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="font-bold text-slate-900">Voir les stats</p>
        </button>
        <button className="p-6 bg-white hover:bg-slate-50 rounded-xl border-2 border-slate-200 shadow-lg transition-all text-center">
          <div className="text-4xl mb-2">👥</div>
          <p className="font-bold text-slate-900">Gérer les clients</p>
        </button>
        <button className="p-6 bg-white hover:bg-slate-50 rounded-xl border-2 border-slate-200 shadow-lg transition-all text-center">
          <div className="text-4xl mb-2">⚙️</div>
          <p className="font-bold text-slate-900">Exploitation</p>
        </button>
        <button className="p-6 bg-white hover:bg-slate-50 rounded-xl border-2 border-slate-200 shadow-lg transition-all text-center">
          <div className="text-4xl mb-2">💰</div>
          <p className="font-bold text-slate-900">Voir les revenus</p>
        </button>
      </div>
    </div>
  )
}


