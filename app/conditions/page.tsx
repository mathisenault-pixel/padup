import Link from "next/link";

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Conditions d'utilisation
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-300">
          Cette page décrit les règles d'utilisation de la plateforme Pad'Up afin de
          garantir une expérience fiable, simple et respectueuse pour tous les utilisateurs.
        </p>
      </header>

      <section className="space-y-10 text-slate-300">
        <div>
          <h2 className="text-xl font-semibold text-white">1. Utilisation de la plateforme</h2>
          <p className="mt-3 leading-relaxed">
            Pad'Up permet de consulter des disponibilités de terrains de padel et
            d'effectuer des réservations auprès de clubs partenaires.
            L'utilisateur s'engage à utiliser la plateforme conformément à cette finalité.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">2. Création et gestion de compte</h2>
          <p className="mt-3 leading-relaxed">
            Certaines fonctionnalités nécessitent la création d'un compte.
            L'utilisateur est responsable des informations fournies et de la sécurité de ses accès.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">3. Réservations et disponibilités</h2>
          <p className="mt-3 leading-relaxed">
            Les disponibilités sont affichées en fonction des informations transmises par les clubs.
            Pad'Up met en œuvre des mécanismes techniques pour limiter les erreurs,
            mais le club reste la référence finale.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">4. Comportement des utilisateurs</h2>
          <p className="mt-3 leading-relaxed">
            L'utilisateur s'engage à respecter :
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>les règles propres à chaque club,</li>
            <li>les horaires et conditions de réservation,</li>
            <li>les autres joueurs et le personnel des clubs.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">5. Limitation de responsabilité</h2>
          <p className="mt-3 leading-relaxed">
            Pad'Up fournit une plateforme technique.
            Les prestations sportives, l'accès aux installations et leur bon déroulement
            relèvent de la responsabilité des clubs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">6. Support et assistance</h2>
          <p className="mt-3 leading-relaxed">
            En cas de problème ou de question, l'utilisateur peut contacter l'équipe Pad'Up
            via la page{" "}
            <Link href="/contact" className="underline hover:text-white">
              Contact
            </Link>
            .
          </p>
        </div>

        <p className="pt-2 text-sm text-slate-400">
          Pad'Up privilégie la simplicité : des règles claires pour une réservation sans friction.
        </p>
      </section>
    </main>
  );
}
