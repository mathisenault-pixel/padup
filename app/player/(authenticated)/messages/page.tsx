'use client'

import { useState } from 'react'

type Message = {
  id: number
  sender: string
  subject: string
  preview: string
  date: string
  read: boolean
  type: 'club' | 'system' | 'player'
}

export default function MessagesPage() {
  const [messages] = useState<Message[]>([
    {
      id: 1,
      sender: 'Le Hangar Sport & Co',
      subject: 'Confirmation de réservation',
      preview: 'Votre réservation pour le terrain 3 a été confirmée pour demain à 18h00.',
      date: '2026-01-22',
      read: false,
      type: 'club'
    },
    {
      id: 2,
      sender: 'Pad\'Up',
      subject: 'Nouveautés de la plateforme',
      preview: 'Découvrez les nouvelles fonctionnalités disponibles sur Pad\'Up !',
      date: '2026-01-20',
      read: true,
      type: 'system'
    },
    {
      id: 3,
      sender: 'Paul & Louis Sport',
      subject: 'Nouveau tournoi organisé',
      preview: 'Inscrivez-vous au tournoi P1000 du 15 février !',
      date: '2026-01-18',
      read: true,
      type: 'club'
    }
  ])

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'club':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )
      case 'system':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return "Hier"
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-8">
        
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Vos conversations et notifications</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Liste des messages */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              
              {/* Header de la liste */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">Boîte de réception</h2>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {messages.filter(m => !m.read).length} nouveau{messages.filter(m => !m.read).length > 1 ? 'x' : ''}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="divide-y divide-gray-200">
                {messages.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500 font-medium">Aucun message</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <button
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`w-full text-left px-4 py-4 hover:bg-gray-50 transition-all ${
                        selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                      } ${!message.read ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          message.type === 'club' ? 'bg-blue-100 text-blue-600' :
                          message.type === 'system' ? 'bg-purple-100 text-purple-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getTypeIcon(message.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`text-sm font-semibold truncate ${!message.read ? 'text-gray-900' : 'text-gray-600'}`}>
                              {message.sender}
                            </p>
                            {!message.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          <p className={`text-sm mb-1 truncate ${!message.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                            {message.subject}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{message.preview}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(message.date)}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

            </div>
          </div>

          {/* Détails du message */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                
                {/* Header du message */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedMessage.type === 'club' ? 'bg-blue-100 text-blue-600' :
                      selectedMessage.type === 'system' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {getTypeIcon(selectedMessage.type)}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedMessage.subject}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-semibold">{selectedMessage.sender}</span>
                        <span>•</span>
                        <span>{formatDate(selectedMessage.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenu du message */}
                <div className="px-6 py-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedMessage.preview}
                    {'\n\n'}
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    {'\n\n'}
                    Cordialement,{'\n'}
                    {selectedMessage.sender}
                  </p>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all">
                      Répondre
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all">
                      Supprimer
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex items-center justify-center p-12">
                <div className="text-center">
                  <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-gray-500 font-medium text-lg">Sélectionnez un message</p>
                  <p className="text-gray-400 text-sm mt-2">Choisissez un message dans la liste pour le lire</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
