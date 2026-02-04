import Link from "next/link";

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Politique de confidentialité
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-300">
          Pad'Up accorde une importance particulière à la protection des données.
          Cette page décrit les principes appliqués concernant la collecte et l'utilisation
          des informations nécessaires au fonctionnement du service.
        </p>
      </header>

      <section className="space-y-10 text-slate-300">
        <div>
          <h2 className="text-xl font-semibold text-white">1. Données collectées</h2>
          <p className="mt-3 leading-relaxed">
            Pad'Up peut collecter des informations strictement utiles au service, notamment :
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>données de compte (ex : identifiant, email),</li>
            <li>données liées aux réservations (ex : club, créneau, historique),</li>
            <li>données techniques (ex : journaux, informations de navigation).</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">2. Finalités</h2>
          <p className="mt-3 leading-relaxed">
            Ces données peuvent être utilisées pour :
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>permettre la création et la gestion de compte,</li>
            <li>gérer les réservations et l'historique,</li>
            <li>améliorer la qualité, la fiabilité et la sécurité du service,</li>
            <li>assurer le support utilisateur.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">3. Partage des données</h2>
          <p className="mt-3 leading-relaxed">
            Pad'Up ne vend pas de données personnelles.
            Certaines informations peuvent être partagées uniquement lorsque nécessaire au service,
            par exemple avec le club concerné par une réservation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">4. Conservation</h2>
          <p className="mt-3 leading-relaxed">
            Les données sont conservées le temps nécessaire au fonctionnement du service,
            puis supprimées ou anonymisées selon les besoins légaux et techniques.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">5. Sécurité</h2>
          <p className="mt-3 leading-relaxed">
            Pad'Up met en œuvre des mesures techniques et organisationnelles pour protéger les données
            contre l'accès non autorisé, la perte ou l'altération.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">6. Vos droits</h2>
          <p className="mt-3 leading-relaxed">
            Conformément à la réglementation applicable, vous pouvez demander l'accès,
            la rectification ou la suppression de vos données. Pour exercer vos droits,
            vous pouvez passer par la page{" "}
            <Link href="/contact" className="underline hover:text-white">
              Contact
            </Link>
            .
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">7. Évolution</h2>
          <p className="mt-3 leading-relaxed">
            Cette politique peut être mise à jour afin de refléter l'évolution du service.
            La version publiée en ligne fait foi.
          </p>
        </div>

        <p className="pt-2 text-sm text-slate-400">
          Transparence, sécurité et simplicité : l'engagement Pad'Up sur vos données.
        </p>
      </section>
    </main>
  );
}
