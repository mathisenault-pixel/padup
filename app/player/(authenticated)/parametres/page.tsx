'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'

export default function ParametresPage() {
  const router = useRouter()
  const [email, setEmail] = useState('demo@padup.com')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  })
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const handleEmailChange = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
    console.log('Email changé:', email)
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas')
      return
    }
    
    if (newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    console.log('Mot de passe changé')
  }

  const handleNotificationsChange = () => {
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
    console.log('Notifications mises à jour:', notifications)
  }

  const handleSignOut = async () => {
    if (!confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      return
    }
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Erreur lors de la déconnexion:', error)
      alert('Erreur lors de la déconnexion')
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Paramètres</h1>
          <p className="text-lg text-gray-600">Gérez votre compte et vos préférences</p>
        </div>

        {/* Message de succès */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold text-green-700">Modifications enregistrées avec succès !</span>
          </div>
        )}

        <div className="space-y-6">
          
          {/* Section Email */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Adresse email</h2>
              <p className="text-gray-600">Modifiez votre adresse email de connexion</p>
            </div>
            
            <form onSubmit={handleEmailChange}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nouvelle adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-slate-400 text-gray-900"
                  placeholder="votre-email@exemple.com"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all"
              >
                Enregistrer l'email
              </button>
            </form>
          </div>

          {/* Section Mot de passe */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Mot de passe</h2>
              <p className="text-gray-600">Changez votre mot de passe de connexion</p>
            </div>
            
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-slate-400 text-gray-900"
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-slate-400 text-gray-900"
                    placeholder="••••••••"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Minimum 6 caractères</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-slate-400 text-gray-900"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all"
              >
                Changer le mot de passe
              </button>
            </form>
          </div>

          {/* Section Notifications */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Notifications</h2>
              <p className="text-gray-600">Gérez vos préférences de notifications</p>
            </div>
            
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Notifications par email</div>
                    <div className="text-sm text-gray-600">Réservations, rappels, actualités</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setNotifications({ ...notifications, email: !notifications.email })
                    handleNotificationsChange()
                  }}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    notifications.email ? 'bg-slate-900' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* SMS */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Notifications par SMS</div>
                    <div className="text-sm text-gray-600">Rappels urgents uniquement</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setNotifications({ ...notifications, sms: !notifications.sms })
                    handleNotificationsChange()
                  }}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    notifications.sms ? 'bg-slate-900' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      notifications.sms ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Push */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Notifications push</div>
                    <div className="text-sm text-gray-600">Notifications dans l'application</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setNotifications({ ...notifications, push: !notifications.push })
                    handleNotificationsChange()
                  }}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    notifications.push ? 'bg-slate-900' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      notifications.push ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section Confidentialité */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Confidentialité et sécurité</h2>
              <p className="text-gray-600">Gérez vos données et votre compte</p>
            </div>
            
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl font-semibold text-gray-900 transition-all">
                Télécharger mes données
              </button>
              
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl font-semibold text-gray-900 transition-all">
                Historique de connexion
              </button>
              
              <button 
                onClick={handleSignOut}
                className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-xl font-semibold text-red-600 transition-all"
              >
                Me déconnecter de ce compte
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

