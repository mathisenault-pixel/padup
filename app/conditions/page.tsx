import Link from "next/link";

export default function ConditionsPage() {
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
            Cette page précise les règles d&apos;utilisation de Pad&apos;Up afin de garantir une expérience fiable et respectueuse pour tous.
          </p>

          {/* Utilisation de la plateforme */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Utilisation de la plateforme</h2>
            <p className="text-gray-700 leading-relaxed">
              L&apos;utilisateur s&apos;engage à utiliser Pad&apos;Up de manière loyale, conformément à sa finalité : consulter des disponibilités et réserver des terrains de padel.
            </p>
          </section>

          {/* Exactitude des informations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Exactitude des informations</h2>
            <p className="text-gray-700 leading-relaxed">
              L&apos;utilisateur s&apos;engage à fournir des informations exactes lors de la création de compte et lors des réservations. Toute utilisation frauduleuse peut entraîner la suspension de l&apos;accès.
            </p>
          </section>

          {/* Réservations et disponibilité */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Réservations et disponibilité</h2>
            <p className="text-gray-700 leading-relaxed">
              Les disponibilités sont mises à jour en temps réel selon les informations du club. En cas d&apos;écart, l&apos;utilisateur est invité à contacter le club concerné.
            </p>
          </section>

          {/* Comportement et respect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Comportement et respect</h2>
            <p className="text-gray-700 leading-relaxed">
              L&apos;utilisateur s&apos;engage à respecter les règles du club (horaires, présence, conditions d&apos;accès, règlement intérieur). Pad&apos;Up ne remplace pas les règles spécifiques de chaque structure.
            </p>
          </section>

          {/* Limitation de responsabilité */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation de responsabilité</h2>
            <p className="text-gray-700 leading-relaxed">
              Pad&apos;Up fournit une plateforme technique. Les prestations sportives et l&apos;accès aux installations relèvent du club. Pad&apos;Up ne peut être tenu responsable des incidents liés aux installations, aux annulations ou aux litiges entre utilisateur et club.
            </p>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Support</h2>
            <p className="text-gray-700 leading-relaxed">
              En cas de problème, l&apos;utilisateur peut contacter l&apos;équipe Pad&apos;Up via la page Contact.
            </p>
          </section>

          {/* Phrase de fin */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xl font-semibold text-gray-900 text-center">
              Pad&apos;Up privilégie la simplicité : des règles claires, une réservation rapide, et plus de temps pour jouer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
