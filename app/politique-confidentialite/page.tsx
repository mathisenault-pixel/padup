import Link from 'next/link'

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-12">
        {/* Bouton retour */}
        <Link 
          href="/"
          className="group inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition-all mb-8"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </Link>

        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-xl p-2">
            <img 
              src="/icon.png" 
              alt="Pad'Up Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Politique de confidentialité
          </h1>
          <p className="text-gray-600 text-lg">
            Dernière mise à jour : 22 janvier 2026
          </p>
        </div>

        {/* Contenu */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Chez Pad&apos;Up, nous prenons la protection de vos données personnelles très au sérieux. 
              Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et 
              protégeons vos informations personnelles conformément au Règlement Général sur la Protection 
              des Données (RGPD).
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
              <p className="text-gray-700 font-semibold">
                🔒 Votre vie privée est importante pour nous. Nous ne vendons jamais vos données personnelles 
                à des tiers.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Responsable du traitement</h2>
            <div className="bg-gray-50 p-6 rounded-xl">
              <p className="text-gray-700 leading-relaxed mb-2">
                <span className="font-bold">Raison sociale :</span> Pad&apos;Up SAS
              </p>
              <p className="text-gray-700 leading-relaxed mb-2">
                <span className="font-bold">Adresse :</span> 123 Avenue du Padel, 84000 Avignon, France
              </p>
              <p className="text-gray-700 leading-relaxed mb-2">
                <span className="font-bold">Email :</span>{' '}
                <a href="mailto:contact@padup.fr" className="text-blue-600 hover:underline">
                  contact@padup.fr
                </a>
              </p>
              <p className="text-gray-700 leading-relaxed">
                <span className="font-bold">DPO (Délégué à la Protection des Données) :</span>{' '}
                <a href="mailto:dpo@padup.fr" className="text-blue-600 hover:underline">
                  dpo@padup.fr
                </a>
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Données collectées</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous collectons différents types de données selon votre utilisation du service :
            </p>

            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">📝 Données d&apos;inscription</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Mot de passe (crypté)</li>
                  <li>Date de naissance</li>
                  <li>Numéro de téléphone</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">🎾 Données de réservation</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Historique des réservations</li>
                  <li>Clubs fréquentés</li>
                  <li>Préférences de jeu (niveau, créneaux horaires)</li>
                  <li>Partenaires de jeu invités</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">💳 Données de paiement</h3>
                <p className="text-gray-700 leading-relaxed">
                  Les informations de paiement sont collectées et traitées directement par nos partenaires 
                  de paiement sécurisés. Nous ne stockons jamais vos numéros de carte bancaire complets.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">📍 Données de géolocalisation</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  Avec votre consentement explicite, nous pouvons accéder à votre position géographique pour :
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Vous proposer les clubs les plus proches</li>
                  <li>Afficher les temps de trajet estimés</li>
                  <li>Filtrer les tournois par proximité</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3 font-semibold">
                  ℹ️ Vous pouvez refuser ou révoquer ce consentement à tout moment depuis les paramètres de votre navigateur.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">📊 Données techniques</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Adresse IP</li>
                  <li>Type de navigateur et système d&apos;exploitation</li>
                  <li>Pages visitées et temps de navigation</li>
                  <li>Cookies (voir section dédiée ci-dessous)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Utilisation des données</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vos données personnelles sont utilisées uniquement pour les finalités suivantes :
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700"><span className="font-bold">Gestion de votre compte</span> : création, authentification, gestion du profil</p>
              </div>
              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700"><span className="font-bold">Traitement des réservations</span> : validation, confirmation, annulation</p>
              </div>
              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700"><span className="font-bold">Communication</span> : confirmations de réservation, rappels, notifications importantes</p>
              </div>
              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700"><span className="font-bold">Amélioration du service</span> : analyse statistique, correction de bugs, nouvelles fonctionnalités</p>
              </div>
              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700"><span className="font-bold">Personnalisation</span> : recommandations de clubs et tournois selon vos préférences</p>
              </div>
              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700"><span className="font-bold">Sécurité</span> : détection de fraude, prévention des abus</p>
              </div>
              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700"><span className="font-bold">Conformité légale</span> : respect des obligations comptables et fiscales</p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Partage des données</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vos données personnelles peuvent être partagées avec :
            </p>
            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">🏢 Clubs partenaires</h3>
                <p className="text-gray-700 leading-relaxed">
                  Nous partageons uniquement les informations nécessaires à la gestion de vos réservations 
                  (nom, prénom, email, téléphone) avec les clubs où vous réservez.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">💳 Prestataires de paiement</h3>
                <p className="text-gray-700 leading-relaxed">
                  Les données de paiement sont transmises de manière sécurisée à nos partenaires de paiement 
                  certifiés PCI-DSS.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">📧 Prestataires de services techniques</h3>
                <p className="text-gray-700 leading-relaxed">
                  Nous utilisons des prestataires pour l&apos;hébergement, l&apos;envoi d&apos;emails et l&apos;analyse. 
                  Tous sont soumis à des obligations strictes de confidentialité.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">⚖️ Autorités légales</h3>
                <p className="text-gray-700 leading-relaxed">
                  En cas d&apos;obligation légale ou de demande judiciaire, nous pouvons être amenés à communiquer 
                  vos données aux autorités compétentes.
                </p>
              </div>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mt-4">
              <p className="text-gray-700 font-semibold">
                ❌ Nous ne vendons jamais vos données à des tiers à des fins marketing.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Conservation des données</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous conservons vos données personnelles uniquement le temps nécessaire aux finalités pour 
              lesquelles elles ont été collectées :
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><span className="font-bold">Données de compte :</span> tant que votre compte est actif + 3 ans après suppression</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><span className="font-bold">Historique de réservations :</span> 3 ans après la dernière réservation</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><span className="font-bold">Données de paiement :</span> durée légale obligatoire (10 ans pour la comptabilité)</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><span className="font-bold">Logs de connexion :</span> 1 an</span>
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Sécurité des données</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h3 className="font-bold text-gray-900">Cryptage SSL/TLS</h3>
                </div>
                <p className="text-sm text-gray-700">Toutes les communications sont chiffrées</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 className="font-bold text-gray-900">Mots de passe cryptés</h3>
                </div>
                <p className="text-sm text-gray-700">Vos mots de passe sont hachés et salés</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  <h3 className="font-bold text-gray-900">Serveurs sécurisés</h3>
                </div>
                <p className="text-sm text-gray-700">Hébergement en Europe (RGPD)</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <h3 className="font-bold text-gray-900">Accès restreint</h3>
                </div>
                <p className="text-sm text-gray-700">Seuls les employés autorisés</p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Vos droits (RGPD)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
            </p>
            <div className="space-y-3">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">✅ Droit d&apos;accès</h3>
                <p className="text-sm text-gray-700">Obtenir une copie de toutes vos données personnelles</p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">✏️ Droit de rectification</h3>
                <p className="text-sm text-gray-700">Corriger vos données inexactes ou incomplètes</p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">🗑️ Droit à l&apos;effacement</h3>
                <p className="text-sm text-gray-700">Supprimer vos données personnelles (sous certaines conditions)</p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">⏸️ Droit à la limitation</h3>
                <p className="text-sm text-gray-700">Restreindre le traitement de vos données</p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">📦 Droit à la portabilité</h3>
                <p className="text-sm text-gray-700">Recevoir vos données dans un format structuré et lisible</p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">🚫 Droit d&apos;opposition</h3>
                <p className="text-sm text-gray-700">Vous opposer au traitement de vos données (marketing, profilage)</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl mt-6">
              <p className="text-gray-700 leading-relaxed mb-4 font-semibold">
                Pour exercer ces droits, contactez-nous :
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:dpo@padup.fr" className="text-blue-600 hover:underline font-semibold">
                    dpo@padup.fr
                  </a>
                </li>
              </ul>
              <p className="text-sm text-gray-600 mt-4">
                Nous nous engageons à répondre à votre demande dans un délai maximum d&apos;un mois.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous utilisons des cookies pour améliorer votre expérience sur notre site. Un cookie est un 
              petit fichier texte stocké sur votre appareil.
            </p>
            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">🍪 Cookies essentiels</h3>
                <p className="text-gray-700 leading-relaxed">
                  Nécessaires au fonctionnement du site (authentification, panier). 
                  <span className="font-semibold"> Obligatoires.</span>
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">📊 Cookies analytiques</h3>
                <p className="text-gray-700 leading-relaxed">
                  Nous aident à comprendre comment vous utilisez le site pour l&apos;améliorer. 
                  <span className="font-semibold"> Avec votre consentement.</span>
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">🎯 Cookies de personnalisation</h3>
                <p className="text-gray-700 leading-relaxed">
                  Mémorisent vos préférences (langue, filtres). 
                  <span className="font-semibold"> Avec votre consentement.</span>
                </p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              Vous pouvez gérer vos préférences de cookies à tout moment depuis les paramètres de votre navigateur 
              ou via notre bannière de consentement.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modifications de cette politique</h2>
            <p className="text-gray-700 leading-relaxed">
              Nous pouvons modifier cette politique de confidentialité à tout moment. En cas de changement 
              significatif, nous vous en informerons par email ou via une notification sur le site. 
              La date de dernière mise à jour est indiquée en haut de cette page.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact et réclamations</h2>
            <div className="bg-blue-50 p-6 rounded-xl mb-4">
              <p className="text-gray-700 leading-relaxed mb-4">
                Pour toute question concernant cette politique ou l&apos;utilisation de vos données :
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">Délégué à la Protection des Données :</span>
                  <a href="mailto:dpo@padup.fr" className="text-blue-600 hover:underline">dpo@padup.fr</a>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">Support général :</span>
                  <a href="mailto:contact@padup.fr" className="text-blue-600 hover:underline">contact@padup.fr</a>
                </li>
              </ul>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold">Droit de réclamation :</span> Si vous estimez que vos droits 
                ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL 
                (Commission Nationale de l&apos;Informatique et des Libertés) : 
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold"> www.cnil.fr</a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link
            href="/conditions-utilisation"
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
          >
            Voir nos Conditions d&apos;utilisation →
          </Link>
        </div>
      </div>
    </div>
  )
}
