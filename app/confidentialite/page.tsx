"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          ← Retour
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Politique de confidentialité</h1>

        <div className="space-y-8">
          {/* Intro */}
          <p className="text-lg text-gray-700 leading-relaxed">
            Pad&apos;Up accorde une importance particulière à la protection des données. Cette page décrit les principes appliqués concernant la collecte et l&apos;utilisation des informations nécessaires au fonctionnement du service.
          </p>

          {/* 1. Données collectées */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Données collectées</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Pad&apos;Up peut collecter des informations strictement utiles au service, notamment :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>données de compte (ex : identifiant, email),</li>
              <li>données liées aux réservations (ex : club, créneau, historique),</li>
              <li>données techniques (ex : journaux, informations de navigation).</li>
            </ul>
          </section>

          {/* 2. Finalités */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Finalités</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Ces données peuvent être utilisées pour :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>permettre la création et la gestion de compte,</li>
              <li>gérer les réservations et l&apos;historique,</li>
              <li>améliorer la qualité, la fiabilité et la sécurité du service,</li>
              <li>assurer le support utilisateur.</li>
            </ul>
          </section>

          {/* 3. Partage des données */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Partage des données</h2>
            <p className="text-gray-700 leading-relaxed">
              Pad&apos;Up ne vend pas de données personnelles. Certaines informations peuvent être partagées uniquement lorsque nécessaire au service, par exemple avec le club concerné par une réservation.
            </p>
          </section>

          {/* 4. Conservation */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Conservation</h2>
            <p className="text-gray-700 leading-relaxed">
              Les données sont conservées le temps nécessaire au fonctionnement du service, puis supprimées ou anonymisées selon les besoins légaux et techniques.
            </p>
          </section>

          {/* 5. Sécurité */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Sécurité</h2>
            <p className="text-gray-700 leading-relaxed">
              Pad&apos;Up met en œuvre des mesures techniques et organisationnelles pour protéger les données contre l&apos;accès non autorisé, la perte ou l&apos;altération.
            </p>
          </section>

          {/* 6. Vos droits */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Vos droits</h2>
            <p className="text-gray-700 leading-relaxed">
              Conformément à la réglementation applicable, vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données. Pour exercer vos droits, vous pouvez passer par la page{" "}
              <Link href="/contact" className="text-slate-700 hover:underline">
                Contact
              </Link>
              .
            </p>
          </section>

          {/* 7. Évolution */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Évolution</h2>
            <p className="text-gray-700 leading-relaxed">
              Cette politique peut être mise à jour afin de refléter l&apos;évolution du service. La version publiée en ligne fait foi.
            </p>
          </section>

          {/* Phrase de fin */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xl font-semibold text-gray-900 text-center">
              Transparence, sécurité et simplicité : l&apos;engagement Pad&apos;Up sur vos données.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
