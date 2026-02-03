'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'

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
  const [isEditing, setIsEditing] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [profil, setProfil] = useState<ProfilInfo>({
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@email.com',
    telephone: '+33 6 12 34 56 78',
    dateNaissance: '1990-05-15',
    niveau: 'Intermédiaire',
    coupPrefere: 'Vibora',
    mainDominante: 'Droitier',
    positionPreferee: 'Droite',
    experience: '2 ans',
    objectifs: 'Progresser en technique et participer à des tournois régionaux'
  })

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
      case 'Débutant': return 'from-blue-500 to-blue-600'
      case 'Intermédiaire': return 'from-blue-500 to-blue-600'
      case 'Avancé': return 'from-blue-500 to-blue-600'
      case 'Expert': return 'from-blue-500 to-blue-600'
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

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12 max-w-[1400px]">
        {/* Header avec bouton Modifier */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Mon profil</h1>
            <p className="text-lg text-gray-600 mt-1">Gérez vos informations personnelles</p>
          </div>
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

        {/* Bouton Déconnexion en bas - Visible uniquement sur mobile */}
        <div className="md:hidden mt-12 pb-8">
          <button
            onClick={handleSignOut}
            className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-lg">Se déconnecter</span>
          </button>
        </div>
      </div>
    </div>
  )
}
