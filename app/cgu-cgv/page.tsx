import Link from "next/link";

export default function CguCgvPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          ← Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Conditions Générales d&apos;Utilisation et de Vente (CGU/CGV)</h1>

        <div className="space-y-8">
          {/* Intro */}
          <p className="text-lg text-gray-700 leading-relaxed">
            Les présentes conditions encadrent l&apos;accès et l&apos;utilisation de la plateforme Pad&apos;Up. En naviguant sur le site ou en utilisant les services, vous acceptez ces conditions.
          </p>

          {/* Objet */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Objet</h2>
            <p className="text-gray-700 leading-relaxed">
              Pad&apos;Up propose une plateforme permettant aux joueurs de consulter des disponibilités de terrains de padel et d&apos;effectuer des réservations auprès de clubs partenaires.
            </p>
          </section>

          {/* Accès au service */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès au service</h2>
            <p className="text-gray-700 leading-relaxed">
              Certaines fonctionnalités (ex : gestion des réservations) peuvent nécessiter la création d&apos;un compte. L&apos;utilisateur s&apos;engage à fournir des informations exactes et à maintenir la confidentialité de ses accès.
            </p>
          </section>

          {/* Réservations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Réservations</h2>
            <p className="text-gray-700 leading-relaxed">
              Les créneaux affichés dépendent des informations fournies par les clubs. Pad&apos;Up met en œuvre les moyens nécessaires pour afficher des disponibilités fiables et limiter les doubles réservations.
            </p>
          </section>

          {/* Paiement et frais */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Paiement et frais</h2>
            <p className="text-gray-700 leading-relaxed">
              La réservation via Pad&apos;Up est sans frais pour les joueurs. Les conditions de paiement (montant, modalités, éventuels remboursements) peuvent dépendre du club concerné et des règles applicables.
            </p>
          </section>

          {/* Annulation et modifications */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Annulation et modifications</h2>
            <p className="text-gray-700 leading-relaxed">
              Les conditions d&apos;annulation, de modification ou de remboursement peuvent varier selon les clubs. L&apos;utilisateur est invité à consulter les règles affichées au moment de la réservation ou à contacter le club.
            </p>
          </section>

          {/* Responsabilité */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Responsabilité</h2>
            <p className="text-gray-700 leading-relaxed">
              Pad&apos;Up agit en tant que plateforme de mise en relation et de réservation. Pad&apos;Up ne peut être tenu responsable des décisions, indisponibilités ou changements opérés par les clubs, ni des litiges liés à l&apos;usage des installations.
            </p>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Propriété intellectuelle</h2>
            <p className="text-gray-700 leading-relaxed">
              Les contenus, marques, logos et éléments graphiques associés à Pad&apos;Up sont protégés. Toute reproduction non autorisée est interdite.
            </p>
          </section>

          {/* Données personnelles */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Données personnelles</h2>
            <p className="text-gray-700 leading-relaxed">
              Le traitement des données personnelles est détaillé dans la page &quot;Confidentialité&quot;.
            </p>
          </section>

          {/* Évolution des conditions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Évolution des conditions</h2>
            <p className="text-gray-700 leading-relaxed">
              Pad&apos;Up peut faire évoluer ces conditions afin de refléter les mises à jour du service. La version applicable est celle publiée en ligne au moment de l&apos;utilisation.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              Pour toute question, l&apos;utilisateur peut contacter Pad&apos;Up via la page Contact.
            </p>
          </section>

          {/* Phrase de fin */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xl font-semibold text-gray-900 text-center">
              Ces conditions visent à garantir une expérience simple, claire et sécurisée pour tous.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
