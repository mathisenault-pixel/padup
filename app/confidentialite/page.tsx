import Link from "next/link";

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          ← Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Politique de confidentialité</h1>

        <div className="space-y-8">
          {/* Intro */}
          <p className="text-lg text-gray-700 leading-relaxed">
            Pad&apos;Up attache une importance particulière à la protection des données. Cette page décrit les principes appliqués concernant la collecte et l&apos;utilisation des informations.
          </p>

          {/* Données collectées */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Données collectées</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Pad&apos;Up peut collecter des données nécessaires au fonctionnement du service, notamment :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Informations de compte (ex : email, identifiant)</li>
              <li>Informations liées aux réservations (ex : club, créneau, historique)</li>
              <li>Données techniques (ex : logs, informations de navigation)</li>
            </ul>
          </section>

          {/* Finalités */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Finalités</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Ces données sont utilisées pour :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Permettre la création et la gestion de compte</li>
              <li>Gérer les réservations et l&apos;historique</li>
              <li>Améliorer la qualité et la sécurité du service</li>
              <li>Assurer le support utilisateur</li>
            </ul>
          </section>

          {/* Partage des données */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Partage des données</h2>
            <p className="text-gray-700 leading-relaxed">
              Pad&apos;Up ne vend pas les données personnelles. Certaines données peuvent être partagées uniquement lorsque nécessaire au service, par exemple avec le club concerné par une réservation.
            </p>
          </section>

          {/* Conservation */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Conservation</h2>
            <p className="text-gray-700 leading-relaxed">
              Les données sont conservées le temps nécessaire au fonctionnement du service, puis supprimées ou anonymisées selon les besoins légaux et techniques.
            </p>
          </section>

          {/* Sécurité */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sécurité</h2>
            <p className="text-gray-700 leading-relaxed">
              Pad&apos;Up met en œuvre des mesures techniques et organisationnelles pour protéger les données contre l&apos;accès non autorisé, la perte ou l&apos;altération.
            </p>
          </section>

          {/* Vos droits */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vos droits</h2>
            <p className="text-gray-700 leading-relaxed">
              Conformément à la réglementation applicable, vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données. Les demandes peuvent être effectuées via la page Contact.
            </p>
          </section>

          {/* Évolution */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Évolution</h2>
            <p className="text-gray-700 leading-relaxed">
              Cette politique peut être mise à jour afin de refléter l&apos;évolution du service. La version publiée en ligne fait foi.
            </p>
          </section>

          {/* Phrase de fin */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xl font-semibold text-gray-900 text-center">
              Transparence, sécurité, et simplicité : c&apos;est l&apos;engagement Pad&apos;Up sur vos données.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
