'use client'

import { useState } from 'react'

type Horaire = {
  jour: string
  ouvert: boolean
  heureOuverture: string
  heureFermeture: string
}

type ClubInfo = {
  nom: string
  adresse: string
  codePostal: string
  ville: string
  telephone: string
  email: string
  siteWeb: string
  description: string
  nombreTerrains: number
}

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState<'info' | 'horaires' | 'notifications' | 'paiement' | 'branding'>('info')
  const [isEditing, setIsEditing] = useState(false)

  const [clubInfo, setClubInfo] = useState<ClubInfo>({
    nom: 'Padel Club Paris Centre',
    adresse: '45 Avenue des Champs-Élysées',
    codePostal: '75008',
    ville: 'Paris',
    telephone: '+33 1 42 56 78 90',
    email: 'contact@padelclubparis.fr',
    siteWeb: 'www.padelclubparis.fr',
    description: 'Le meilleur club de padel au cœur de Paris. 6 terrains intérieurs et extérieurs, bar restaurant, boutique équipement.',
    nombreTerrains: 6,
  })

  const [horaires, setHoraires] = useState<Horaire[]>([
    { jour: 'Lundi', ouvert: true, heureOuverture: '07:00', heureFermeture: '23:00' },
    { jour: 'Mardi', ouvert: true, heureOuverture: '07:00', heureFermeture: '23:00' },
    { jour: 'Mercredi', ouvert: true, heureOuverture: '07:00', heureFermeture: '23:00' },
    { jour: 'Jeudi', ouvert: true, heureOuverture: '07:00', heureFermeture: '23:00' },
    { jour: 'Vendredi', ouvert: true, heureOuverture: '07:00', heureFermeture: '00:00' },
    { jour: 'Samedi', ouvert: true, heureOuverture: '08:00', heureFermeture: '00:00' },
    { jour: 'Dimanche', ouvert: true, heureOuverture: '08:00', heureFermeture: '22:00' },
  ])

  const [notifications, setNotifications] = useState({
    emailReservations: true,
    emailAnnulations: true,
    smsRappels: true,
    smsConfirmations: false,
    notifPaiements: true,
    notifAvis: true,
  })

  const handleSave = () => {
    setIsEditing(false)
    // Ici on sauvegarderait les données dans Supabase
    alert('✅ Modifications enregistrées avec succès !')
  }

  const updateHoraire = (index: number, field: keyof Horaire, value: string | boolean) => {
    const newHoraires = [...horaires]
    newHoraires[index] = { ...newHoraires[index], [field]: value }
    setHoraires(newHoraires)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Paramètres du Club</h1>
          <p className="text-slate-600 mt-1">Configuration et informations du club</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-semibold transition-all"
              >
                ✕ Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
              >
                ✓ Enregistrer
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-lg font-semibold hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg"
            >
              ✏️ Modifier
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'info'
              ? 'text-slate-900 border-b-4 border-slate-900 -mb-0.5'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          🏢 Informations
        </button>
        <button
          onClick={() => setActiveTab('horaires')}
          className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'horaires'
              ? 'text-slate-900 border-b-4 border-slate-900 -mb-0.5'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          🕐 Horaires
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'text-slate-900 border-b-4 border-slate-900 -mb-0.5'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          🔔 Notifications
        </button>
        <button
          onClick={() => setActiveTab('paiement')}
          className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'paiement'
              ? 'text-slate-900 border-b-4 border-slate-900 -mb-0.5'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          💳 Paiement
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'branding'
              ? 'text-slate-900 border-b-4 border-slate-900 -mb-0.5'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          🎨 Branding
        </button>
      </div>

      {/* Content */}
      {activeTab === 'info' && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Informations générales</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nom du club *
                </label>
                <input
                  type="text"
                  value={clubInfo.nom}
                  onChange={(e) => setClubInfo({ ...clubInfo, nom: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nombre de terrains *
                </label>
                <input
                  type="number"
                  value={clubInfo.nombreTerrains}
                  onChange={(e) => setClubInfo({ ...clubInfo, nombreTerrains: parseInt(e.target.value) })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                value={clubInfo.adresse}
                onChange={(e) => setClubInfo({ ...clubInfo, adresse: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Code postal *
                </label>
                <input
                  type="text"
                  value={clubInfo.codePostal}
                  onChange={(e) => setClubInfo({ ...clubInfo, codePostal: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  value={clubInfo.ville}
                  onChange={(e) => setClubInfo({ ...clubInfo, ville: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={clubInfo.telephone}
                  onChange={(e) => setClubInfo({ ...clubInfo, telephone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={clubInfo.email}
                  onChange={(e) => setClubInfo({ ...clubInfo, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Site web
              </label>
              <input
                type="url"
                value={clubInfo.siteWeb}
                onChange={(e) => setClubInfo({ ...clubInfo, siteWeb: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description du club
              </label>
              <textarea
                value={clubInfo.description}
                onChange={(e) => setClubInfo({ ...clubInfo, description: e.target.value })}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:text-slate-600 resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'horaires' && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Horaires d&apos;ouverture</h2>
          
          <div className="space-y-4">
            {horaires.map((horaire, index) => (
              <div key={horaire.jour} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                <div className="w-32">
                  <span className="font-bold text-slate-900">{horaire.jour}</span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={horaire.ouvert}
                    onChange={(e) => updateHoraire(index, 'ouvert', e.target.checked)}
                    disabled={!isEditing}
                    className="w-5 h-5 rounded border-2 border-slate-300 text-slate-700 focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
                  />
                  <span className="text-sm font-medium text-slate-700">Ouvert</span>
                </label>

                {horaire.ouvert && (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-slate-700">De</label>
                      <input
                        type="time"
                        value={horaire.heureOuverture}
                        onChange={(e) => updateHoraire(index, 'heureOuverture', e.target.value)}
                        disabled={!isEditing}
                        className="px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none disabled:bg-slate-100 disabled:text-slate-600"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-slate-700">À</label>
                      <input
                        type="time"
                        value={horaire.heureFermeture}
                        onChange={(e) => updateHoraire(index, 'heureFermeture', e.target.value)}
                        disabled={!isEditing}
                        className="px-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none disabled:bg-slate-100 disabled:text-slate-600"
                      />
                    </div>

                    <div className="flex-1 text-right">
                      <span className="text-sm font-semibold text-slate-600">
                        {(() => {
                          const debut = parseInt(horaire.heureOuverture.split(':')[0])
                          let fin = parseInt(horaire.heureFermeture.split(':')[0])
                          if (fin === 0) fin = 24
                          const duree = fin - debut
                          return `${duree}h ouvert`
                        })()}
                      </span>
                    </div>
                  </>
                )}

                {!horaire.ouvert && (
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-red-600">Fermé</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Astuce :</strong> Les horaires d&apos;ouverture sont affichés aux joueurs lors de la réservation. Pensez à les mettre à jour en cas de jours fériés ou fermetures exceptionnelles.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Notifications & Messages</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">📧 Notifications Email</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-100 transition-all">
                  <div>
                    <p className="font-semibold text-slate-900">Nouvelles réservations</p>
                    <p className="text-sm text-slate-600">Recevoir un email à chaque nouvelle réservation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailReservations}
                    onChange={(e) => setNotifications({ ...notifications, emailReservations: e.target.checked })}
                    disabled={!isEditing}
                    className="w-6 h-6 rounded border-2 border-slate-300 text-slate-700 focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-100 transition-all">
                  <div>
                    <p className="font-semibold text-slate-900">Annulations</p>
                    <p className="text-sm text-slate-600">Recevoir un email en cas d&apos;annulation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailAnnulations}
                    onChange={(e) => setNotifications({ ...notifications, emailAnnulations: e.target.checked })}
                    disabled={!isEditing}
                    className="w-6 h-6 rounded border-2 border-slate-300 text-slate-700 focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
                  />
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">📱 Notifications SMS</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-100 transition-all">
                  <div>
                    <p className="font-semibold text-slate-900">Rappels de réservation</p>
                    <p className="text-sm text-slate-600">Envoyer des SMS de rappel 24h avant</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.smsRappels}
                    onChange={(e) => setNotifications({ ...notifications, smsRappels: e.target.checked })}
                    disabled={!isEditing}
                    className="w-6 h-6 rounded border-2 border-slate-300 text-slate-700 focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-100 transition-all">
                  <div>
                    <p className="font-semibold text-slate-900">Confirmations</p>
                    <p className="text-sm text-slate-600">Envoyer un SMS de confirmation après réservation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.smsConfirmations}
                    onChange={(e) => setNotifications({ ...notifications, smsConfirmations: e.target.checked })}
                    disabled={!isEditing}
                    className="w-6 h-6 rounded border-2 border-slate-300 text-slate-700 focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
                  />
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">🔔 Autres notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-100 transition-all">
                  <div>
                    <p className="font-semibold text-slate-900">Paiements reçus</p>
                    <p className="text-sm text-slate-600">Notification lors de la réception d&apos;un paiement</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.notifPaiements}
                    onChange={(e) => setNotifications({ ...notifications, notifPaiements: e.target.checked })}
                    disabled={!isEditing}
                    className="w-6 h-6 rounded border-2 border-slate-300 text-slate-700 focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-100 transition-all">
                  <div>
                    <p className="font-semibold text-slate-900">Nouveaux avis clients</p>
                    <p className="text-sm text-slate-600">Notification lors d&apos;un nouvel avis</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.notifAvis}
                    onChange={(e) => setNotifications({ ...notifications, notifAvis: e.target.checked })}
                    disabled={!isEditing}
                    className="w-6 h-6 rounded border-2 border-slate-300 text-slate-700 focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'paiement' && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Moyens de paiement</h2>
          
          <div className="space-y-6">
            <div className="p-6 bg-green-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center text-2xl">
                    💳
                  </div>
                  <div>
                    <p className="font-bold text-green-900 text-lg">Stripe connecté</p>
                    <p className="text-sm text-green-700">Paiements en ligne activés</p>
                  </div>
                </div>
                <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all">
                  Gérer Stripe
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">💰</span>
                  <h3 className="font-bold text-slate-900">Paiement sur place</h3>
                </div>
                <p className="text-sm text-slate-600">Accepter les paiements en espèces et carte sur place</p>
                <label className="flex items-center gap-2 mt-4">
                  <input type="checkbox" defaultChecked disabled={!isEditing} className="w-5 h-5" />
                  <span className="text-sm font-medium">Activé</span>
                </label>
              </div>

              <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🏦</span>
                  <h3 className="font-bold text-slate-900">Virement bancaire</h3>
                </div>
                <p className="text-sm text-slate-600">Autoriser les paiements par virement</p>
                <label className="flex items-center gap-2 mt-4">
                  <input type="checkbox" defaultChecked disabled={!isEditing} className="w-5 h-5" />
                  <span className="text-sm font-medium">Activé</span>
                </label>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Important :</strong> Pour modifier vos paramètres de paiement Stripe, vous serez redirigé vers votre tableau de bord Stripe.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Personnalisation & Branding</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Logo du club</h3>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 bg-slate-100 border-4 border-slate-300 rounded-2xl flex items-center justify-center text-5xl">
                  🎾
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-3">Format accepté : JPG, PNG (max 2MB)</p>
                  <button
                    disabled={!isEditing}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📤 Télécharger un logo
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Couleurs du club</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Couleur principale
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      defaultValue="#1e293b"
                      disabled={!isEditing}
                      className="w-16 h-12 rounded-lg border-2 border-slate-300 cursor-pointer disabled:opacity-50"
                    />
                    <input
                      type="text"
                      defaultValue="#1e293b"
                      disabled={!isEditing}
                      className="flex-1 px-4 py-2 border-2 border-slate-300 rounded-lg outline-none disabled:bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Couleur secondaire
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      defaultValue="#3b82f6"
                      disabled={!isEditing}
                      className="w-16 h-12 rounded-lg border-2 border-slate-300 cursor-pointer disabled:opacity-50"
                    />
                    <input
                      type="text"
                      defaultValue="#3b82f6"
                      disabled={!isEditing}
                      className="flex-1 px-4 py-2 border-2 border-slate-300 rounded-lg outline-none disabled:bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Couleur accent
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      defaultValue="#10b981"
                      disabled={!isEditing}
                      className="w-16 h-12 rounded-lg border-2 border-slate-300 cursor-pointer disabled:opacity-50"
                    />
                    <input
                      type="text"
                      defaultValue="#10b981"
                      disabled={!isEditing}
                      className="flex-1 px-4 py-2 border-2 border-slate-300 rounded-lg outline-none disabled:bg-slate-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Info :</strong> Les couleurs du club seront utilisées dans l&apos;application mobile et sur votre page publique.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
