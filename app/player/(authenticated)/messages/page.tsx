'use client'

import { useState, useRef, useEffect } from 'react'

type MessageBubble = {
  id: number
  text: string
  timestamp: string
  isFromMe: boolean
}

type Conversation = {
  id: number
  contact: string
  avatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  messages: MessageBubble[]
  type: 'club' | 'system' | 'player'
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      contact: 'Le Hangar Sport & Co',
      lastMessage: 'Votre réservation est confirmée',
      lastMessageTime: '10:30',
      unreadCount: 2,
      type: 'club',
      messages: [
        {
          id: 1,
          text: 'Bonjour ! Votre réservation pour le terrain 3 a été confirmée pour demain à 18h00.',
          timestamp: '10:25',
          isFromMe: false
        },
        {
          id: 2,
          text: 'Merci beaucoup ! Est-ce que je peux annuler jusqu\'à quelle heure ?',
          timestamp: '10:27',
          isFromMe: true
        },
        {
          id: 3,
          text: 'Vous pouvez annuler gratuitement jusqu\'à 24h avant votre créneau. 🎾',
          timestamp: '10:30',
          isFromMe: false
        }
      ]
    },
    {
      id: 2,
      contact: 'Pad\'Up',
      lastMessage: 'Découvrez les nouvelles fonctionnalités',
      lastMessageTime: 'Hier',
      unreadCount: 0,
      type: 'system',
      messages: [
        {
          id: 1,
          text: 'Bonjour ! 👋 Nous avons ajouté de nouvelles fonctionnalités pour améliorer votre expérience.',
          timestamp: 'Hier 15:20',
          isFromMe: false
        },
        {
          id: 2,
          text: '✨ Nouvelles fonctionnalités :\n• Recherche de clubs par ville\n• Système de messagerie amélioré\n• Historique complet de vos réservations',
          timestamp: 'Hier 15:20',
          isFromMe: false
        },
        {
          id: 3,
          text: 'Super, merci !',
          timestamp: 'Hier 16:45',
          isFromMe: true
        }
      ]
    },
    {
      id: 3,
      contact: 'Paul & Louis Sport',
      lastMessage: 'Inscrivez-vous au tournoi P1000',
      lastMessageTime: '18 Jan',
      unreadCount: 0,
      type: 'club',
      messages: [
        {
          id: 1,
          text: 'Bonjour ! 🏆 Nous organisons un tournoi P1000 le 15 février.',
          timestamp: '18 Jan 14:30',
          isFromMe: false
        },
        {
          id: 2,
          text: 'Format B1, inscription 20€ par équipe, dotation 500€ + trophées.',
          timestamp: '18 Jan 14:30',
          isFromMe: false
        },
        {
          id: 3,
          text: 'Les inscriptions sont ouvertes via l\'onglet Tournois !',
          timestamp: '18 Jan 14:31',
          isFromMe: false
        }
      ]
    }
  ])

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const newMsg: MessageBubble = {
      id: Date.now(),
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isFromMe: true
    }

    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id
        ? { ...conv, messages: [...conv.messages, newMsg], lastMessage: newMessage, lastMessageTime: 'À l\'instant' }
        : conv
    ))

    setSelectedConversation(prev => prev ? { ...prev, messages: [...prev.messages, newMsg] } : null)
    setNewMessage('')
  }

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv)
    // Marquer comme lu
    setConversations(prev => prev.map(c => 
      c.id === conv.id ? { ...c, unreadCount: 0 } : c
    ))
  }

  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (type: string) => {
    switch (type) {
      case 'club': return 'from-blue-500 to-blue-600'
      case 'system': return 'from-purple-500 to-purple-600'
      case 'player': return 'from-green-500 to-green-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 md:px-6 py-4 md:py-6 pb-1 md:pb-3 max-w-[1400px]">
        {/* En-tête */}
        <div className="mb-4 md:mb-5">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Messages</h1>
          <p className="text-sm md:text-base text-gray-600">Discutez avec les clubs et consultez vos notifications</p>
        </div>

        {/* Interface de messagerie */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
          <div className="flex h-full">
            {/* Liste des conversations - Gauche */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
              {/* Recherche */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Liste des conversations */}
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer touch-manipulation ${
                      selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(conv.type)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {getAvatarInitials(conv.contact)}
                    </div>

                    {/* Info conversation */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-bold text-gray-900 truncate ${conv.unreadCount > 0 ? 'font-black' : ''}`}>
                          {conv.contact}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{conv.lastMessageTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                          {conv.lastMessage}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Zone de conversation - Droite */}
            {selectedConversation ? (
              <div className="flex flex-1 flex-col w-full">
                {/* En-tête de la conversation */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                  {/* Bouton retour (mobile uniquement) */}
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(selectedConversation.type)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {getAvatarInitials(selectedConversation.contact)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-900 truncate">{selectedConversation.contact}</h2>
                    <p className="text-xs text-gray-500 truncate">
                      {selectedConversation.type === 'club' ? 'Club de padel' : 
                       selectedConversation.type === 'system' ? 'Notifications Pad\'Up' : 'Joueur'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isFromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${msg.isFromMe ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            msg.isFromMe
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-white text-gray-900 shadow-sm rounded-bl-md'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        </div>
                        <p className={`text-xs text-gray-500 mt-1 px-2 ${msg.isFromMe ? 'text-right' : 'text-left'}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Zone de saisie */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Écrivez votre message..."
                      className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
                <div className="text-center">
                  <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-gray-500 font-semibold">Sélectionnez une conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
