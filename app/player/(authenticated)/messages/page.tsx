'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from '@/state/LocaleContext'

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
  const { t } = useLocale()
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
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isInputFocused, setIsInputFocused] = useState(false)

  // Bloquer le scroll du body quand une conversation est ouverte sur mobile
  useEffect(() => {
    if (selectedConversation && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.height = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.height = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.height = ''
    }
  }, [selectedConversation])

  // Cacher la barre de navigation mobile quand on est dans une conversation
  useEffect(() => {
    const mobileBottomBar = document.querySelector('[data-mobile-bottom-bar]') as HTMLElement
    if (mobileBottomBar) {
      if (selectedConversation && window.innerWidth < 768) {
        mobileBottomBar.style.display = 'none'
      } else {
        mobileBottomBar.style.display = ''
      }
    }

    return () => {
      if (mobileBottomBar) {
        mobileBottomBar.style.display = ''
      }
    }
  }, [selectedConversation])

  // Gérer le clavier mobile et ajuster la vue
  useEffect(() => {
    if (typeof window === 'undefined' || !selectedConversation) return

    const handleVisualViewportResize = () => {
      if (window.visualViewport) {
        const viewport = window.visualViewport
        const windowHeight = window.innerHeight
        const viewportHeight = viewport.height
        const diff = windowHeight - viewportHeight
        
        // Le clavier est ouvert si la différence est significative
        if (diff > 150) {
          setKeyboardHeight(diff)
          // Scroll vers le bas après un court délai
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
            }
          }, 100)
        } else {
          setKeyboardHeight(0)
        }
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportResize)
      return () => {
        window.visualViewport?.removeEventListener('resize', handleVisualViewportResize)
      }
    }
  }, [selectedConversation])

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
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
    
    // Garder le focus sur l'input après l'envoi
    if (inputRef.current) {
      inputRef.current.focus()
    }
    
    // Scroll vers le bas après l'envoi
    setTimeout(scrollToBottom, 100)
  }

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv)
    // Marquer comme lu
    setConversations(prev => prev.map(c => 
      c.id === conv.id ? { ...c, unreadCount: 0 } : c
    ))
    
    // Sur mobile, activer automatiquement le mode écriture (comme Instagram)
    if (window.innerWidth < 768) {
      setIsInputFocused(true)
      // Focus l'input après un court délai pour laisser l'animation se terminer
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          // Forcer l'ouverture du clavier sur iOS
          inputRef.current.click()
        }
        // Scroll vers le bas après le focus
        setTimeout(scrollToBottom, 300)
      }, 500)
    } else {
      // Scroll vers le bas pour desktop
      setTimeout(scrollToBottom, 100)
    }
  }

  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (type: string) => {
    switch (type) {
      case 'club': return 'from-slate-700 to-slate-800'
      case 'system': return 'from-purple-500 to-purple-600'
      case 'player': return 'from-green-500 to-green-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <>
      {/* Vue normale (liste + desktop) */}
      <div className={`min-h-screen bg-gray-50 ${selectedConversation ? 'hidden md:block' : 'block'}`}>
        <div className="container mx-auto px-3 md:px-6 py-4 md:py-6 pb-1 md:pb-3 max-w-[1400px]">
          {/* En-tête */}
          <div className="mb-4 md:mb-5">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{t('messages.title')}</h1>
            <p className="text-sm md:text-base text-gray-600">{t('messages.subtitle')}</p>
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
                    placeholder={t('messages.rechercher')}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
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
                      selectedConversation?.id === conv.id ? 'bg-slate-50 border-l-4 border-slate-900' : ''
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
                          <span className="ml-2 bg-slate-900 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Zone de conversation - Droite (Desktop) */}
            {selectedConversation ? (
              <div className="hidden md:flex flex-1 flex-col w-full">
                {/* En-tête de la conversation */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(selectedConversation.type)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {getAvatarInitials(selectedConversation.contact)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-900 truncate">{selectedConversation.contact}</h2>
                    <p className="text-xs text-gray-500 truncate">
                      {selectedConversation.type === 'club' ? t('messages.clubPadel') : 
                       selectedConversation.type === 'system' ? t('messages.notificationsPadup') : t('messages.joueur')}
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
                              ? 'bg-slate-900 text-white rounded-br-md'
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
                      placeholder={t('messages.ecrireMessage')}
                      className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
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
                  <p className="text-gray-500 font-semibold">{t('messages.selectionnerConversation')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Vue mobile plein écran pour la conversation */}
      {selectedConversation && (
        <div 
          className="md:hidden fixed inset-0 bg-white z-50 flex flex-col"
          style={{
            minHeight: '100vh',
            height: '100dvh',
            overscrollBehavior: 'none',
            overflow: 'hidden',
          }}
        >
          {/* En-tête de la conversation */}
          <div className="flex-shrink-0 p-3 border-b border-gray-200 flex items-center gap-3 bg-white" style={{ touchAction: 'none' }}>
            {/* Bouton retour */}
            <button
              onClick={() => {
                setSelectedConversation(null)
                setIsInputFocused(false)
              }}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(selectedConversation.type)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
              {getAvatarInitials(selectedConversation.contact)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900 truncate text-base">{selectedConversation.contact}</h2>
              <p className="text-xs text-gray-500 truncate">
                {selectedConversation.type === 'club' ? t('messages.clubPadel') : 
                 selectedConversation.type === 'system' ? t('messages.notificationsPadup') : t('messages.joueur')}
              </p>
            </div>
          </div>

          {/* Messages - Zone scrollable avec hauteur dynamique */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden px-3 bg-gray-50"
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
              overscrollBehavior: 'contain',
              paddingTop: '16px',
              paddingBottom: 'calc(180px + 4cm)',
              marginBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px',
              minHeight: '100%',
            }}
          >
            {selectedConversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex mb-3 ${msg.isFromMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${msg.isFromMe ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      msg.isFromMe
                        ? 'bg-slate-900 text-white rounded-br-md'
                        : 'bg-white text-gray-900 shadow-sm rounded-bl-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{msg.text}</p>
                  </div>
                  <p className={`text-[11px] text-gray-500 mt-1 px-2 ${msg.isFromMe ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie - Fixe en bas, s'ajuste au clavier */}
          <div 
            className="flex-shrink-0 p-3 border-t border-gray-200 bg-white"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
              transform: keyboardHeight > 0 ? `translateY(-${keyboardHeight}px)` : 'translateY(0)',
              transition: 'transform 0.2s ease-out',
              zIndex: 10,
              touchAction: 'none',
            }}
          >
            <div className="flex items-end gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                onFocus={() => {
                  if (!isInputFocused) {
                    setIsInputFocused(true)
                  }
                  setTimeout(() => {
                    if (messagesContainerRef.current) {
                      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
                    }
                  }, 300)
                  setTimeout(scrollToBottom, 400)
                }}
                placeholder={t('messages.ecrireMessage')}
                className="flex-1 px-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-400 text-[16px]"
                style={{ fontSize: '16px' }} // Évite le zoom sur iOS
              />
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                onMouseDown={(e) => e.preventDefault()}
                disabled={!newMessage.trim()}
                className="flex-shrink-0 w-12 h-12 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all flex items-center justify-center touch-manipulation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
