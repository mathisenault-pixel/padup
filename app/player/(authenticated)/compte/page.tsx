'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
import type { User } from '@supabase/supabase-js'

type ProfilInfo = {
  nom: string
  prenom: string
  email: string
  telephone: string
  dateNaissance: string
  niveau: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert'
  coupPrefere: string
  mainDominante: 'Droitier' | 'Gaucher' | 'Ambidextre'
  positionPreferee: 'Gauche' | 'Droite' | 'Les deux'
  experience: string
  objectifs: string
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  
  // États pour les paramètres (anciennement dans parametres/page.tsx)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  })
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  
  const [profil, setProfil] = useState<ProfilInfo>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    dateNaissance: '',
    niveau: 'Intermédiaire',
    coupPrefere: '',
    mainDominante: 'Droitier',
    positionPreferee: 'Droite',
    experience: '',
    objectifs: ''
  })

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[COMPTE] Checking authentication...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('[COMPTE] Error checking session:', error)
        router.push('/login')
        return
      }

      if (!session?.user) {
        console.log('[COMPTE] No session found, redirecting to login')
        router.push('/login')
        return
      }

      console.log('[COMPTE] User authenticated:', session.user.email)
      setUser(session.user)
      
      // Charger les données du profil depuis l'email de l'utilisateur
      setProfil(prev => ({
        ...prev,
        email: session.user.email || '',
        // Pour l'instant, on garde les valeurs par défaut pour les autres champs
        // Plus tard, on pourra les charger depuis une table profiles dans Supabase
        nom: 'Dupont',
        prenom: 'Jean',
        telephone: '+33 6 12 34 56 78',
        dateNaissance: '1990-05-15',
        coupPrefere: 'Vibora',
        experience: '2 ans',
        objectifs: 'Progresser en technique et participer à des tournois régionaux'
      }))
      
      setIsLoadingAuth(false)
    }

    checkAuth()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[COMPTE] Auth state changed:', event)
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login')
      } else if (session?.user) {
        setUser(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier que c'est une image
      if (!file.type.startsWith('image/')) {
        alert('⚠️ Veuillez sélectionner une image')
        return
      }
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('⚠️ L\'image est trop grande (max 5MB)')
        return
      }
      // Créer une URL temporaire pour afficher l'image
      const url = URL.createObjectURL(file)
      setPhotoUrl(url)
    }
  }

  const [stats] = useState({
    matchsJoues: 42,
    victoires: 28,
    defaites: 14,
    tempsJeuTotal: '63h',
    tournoisParticipes: 5,
    tauxVictoire: 67,
    classement: '12847',
  })

  const handleSave = () => {
    setIsEditing(false)
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
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

  const getNiveauColor = (niveau: string) => {
    switch (niveau) {
      case 'Débutant': return 'from-blue-500 to-blue-600'
      case 'Intermédiaire': return 'from-blue-500 to-blue-600'
      case 'Avancé': return 'from-blue-500 to-blue-600'
      case 'Expert': return 'from-blue-500 to-blue-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  // Afficher un loader pendant la vérification d'authentification
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Chargement...</p>
        </div>
      </div>
    )
  }

  // Ne rien afficher si pas d'utilisateur (redirection en cours)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12 max-w-[1400px]">
        
        {/* Message de succès global */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center gap-3 max-w-4xl mx-auto">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold text-green-700">Modifications enregistrées avec succès !</span>
          </div>
        )}
        
        {/* Header avec bouton Modifier */}
        <div className="flex items-center justify-end mb-8">
          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl font-bold transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Enregistrer
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier
              </span>
            </button>
          )}
        </div>

        {/* Layout 2 colonnes - Profil à gauche, Stats à droite */}
        {!isEditing ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne gauche - Profil */}
            <div className="space-y-6">
              {/* Card Profil Principal */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 text-center shadow-lg">
                {/* Avatar */}
                <div className="relative inline-block mb-6">
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer group relative block"
                  >
                    {photoUrl ? (
                      <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl relative">
                        <img
                          src={photoUrl}
                          alt="Photo de profil"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center text-white text-5xl font-bold shadow-xl relative group-hover:shadow-2xl group-hover:scale-105 transition-all">
                        {profil.prenom[0]}{profil.nom[0]}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-3xl flex items-center justify-center">
                          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </label>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Nom */}
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {profil.prenom} {profil.nom}
                </h2>
                <p className="text-gray-600 mb-4">{profil.email}</p>

                {/* Classement */}
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-bold shadow-lg mb-6">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  {stats.classement}ème français
                </div>

                {/* Niveau */}
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Niveau</p>
                  <span className={`inline-block px-6 py-2 bg-gradient-to-r ${getNiveauColor(profil.niveau)} text-white rounded-2xl font-bold text-lg shadow-lg`}>
                    {profil.niveau}
                  </span>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t-2 border-gray-100">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.matchsJoues}</p>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Matchs</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-600">{stats.tauxVictoire}%</p>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Victoires</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite - Statistiques */}
            <div className="space-y-6">
              {/* Card Statistiques Détaillées */}
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Statistiques détaillées
                </h3>

                <div className="space-y-5">
                  {[
                    { label: 'Matchs joués', value: stats.matchsJoues, icon: '🎾', color: 'gray' },
                    { label: 'Victoires', value: stats.victoires, icon: '✓', color: 'emerald' },
                    { label: 'Défaites', value: stats.defaites, icon: '✕', color: 'red' },
                    { label: 'Taux de victoire', value: `${stats.tauxVictoire}%`, icon: '📊', color: 'blue' },
                    { label: 'Temps de jeu total', value: stats.tempsJeuTotal, icon: '⏱', color: 'purple' },
                    { label: 'Tournois participés', value: stats.tournoisParticipes, icon: '🏆', color: 'orange' },
                  ].map((stat, index) => (
                    <div key={index} className="bg-gray-50 rounded-2xl p-5 hover:bg-gray-100 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{stat.icon}</span>
                          <span className="font-semibold text-gray-700 text-lg">{stat.label}</span>
                        </div>
                        <span className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Mode édition - Formulaires */
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Section Informations personnelles */}
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Informations personnelles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Prénom</label>
                  <input
                    type="text"
                    value={profil.prenom}
                    onChange={(e) => setProfil({ ...profil, prenom: e.target.value })}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Nom</label>
                  <input
                    type="text"
                    value={profil.nom}
                    onChange={(e) => setProfil({ ...profil, nom: e.target.value })}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    value={profil.email}
                    onChange={(e) => setProfil({ ...profil, email: e.target.value })}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Téléphone</label>
                  <input
                    type="tel"
                    value={profil.telephone}
                    onChange={(e) => setProfil({ ...profil, telephone: e.target.value })}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Date de naissance</label>
                  <input
                    type="date"
                    value={profil.dateNaissance}
                    onChange={(e) => setProfil({ ...profil, dateNaissance: e.target.value })}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Expérience</label>
                  <input
                    type="text"
                    value={profil.experience}
                    onChange={(e) => setProfil({ ...profil, experience: e.target.value })}
                    placeholder="Ex: 2 ans"
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Section Profil de jeu */}
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Profil de jeu
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Niveau</label>
                  <select
                    value={profil.niveau}
                    onChange={(e) => setProfil({ ...profil, niveau: e.target.value as ProfilInfo['niveau'] })}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium transition-all"
                  >
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Coup préféré</label>
                  <input
                    type="text"
                    value={profil.coupPrefere}
                    onChange={(e) => setProfil({ ...profil, coupPrefere: e.target.value })}
                    placeholder="Ex: Vibora, Bandeja, Smash..."
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium transition-all placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Main dominante</label>
                  <select
                    value={profil.mainDominante}
                    onChange={(e) => setProfil({ ...profil, mainDominante: e.target.value as ProfilInfo['mainDominante'] })}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium transition-all"
                  >
                    <option value="Droitier">Droitier</option>
                    <option value="Gaucher">Gaucher</option>
                    <option value="Ambidextre">Ambidextre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Position préférée</label>
                  <select
                    value={profil.positionPreferee}
                    onChange={(e) => setProfil({ ...profil, positionPreferee: e.target.value as ProfilInfo['positionPreferee'] })}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium transition-all"
                  >
                    <option value="Gauche">Gauche (revers)</option>
                    <option value="Droite">Droite (coup droit)</option>
                    <option value="Les deux">Les deux</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Objectifs</label>
                  <textarea
                    value={profil.objectifs}
                    onChange={(e) => setProfil({ ...profil, objectifs: e.target.value })}
                    rows={4}
                    placeholder="Quels sont vos objectifs au padel ?"
                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-900 font-medium transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION PARAMÈTRES (anciennement dans parametres/page.tsx) */}
        <div className="space-y-6 max-w-4xl mx-auto mt-12">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Paramètres du compte</h2>
            <p className="text-lg text-gray-600">Gérez votre sécurité et vos préférences</p>
          </div>

          {/* Section Mot de passe */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Mot de passe</h3>
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 text-gray-900"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 text-gray-900"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 text-gray-900"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
              >
                Changer le mot de passe
              </button>
            </form>
          </div>

          {/* Section Notifications */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Notifications</h3>
              <p className="text-gray-600">Gérez vos préférences de notifications</p>
            </div>
            
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    notifications.email ? 'bg-blue-600' : 'bg-gray-300'
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
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    notifications.sms ? 'bg-blue-600' : 'bg-gray-300'
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
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    notifications.push ? 'bg-blue-600' : 'bg-gray-300'
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
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Confidentialité et sécurité</h3>
              <p className="text-gray-600">Gérez vos données et votre compte</p>
            </div>
            
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl font-semibold text-gray-900 transition-all">
                Télécharger mes données
              </button>
              
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl font-semibold text-gray-900 transition-all">
                Historique de connexion
              </button>
              
              <button className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-xl font-semibold text-red-600 transition-all">
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


