'use client'

import { useState } from 'react'

type RevenuCategory = {
  name: string
  value: number
  evolution: number // en pourcentage
  icon: string
  color: string
}

type ReservationRevenu = {
  id: number
  date: string
  heure: string
  terrain: string
  client: string
  montant: number
  statut: 'Payé' | 'En attente'
}

type PeriodData = {
  period: string
  terrains: number
  restauration: number
  boutique: number
  total: number
}

export default function RevenusPage() {
  const [selectedView, setSelectedView] = useState<'jour' | 'semaine'>('jour')
  const [selectedDate, setSelectedDate] = useState('2025-01-20')

  const categories: RevenuCategory[] = [
    {
      name: 'Réservations Terrains',
      value: 8450,
      evolution: 12.5,
      icon: '🎾',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Restauration',
      value: 3280,
      evolution: 8.3,
      icon: '🍔',
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Boutique (équipements)',
      value: 1890,
      evolution: -3.2,
      icon: '🎒',
      color: 'from-purple-500 to-purple-600'
    },
  ]

  const totalCA = categories.reduce((acc, cat) => acc + cat.value, 0)

  const reservationsJour: ReservationRevenu[] = [
    { id: 1, date: '2025-01-20', heure: '09:00', terrain: 'Terrain 1', client: 'Jean Dupont', montant: 45, statut: 'Payé' },
    { id: 2, date: '2025-01-20', heure: '10:00', terrain: 'Terrain 2', client: 'Marie Martin', montant: 45, statut: 'Payé' },
    { id: 3, date: '2025-01-20', heure: '14:00', terrain: 'Terrain 1', client: 'Pierre Durand', montant: 40, statut: 'En attente' },
    { id: 4, date: '2025-01-20', heure: '16:00', terrain: 'Terrain 3', client: 'Sophie Bernard', montant: 40, statut: 'Payé' },
    { id: 5, date: '2025-01-20', heure: '18:00', terrain: 'Terrain 5', client: 'Luc Petit', montant: 50, statut: 'Payé' },
    { id: 6, date: '2025-01-20', heure: '19:30', terrain: 'Terrain 2', client: 'Emma Dubois', montant: 50, statut: 'Payé' },
    { id: 7, date: '2025-01-20', heure: '21:00', terrain: 'Terrain 1', client: 'Thomas Roux', montant: 55, statut: 'Payé' },
  ]

  const evolutionHebdo: PeriodData[] = [
    { period: 'Lun 13/01', terrains: 420, restauration: 180, boutique: 95, total: 695 },
    { period: 'Mar 14/01', terrains: 480, restauration: 210, boutique: 120, total: 810 },
    { period: 'Mer 15/01', terrains: 510, restauration: 230, boutique: 85, total: 825 },
    { period: 'Jeu 16/01', terrains: 540, restauration: 250, boutique: 140, total: 930 },
    { period: 'Ven 17/01', terrains: 680, restauration: 320, boutique: 180, total: 1180 },
    { period: 'Sam 18/01', terrains: 890, restauration: 450, boutique: 240, total: 1580 },
    { period: 'Dim 19/01', terrains: 850, restauration: 420, boutique: 210, total: 1480 },
  ]

  const evolutionMensuelle: PeriodData[] = [
    { period: 'Sem 1', terrains: 2850, restauration: 1280, boutique: 680, total: 4810 },
    { period: 'Sem 2', terrains: 3100, restauration: 1420, boutique: 720, total: 5240 },
    { period: 'Sem 3', terrains: 3370, restauration: 1580, boutique: 490, total: 5440 },
    { period: 'Sem 4', terrains: 3580, restauration: 1640, boutique: 870, total: 6090 },
  ]

  const currentEvolution = selectedView === 'jour' ? evolutionHebdo : evolutionMensuelle
  const maxTotal = Math.max(...currentEvolution.map(d => d.total))

  const totalReservationsJour = reservationsJour.reduce((acc, r) => acc + r.montant, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Revenus & Facturation</h1>
          <p className="text-slate-600 mt-1">Suivi du chiffre d&apos;affaires et des paiements</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-semibold transition-all border-2 border-slate-300">
            📊 Exporter
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-lg font-semibold hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg">
            + Nouvelle facture
          </button>
        </div>
      </div>

      {/* CA Total */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-2xl border-2 border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-lg mb-2">Chiffre d&apos;affaires mensuel</p>
            <p className="text-6xl font-black">{totalCA.toLocaleString()}€</p>
            <p className="text-slate-400 mt-2">Janvier 2025</p>
          </div>
          <div className="text-right">
            <div className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-2xl shadow-lg">
              +{((categories.reduce((acc, cat) => acc + (cat.evolution * cat.value), 0) / totalCA)).toFixed(1)}%
            </div>
            <p className="text-slate-400 mt-2 text-sm">vs mois précédent</p>
          </div>
        </div>
      </div>

      {/* Répartition par catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <div key={index} className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-3xl shadow-lg`}>
                {category.icon}
              </div>
              <div className={`px-3 py-1 rounded-lg font-bold text-sm ${
                category.evolution >= 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {category.evolution >= 0 ? '↗' : '↘'} {Math.abs(category.evolution)}%
              </div>
            </div>
            <h3 className="text-sm text-slate-600 mb-2">{category.name}</h3>
            <p className="text-3xl font-bold text-slate-900">{category.value.toLocaleString()}€</p>
            <div className="mt-4 bg-slate-100 rounded-full h-2">
              <div
                className={`bg-gradient-to-r ${category.color} h-2 rounded-full transition-all`}
                style={{ width: `${(category.value / totalCA) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {((category.value / totalCA) * 100).toFixed(1)}% du CA total
            </p>
          </div>
        ))}
      </div>

      {/* Graphique d'évolution */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">📈 Évolution des revenus</h2>
          <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedView('jour')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                selectedView === 'jour'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Journalier (7j)
            </button>
            <button
              onClick={() => setSelectedView('semaine')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                selectedView === 'semaine'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hebdomadaire (4 sem)
            </button>
          </div>
        </div>

        {/* Légende */}
        <div className="flex gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-slate-700 font-medium">Terrains</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-slate-700 font-medium">Restauration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm text-slate-700 font-medium">Boutique</span>
          </div>
        </div>

        {/* Graphique */}
        <div className="space-y-4">
          {currentEvolution.map((data, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700 w-24">{data.period}</span>
                <span className="font-bold text-slate-900">{data.total}€</span>
              </div>
              <div className="flex gap-1 h-12">
                {/* Terrains */}
                <div
                  className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-lg relative group transition-all hover:from-blue-600 hover:to-blue-500"
                  style={{ width: `${(data.terrains / data.total) * 100}%` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.terrains}€
                  </div>
                </div>
                {/* Restauration */}
                <div
                  className="bg-gradient-to-t from-green-500 to-green-400 rounded-lg relative group transition-all hover:from-green-600 hover:to-green-500"
                  style={{ width: `${(data.restauration / data.total) * 100}%` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.restauration}€
                  </div>
                </div>
                {/* Boutique */}
                <div
                  className="bg-gradient-to-t from-purple-500 to-purple-400 rounded-lg relative group transition-all hover:from-purple-600 hover:to-purple-500"
                  style={{ width: `${(data.boutique / data.total) * 100}%` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.boutique}€
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totaux */}
        <div className="mt-6 pt-6 border-t-2 border-slate-200">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">Total période</p>
              <p className="text-2xl font-bold text-slate-900">
                {currentEvolution.reduce((acc, d) => acc + d.total, 0).toLocaleString()}€
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-600 mb-1">Terrains</p>
              <p className="text-2xl font-bold text-blue-700">
                {currentEvolution.reduce((acc, d) => acc + d.terrains, 0).toLocaleString()}€
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-green-600 mb-1">Restauration</p>
              <p className="text-2xl font-bold text-green-700">
                {currentEvolution.reduce((acc, d) => acc + d.restauration, 0).toLocaleString()}€
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-purple-600 mb-1">Boutique</p>
              <p className="text-2xl font-bold text-purple-700">
                {currentEvolution.reduce((acc, d) => acc + d.boutique, 0).toLocaleString()}€
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Réservations du jour */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">💰 Réservations & Paiements</h2>
            <p className="text-sm text-slate-600 mt-1">Détail des transactions du jour</p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
            />
            <div className="text-right">
              <p className="text-sm text-slate-600">Total du jour</p>
              <p className="text-2xl font-bold text-green-600">{totalReservationsJour}€</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Heure</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Terrain</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reservationsJour.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">{reservation.heure}</td>
                  <td className="px-6 py-4 text-slate-700">{reservation.terrain}</td>
                  <td className="px-6 py-4 text-slate-700">{reservation.client}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-green-600">{reservation.montant}€</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      reservation.statut === 'Payé'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {reservation.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-bold text-slate-900">Total :</td>
                <td colSpan={2} className="px-6 py-4 font-bold text-green-600 text-xl">{totalReservationsJour}€</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
