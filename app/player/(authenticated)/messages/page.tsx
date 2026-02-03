'use client'

import { useState, useEffect } from 'react'

type Message = {
  id: number
  sender: string
  subject: string
  preview: string
  fullContent: string
  date: string
  read: boolean
  type: 'club' | 'system' | 'player'
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'Le Hangar Sport & Co',
      subject: 'Confirmation de réservation',
      preview: 'Votre réservation pour le terrain 3 a été confirmée pour demain à 18h00.',
      fullContent: `Bonjour,

Nous vous confirmons votre réservation :

📅 Date : Demain, 23 janvier 2026
⏰ Horaire : 18h00 - 19h30
🎾 Terrain : Terrain 3 (couvert)
💰 Prix : 25€

Votre terrain sera disponible 5 minutes avant l'heure de début. N'oubliez pas d'apporter votre carte de membre ou une pièce d'identité.

En cas d'empêchement, merci de nous prévenir au moins 24h à l'avance.

À très bientôt sur nos terrains !

Cordialement,
L'équipe du Hangar Sport & Co`,
      date: '2026-01-22',
      read: false,
      type: 'club'
    },
    {
      id: 2,
      sender: 'Pad\'Up',
      subject: 'Nouveautés de la plateforme',
      preview: 'Découvrez les nouvelles fonctionnalités disponibles sur Pad\'Up !',
      fullContent: `Bonjour,

Nous sommes ravis de vous présenter les dernières nouveautés de Pad'Up :

✨ Nouvelles fonctionnalités :
• Recherche de clubs par ville avec rayon personnalisable
• Système de messagerie amélioré
• Historique complet de vos réservations et tournois
• Interface modernisée et plus intuitive

🏆 Tournois à venir :
Consultez l'onglet "Tournois" pour découvrir tous les événements à venir dans votre région.

Merci de votre confiance et bon jeu !

L'équipe Pad'Up`,
      date: '2026-01-20',
      read: true,
      type: 'system'
    },
    {
      id: 3,
      sender: 'Paul & Louis Sport',
      subject: 'Nouveau tournoi organisé',
      preview: 'Inscrivez-vous au tournoi P1000 du 15 février !',
      fullContent: `Chers joueurs,

Nous sommes heureux de vous annoncer l'organisation d'un tournoi P1000 :

🏆 Tournoi P1000 Hommes
📅 Date : 15 février 2026
⏰ Début : 09h00
💰 Inscription : 20€ par équipe
🎁 Dotation : 500€ + Trophées

Format : B1 (16 équipes maximum)
Niveau : Intermédiaire à avancé

Les inscriptions sont ouvertes dès maintenant via l'onglet "Tournois" de l'application.

Places limitées, ne tardez pas !

Sportivement,
L'équipe Paul & Louis Sport`,
      date: '2026-01-18',
      read: true,
      type: 'club'
    }
  ])

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Marquer automatiquement comme lu lors de la sélection
  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message)
    
    if (!message.read) {
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, read: true } : m
      ))
    }
  }

  // Marquer tous les messages comme lus
  const markAllAsRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })))
  }

  // Supprimer un message
  const handleDelete = () => {
    if (!selectedMessage) return
    
    setMessages(prev => prev.filter(m => m.id !== selectedMessage.id))
    setSelectedMessage(null)
    setShowDeleteConfirm(false)
  }

  // Répondre à un message
  const handleReply = () => {
    if (!replyText.trim() || !selectedMessage) return
    
    // Simuler l'envoi (dans une vraie app, ce serait une API call)
    console.log('Réponse envoyée:', {
      to: selectedMessage.sender,
      subject: `Re: ${selectedMessage.subject}`,
      content: replyText
    })
    
    // Réinitialiser et fermer
    setReplyText('')
    setShowReplyModal(false)
    
    // Feedback visuel
    alert('Votre réponse a été envoyée avec succès !')
  }

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
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-gray-900">Boîte de réception</h2>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {messages.filter(m => !m.read).length} nouveau{messages.filter(m => !m.read).length > 1 ? 'x' : ''}
                  </span>
                </div>
                {messages.filter(m => !m.read).length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
                  >
                    Tout marquer comme lu
                  </button>
                )}
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
                      onClick={() => handleSelectMessage(message)}
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
                    {selectedMessage.fullContent}
                  </p>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    {selectedMessage.type === 'club' && (
                      <button 
                        onClick={() => setShowReplyModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Répondre
                      </button>
                    )}
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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

      {/* Modal Répondre */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Répondre à {selectedMessage.sender}</h3>
                <button
                  onClick={() => {
                    setShowReplyModal(false)
                    setReplyText('')
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="px-6 py-6">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-900 mb-2">Sujet</label>
                <input
                  type="text"
                  value={`Re: ${selectedMessage.subject}`}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Votre message</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Écrivez votre réponse..."
                  rows={8}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-gray-900"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReplyModal(false)
                    setReplyText('')
                  }}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Envoyer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      {showDeleteConfirm && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Supprimer ce message ?</h3>
                  <p className="text-sm text-gray-600 mt-1">Cette action est irréversible</p>
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div className="px-6 py-5">
              <p className="text-gray-700">
                Êtes-vous sûr de vouloir supprimer le message <strong>"{selectedMessage.subject}"</strong> de <strong>{selectedMessage.sender}</strong> ?
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
