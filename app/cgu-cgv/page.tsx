import Link from "next/link";

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          CGU / CGV
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-300">
          Les présentes Conditions Générales encadrent l'accès et l'utilisation de la plateforme
          Pad'Up. En naviguant sur le site ou en utilisant les services, vous acceptez ces conditions.
        </p>
      </header>

      <section className="space-y-10 text-slate-300">
        <div>
          <h2 className="text-xl font-semibold text-white">1. Objet</h2>
          <p className="mt-3 leading-relaxed">
            Pad'Up met à disposition une plateforme permettant de consulter des disponibilités de
            terrains de padel et d'effectuer des réservations auprès de clubs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">2. Accès au service</h2>
          <p className="mt-3 leading-relaxed">
            Certaines fonctionnalités nécessitent la création d'un compte (ex : gérer vos réservations).
            L'utilisateur s'engage à fournir des informations exactes et à conserver la confidentialité de
            ses accès.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">3. Réservations</h2>
          <p className="mt-3 leading-relaxed">
            Les créneaux affichés sont fournis par les clubs. Pad'Up met en œuvre des mécanismes techniques
            pour afficher des disponibilités à jour et limiter les doubles réservations. En cas d'écart ou
            de modification, le club reste la source de référence.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">4. Prix, paiement et frais</h2>
          <p className="mt-3 leading-relaxed">
            La réservation via Pad'Up est sans frais pour les joueurs. Les conditions de paiement
            (montant, modalités, éventuels remboursements) dépendent du club concerné et des informations
            affichées lors de la réservation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">5. Annulation et modification</h2>
          <p className="mt-3 leading-relaxed">
            Les règles d'annulation et de modification peuvent varier selon les clubs (délais, conditions,
            avoirs, etc.). L'utilisateur est invité à consulter les règles affichées au moment de la
            réservation et, si nécessaire, à contacter le club.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">6. Responsabilités</h2>
          <p className="mt-3 leading-relaxed">
            Pad'Up fournit une plateforme technique de consultation et de réservation. L'accès aux
            installations, les prestations sportives et le règlement intérieur relèvent du club.
            Pad'Up ne peut être tenu responsable des indisponibilités, annulations, incidents sur place
            ou litiges entre utilisateur et club.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">7. Usage acceptable</h2>
          <p className="mt-3 leading-relaxed">
            L'utilisateur s'engage à utiliser Pad'Up de manière loyale et à ne pas :
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
            <li>perturber le fonctionnement du service,</li>
            <li>tenter d'accéder à des données non autorisées,</li>
            <li>utiliser la plateforme à des fins frauduleuses.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">8. Propriété intellectuelle</h2>
          <p className="mt-3 leading-relaxed">
            Le contenu, la marque, les logos et l'identité visuelle Pad'Up sont protégés. Toute reproduction
            ou utilisation non autorisée est interdite.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">9. Données personnelles</h2>
          <p className="mt-3 leading-relaxed">
            Les règles de traitement des données sont décrites dans la page{" "}
            <Link href="/confidentialite" className="underline hover:text-white">
              Confidentialité
            </Link>
            .
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">10. Évolution des conditions</h2>
          <p className="mt-3 leading-relaxed">
            Pad'Up peut faire évoluer ces conditions pour refléter les mises à jour du service. La version
            publiée en ligne au moment de l'utilisation s'applique.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">11. Contact</h2>
          <p className="mt-3 leading-relaxed">
            Pour toute question concernant ces conditions, vous pouvez nous contacter via la page{" "}
            <Link href="/contact" className="underline hover:text-white">
              Contact
            </Link>
            .
          </p>
        </div>

        <p className="pt-2 text-sm text-slate-400">
          Notre objectif : une expérience de réservation simple, claire et fiable.
        </p>
      </section>
    </main>
  );
}
