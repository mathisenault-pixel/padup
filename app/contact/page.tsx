import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          ← Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Contactez Pad&apos;Up</h1>

        <div className="space-y-8">
          {/* Intro */}
          <p className="text-lg text-gray-700 leading-relaxed">
            Une question, un besoin spécifique ou une demande de partenariat ?
            L&apos;équipe Pad&apos;Up est disponible pour échanger et vous accompagner.
          </p>

          {/* Vous êtes joueur */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vous êtes joueur</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Vous pouvez nous contacter pour :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Une question sur une réservation</li>
              <li>Un problème rencontré sur la plateforme</li>
              <li>Une suggestion d&apos;amélioration</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Nous faisons notre possible pour répondre rapidement.
            </p>
          </section>

          {/* Vous êtes un club ou un partenaire */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vous êtes un club ou un partenaire</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Clubs de padel, structures ou acteurs du secteur :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Demande d&apos;information</li>
              <li>Partenariat</li>
              <li>Intégration à la plateforme</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Nous étudions chaque demande avec attention.
            </p>
          </section>

          {/* Moyens de contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Moyens de contact</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Vous pouvez nous contacter :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Par email</li>
              <li>Via le formulaire de contact (si disponible)</li>
              <li>Ou directement depuis la plateforme</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Les coordonnées exactes seront précisées prochainement.
            </p>
          </section>

          {/* Notre engagement */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre engagement</h2>
            <p className="text-gray-700 leading-relaxed">
              Nous privilégions des échanges simples, clairs et efficaces.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Chaque message est lu et traité avec sérieux.
            </p>
          </section>

          {/* Phrase de fin */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xl font-semibold text-gray-900 text-center">
              Un message suffit pour commencer à jouer ensemble.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
