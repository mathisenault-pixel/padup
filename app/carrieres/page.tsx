import Link from "next/link";

export default function CarrieresPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          ← Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Carrières chez Pad&apos;Up</h1>

        <div className="space-y-8">
          {/* Intro */}
          <p className="text-lg text-gray-700 leading-relaxed">
            Pad&apos;Up est une plateforme française en construction, avec une ambition claire : simplifier la réservation de terrains de padel pour les joueurs et les clubs. Nous construisons un produit utile, simple et évolutif, et nous recherchons des personnes motivées pour participer à cette aventure.
          </p>

          {/* Rejoindre le projet */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rejoindre le projet</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Travailler chez Pad&apos;Up, c&apos;est :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Participer à la construction d&apos;un produit dès ses débuts</li>
              <li>Avoir un impact réel sur le produit et ses évolutions</li>
              <li>Travailler sur des problématiques concrètes, proches du terrain</li>
              <li>Évoluer dans un environnement agile et pragmatique</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Nous privilégions l&apos;autonomie, la responsabilité et l&apos;efficacité.
            </p>
          </section>

          {/* Profils recherchés */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profils recherchés</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Nous sommes ouverts à différents profils, notamment :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Développement web / produit</li>
              <li>Design UI / UX</li>
              <li>Marketing et communication</li>
              <li>Relation clubs et partenariats</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              L&apos;essentiel n&apos;est pas uniquement le diplôme, mais la motivation et l&apos;envie de construire.
            </p>
          </section>

          {/* Notre état d'esprit */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre état d&apos;esprit</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Chez Pad&apos;Up, nous avançons étape par étape :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Simplicité avant complexité</li>
              <li>Produit avant discours</li>
              <li>Qualité avant quantité</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Chaque contribution compte.
            </p>
          </section>

          {/* Postuler */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Postuler</h2>
            <p className="text-gray-700 leading-relaxed">
              Aucune offre ne correspond à votre profil mais vous souhaitez rejoindre l&apos;aventure ?
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Envoyez-nous une candidature spontanée et expliquez-nous ce que vous aimeriez apporter au projet.
            </p>
          </section>

          {/* Phrase de fin */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xl font-semibold text-gray-900 text-center">
              Construire un produit utile commence par les bonnes personnes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
