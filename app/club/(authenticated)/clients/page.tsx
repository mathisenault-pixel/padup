'use client'

import { useState } from 'react'

type Match = {
  id: number
  date: string
  terrain: string
  partenaire: string
  adversaires: string[]
  score: string
  resultat: 'Victoire' | 'Défaite'
  duree: string
}

type Client = {
  id: number
  nom: string
  email: string
  telephone: string
  dateInscription: string
  niveau: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert'
  totalMatchs: number
  victoires: number
  defaites: number
  tempsJeuTotal: string
  montantDepense: number
  dernierMatch: string
  statut: 'Actif' | 'Inactif'
  abonnement: 'Aucun' | 'Mensuel' | 'Annuel'
}

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [clients] = useState<Client[]>([
    {
      id: 1,
      nom: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      telephone: '+33 6 12 34 56 78',
      dateInscription: '2024-06-15',
      niveau: 'Intermédiaire',
      totalMatchs: 42,
      victoires: 28,
      defaites: 14,
      tempsJeuTotal: '63h',
      montantDepense: 1680,
      dernierMatch: '2025-01-18',
      statut: 'Actif',
      abonnement: 'Mensuel'
    },
    {
      id: 2,
      nom: 'Marie Martin',
      email: 'marie.martin@email.com',
      telephone: '+33 6 23 45 67 89',
      dateInscription: '2024-03-20',
      niveau: 'Avancé',
      totalMatchs: 67,
      victoires: 45,
      defaites: 22,
      tempsJeuTotal: '100h',
      montantDepense: 2850,
      dernierMatch: '2025-01-19',
      statut: 'Actif',
      abonnement: 'Annuel'
    },
    {
      id: 3,
      nom: 'Pierre Durand',
      email: 'pierre.durand@email.com',
      telephone: '+33 6 34 56 78 90',
      dateInscription: '2024-09-10',
      niveau: 'Débutant',
      totalMatchs: 15,
      victoires: 6,
      defaites: 9,
      tempsJeuTotal: '22h',
      montantDepense: 600,
      dernierMatch: '2025-01-15',
      statut: 'Actif',
      abonnement: 'Aucun'
    },
    {
      id: 4,
      nom: 'Sophie Bernard',
      email: 'sophie.bernard@email.com',
      telephone: '+33 6 45 67 89 01',
      dateInscription: '2023-11-05',
      niveau: 'Expert',
      totalMatchs: 89,
      victoires: 67,
      defaites: 22,
      tempsJeuTotal: '133h',
      montantDepense: 4200,
      dernierMatch: '2025-01-20',
      statut: 'Actif',
      abonnement: 'Annuel'
    },
    {
      id: 5,
      nom: 'Luc Petit',
      email: 'luc.petit@email.com',
      telephone: '+33 6 56 78 90 12',
      dateInscription: '2024-07-22',
      niveau: 'Intermédiaire',
      totalMatchs: 31,
      victoires: 18,
      defaites: 13,
      tempsJeuTotal: '46h',
      montantDepense: 1240,
      dernierMatch: '2025-01-17',
      statut: 'Actif',
      abonnement: 'Mensuel'
    },
    {
      id: 6,
      nom: 'Emma Dubois',
      email: 'emma.dubois@email.com',
      telephone: '+33 6 67 89 01 23',
      dateInscription: '2024-01-12',
      niveau: 'Avancé',
      totalMatchs: 54,
      victoires: 32,
      defaites: 22,
      tempsJeuTotal: '81h',
      montantDepense: 2160,
      dernierMatch: '2025-01-12',
      statut: 'Inactif',
      abonnement: 'Aucun'
    },
  ])

  const matchsHistorique: Record<number, Match[]> = {
    1: [
      { id: 1, date: '2025-01-18', terrain: 'Terrain 1', partenaire: 'Marie Martin', adversaires: ['Pierre Durand', 'Luc Petit'], score: '6-4, 6-3', resultat: 'Victoire', duree: '1h30' },
      { id: 2, date: '2025-01-15', terrain: 'Terrain 2', partenaire: 'Sophie Bernard', adversaires: ['Emma Dubois', 'Thomas Roux'], score: '6-2, 7-5', resultat: 'Victoire', duree: '1h45' },
      { id: 3, date: '2025-01-12', terrain: 'Terrain 3', partenaire: 'Luc Petit', adversaires: ['Marie Martin', 'Sophie Bernard'], score: '4-6, 3-6', resultat: 'Défaite', duree: '1h20' },
      { id: 4, date: '2025-01-10', terrain: 'Terrain 1', partenaire: 'Pierre Durand', adversaires: ['Emma Dubois', 'Marc Lefebvre'], score: '6-3, 6-4', resultat: 'Victoire', duree: '1h35' },
      { id: 5, date: '2025-01-08', terrain: 'Terrain 2', partenaire: 'Sophie Bernard', adversaires: ['Luc Petit', 'Thomas Roux'], score: '7-6, 6-2', resultat: 'Victoire', duree: '1h50' },
    ],
    2: [
      { id: 6, date: '2025-01-19', terrain: 'Terrain 3', partenaire: 'Sophie Bernard', adversaires: ['Jean Dupont', 'Luc Petit'], score: '6-4, 6-3', resultat: 'Victoire', duree: '1h40' },
      { id: 7, date: '2025-01-16', terrain: 'Terrain 1', partenaire: 'Emma Dubois', adversaires: ['Pierre Durand', 'Marc Lefebvre'], score: '6-1, 6-2', resultat: 'Victoire', duree: '1h15' },
      { id: 8, date: '2025-01-12', terrain: 'Terrain 3', partenaire: 'Sophie Bernard', adversaires: ['Jean Dupont', 'Luc Petit'], score: '6-3, 6-4', resultat: 'Victoire', duree: '1h20' },
    ],
    4: [
      { id: 9, date: '2025-01-20', terrain: 'Terrain 1', partenaire: 'Marie Martin', adversaires: ['Jean Dupont', 'Pierre Durand'], score: '6-2, 6-1', resultat: 'Victoire', duree: '1h25' },
      { id: 10, date: '2025-01-18', terrain: 'Terrain 2', partenaire: 'Emma Dubois', adversaires: ['Luc Petit', 'Thomas Roux'], score: '7-5, 6-4', resultat: 'Victoire', duree: '1h55' },
    ],
  }

  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getNiveauColor = (niveau: string) => {
    switch (niveau) {
      case 'Débutant': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Intermédiaire': return 'bg-green-100 text-green-800 border-green-200'
      case 'Avancé': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Expert': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients & CRM</h1>
          <p className="text-slate-600 mt-1">Gestion des clients et historique de jeu</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-lg font-semibold hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg">
          + Ajouter un client
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
          <p className="text-sm text-slate-600 mb-1">Total clients</p>
          <p className="text-3xl font-bold text-slate-900">{clients.length}</p>
        </div>
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
          <p className="text-sm text-slate-600 mb-1">Actifs (30j)</p>
          <p className="text-3xl font-bold text-green-600">{clients.filter(c => c.statut === 'Actif').length}</p>
        </div>
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
          <p className="text-sm text-slate-600 mb-1">Abonnements</p>
          <p className="text-3xl font-bold text-blue-600">
            {clients.filter(c => c.abonnement !== 'Aucun').length}
          </p>
        </div>
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
          <p className="text-sm text-slate-600 mb-1">CA total</p>
          <p className="text-3xl font-bold text-purple-600">
            {clients.reduce((acc, c) => acc + c.montantDepense, 0).toLocaleString()}€
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
        <input
          type="text"
          placeholder="🔍 Rechercher un client par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none text-lg"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => setSelectedClient(client)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {client.nom.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{client.nom}</h3>
                  <p className="text-sm text-slate-600">{client.email}</p>
                  <p className="text-xs text-slate-500 mt-1">{client.telephone}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getNiveauColor(client.niveau)}`}>
                {client.niveau}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-600">Matchs</p>
                <p className="text-2xl font-bold text-slate-900">{client.totalMatchs}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs text-green-600">Victoires</p>
                <p className="text-2xl font-bold text-green-700">{client.victoires}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-xs text-red-600">Défaites</p>
                <p className="text-2xl font-bold text-red-700">{client.defaites}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Temps de jeu total :</span>
                <span className="font-semibold text-slate-900">{client.tempsJeuTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Dépenses totales :</span>
                <span className="font-semibold text-slate-900">{client.montantDepense}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Dernier match :</span>
                <span className="font-semibold text-slate-900">{client.dernierMatch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Abonnement :</span>
                <span className={`font-semibold ${client.abonnement !== 'Aucun' ? 'text-green-600' : 'text-slate-500'}`}>
                  {client.abonnement}
                </span>
              </div>
            </div>

            <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium transition-all">
              Voir l&apos;historique complet
            </button>
          </div>
        ))}
      </div>

      {/* Modal Historique */}
      {selectedClient && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedClient(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b-2 border-slate-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {selectedClient.nom.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedClient.nom}</h2>
                  <p className="text-slate-600">{selectedClient.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-semibold transition-all"
              >
                ✕ Fermer
              </button>
            </div>

            {/* Stats détaillées */}
            <div className="p-6 bg-slate-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 text-center border-2 border-slate-200">
                  <p className="text-sm text-slate-600">Matchs totaux</p>
                  <p className="text-3xl font-bold text-slate-900">{selectedClient.totalMatchs}</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border-2 border-green-200">
                  <p className="text-sm text-green-600">Victoires</p>
                  <p className="text-3xl font-bold text-green-700">{selectedClient.victoires}</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border-2 border-slate-200">
                  <p className="text-sm text-slate-600">Taux victoire</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {Math.round((selectedClient.victoires / selectedClient.totalMatchs) * 100)}%
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border-2 border-purple-200">
                  <p className="text-sm text-purple-600">CA généré</p>
                  <p className="text-3xl font-bold text-purple-700">{selectedClient.montantDepense}€</p>
                </div>
              </div>
            </div>

            {/* Historique des matchs */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">📋 Historique des matchs</h3>
              
              {matchsHistorique[selectedClient.id] ? (
                <div className="space-y-4">
                  {matchsHistorique[selectedClient.id].map((match) => (
                    <div key={match.id} className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm text-slate-600">📅 {match.date} • {match.terrain} • ⏱️ {match.duree}</p>
                        </div>
                        <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                          match.resultat === 'Victoire' 
                            ? 'bg-green-100 text-green-800 border-2 border-green-300'
                            : 'bg-red-100 text-red-800 border-2 border-red-300'
                        }`}>
                          {match.resultat}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <p className="text-xs text-slate-600 mb-1">Partenaire</p>
                          <p className="font-semibold text-slate-900">👥 {match.partenaire}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <p className="text-xs text-slate-600 mb-1">Adversaires</p>
                          <p className="font-semibold text-slate-900">⚔️ {match.adversaires.join(' & ')}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <p className="text-xs text-slate-600 mb-1">Score</p>
                          <p className="font-bold text-slate-900">🎯 {match.score}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <p className="text-slate-500">Aucun historique de match disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
