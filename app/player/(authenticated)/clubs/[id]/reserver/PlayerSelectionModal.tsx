'use client'

import { useState } from 'react'

type Player = {
  id: string
  name: string
  level: string
}

// Joueurs disponibles (démo)
const availablePlayers: Player[] = [
  { id: '1', name: 'Lucas Martin', level: 'Avancé' },
  { id: '2', name: 'Emma Dubois', level: 'Intermédiaire' },
  { id: '3', name: 'Thomas Leroy', level: 'Expert' },
  { id: '4', name: 'Sophie Bernard', level: 'Débutant' },
  { id: 'invite1', name: 'Invité 1', level: 'Invité' },
  { id: 'invite2', name: 'Invité 2', level: 'Invité' },
  { id: 'invite3', name: 'Invité 3', level: 'Invité' },
]

type Props = {
  onClose: () => void
  onContinue: (players: string[], showPremium: boolean) => void
  clubName: string
  timeSlot: string
}

export default function PlayerSelectionModal({ onClose, onContinue, clubName, timeSlot }: Props) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitedEmails, setInvitedEmails] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false) // Guard anti double-clic
  
  const togglePlayer = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId))
    } else {
      // Maximum 3 autres joueurs (4 joueurs au total incluant vous)
      if (selectedPlayers.length < 3) {
        setSelectedPlayers([...selectedPlayers, playerId])
      }
    }
  }
  
  const handleInvite = () => {
    if (inviteEmail && inviteEmail.includes('@')) {
      if (invitedEmails.length + selectedPlayers.length < 3) {
        setInvitedEmails([...invitedEmails, inviteEmail])
        setInviteEmail('')
      }
    }
  }
  
  const removeInvited = (email: string) => {
    setInvitedEmails(invitedEmails.filter(e => e !== email))
  }
  
  const totalPlayers = 1 + selectedPlayers.length + invitedEmails.length
  
  const handleContinue = () => {
    if (isProcessing) {
      console.log('[MODAL] handleContinue BLOCKED - already processing')
      return
    }
    
    console.log('[MODAL] handleContinue START')
    setIsProcessing(true)
    
    // ✅ requestAnimationFrame plus performant que setTimeout
    requestAnimationFrame(() => {
      console.log('[MODAL] handleContinue EXECUTING callback')
      onContinue(selectedPlayers, true)
      console.log('[MODAL] handleContinue DONE')
    })
  }
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-black text-gray-900 mb-1">Choisir les joueurs</h3>
            <p className="text-gray-600">{clubName} • {timeSlot}</p>
            <p className="text-sm text-gray-500 mt-2">
              {totalPlayers}/4 joueurs • Vous pouvez ajouter jusqu'à 3 autres joueurs
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Vous */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-gray-600 mb-3 uppercase">Organisateur</h4>
          <div className="bg-blue-50 border-2 border-blue-600 rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
              M
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-900">Moi (Joueur Démo)</div>
              <div className="text-sm text-gray-600">Organisateur</div>
            </div>
            <div className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-lg">
              Confirmé
            </div>
          </div>
        </div>
        
        {/* Joueurs sélectionnés */}
        {selectedPlayers.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-600 mb-3 uppercase">Joueurs sélectionnés ({selectedPlayers.length})</h4>
            <div className="space-y-2">
              {selectedPlayers.map(playerId => {
                const player = availablePlayers.find(p => p.id === playerId)
                return player ? (
                  <div key={player.id} className="bg-blue-50 border-2 border-blue-600 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                      {player.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{player.name}</div>
                      <div className="text-sm text-gray-600">{player.level}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePlayer(player.id)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-bold rounded-lg transition-all"
                    >
                      Retirer
                    </button>
                  </div>
                ) : null
              })}
            </div>
          </div>
        )}
        
        {/* Invitations par email */}
        {invitedEmails.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-600 mb-3 uppercase">Invités ({invitedEmails.length})</h4>
            <div className="space-y-2">
              {invitedEmails.map((email, idx) => (
                <div key={idx} className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-400 rounded-xl flex items-center justify-center text-white text-xl">
                    ✉️
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{email}</div>
                    <div className="text-sm text-gray-600">En attente de confirmation</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeInvited(email)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-bold rounded-lg transition-all"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Inviter par email */}
        {totalPlayers < 4 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-600 mb-3 uppercase">Inviter par email</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="email@exemple.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 text-gray-900"
              />
              <button
                type="button"
                onClick={handleInvite}
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-all"
              >
                Inviter
              </button>
            </div>
          </div>
        )}
        
        {/* Liste des joueurs disponibles */}
        {totalPlayers < 4 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-600 mb-3 uppercase">JOUEURS</h4>
            
            {/* Barre de recherche */}
            <div className="relative mb-4">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher un joueur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 text-gray-900 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Grille des joueurs filtrés */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availablePlayers
                .filter(p => !selectedPlayers.includes(p.id))
                .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(player => (
                  <button
                    type="button"
                    key={player.id}
                    onClick={() => togglePlayer(player.id)}
                    className="bg-white border-2 border-gray-200 hover:border-blue-600 rounded-xl p-4 flex items-center gap-3 transition-all text-left"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                      player.level === 'Invité' 
                        ? 'bg-gray-300 text-gray-600' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {player.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{player.name}</div>
                      <div className={`text-sm ${player.level === 'Invité' ? 'text-gray-500 italic' : 'text-gray-600'}`}>
                        {player.level}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                ))}
            </div>
            
            {/* Message si aucun résultat */}
            {availablePlayers
              .filter(p => !selectedPlayers.includes(p.id))
              .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="font-semibold">Aucun joueur trouvé</p>
                <p className="text-sm">Essayez une autre recherche</p>
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
              isProcessing
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={isProcessing}
            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
              isProcessing
                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isProcessing ? '⏳ Traitement...' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  )
}


