import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          ← Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Conditions d&apos;utilisation</h1>

        <div className="space-y-8">
          {/* Intro */}
          <p className="text-lg text-gray-700 leading-relaxed">
            Cette page décrit les règles d&apos;utilisation de la plateforme Pad&apos;Up afin de garantir une expérience fiable, simple et respectueuse pour tous les utilisateurs.
          </p>

          {/* 1. Utilisation de la plateforme */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Utilisation de la plateforme</h2>
            <p className="text-gray-700 leading-relaxed">
              Pad&apos;Up permet de consulter des disponibilités de terrains de padel et d&apos;effectuer des réservations auprès de clubs partenaires. L&apos;utilisateur s&apos;engage à utiliser la plateforme conformément à cette finalité.
            </p>
          </section>

          {/* 2. Création et gestion de compte */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Création et gestion de compte</h2>
            <p className="text-gray-700 leading-relaxed">
              Certaines fonctionnalités nécessitent la création d&apos;un compte. L&apos;utilisateur est responsable des informations fournies et de la sécurité de ses accès.
            </p>
          </section>

          {/* 3. Réservations et disponibilités */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Réservations et disponibilités</h2>
            <p className="text-gray-700 leading-relaxed">
              Les disponibilités sont affichées en fonction des informations transmises par les clubs. Pad&apos;Up met en œuvre des mécanismes techniques pour limiter les erreurs, mais le club reste la référence finale.
            </p>
          </section>

          {/* 4. Comportement des utilisateurs */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Comportement des utilisateurs</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              L&apos;utilisateur s&apos;engage à respecter :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>les règles propres à chaque club,</li>
              <li>les horaires et conditions de réservation,</li>
              <li>les autres joueurs et le personnel des clubs.</li>
            </ul>
          </section>

          {/* 5. Limitation de responsabilité */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitation de responsabilité</h2>
            <p className="text-gray-700 leading-relaxed">
              Pad&apos;Up fournit une plateforme technique. Les prestations sportives, l&apos;accès aux installations et leur bon déroulement relèvent de la responsabilité des clubs.
            </p>
          </section>

          {/* 6. Support et assistance */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Support et assistance</h2>
            <p className="text-gray-700 leading-relaxed">
              En cas de problème ou de question, l&apos;utilisateur peut contacter l&apos;équipe Pad&apos;Up via la page{" "}
              <Link href="/contact" className="text-blue-600 hover:underline">
                Contact
              </Link>
              .
            </p>
          </section>

          {/* Phrase de fin */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xl font-semibold text-gray-900 text-center">
              Pad&apos;Up privilégie la simplicité : des règles claires pour une réservation sans friction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
