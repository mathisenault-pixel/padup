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

        <h1 className="text-4xl font-bold text-gray-900 mb-8">CGU / CGV</h1>

        <div className="space-y-8">
          {/* Intro */}
          <p className="text-lg text-gray-700 leading-relaxed">
            Les présentes Conditions Générales encadrent l&apos;accès et l&apos;utilisation de la plateforme Pad&apos;Up. En naviguant sur le site ou en utilisant les services, vous acceptez ces conditions.
          </p>

          {/* 1. Objet */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Objet</h2>
            <p className="text-gray-700 leading-relaxed">
              Pad&apos;Up met à disposition une plateforme permettant de consulter des disponibilités de terrains de padel et d&apos;effectuer des réservations auprès de clubs.
            </p>
          </section>

          {/* 2. Accès au service */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Accès au service</h2>
            <p className="text-gray-700 leading-relaxed">
              Certaines fonctionnalités nécessitent la création d&apos;un compte (ex : gérer vos réservations). L&apos;utilisateur s&apos;engage à fournir des informations exactes et à conserver la confidentialité de ses accès.
            </p>
          </section>

          {/* 3. Réservations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Réservations</h2>
            <p className="text-gray-700 leading-relaxed">
              Les créneaux affichés sont fournis par les clubs. Pad&apos;Up met en œuvre des mécanismes techniques pour afficher des disponibilités à jour et limiter les doubles réservations.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              En cas d&apos;écart ou de modification, le club reste la source de référence.
            </p>
          </section>

          {/* 4. Prix, paiement et frais */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Prix, paiement et frais</h2>
            <p className="text-gray-700 leading-relaxed">
              La réservation via Pad&apos;Up est sans frais pour les joueurs.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Les conditions de paiement (montant, modalités, éventuels remboursements) dépendent du club concerné et des informations affichées lors de la réservation.
            </p>
          </section>

          {/* 5. Annulation et modification */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Annulation et modification</h2>
            <p className="text-gray-700 leading-relaxed">
              Les règles d&apos;annulation et de modification peuvent varier selon les clubs (délais, conditions, avoirs, etc.).
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              L&apos;utilisateur est invité à consulter les règles affichées au moment de la réservation et, si nécessaire, à contacter le club.
            </p>
          </section>

          {/* 6. Responsabilités */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Responsabilités</h2>
            <p className="text-gray-700 leading-relaxed">
              Pad&apos;Up fournit une plateforme technique de consultation et de réservation.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              L&apos;accès aux installations, les prestations sportives et le règlement intérieur relèvent du club.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Pad&apos;Up ne peut être tenu responsable des indisponibilités, annulations, incidents sur place ou litiges entre utilisateur et club.
            </p>
          </section>

          {/* 7. Usage acceptable */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Usage acceptable</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              L&apos;utilisateur s&apos;engage à utiliser Pad&apos;Up de manière loyale et à ne pas :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>perturber le fonctionnement du service,</li>
              <li>tenter d&apos;accéder à des données non autorisées,</li>
              <li>utiliser la plateforme à des fins frauduleuses.</li>
            </ul>
          </section>

          {/* 8. Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Propriété intellectuelle</h2>
            <p className="text-gray-700 leading-relaxed">
              Le contenu, la marque, les logos et l&apos;identité visuelle Pad&apos;Up sont protégés. Toute reproduction ou utilisation non autorisée est interdite.
            </p>
          </section>

          {/* 9. Données personnelles */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Données personnelles</h2>
            <p className="text-gray-700 leading-relaxed">
              Les règles de traitement des données sont décrites dans la page &quot;Confidentialité&quot;.
            </p>
          </section>

          {/* 10. Évolution des conditions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Évolution des conditions</h2>
            <p className="text-gray-700 leading-relaxed">
              Pad&apos;Up peut faire évoluer ces conditions pour refléter les mises à jour du service. La version publiée en ligne au moment de l&apos;utilisation s&apos;applique.
            </p>
          </section>

          {/* 11. Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              Pour toute question concernant ces conditions, vous pouvez nous contacter via la page Contact.
            </p>
          </section>

          {/* Phrase de fin */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xl font-semibold text-gray-900 text-center">
              Notre objectif : une expérience de réservation simple, claire et fiable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
