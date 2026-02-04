import Link from 'next/link'

export default function ConditionsUtilisationPage() {
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
            Conditions d&apos;utilisation
          </h1>
          <p className="text-gray-600 text-lg">
            Dernière mise à jour : 22 janvier 2026
          </p>
        </div>

        {/* Contenu */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptation des conditions</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              En accédant et en utilisant Pad&apos;Up (&quot;le Service&quot;), vous acceptez d&apos;être lié par ces conditions d&apos;utilisation. 
              Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Pad&apos;Up est une plateforme de réservation de terrains de padel qui permet aux utilisateurs de réserver 
              des créneaux horaires dans différents clubs partenaires et de participer à des tournois.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Inscription et compte utilisateur</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Création de compte</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Vous devez fournir des informations exactes et à jour lors de votre inscription</li>
                <li>Vous êtes responsable de la confidentialité de votre mot de passe</li>
                <li>Vous devez avoir au moins 16 ans pour créer un compte</li>
                <li>Un compte par personne est autorisé</li>
              </ul>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Vous êtes responsable de toutes les activités effectuées sous votre compte. En cas d&apos;utilisation 
              non autorisée de votre compte, vous devez nous en informer immédiatement à l&apos;adresse : 
              <a href="mailto:contact@padup.fr" className="text-blue-600 hover:underline font-semibold"> contact@padup.fr</a>
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Réservations et paiements</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Réservation de terrains</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Les réservations sont confirmées après paiement</li>
                  <li>Vous recevrez un email de confirmation avec les détails de votre réservation</li>
                  <li>Les tarifs affichés sont par personne pour la durée indiquée (généralement 1h30)</li>
                  <li>Les disponibilités sont mises à jour en temps réel</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Politique d&apos;annulation</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Annulation gratuite jusqu&apos;à <span className="font-bold">24 heures</span> avant le créneau</li>
                  <li>Remboursement intégral si annulation dans les délais</li>
                  <li>Aucun remboursement pour annulation moins de 24h avant le créneau</li>
                  <li>Les conditions d&apos;annulation des tournois peuvent varier</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Paiements</h3>
                <p className="text-gray-700 leading-relaxed">
                  Les paiements sont sécurisés et traités par nos partenaires de paiement certifiés. 
                  Nous acceptons les cartes bancaires (Visa, Mastercard, American Express). 
                  Aucune information de carte bancaire n&apos;est stockée sur nos serveurs.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Tournois</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              L&apos;inscription aux tournois est soumise aux règles spécifiques de chaque événement. 
              Les détails (format, catégorie, niveau requis, prix) sont clairement indiqués sur chaque page de tournoi.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
              <p className="text-gray-700 font-semibold">
                ⚠️ Important : Une fois inscrit, l&apos;annulation d&apos;un tournoi peut entraîner des frais ou être impossible 
                selon les conditions spécifiques de l&apos;événement.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Comportement et règles</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              En utilisant Pad&apos;Up, vous vous engagez à :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Respecter les autres utilisateurs et le personnel des clubs</li>
              <li>Arriver à l&apos;heure pour vos réservations</li>
              <li>Respecter les règles et le matériel des clubs partenaires</li>
              <li>Ne pas revendre vos réservations</li>
              <li>Signaler tout comportement inapproprié</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Nous nous réservons le droit de suspendre ou supprimer votre compte en cas de non-respect 
              de ces règles ou de comportement inapproprié.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propriété intellectuelle</h2>
            <p className="text-gray-700 leading-relaxed">
              Tous les contenus présents sur Pad&apos;Up (logo, textes, images, design, code source) sont protégés 
              par les droits de propriété intellectuelle et appartiennent à Pad&apos;Up ou à ses partenaires. 
              Toute reproduction, modification ou exploitation non autorisée est interdite.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation de responsabilité</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pad&apos;Up agit en tant qu&apos;intermédiaire entre les utilisateurs et les clubs de padel. 
              Nous mettons tout en œuvre pour assurer la qualité du service, mais nous ne pouvons être tenus 
              responsables de :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>La qualité des installations des clubs partenaires</li>
              <li>Les blessures survenues lors de la pratique du padel</li>
              <li>Les différends entre utilisateurs</li>
              <li>Les interruptions temporaires du service pour maintenance</li>
              <li>Les pertes ou dommages indirects</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modification des conditions</h2>
            <p className="text-gray-700 leading-relaxed">
              Nous nous réservons le droit de modifier ces conditions d&apos;utilisation à tout moment. 
              Les modifications entreront en vigueur dès leur publication sur le site. Nous vous encourageons 
              à consulter régulièrement cette page. L&apos;utilisation continue du service après modification 
              vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Résiliation</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre profil. 
              Nous nous réservons le droit de suspendre ou supprimer votre compte en cas de :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Violation de ces conditions d&apos;utilisation</li>
              <li>Activité frauduleuse ou suspecte</li>
              <li>Comportement inapproprié envers les autres utilisateurs ou les clubs</li>
              <li>Non-paiement de réservations confirmées</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Droit applicable et juridiction</h2>
            <p className="text-gray-700 leading-relaxed">
              Ces conditions d&apos;utilisation sont régies par le droit français. En cas de litige, 
              et après tentative de résolution amiable, les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact</h2>
            <div className="bg-blue-50 p-6 rounded-xl">
              <p className="text-gray-700 leading-relaxed mb-4">
                Pour toute question concernant ces conditions d&apos;utilisation, vous pouvez nous contacter :
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:contact@padup.fr" className="text-blue-600 hover:underline font-semibold">
                    contact@padup.fr
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-semibold">Pad&apos;Up, 123 Avenue du Padel, 84000 Avignon, France</span>
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link
            href="/politique-confidentialite"
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
          >
            Voir notre Politique de confidentialité →
          </Link>
        </div>
      </div>
    </div>
  )
}
