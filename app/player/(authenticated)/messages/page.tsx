'use client'

import { useState } from 'react'

type Message = {
  id: number
  texte: string
  auteur: 'moi' | 'autre'
  timestamp: string
}

type Conversation = {
  id: number
  nom: string
  avatar: string
  type: 'joueur' | 'club'
  dernierMessage: string
  timestamp: string
  nonLus: number
  enLigne: boolean
}

export default function MessagesPage() {
  const [selectedConv, setSelectedConv] = useState<number | null>(1)
  const [messageInput, setMessageInput] = useState('')
  const [showNewConvModal, setShowNewConvModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [messages, setMessages] = useState<Record<number, Message[]>>({
    1: [
      { id: 1, texte: 'Salut ! Tu es dispo pour un match cette semaine ?', auteur: 'autre', timestamp: '10:15' },
      { id: 2, texte: 'Hey ! Oui carrément, tu préfères quel jour ?', auteur: 'moi', timestamp: '10:20' },
      { id: 3, texte: 'Jeudi soir ça te va ? Genre 18h ?', auteur: 'autre', timestamp: '10:25' },
      { id: 4, texte: 'Parfait ! Je réserve un terrain au Hangar ?', auteur: 'moi', timestamp: '10:28' },
      { id: 5, texte: 'Super ! On se retrouve à 18h ?', auteur: 'autre', timestamp: '10:30' },
    ],
    2: [
      { id: 1, texte: 'Bonjour Jean, votre réservation pour le 22 janvier à 18h est confirmée.', auteur: 'autre', timestamp: 'Hier 14:30' },
      { id: 2, texte: 'Terrain : Terrain 3\nDurée : 1h30\nMontant : 45€', auteur: 'autre', timestamp: 'Hier 14:30' },
      { id: 3, texte: 'Merci ! À bientôt', auteur: 'moi', timestamp: 'Hier 14:35' },
    ],
    3: [
      { id: 1, texte: 'Yo ! Tu veux faire un match demain ?', auteur: 'autre', timestamp: 'Hier 16:20' },
      { id: 2, texte: 'Je te propose 10h au Paul & Louis Sport', auteur: 'autre', timestamp: 'Hier 16:21' },
    ],
    4: [
      { id: 1, texte: 'Quel match !! Tu t\'es super bien amélioré 💪', auteur: 'autre', timestamp: '18 Jan 20:45' },
      { id: 2, texte: 'Merci ! Toi aussi tu étais au top !', auteur: 'moi', timestamp: '18 Jan 20:50' },
      { id: 3, texte: 'GG pour le match ! 🏆', auteur: 'autre', timestamp: '18 Jan 20:51' },
    ],
    5: [
      { id: 1, texte: 'Bonjour, nous organisons un nouveau tournoi Open le 5 février !', auteur: 'autre', timestamp: '17 Jan 11:00' },
      { id: 2, texte: 'Dotation : 1000€ + Trophées\nInscription : 50€ par équipe', auteur: 'autre', timestamp: '17 Jan 11:00' },
      { id: 3, texte: 'Places limitées, inscrivez-vous vite !', auteur: 'autre', timestamp: '17 Jan 11:01' },
    ],
  })

  const [conversations] = useState<Conversation[]>([
    {
      id: 1,
      nom: 'Marie Martin',
      avatar: '👩',
      type: 'joueur',
      dernierMessage: 'Super ! On se retrouve à 18h ?',
      timestamp: '10:30',
      nonLus: 2,
      enLigne: true
    },
    {
      id: 2,
      nom: 'Le Hangar Sport & Co',
      avatar: '🏗️',
      type: 'club',
      dernierMessage: 'Votre réservation est confirmée',
      timestamp: 'Hier',
      nonLus: 0,
      enLigne: false
    },
    {
      id: 3,
      nom: 'Pierre Durand',
      avatar: '👨',
      type: 'joueur',
      dernierMessage: 'Tu veux faire un match demain ?',
      timestamp: 'Hier',
      nonLus: 1,
      enLigne: false
    },
    {
      id: 4,
      nom: 'Sophie Bernard',
      avatar: '👩',
      type: 'joueur',
      dernierMessage: 'GG pour le match ! 🏆',
      timestamp: '18 Jan',
      nonLus: 0,
      enLigne: true
    },
    {
      id: 5,
      nom: 'Paul & Louis Sport',
      avatar: '🎾',
      type: 'club',
      dernierMessage: 'Nouveau tournoi disponible !',
      timestamp: '17 Jan',
      nonLus: 3,
      enLigne: false
    },
    {
      id: 6,
      nom: 'Luc Petit',
      avatar: '👨',
      type: 'joueur',
      dernierMessage: 'On refait ça bientôt ?',
      timestamp: '15 Jan',
      nonLus: 0,
      enLigne: false
    },
    {
      id: 7,
      nom: 'ZE Padel',
      avatar: '⚡',
      type: 'club',
      dernierMessage: 'Stage débutants en février',
      timestamp: '14 Jan',
      nonLus: 1,
      enLigne: false
    },
  ])

  const currentMessages = selectedConv ? messages[selectedConv] || [] : []
  const currentConv = conversations.find(c => c.id === selectedConv)

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedConv) {
      const now = new Date()
      const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
      
      const newMessage: Message = {
        id: (messages[selectedConv]?.length || 0) + 1,
        texte: messageInput.trim(),
        auteur: 'moi',
        timestamp: timestamp
      }

      setMessages({
        ...messages,
        [selectedConv]: [...(messages[selectedConv] || []), newMessage]
      })
      
      setMessageInput('')
    }
  }

  const handleCall = () => {
    if (currentConv) {
      alert(`Appel de ${currentConv.nom}... 📞\n\nFonctionnalité en développement 🛠️`)
    }
  }

  const handleInfo = () => {
    setShowInfoModal(true)
  }

  const handleAttachment = () => {
    alert('Sélectionner une pièce jointe 📎\n\nFonctionnalité en développement 🛠️')
  }

  const handleEmoji = () => {
    alert('Sélectionner un emoji 😊\n\nFonctionnalité en développement 🛠️')
  }

  const handleNewConversation = () => {
    setShowNewConvModal(true)
  }

  const totalNonLus = conversations.reduce((acc, conv) => acc + conv.nonLus, 0)

  return (
    <div className="h-[calc(100vh-300px)] flex gap-6">
      {/* Liste des conversations */}
      <div className="w-96 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Messages</h2>
          <p className="text-sm text-slate-300">
            {totalNonLus} message{totalNonLus > 1 ? 's' : ''} non lu{totalNonLus > 1 ? 's' : ''}
          </p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none text-sm text-slate-900"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConv(conv.id)}
              className={`p-4 cursor-pointer hover:bg-slate-50 transition-all border-b border-slate-100 ${
                selectedConv === conv.id ? 'bg-slate-50 border-l-4 border-l-slate-900' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl">
                    {conv.avatar}
                  </div>
                  {conv.enLigne && (
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{conv.nom}</h3>
                    <span className="text-xs text-slate-500">{conv.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 truncate">{conv.dernierMessage}</p>
                    {conv.nonLus > 0 && (
                      <span className="ml-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {conv.nonLus}
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                      conv.type === 'club' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'bg-slate-50 text-slate-700 border border-slate-200'
                    }`}>
                      {conv.type === 'club' ? 'Club' : 'Joueur'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nouvelle conversation */}
        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleNewConversation}
            className="w-full px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all shadow-sm"
          >
            Nouvelle conversation
          </button>
        </div>
      </div>

      {/* Zone de chat */}
      {selectedConv ? (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {/* Header conversation */}
          <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-2xl">
                  {currentConv?.avatar}
                </div>
                {currentConv?.enLigne && (
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold">{currentConv?.nom}</h2>
                <p className="text-sm text-slate-300">
                  {currentConv?.enLigne ? 'En ligne' : 'Hors ligne'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleCall}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button 
                onClick={handleInfo}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
            {currentMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.auteur === 'moi' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] ${
                    message.auteur === 'moi'
                      ? 'bg-slate-900 text-white rounded-2xl rounded-br-sm'
                      : 'bg-white text-slate-900 rounded-2xl rounded-bl-sm border border-slate-200'
                  } px-4 py-3 shadow-sm`}
                >
                  <p className="font-medium whitespace-pre-line">{message.texte}</p>
                  <p className={`text-xs mt-1 ${
                    message.auteur === 'moi' ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex gap-3">
              <button 
                onClick={handleAttachment}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <button 
                onClick={handleEmoji}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Écris ton message..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none text-slate-900"
              />
              <button
                onClick={handleSendMessage}
                className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-20 h-20 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-xl font-semibold text-slate-700">Sélectionne une conversation</p>
            <p className="text-slate-500 mt-2">Choisis un contact pour commencer à discuter</p>
          </div>
        </div>
      )}

      {/* Modal Nouvelle Conversation */}
      {showNewConvModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-slate-900">Nouvelle conversation</h3>
              <button 
                onClick={() => setShowNewConvModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Rechercher un contact</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Nom du joueur ou du club..."
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none text-slate-900"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Contacts suggérés</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {['Emma Dubois 👩', 'Thomas Roux 👨', 'Marc Lefebvre 👨', 'QG Padel Club 🏟️', 'Amélie Garcia 👩'].map((contact, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        alert(`Conversation avec ${contact.split(' ')[0]} démarrée ! 💬`)
                        setShowNewConvModal(false)
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all border border-slate-200"
                    >
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-lg">
                        {contact.split(' ').pop()}
                      </div>
                      <span className="font-medium text-slate-900">{contact.replace(/[^\w\s]/gi, '').trim()}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowNewConvModal(false)}
                className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-all mt-4"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Info Contact */}
      {showInfoModal && currentConv && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Informations</h3>
              <button 
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Avatar et nom */}
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-5xl mb-3 relative">
                  {currentConv.avatar}
                  {currentConv.enLigne && (
                    <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                  )}
                </div>
                <h4 className="text-2xl font-bold text-slate-900">{currentConv.nom}</h4>
                <span className={`mt-2 px-3 py-1 rounded-lg text-sm font-semibold ${
                  currentConv.type === 'club' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'bg-slate-50 text-slate-700 border border-slate-200'
                }`}>
                  {currentConv.type === 'club' ? 'Club' : 'Joueur'}
                </span>
              </div>

              {/* Infos */}
              <div className="space-y-3">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-1">Statut</p>
                  <p className="font-semibold text-slate-900">
                    {currentConv.enLigne ? '🟢 En ligne' : '⚪ Hors ligne'}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-1">Dernier message</p>
                  <p className="font-semibold text-slate-900">{currentConv.timestamp}</p>
                </div>

                {currentConv.type === 'joueur' && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 font-medium mb-1">Matchs ensemble</p>
                    <p className="font-semibold text-slate-900">12 parties</p>
                  </div>
                )}

                {currentConv.type === 'club' && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 font-medium mb-1">Réservations</p>
                    <p className="font-semibold text-slate-900">8 réservations effectuées</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCall}
                  className="flex-1 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition-all border border-blue-200"
                >
                  Appeler
                </button>
                <button
                  onClick={() => {
                    alert(`Bloquer ${currentConv.nom} ?\n\nFonctionnalité en développement 🛠️`)
                  }}
                  className="flex-1 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold transition-all border border-red-200"
                >
                  Bloquer
                </button>
              </div>

              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all shadow-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
