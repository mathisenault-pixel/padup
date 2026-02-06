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

export default function ProfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
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
      console.log('[PROFIL] Checking authentication...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('[PROFIL] Error checking session:', error)
        router.push('/login')
        return
      }

      if (!session?.user) {
        console.log('[PROFIL] No session found, redirecting to login')
        router.push('/login')
        return
      }

      console.log('[PROFIL] User authenticated:', session.user.email)
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
      console.log('[PROFIL] Auth state changed:', event)
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
    alert('✅ Profil mis à jour avec succès !')
  }

  const getNiveauColor = (niveau: string) => {
    switch (niveau) {
      case 'Débutant': return 'from-slate-700 to-slate-800'
      case 'Intermédiaire': return 'from-slate-700 to-slate-800'
      case 'Avancé': return 'from-slate-700 to-slate-800'
      case 'Expert': return 'from-slate-700 to-slate-800'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const handleSignOut = async () => {
    if (!confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      return
    }

    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('[PROFIL] Error signing out:', error)
      alert('Erreur lors de la déconnexion')
    } else {
      console.log('[PROFIL] ✅ Signed out successfully')
      router.push('/player/accueil')
    }
  }

  // Afficher un loader pendant la vérification d'authentification
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Header avec titre et boutons */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-2">
            {isEditing ? 'Modifier mon profil' : 'Mon profil'}
          </h1>
          <p className="text-base sm:text-lg text-slate-500">
            {isEditing ? 'Mettez à jour vos informations personnelles' : 'Gérez vos informations personnelles'}
          </p>
        </div>

        {/* Contenu principal */}
        {!isEditing ? (
          /* Mode Lecture - Card unique avec toutes les infos */
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
            {/* Section Profil */}
            <div className="text-center mb-8">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
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
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm relative border border-slate-200">
                      <img
                        src={photoUrl}
                        alt="Photo de profil"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-3xl font-semibold shadow-sm border border-slate-200 relative group-hover:bg-slate-800 transition-all">
                      {profil.prenom[0]}{profil.nom[0]}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-2xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* Nom et Email */}
              <h2 className="text-2xl font-semibold text-slate-900 mb-1">
                {profil.prenom} {profil.nom}
              </h2>
              <p className="text-sm text-slate-500 mb-4">{profil.email}</p>

              {/* Classement et Niveau */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium shadow-sm mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                {stats.classement}ème français • {profil.niveau}
              </div>
            </div>

            {/* Séparateur */}
            <div className="border-t border-slate-200 my-6"></div>

            {/* Informations personnelles */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations personnelles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Téléphone</p>
                  <p className="text-sm text-slate-500">{profil.telephone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Date de naissance</p>
                  <p className="text-sm text-slate-500">
                    {new Date(profil.dateNaissance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Expérience</p>
                  <p className="text-sm text-slate-500">{profil.experience}</p>
                </div>
              </div>
            </div>

            {/* Séparateur */}
            <div className="border-t border-slate-200 my-6"></div>

            {/* Profil de jeu */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Profil de jeu</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Coup préféré</p>
                  <p className="text-sm text-slate-500">{profil.coupPrefere}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Main dominante</p>
                  <p className="text-sm text-slate-500">{profil.mainDominante}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Position préférée</p>
                  <p className="text-sm text-slate-500">{profil.positionPreferee}</p>
                </div>
              </div>
              {profil.objectifs && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700 mb-1">Objectifs</p>
                  <p className="text-sm text-slate-500">{profil.objectifs}</p>
                </div>
              )}
            </div>

            {/* Séparateur */}
            <div className="border-t border-slate-200 my-6"></div>

            {/* Statistiques */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Statistiques</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Matchs', value: stats.matchsJoues },
                  { label: 'Victoires', value: stats.victoires },
                  { label: 'Défaites', value: stats.defaites },
                  { label: 'Taux victoire', value: `${stats.tauxVictoire}%` },
                  { label: 'Temps de jeu', value: stats.tempsJeuTotal },
                  { label: 'Tournois', value: stats.tournoisParticipes },
                ].map((stat, index) => (
                  <div key={index} className="bg-slate-50 rounded-xl p-4">
                    <p className="text-2xl font-semibold text-slate-900 mb-1">{stat.value}</p>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bouton Modifier */}
            <div className="mt-8">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto h-10 px-4 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier mon profil
              </button>
            </div>
          </div>
        ) : (
          /* Mode édition - Formulaires */
          <div className="space-y-6">
            {/* Section Informations personnelles */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Informations personnelles
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    value={profil.prenom}
                    onChange={(e) => setProfil({ ...profil, prenom: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none text-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                  <input
                    type="text"
                    value={profil.nom}
                    onChange={(e) => setProfil({ ...profil, nom: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none text-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profil.email}
                    onChange={(e) => setProfil({ ...profil, email: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none text-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={profil.telephone}
                    onChange={(e) => setProfil({ ...profil, telephone: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none text-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date de naissance</label>
                  <input
                    type="date"
                    value={profil.dateNaissance}
                    onChange={(e) => setProfil({ ...profil, dateNaissance: e.target.value })}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none text-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Expérience</label>
                  <input
                    type="text"
                    value={profil.experience}
                    onChange={(e) => setProfil({ ...profil, experience: e.target.value })}
                    placeholder="Ex: 2 ans"
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none text-slate-900 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Section Profil de jeu */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Profil de jeu
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Niveau</label>
                  <select
                    value={profil.niveau}
                    onChange={(e) => setProfil({ ...profil, niveau: e.target.value as ProfilInfo['niveau'] })}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none text-slate-900 transition-all"
                  >
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Coup préféré</label>
                  <input
                    type="text"
                    value={profil.coupPrefere}
                    onChange={(e) => setProfil({ ...profil, coupPrefere: e.target.value })}
                    placeholder="Ex: Vibora, Bandeja, Smash..."
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none text-slate-900 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Main dominante</label>
                  <select
                    value={profil.mainDominante}
                    onChange={(e) => setProfil({ ...profil, mainDominante: e.target.value as ProfilInfo['mainDominante'] })}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none text-slate-900 transition-all"
                  >
                    <option value="Droitier">Droitier</option>
                    <option value="Gaucher">Gaucher</option>
                    <option value="Ambidextre">Ambidextre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Position préférée</label>
                  <select
                    value={profil.positionPreferee}
                    onChange={(e) => setProfil({ ...profil, positionPreferee: e.target.value as ProfilInfo['positionPreferee'] })}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none text-slate-900 transition-all"
                  >
                    <option value="Gauche">Gauche (revers)</option>
                    <option value="Droite">Droite (coup droit)</option>
                    <option value="Les deux">Les deux</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Objectifs</label>
                  <textarea
                    value={profil.objectifs}
                    onChange={(e) => setProfil({ ...profil, objectifs: e.target.value })}
                    rows={4}
                    placeholder="Quels sont vos objectifs au padel ?"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none resize-none text-slate-900 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setIsEditing(false)}
                className="w-full sm:w-auto h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-medium rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="w-full sm:w-auto h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Enregistrer les modifications
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
