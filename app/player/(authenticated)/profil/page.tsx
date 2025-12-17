'use client'

import { useState } from 'react'

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
  const [isEditing, setIsEditing] = useState(false)
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

  const [stats] = useState({
    matchsJoues: 42,
    victoires: 28,
    defaites: 14,
    tempsJeuTotal: '63h',
    clubsFavoris: 3,
    tournoisParticipes: 5,
    tauxVictoire: 67,
    classement: 'P250'
  })

  const handleSave = () => {
    setIsEditing(false)
    // Ici on sauvegarderait dans Supabase
    alert('✅ Profil mis à jour avec succès !')
  }

  const getNiveauColor = (niveau: string) => {
    switch (niveau) {
      case 'Débutant': return 'from-blue-600 to-blue-700'
      case 'Intermédiaire': return 'from-green-600 to-green-700'
      case 'Avancé': return 'from-orange-600 to-orange-700'
      case 'Expert': return 'from-purple-600 to-purple-700'
      default: return 'from-gray-600 to-gray-700'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header with Avatar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                {profil.prenom[0]}{profil.nom[0]}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{profil.prenom} {profil.nom}</h1>
              <p className="text-slate-300 text-lg mb-3">Classement: {stats.classement}</p>
              <div className="flex gap-2">
                <span className={`px-4 py-1.5 bg-gradient-to-r ${getNiveauColor(profil.niveau)} rounded-lg font-semibold text-sm shadow-md`}>
                  {profil.niveau}
                </span>
                <span className="px-4 py-1.5 bg-slate-700 rounded-lg font-semibold text-sm">
                  {stats.matchsJoues} matchs
                </span>
                <span className="px-4 py-1.5 bg-slate-700 rounded-lg font-semibold text-sm">
                  {stats.tauxVictoire}% victoires
                </span>
              </div>
            </div>
          </div>
          <div>
            {isEditing ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-all shadow-md"
                >
                  Sauvegarder
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-all"
              >
                Modifier le profil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center">
          <svg className="w-8 h-8 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <p className="text-3xl font-bold text-slate-900">{stats.matchsJoues}</p>
          <p className="text-sm text-slate-600">Matchs joués</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center">
          <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-3xl font-bold text-green-600">{stats.victoires}</p>
          <p className="text-sm text-slate-600">Victoires</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center">
          <svg className="w-8 h-8 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-3xl font-bold text-slate-900">{stats.tempsJeuTotal}</p>
          <p className="text-sm text-slate-600">Temps de jeu</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center">
          <svg className="w-8 h-8 text-amber-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <p className="text-3xl font-bold text-amber-600">{stats.tournoisParticipes}</p>
          <p className="text-sm text-slate-600">Tournois</p>
        </div>
      </div>

      {/* Profil Form */}
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Informations personnelles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Prénom
            </label>
            <input
              type="text"
              value={profil.prenom}
              onChange={(e) => setProfil({ ...profil, prenom: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nom
            </label>
            <input
              type="text"
              value={profil.nom}
              onChange={(e) => setProfil({ ...profil, nom: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profil.email}
              onChange={(e) => setProfil({ ...profil, email: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={profil.telephone}
              onChange={(e) => setProfil({ ...profil, telephone: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Date de naissance
            </label>
            <input
              type="date"
              value={profil.dateNaissance}
              onChange={(e) => setProfil({ ...profil, dateNaissance: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Expérience
            </label>
            <input
              type="text"
              value={profil.experience}
              onChange={(e) => setProfil({ ...profil, experience: e.target.value })}
              disabled={!isEditing}
              placeholder="Ex: 2 ans"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600 text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Profil de jeu */}
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Profil de jeu
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Niveau
            </label>
            <select
              value={profil.niveau}
              onChange={(e) => setProfil({ ...profil, niveau: e.target.value as any })}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600 text-slate-900"
            >
              <option value="Débutant">Débutant</option>
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Avancé">Avancé</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Coup préféré
            </label>
            <input
              type="text"
              value={profil.coupPrefere}
              onChange={(e) => setProfil({ ...profil, coupPrefere: e.target.value })}
              disabled={!isEditing}
              placeholder="Ex: Vibora, Bandeja, Smash..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Main dominante
            </label>
            <select
              value={profil.mainDominante}
              onChange={(e) => setProfil({ ...profil, mainDominante: e.target.value as any })}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600 text-slate-900"
            >
              <option value="Droitier">Droitier</option>
              <option value="Gaucher">Gaucher</option>
              <option value="Ambidextre">Ambidextre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Position préférée
            </label>
            <select
              value={profil.positionPreferee}
              onChange={(e) => setProfil({ ...profil, positionPreferee: e.target.value as any })}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600 text-slate-900"
            >
              <option value="Gauche">Gauche (revers)</option>
              <option value="Droite">Droite (coup droit)</option>
              <option value="Les deux">Les deux</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Objectifs
            </label>
            <textarea
              value={profil.objectifs}
              onChange={(e) => setProfil({ ...profil, objectifs: e.target.value })}
              disabled={!isEditing}
              rows={3}
              placeholder="Quels sont vos objectifs au padel ?"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600 resize-none text-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
